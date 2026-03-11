<template>
  <div class="main-div" :class="{ 'dark-mode': isDarkMode }" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="editor-container" :style="{ height: editorHeight + 'px' }">
      <MonacoEditor ref="codeEditor" class="code-editor" @keydown.ctrl.enter="handleExecuteCode"
        @format-code="handleFormatCode" @update:value="onEditorContentChange" />
    </div>

    <div class="resizer" @mousedown="startResize" :class="{ 'resizing': isResizing }"></div>

    <ToolBar :finished-time="finishedTime" :cost-seconds="costSeconds" :show-settings="isHover" :is-dark-mode="isDarkMode"
      @format="handleFormatCode" @run="handleExecuteCode" @open-settings="configDialogVisible = true" />

    <div class="output-container">
      <OutputSection ref="outputSection" :result="result" :is-dark-mode="isDarkMode" />
    </div>
  </div>

  <SettingsDialog v-model="configDialogVisible" :config="config" @save="handleSaveConfig" @clear-data="handleClearData" />
</template>

<script lang="ts">
import MonacoEditor from '@/components/MonacoEditor.vue'
import ToolBar from '@/components/ToolBar.vue'
import OutputSection from '@/components/OutputSection.vue'
import SettingsDialog from '@/components/SettingsDialog.vue'
import { GetConfig, SaveConfig, siyuanClient, ClearWidgetData, ClearConfig } from '@/utils/siyuan_client'
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
      editorHeight: 400,
      isResizing: false,
      startY: 0,
      startHeight: 0,
    }
  },

  computed: {
    isDarkMode() {
      return this.config.theme === 'vs-dark'
    },
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
      this.editorHeight = savedData.editorHeight || Math.floor(window.innerHeight * 0.5)

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

    async handleClearData() {
      try {
        // 清除挂件数据
        await ClearWidgetData()
        
        // 清除全局配置
        await ClearConfig()
        
        // 重置本地状态
        this.config = {
          theme: 'vs-light',
          pipPackages: '',
        }
        this.finishedTime = ''
        this.costSeconds = 0
        this.result = ''
        this.editorHeight = 400
        this.canvasImages = {}
        
        // 清空编辑器和输出
        const codeEditor = this.$refs.codeEditor as any
        codeEditor.setEditorContent('')
        codeEditor.setEditorTheme(this.config.theme)
        
        const outputSection = this.$refs.outputSection as any
        outputSection.clearMatplotlib()
        
        this.configDialogVisible = false
        
        // 显示成功消息
        const { ElMessage } = await import('element-plus')
        ElMessage.success('所有数据已清除')
      } catch (error) {
        const { ElMessage } = await import('element-plus')
        ElMessage.error('清除数据失败：' + error)
      }
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
        editorHeight: this.editorHeight,
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
        editorHeight: this.editorHeight,
      })
    },

    startResize(e: MouseEvent) {
      this.isResizing = true
      this.startY = e.clientY
      this.startHeight = this.editorHeight

      document.addEventListener('mousemove', this.handleResize)
      document.addEventListener('mouseup', this.stopResize)
      e.preventDefault()
    },

    handleResize(e: MouseEvent) {
      if (!this.isResizing) return

      const deltaY = e.clientY - this.startY
      const newHeight = this.startHeight + deltaY

      this.editorHeight = Math.max(50, Math.min(newHeight, window.innerHeight - 50))
    },

    async stopResize() {
      if (!this.isResizing) return

      this.isResizing = false
      document.removeEventListener('mousemove', this.handleResize)
      document.removeEventListener('mouseup', this.stopResize)

      const codeEditor = this.$refs.codeEditor as any
      const outputSection = this.$refs.outputSection as any
      await this.saveData({
        code: codeEditor.getEditorContent(),
        finishedTime: this.finishedTime,
        costSeconds: this.costSeconds,
        result: this.result,
        matplotlibDiv: outputSection.getMatplotlibDiv()?.innerHTML || '',
        canvasImages: this.canvasImages,
        editorHeight: this.editorHeight,
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
  transition: background-color 0.3s ease;
}

.main-div.dark-mode {
  background: #1e1e1e;
}

.editor-container {
  width: 95vw;
  margin: auto;
  position: relative;
}

.code-editor {
  width: 100%;
  height: 100%;
}

.resizer {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  cursor: ns-resize;
  position: relative;
  transition: background 0.2s;
  margin: 4px 0;
}

.dark-mode .resizer {
  background: #3e3e3e;
}

.resizer:hover,
.resizer.resizing {
  background: #2196f3;
}

.resizer::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 4px;
  background: #999;
  border-radius: 2px;
}

.dark-mode .resizer::before {
  background: #666;
}

.resizer:hover::before,
.resizer.resizing::before {
  background: #fff;
}

.output-container {
  flex: 1;
  overflow: auto;
}
</style>
