import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { PyodideWrapper } from "@/utils/pyodide_wrapper";

export function usePythonExecution(pyodideWrapper: PyodideWrapper | null) {
  const result = ref("");
  const finishedTime = ref("");
  const costSeconds = ref(0);
  const startExecuteTime = ref(0);

  const executeCode = async (code: string, stdinText?: string) => {
    startExecuteTime.value = new Date().getTime();

    if (!code) {
      result.value = "Execution successful (no output)";
      finishExecution();
      return;
    }

    result.value = "";

    try {
      const output: string[] = [];
      pyodideWrapper?.pyodide.setStdout({ batched: (text: string) => output.push(text) });

      // 设置 stdin：将输入文本按行分割，每次 input() 调用读取一行
      if (stdinText !== undefined) {
        const lines = stdinText.split("\n");
        let lineIndex = 0;
        pyodideWrapper?.pyodide.setStdin({
          stdin: () => {
            if (lineIndex < lines.length) {
              return lines[lineIndex++];
            }
            return undefined;
          },
        });
      }

      await pyodideWrapper?.pyodide.runPythonAsync(code);
      result.value = output.join("\n") || "Execution successful (no output)";
    } catch (error: any) {
      result.value = error.toString();
    } finally {
      finishExecution();
    }
  };

  const finishExecution = () => {
    finishedTime.value = new Date().toLocaleString();
    costSeconds.value = Number(((new Date().getTime() - startExecuteTime.value) / 1000).toFixed(2));
  };

  const formatCode = async (code: string): Promise<string | null> => {
    if (!code) {
      ElMessage.error("No code to format");
      return null;
    }

    ElMessage.warning("代码格式化功能已禁用（需要联网下载 Black 包）");
    return null;
  };

  return {
    result,
    finishedTime,
    costSeconds,
    executeCode,
    formatCode,
  };
}
