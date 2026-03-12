# Siyuan Run Python Code

一个功能完善的思源笔记 Python 代码运行挂件，基于 Pyodide 实现浏览器端 Python 代码执行，无需后端服务器。

> 本项目基于 [ay27/run_python_code](https://github.com/ay27/run_python_code) 改进和优化

## 核心特性

- **代码编辑与执行**：基于 Monaco Editor 的专业代码编辑器，支持语法高亮和智能补全
- **智能代码补全**：集成 Jedi 提供 Python 代码自动补全功能
- **代码格式化**：使用 Black 自动格式化代码（快捷键：Ctrl+Shift+F）
- **快速执行**：支持快捷键执行（Ctrl+Enter）
- **数据可视化**：完整支持 Matplotlib 图表渲染和保存
- **包管理**：支持通过 micropip 安装纯 Python 第三方库
- **状态持久化**：自动保存代码、执行结果和图表输出
- **主题切换**：支持明暗主题切换
- **可调整布局**：编辑器高度可拖拽调整

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件**：Element Plus + Tailwind CSS
- **代码编辑器**：Monaco Editor
- **Python 运行时**：Pyodide 0.27.7
- **思源集成**：@siyuan-community/siyuan-sdk
- **构建工具**：Vite

## 使用说明

### 1. 基本使用

在思源笔记中插入挂件，即可开始编写和运行 Python 代码：

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage1.png)

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage2.png)

**快捷键**：
- `Ctrl+Enter`：执行代码
- `Ctrl+Shift+F`：格式化代码

### 2. 全局配置

点击设置按钮可以配置主题和第三方库：

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage3.png)
![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage4.png)

**配置项**：
- **编辑器主题**：支持明亮/暗黑主题切换
- **第三方库**：每行一个包名，支持版本指定（如 `numpy==1.24.0`）

### 3. 数据可视化

完整支持 Matplotlib 图表，执行结果会自动渲染并保存：

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage6.png)

```python
import matplotlib.pyplot as plt
import numpy as np

x = np.linspace(0, 10, 100)
y = np.sin(x)

plt.plot(x, y)
plt.title('Sine Wave')
plt.xlabel('x')
plt.ylabel('sin(x)')
plt.show()
```

## 安装部署

### 从源码构建

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 或使用构建脚本
./build.sh   # Linux/Mac
build.bat    # Windows
```

### 安装到思源笔记

1. 构建完成后，将 `dist` 目录下的文件复制到思源笔记的挂件目录
2. 或直接从集市下载安装

## 开发说明

### 项目结构

```
src/
├── components/          # Vue 组件
│   ├── MonacoEditor.vue    # 代码编辑器
│   ├── OutputSection.vue   # 输出区域
│   ├── SettingsDialog.vue  # 设置对话框
│   └── ToolBar.vue         # 工具栏
├── composables/         # 组合式函数
│   ├── useDataPersistence.ts  # 数据持久化
│   └── usePythonExecution.ts  # Python 执行逻辑
├── utils/               # 工具函数
│   ├── pyodide_wrapper.ts     # Pyodide 封装
│   └── siyuan_client.ts       # 思源 API 客户端
└── MainApp.vue          # 主应用组件
```

### 核心功能实现

- **Pyodide 初始化**：支持多 CDN 源自动切换，提高加载成功率
- **代码执行**：异步执行 Python 代码，捕获标准输出和错误
- **图表渲染**：自动检测 Matplotlib 画布并转换为图片保存
- **数据持久化**：通过思源 API 保存代码、配置和执行结果

## 注意事项

- Pyodide 仅支持纯 Python 包，不支持包含 C 扩展的包（除非已预编译）
- 首次加载需要下载 Pyodide 运行时（约 10-20MB），请耐心等待
- 建议在稳定的网络环境下使用，避免 CDN 加载失败

## 许可证

详见 [LICENSE](https://github.com/Kaede221/siyuan-run-python-code/blob/main/LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.1.0
- ✅ 完善设置面板功能
- ✅ 支持代码格式化（Black）
- ✅ 支持第三方库安装配置
- ✅ 完整支持 Matplotlib 图表保存
- ✅ 支持主题切换
- ✅ 优化 Pyodide 加载策略（多 CDN 源）

---

**作者**：[Kaede221](https://github.com/Kaede221)  
**原作者**：[ay27](https://github.com/ay27)  
**项目地址**：https://github.com/Kaede221/siyuan-run-python-code
