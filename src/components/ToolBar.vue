<template>
  <div class="middle-toolbar flex" :class="isDarkMode ? 'bg-gray-700' : 'bg-gray-200'">
    <el-tooltip content="Ctrl+Enter to Run" :show-after="500">
      <button
        class="bg-blue-500 hover:bg-blue-400 text-gray-800 font-bold py-0.75 px-4 inline-flex items-center cursor-pointer"
        @click="$emit('run')">
        <el-icon color="white">
          <CaretRight />
        </el-icon>
        <span class="font-medium text-white">Run</span>
      </button>
    </el-tooltip>

    <pre v-if="finishedTime" class="run-time-text" :class="isDarkMode ? 'text-green-400' : 'text-green-600'">
Save and run finished at: {{ finishedTime }}. Cost: {{ costSeconds }}s</pre>

    <el-tooltip content="全局设置" :show-after="500">
      <button
        class="font-bold py-0.75 px-2 inline-flex items-center cursor-pointer ml-auto"
        :class="isDarkMode ? 'hover:bg-gray-600 text-gray-200' : 'hover:bg-gray-300 text-gray-800'"
        v-show="showSettings"
        @click="$emit('open-settings')">
        <el-icon :color="isDarkMode ? 'white' : 'black'">
          <Setting />
        </el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script lang="ts">
import { CaretRight, Setting } from '@element-plus/icons-vue'

export default {
  name: 'ToolBar',
  components: { Setting, CaretRight },
  props: {
    finishedTime: String,
    costSeconds: Number,
    showSettings: Boolean,
    isDarkMode: Boolean,
  },
  emits: ['run', 'open-settings'],
}
</script>

<style scoped>
.middle-toolbar {
  height: 22px;
  line-height: 22px;
  width: 95vw;
  margin: auto;
}

.run-time-text {
  font-size: 11px;
  margin-left: 12px;
}
</style>
