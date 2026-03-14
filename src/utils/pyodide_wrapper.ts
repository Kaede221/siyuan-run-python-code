// 模块级单例状态 - 在当前iframe内共享
let sharedPyodideInstance: any = null;
let loadingPromise: Promise<any> | null = null;
let refCount = 0;

// 跨iframe共享状态的key
const STORAGE_KEY = '__SIYUAN_PYODIDE_STATE__';
const LOCK_KEY = '__SIYUAN_PYODIDE_LOCK__';

// 尝试获取跨iframe共享的Pyodide实例
function getSharedPyodide(): any {
  try {
    // 尝试从父窗口获取
    if (window.parent && window.parent !== window) {
      const parentPyodide = (window.parent as any).__SIYUAN_SHARED_PYODIDE__;
      if (parentPyodide) {
        return parentPyodide;
      }
    }
    
    // 尝试从顶层窗口获取
    if (window.top && window.top !== window) {
      const topPyodide = (window.top as any).__SIYUAN_SHARED_PYODIDE__;
      if (topPyodide) {
        return topPyodide;
      }
    }
  } catch (e) {
    // 跨域限制，忽略
  }
  
  return null;
}

// 设置跨iframe共享的Pyodide实例
function setSharedPyodide(instance: any): void {
  try {
    // 尝试设置到父窗口
    if (window.parent && window.parent !== window) {
      (window.parent as any).__SIYUAN_SHARED_PYODIDE__ = instance;
    }
    
    // 尝试设置到顶层窗口
    if (window.top && window.top !== window) {
      (window.top as any).__SIYUAN_SHARED_PYODIDE__ = instance;
    }
  } catch (e) {
    // 跨域限制，忽略
  }
  
  // 总是设置到当前窗口
  (window as any).__SIYUAN_SHARED_PYODIDE__ = instance;
}

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

  private async waitForSharedInstance(onProgress?: (message: string) => void): Promise<any> {
    const maxWaitTime = 30000; // 最多等待30秒
    const checkInterval = 200; // 每200ms检查一次
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const shared = getSharedPyodide();
      if (shared) {
        console.log("Found shared Pyodide instance from another iframe");
        return shared;
      }
      
      // 检查localStorage中的状态
      try {
        const state = localStorage.getItem(STORAGE_KEY);
        if (state === 'ready') {
          // 再次尝试获取共享实例
          const shared = getSharedPyodide();
          if (shared) {
            return shared;
          }
        } else if (state === 'loading') {
          onProgress?.("等待其他挂件加载 Python 环境...");
        }
      } catch (e) {
        // localStorage不可用，忽略
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    return null;
  }

  public async intialize(onProgress?: (message: string) => void): Promise<void> {
    // 1. 检查当前iframe的模块级实例
    if (sharedPyodideInstance) {
      console.log("Reusing existing Pyodide instance (same iframe)");
      this.pyodide = sharedPyodideInstance;
      refCount++;
      onProgress?.("复用已加载的 Python 环境...");
      return;
    }

    // 2. 检查是否有跨iframe的共享实例
    const crossIframeInstance = getSharedPyodide();
    if (crossIframeInstance) {
      console.log("Reusing Pyodide instance from another iframe");
      this.pyodide = crossIframeInstance;
      sharedPyodideInstance = crossIframeInstance;
      refCount++;
      onProgress?.("复用其他挂件的 Python 环境...");
      return;
    }

    // 3. 如果当前iframe正在加载，等待
    if (loadingPromise) {
      console.log("Waiting for Pyodide to load in current iframe...");
      onProgress?.("等待 Python 环境加载...");
      await loadingPromise;
      this.pyodide = sharedPyodideInstance;
      refCount++;
      return;
    }

    // 4. 尝试获取加载锁
    let shouldLoad = false;
    try {
      const lockValue = localStorage.getItem(LOCK_KEY);
      const now = Date.now();
      
      if (!lockValue || now - parseInt(lockValue) > 10000) {
        // 没有锁，或者锁已过期（超过10秒）
        localStorage.setItem(LOCK_KEY, now.toString());
        localStorage.setItem(STORAGE_KEY, 'loading');
        shouldLoad = true;
      }
    } catch (e) {
      // localStorage不可用，直接加载
      shouldLoad = true;
    }

    // 5. 如果没有获得锁，等待其他iframe加载完成
    if (!shouldLoad) {
      onProgress?.("等待其他挂件加载 Python 环境...");
      const shared = await this.waitForSharedInstance(onProgress);
      if (shared) {
        this.pyodide = shared;
        sharedPyodideInstance = shared;
        refCount++;
        return;
      }
      // 等待超时，尝试自己加载
      console.warn("Wait timeout, loading Pyodide anyway");
    }

    // 6. 开始加载
    onProgress?.("正在加载 Python 运行环境（首次加载）...");
    
    loadingPromise = (async () => {
      try {
        console.log(`Loading Pyodide from: ${PyodideWrapper.LOCAL_PYODIDE_URL}`);

        // 加载 pyodide.js 脚本
        await this.loadPyodideScript(PyodideWrapper.LOCAL_PYODIDE_URL);

        // 调用 loadPyodide 函数
        const loadPyodide = (window as any).loadPyodide;
        
        const pyodideInstance = await loadPyodide({
          indexURL: PyodideWrapper.LOCAL_PYODIDE_URL,
          stdout: console.log,
          stderr: console.error,
        });

        sharedPyodideInstance = pyodideInstance;
        setSharedPyodide(pyodideInstance);
        refCount = 1;
        this.pyodide = pyodideInstance;

        // 更新状态
        try {
          localStorage.setItem(STORAGE_KEY, 'ready');
          localStorage.removeItem(LOCK_KEY);
        } catch (e) {
          // 忽略
        }

        console.log("Pyodide initialized successfully (shared instance)");
        return pyodideInstance;
      } catch (error) {
        loadingPromise = null;
        
        // 清理锁
        try {
          localStorage.removeItem(LOCK_KEY);
          localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
          // 忽略
        }
        
        console.error("Failed to load Pyodide:", error);
        throw error;
      }
    })();

    await loadingPromise;
    loadingPromise = null;
  }

  public dispose(): void {
    if (refCount > 0) {
      refCount--;
      console.log(`Pyodide ref count: ${refCount}`);
    }
    // 注意：不主动清理instance，让浏览器自动管理内存
  }
}
