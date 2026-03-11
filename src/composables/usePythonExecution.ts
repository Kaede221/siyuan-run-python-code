import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { PyodideWrapper } from '@/utils/pyodide_wrapper'

export function usePythonExecution(pyodideWrapper: PyodideWrapper | null) {
  const result = ref('')
  const finishedTime = ref('')
  const costSeconds = ref(0)
  const startExecuteTime = ref(0)
  const canvasImages = ref<Record<string, string>>({})

  const executeCode = async (code: string, matplotlibDiv: HTMLElement) => {
    startExecuteTime.value = new Date().getTime()

    if (!code) {
      result.value = 'Execution successful (no output)'
      finishExecution(matplotlibDiv)
      return
    }

    result.value = ''
    matplotlibDiv.innerHTML = ''
    
    const canvasList = document.querySelectorAll('canvas[id^="matplotlib_"]')
    for (const canvas of canvasList) {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      canvas.remove()
    }
    canvasImages.value = {}

    try {
      const output: string[] = []
      pyodideWrapper?.pyodide.setStdout({ batched: (text: string) => output.push(text) })

      document.pyodideMplTarget = document.getElementById('target')

      let executionCode = code
      if (code.includes('matplotlib')) {
        executionCode += `
import matplotlib.pyplot as plt
plt.close()
        `
      }

      await pyodideWrapper?.pyodide.runPythonAsync(executionCode)
      result.value = output.join('\n') || 'Execution successful (no output)'
    } catch (error: any) {
      result.value = error.toString()
    } finally {
      finishExecution(matplotlibDiv)
    }
  }

  const finishExecution = (matplotlibDiv: HTMLElement) => {
    finishedTime.value = new Date().toLocaleString()
    costSeconds.value = Number(((new Date().getTime() - startExecuteTime.value) / 1000).toFixed(2))

    setTimeout(() => {
      canvasImages.value = {}
      const canvasList = document.querySelectorAll('canvas[id^="matplotlib_"]')

      for (const canvas of canvasList) {
        const img = (canvas as HTMLCanvasElement).toDataURL('image/png')
        const ctx = (canvas as HTMLCanvasElement).getContext('2d')
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height).data
        const isEmpty = Array.from(imageData).every((v) => v === 0)
        
        if (!isEmpty) {
          canvasImages.value[canvas.id] = img
        }
      }
    }, 1000)
  }

  const formatCode = async (code: string): Promise<string | null> => {
    if (!code) {
      ElMessage.error('No code to format')
      return null
    }

    try {
      const output: string[] = []
      pyodideWrapper?.pyodide.setStdout({ batched: (text: string) => output.push(text) })

      // 首次使用时才加载 black
      await pyodideWrapper?.pyodide.runPythonAsync(`
        try:
          import black
        except ImportError:
          import micropip
          await micropip.install('black')
          import black
        
        import json
        code = ${JSON.stringify(code)}
        try:
          formated = black.format_file_contents(code, fast=False, mode=black.Mode(line_length=120))
        except black.report.NothingChanged:
          print(json.dumps({"ok": True, "error": "", "formated": ""}))
        except Exception as e:
          print(json.dumps({"ok": False, "error": str(e), "formated": ""}))
        else:
          print(json.dumps({"ok": True, "error": "", "formated": formated}))
      `)
      
      const formatResult = JSON.parse(output[0])

      if (formatResult.ok) {
        if (formatResult.formated) {
          ElMessage.success({
            message: 'Format code successfully',
            duration: 500,
          })
          return formatResult.formated
        }
        ElMessage.success({
          message: 'Format code successfully',
          duration: 500,
        })
        return null
      } else {
        ElMessage.error(formatResult.error)
        return null
      }
    } catch (error: any) {
      ElMessage.error(error.toString())
      return null
    }
  }

  return {
    result,
    finishedTime,
    costSeconds,
    canvasImages,
    executeCode,
    formatCode,
  }
}
