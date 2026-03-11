<template>
  <div class="middle-toolbar flex bg-gray-200">
    <el-tooltip content="Opt+Cmd+L to Format Code" :show-after="500">
      <button
        class="bg-green-500 hover:bg-green-400 text-gray-800 font-bold py-0.75 px-4 inline-flex items-center cursor-pointer"
        @click="$emit('format')">
        <el-icon color="white">
          <Brush />
        </el-icon>
      </button>
    </el-tooltip>

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

    <pre v-if="finishedTime" class="run-time-text text-green-600">
Save and run finished at: {{ finishedTime }}. Cost: {{ costSeconds }}s</pre>

    <el-tooltip content="Global settings" :show-after="500">
      <button
        class="hover:bg-gray-300 text-gray-800 font-bold py-0.75 px-2 inline-flex items-center cursor-pointer ml-auto"
        v-show="showSettings"
        @click="$emit('open-settings')">
        <el-icon color="black">
          <Setting />
        </el-icon>
      </button>
    </el-tooltip>
  </div>
</template>

<script lang="ts">
import { CaretRight, Setting, Brush } from '@element-plus/icons-vue'

export default {
  name: 'ToolBar',
  components: { Setting, CaretRight, Brush },
  props: {
    finishedTime: String,
    costSeconds: Number,
    showSettings: Boolean,
  },
  emits: ['format', 'run', 'open-settings'],
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
