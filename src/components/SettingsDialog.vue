<template>
  <el-dialog title="全局设置" v-model="visible" width="50%" @close="$emit('update:modelValue', false)">
    <el-form :model="localConfig" label-position="top" class="px-4">
      <el-form-item label="主题颜色">
        <el-select v-model="localConfig.theme" placeholder="Theme" style="width: 200px">
          <el-option label="vs-light" value="vs-light" />
          <el-option label="vs-dark" value="vs-dark" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <template v-slot:label>
          <span>预安装 pip 包，格式参考 requirements.txt 写法。仅支持纯 python 语言的 pip
            包，具体参考：</span>
          <a href="https://pyodide.org/en/stable/usage/packages-in-pyodide.html" target="_blank"
            class="text-blue-600 dark:text-blue-500 hover:underline">https://pyodide.org/en/stable/usage/packages-in-pyodide.html</a>
        </template>
        <el-input v-model="localConfig.pipPackages" placeholder="e.g. numpy==2.0.2" :rows="8" type="textarea" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSave">保存</el-button>
        <el-button type="danger" @click="handleClearData">清除所有数据</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'

export default {
  name: 'SettingsDialog',
  props: {
    modelValue: Boolean,
    config: {
      type: Object as () => { theme: string; pipPackages: string },
      required: true,
    },
  },
  emits: ['update:modelValue', 'save', 'clearData'],
  data() {
    return {
      localConfig: { ...this.config } as { theme: string; pipPackages: string },
    }
  },
  computed: {
    visible: {
      get(): boolean {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  watch: {
    config: {
      handler(newConfig: { theme: string; pipPackages: string }) {
        this.localConfig = { ...newConfig }
      },
      deep: true,
    },
  },
  methods: {
    handleSave() {
      this.$emit('save', this.localConfig)
    },
    async handleClearData() {
      try {
        await ElMessageBox.confirm(
          '此操作将清除当前挂件的所有数据（代码、执行结果、图表等）以及全局配置（主题、pip包）。是否继续？',
          '警告',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
          }
        )
        this.$emit('clearData')
      } catch {
        // 用户取消操作
      }
    },
  },
}
</script>
