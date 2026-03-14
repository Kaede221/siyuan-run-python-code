<template>
  <div class="output-section" :class="{ 'dark-mode': isDarkMode }" ref="outputSection">
    <pre :class="isDarkMode ? 'text-gray-100' : 'text-gray-900'" style="white-space: pre-wrap">{{ result }}</pre>
  </div>
</template>

<script lang="ts">
export default {
  name: 'OutputSection',
  props: {
    result: String,
    isDarkMode: Boolean,
  },
}
</script>

<style scoped>
.output-section {
  width: 95vw;
  min-height: 10vh;
  padding: 12px;
  margin: auto;
  font-size: 12px;
  background: #f9f8f7;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.output-section.dark-mode {
  background: #252526;
}
</style>
