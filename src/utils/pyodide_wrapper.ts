export class PyodideWrapper {
  public pyodide: any;

  // 本地 Pyodide 路径
  private static readonly LOCAL_PYODIDE_URL = "/widgets/siyuan-run-python-code/pyodide/";

  private async loadPyodideScript(indexURL: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 检查是否已经加载
      if (typeof (window as any).loadPyodide !== "undefined") {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = indexURL + "pyodide.js";
      script.onload = () => {
        if (typeof (window as any).loadPyodide !== "undefined") {
          resolve();
        } else {
          reject(new Error("loadPyodide not found after script load"));
        }
      };
      script.onerror = () => reject(new Error(`Failed to load ${script.src}`));
      document.head.appendChild(script);
    });
  }

  public async intialize(onProgress?: (message: string) => void) {
    onProgress?.("正在加载 Python 运行环境...");

    try {
      console.log(`Loading Pyodide from: ${PyodideWrapper.LOCAL_PYODIDE_URL}`);

      // 加载 pyodide.js 脚本
      await this.loadPyodideScript(PyodideWrapper.LOCAL_PYODIDE_URL);

      // 调用 loadPyodide 函数
      const loadPyodide = (window as any).loadPyodide;
      this.pyodide = await loadPyodide({
        indexURL: PyodideWrapper.LOCAL_PYODIDE_URL,
        stdout: console.log,
        stderr: console.error,
      });

      console.log("Pyodide initialized successfully");
    } catch (error) {
      console.error("Failed to load Pyodide:", error);
      throw new Error(
        `Failed to load Pyodide: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
