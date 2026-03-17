<template>
  <div class="input-section" :class="{ 'dark-mode': isDarkMode }">
    <div class="input-header" :class="isDarkMode ? 'text-gray-300' : 'text-gray-600'">
      <el-icon :size="12"><EditPen /></el-icon>
      <span class="input-label">标准输入 (stdin) - 每行对应一次 input() 调用</span>
      <el-tooltip content="折叠/展开输入区域" :show-after="500">
        <button class="toggle-btn"
          :class="isDarkMode ? 'hover:bg-gray-600 text-gray-300' : 'hover:bg-gray-300 text-gray-600'"
          @click="toggleCollapse">
          <el-icon :size="12">
            <ArrowUp v-if="!collapsed" />
            <ArrowDown v-else />
          </el-icon>
        </button>
      </el-tooltip>
    </div>
    <el-input v-show="!collapsed" v-model="content" type="textarea" :rows="3" resize="vertical"
      placeholder="在此输入 input() 的内容，每行对应一次调用..." @input="$emit('update:value', content)" />
  </div>
</template>

<script lang="ts">
import { EditPen, ArrowUp, ArrowDown } from '@element-plus/icons-vue'

export default {
  name: 'InputSection',
  components: { EditPen, ArrowUp, ArrowDown },
  props: {
    isDarkMode: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'vs-light',
    },
  },
  emits: ['update:value', 'update:collapsed'],
  data() {
    return {
      content: '',
      collapsed: true,
    }
  },
  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed
      this.$emit('update:collapsed', this.collapsed)
    },

    getContent(): string {
      return this.content
    },

    setContent(value: string) {
      this.content = value
    },

    isCollapsed(): boolean {
      return this.collapsed
    },

    setCollapsed(value: boolean) {
      this.collapsed = value
    },
  },
}
</script>

<style scoped>
.input-section {
  width: 95vw;
  margin: auto;
}

.input-header {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  padding: 4px 4px 2px 4px;
}

.input-label {
  flex: 1;
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  display: inline-flex;
  align-items: center;
}

.dark-mode :deep(.el-textarea__inner) {
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-color: #3e3e3e;
}
</style>
