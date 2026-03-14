import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

// 自定义插件：让 Vite 不处理 pyodide 文件
function pyodidePlugin() {
  return {
    name: "vite-plugin-pyodide",
    configureServer(server: {
      middlewares: { use: (arg0: (req: any, res: any, next: any) => any) => void };
    }) {
      server.middlewares.use((req, res, next) => {
        // 如果请求的是 pyodide 目录下的文件，直接返回原始文件
        if (req.url?.startsWith("/pyodide/")) {
          // 让 Vite 的静态文件服务器处理，但不转换
          return next();
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: "/widgets/siyuan-run-python-code/",
  plugins: [vue(), vueDevTools(), tailwindcss(), pyodidePlugin()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:6806",
        changeOrigin: true,
      },
    },
    fs: {
      strict: false,
    },
  },
  optimizeDeps: {
    exclude: ["pyodide"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  assetsInclude: ["**/*.wasm", "**/*.data"],
});
