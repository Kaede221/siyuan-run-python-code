<template>
  <div class="output-section" ref="outputSection">
    <pre class="text-gray-900" style="white-space: pre-wrap">{{ result }}</pre>
    <div ref="matplotlibImageDiv" id="target" class="p-2"></div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'OutputSection',
  props: {
    result: String,
  },
  expose: ['getMatplotlibDiv', 'setMatplotlibContent', 'clearMatplotlib', 'restoreCanvasImages'],
  methods: {
    getMatplotlibDiv() {
      return this.$refs.matplotlibImageDiv
    },

    setMatplotlibContent(html: string) {
      this.$refs.matplotlibImageDiv.innerHTML = html
    },

    clearMatplotlib() {
      this.$refs.matplotlibImageDiv.innerHTML = ''
      const canvasList = document.querySelectorAll('canvas[id^="matplotlib_"]')
      for (const canvas of canvasList) {
        const ctx = canvas.getContext('2d')
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        canvas.remove()
      }
    },

    restoreCanvasImages(canvasImages: Record<string, string>) {
      for (const canvasId in canvasImages) {
        const canvas = document.getElementById(canvasId)
        if (canvas) {
          const img = new Image()
          img.src = canvasImages[canvasId]
          img.onload = () => {
            const ctx = canvas.getContext('2d')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            ctx.drawImage(img, 0, 0)
          }
        }
      }
    },
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
}
</style>
