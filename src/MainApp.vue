<template>
  <div class="main-div" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <MonacoEditor ref="codeEditor" class="code-editor" @keydown.ctrl.enter="handleExecuteCode"
      @format-code="handleFormatCode" @update:value="onEditorContentChange" />

    <ToolBar :finished-time="finishedTime" :cost-seconds="costSeconds" :show-settings="isHover"
      @format="handleFormatCode" @run="handleExecuteCode" @open-settings="configDialogVisible = true" />

    <OutputSection ref="outputSection" :result="result" />
  </div>

  <SettingsDialog v-model="configDialogVisible" :config="config" @save="handleSaveConfig" />
</template>

<script lang="ts">
import MonacoEditor from '@/components/MonacoEditor.vue'
import ToolBar from '@/components/ToolBar.vue'
import OutputSection from '@/components/OutputSection.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import { GetConfig, SaveConfig, siyuanClient } from '@/utils/siyuan_client'
import { ElLoading } from 'element-plus'
import { PyodideWrapper } from './utils/pyodide_wrapper'
import { usePythonExecution } from './composables/usePythonExecution'
import { useDataPersistence } from './composables/useDataPersistence'

export default {
  name: 'MainApp',
  components: { MonacoEditor, ToolBar, OutputSection, SettingsDialog },
  setup() {
    const pyodideWrapper = new PyodideWrapper()
    const { result, finishedTime, costSeconds, canvasImages, executeCode, formatCode } = usePythonExecution(pyodideWrapper)
    const { saveData, loadData } = useDataPersistence()

    return {
      pyodideWrapper,
      result,
      finishedTime,
      costSeconds,
      canvasImages,
      executeCode,
      formatCode,
      saveData,
      loadData,
    }
  },
  data() {
    return {
      loading: false,
      isHover: false,
      hoverTimeout: 0 as any,
      configDialogVisible: false,
      config: {
        theme: 'vs-light',
        pipPackages: '',
      },
    }
  },

  async mounted() {
    this.loading = true

    const loadingInstance = ElLoading.service({
      lock: true,
      fullscreen: true,
      text: 'Loading...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    await Promise.all([this.initializePyodide(), this.waitKernelBoot()])
    const cfg = await GetConfig()
    if (cfg && cfg.theme && cfg.pipPackages !== undefined) {
      this.config = { ...cfg }
    }
    const codeEditor = this.$refs.codeEditor as any
    codeEditor.setEditorTheme(this.config.theme)
    codeEditor.setPyodide(this.pyodideWrapper?.pyodide)
    await this.pyodideWrapper?.installPackages(this.config.pipPackages)

    loadingInstance.close()
    this.loading = false
  },

  methods: {
    handleMouseEnter() {
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout)
      }
      this.isHover = true
    },

    handleMouseLeave() {
      this.hoverTimeout = setTimeout(() => {
        this.isHover = false
      }, 100)
    },

    async initializePyodide() {
      await this.pyodideWrapper.intialize()
    },

    async waitKernelBoot() {
      while (true) {
        try {
          await siyuanClient.currentTime()
          await siyuanClient.bootProgress()
          break
        } catch (e) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
      await this.setupEditor()
    },

    async setupEditor() {
      const savedData = await this.loadData()
      this.finishedTime = savedData.finishedTime || ''
      this.costSeconds = savedData.costSeconds || 0
      this.result = savedData.result || ''

      const outputSection = this.$refs.outputSection as any
      outputSection.setMatplotlibContent(savedData.matplotlibDiv || '')
      this.canvasImages = savedData.canvasImages || {}
      outputSection.restoreCanvasImages(this.canvasImages)

      const codeEditor = this.$refs.codeEditor as any
      codeEditor.setEditorContent(savedData.code || '')
    },

    async handleSaveConfig(newConfig: any) {
      if (!(await this.pyodideWrapper?.validatePipPackages(newConfig.pipPackages))) {
        return
      }

      this.config = { ...newConfig }
      const codeEditor = this.$refs.codeEditor as any
      codeEditor.setEditorTheme(this.config.theme)
      await SaveConfig(this.config)
      this.configDialogVisible = false
    },

    async onEditorContentChange() {
      const codeEditor = this.$refs.codeEditor as any
      const outputSection = this.$refs.outputSection as any
      await this.saveData({
        code: codeEditor.getEditorContent(),
        finishedTime: this.finishedTime,
        costSeconds: this.costSeconds,
        result: this.result,
        matplotlibDiv: outputSection.getMatplotlibDiv()?.innerHTML || '',
        canvasImages: this.canvasImages,
      })
    },

    async handleFormatCode() {
      const codeEditor = this.$refs.codeEditor as any
      const value = codeEditor.getEditorContent()
      const cursorPosition = codeEditor.getPosition()

      const formattedCode = await this.formatCode(value)
      if (formattedCode) {
        codeEditor.setEditorContent(formattedCode)
        codeEditor.setPosition(cursorPosition)
      }
    },

    async handleExecuteCode() {
      const codeEditor = this.$refs.codeEditor as any
      const outputSection = this.$refs.outputSection as any
      const code = codeEditor.getEditorContent()
      const matplotlibDiv = outputSection.getMatplotlibDiv()

      outputSection.clearMatplotlib()
      this.canvasImages = {}

      await this.executeCode(code, matplotlibDiv)

      await this.saveData({
        code: codeEditor.getEditorContent(),
        finishedTime: this.finishedTime,
        costSeconds: this.costSeconds,
        result: this.result,
        matplotlibDiv: matplotlibDiv?.innerHTML || '',
        canvasImages: this.canvasImages,
      })
    },
  },
}
</script>

<style scoped>
.main-div {
  width: 100%;
  min-height: 100vh;
  margin: auto;
  padding: 8px;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.code-editor {
  width: 95vw;
  height: 40vh;
  margin: auto;
}
</style>
