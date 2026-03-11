import { ElLoading, ElMessage } from 'element-plus'
import { loadPyodide } from 'pyodide'

export class PyodideWrapper {
  public pyodide: any

  // 备用 CDN 列表，按优先级排序
  private static readonly CDN_URLS = [
    'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
    'https://fastly.jsdelivr.net/pyodide/v0.27.7/full/',  // jsdelivr 的 Fastly CDN
    'https://gcore.jsdelivr.net/pyodide/v0.27.7/full/',   // jsdelivr 的 Gcore CDN
  ]

  private async tryLoadPyodide(indexURL: string): Promise<any> {
    console.log(`Trying to load Pyodide from: ${indexURL}`)
    return await loadPyodide({
      indexURL,
      stdout: console.log,
      stderr: console.error,
      packageCacheDir: 'pyodide-packages',
    })
  }

  public async intialize(onProgress?: (message: string) => void) {
    // 加载 Pyodide，尝试多个 CDN 源
    let lastError: Error | null = null
    
    onProgress?.('正在加载 Python 运行环境...')
    
    for (const cdnUrl of PyodideWrapper.CDN_URLS) {
      try {
        this.pyodide = await this.tryLoadPyodide(cdnUrl)
        console.log(`Successfully loaded Pyodide from: ${cdnUrl}`)
        break
      } catch (error) {
        console.warn(`Failed to load Pyodide from ${cdnUrl}:`, error)
        lastError = error as Error
      }
    }

    if (!this.pyodide) {
      throw new Error(`Failed to load Pyodide from all CDN sources. Last error: ${lastError?.message}`)
    }

    onProgress?.('正在加载包管理器...')
    await this.pyodide.loadPackage(['micropip'])
    
    // jedi 和 black 延迟加载，不阻塞初始化
    this.loadOptionalPackages()
  }

  private async loadOptionalPackages() {
    try {
      console.log('Loading optional packages in background...')
      await this.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('jedi')
        await micropip.install('black')
      `)
      console.log('Optional packages loaded successfully')
    } catch (error) {
      console.warn('Failed to load optional packages:', error)
    }
  }

  public async installPackages(pipPackages: string) {
    if (!pipPackages) {
      return
    }

    const packages = pipPackages
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    return Promise.all(
      packages.map((pkg) =>
        this.pyodide.runPythonAsync(`
          import micropip
          await micropip.install('${pkg}')
          `),
      ),
    )
  }

  public async validatePipPackages(pipPackages: string) {
    const loadingInstance = ElLoading.service({
      lock: true,
      text: 'Validating pip packages...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)',
    })

    try {
      await this.installPackages(pipPackages)
    } catch (error) {
      loadingInstance.close()
      ElMessage.error({
        message: `Failed to install pip packages: ${error}`,
      })
      return false
    }
    loadingInstance.close()
    return true
  }
}
