# Siyuan Run Python Code

一个轻量级的思源笔记 Python 代码运行挂件，基于 Pyodide 实现浏览器端 Python 代码执行，无需后端服务器。

> 本项目基于 [ay27/run_python_code](https://github.com/ay27/run_python_code) 改进和优化

## 核心特性

- **代码编辑与执行**：基于 Monaco Editor 的专业代码编辑器，支持语法高亮
- **快速执行**：支持快捷键执行（Ctrl+Enter）
- **状态持久化**：自动保存代码和执行结果
- **主题切换**：支持明暗主题切换
- **可调整布局**：编辑器高度可拖拽调整
- **本地运行时**：Pyodide 核心文件本地化，完全离线运行

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **UI 组件**：Element Plus + Tailwind CSS
- **代码编辑器**：Monaco Editor
- **Python 运行时**：Pyodide 0.29.3
- **思源集成**：@siyuan-community/siyuan-sdk
- **构建工具**：Vite

## 使用说明

### 1. 基本使用

在思源笔记中插入挂件，即可开始编写和运行 Python 代码：

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage1.png)

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage2.png)

**快捷键**：
- `Ctrl+Enter`：执行代码

### 2. 全局配置

点击设置按钮可以配置主题和第三方库：

![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage3.png)
![](https://github.com/Kaede221/siyuan-run-python-code/blob/main/docs/usage4.png)

**配置项**：
- **编辑器主题**：支持明亮/暗黑主题切换

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

- **Pyodide 初始化**：从本地加载核心文件，完全离线运行
- **代码执行**：异步执行 Python 代码，捕获标准输出和错误
- **数据持久化**：通过思源 API 保存代码、配置和执行结果

## 注意事项

- Pyodide 仅支持纯 Python 包和标准库
- 核心运行时已本地化（~8-10MB），无需联网
- 不支持代码补全和格式化功能（需要额外的包）
- 完全离线运行，适合在无网络环境下使用

## 许可证

详见 [LICENSE](https://github.com/Kaede221/siyuan-run-python-code/blob/main/LICENSE) 文件

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.1.6
- ✅ 移除 Matplotlib 支持，减小体积
- ✅ Pyodide 核心文件本地化（~8-10MB）
- ✅ 升级到 Pyodide 0.29.3
- ✅ 移除所有联网功能，完全离线运行
- ✅ 移除代码补全和格式化功能
- ✅ 优化加载速度和性能

### v1.1.0
- ✅ 完善设置面板功能
- ✅ 支持代码格式化（Black）
- ✅ 支持第三方库安装配置
- ✅ 支持主题切换
- ✅ 优化 Pyodide 加载策略（多 CDN 源）

---

**作者**：[Kaede221](https://github.com/Kaede221)  
**原作者**：[ay27](https://github.com/ay27)  
**项目地址**：https://github.com/Kaede221/siyuan-run-python-code
