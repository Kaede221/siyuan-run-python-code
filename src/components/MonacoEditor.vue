<template>
  <div ref="editorContainer" class="editor-container"></div>
</template>

<script>
import * as monaco from 'monaco-editor'

export default {
  name: 'MonacoEditor',
  props: {
    language: {
      type: String,
      default: 'python',
    },
    // pyodide: {
    //   type: Object,
    //   default: null,
    // },
    theme: {
      type: String,
      default: 'vs-light',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },
  expose: ['getEditorContent', 'setEditorContent', 'setPyodide', 'setEditorTheme', 'getPosition', 'setPosition'],
  emits: ['update:value', 'format-code'],
  data() {
    return {
      position: null,
    }
  },
  watch: {
    value(newValue) {
      if (this.editor && newValue !== this.editor.getValue()) {
        this.editor.setValue(newValue)
      }
    },
  },
  methods: {
    updateEditorSize() {
      if (this.editor) {
        this.editor.layout()
      }
    },

    setEditorTheme(theme) {
      if (this.editor) {
        monaco.editor.setTheme(theme)
      }
    },

    setEditorContent(value) {
      if (this.editor) {
        this.editor.setValue(value)
      }
    },

    getEditorContent() {
      if (this.editor) {
        return this.editor.getValue()
      }
      return ''
    },

    getPosition() {
      return this.position
    },

    setPosition(position) {
      if (this.editor) {
        this.editor.setPosition(position)
      }
    },

    setPyodide(pyodide) {
      this.pyodide = pyodide
    },

    // initializeCompletion() {
    //   // 代码补全功能已禁用（需要联网下载 Jedi 包）
    //   console.log('Code completion disabled (requires network to download Jedi)')
    // },
  },
  mounted() {
    this.editor = monaco.editor.create(this.$refs.editorContainer, {
      value: this.value,
      language: this.language,
      theme: this.theme,
      readOnly: !this.editable,
      automaticLayout: true,
      minimap: { enabled: false },
      wordWrap: 'on',
      trimAutoWhitespace: true,
      wordBasedSuggestions: 'currentDocument',
      scrollbar: {
        alwaysConsumeMouseWheel: false,
        vertical: 'auto',
        horizontal: 'auto',
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      ...this.options,
    })
    this.editor.onDidChangeModelContent(() => {
      this.$emit('update:value', this.editor.getValue())
    })

    this.editor.onDidChangeCursorPosition((e) => {
      this.position = e.position
    })

    this.initializeCompletion()

    window.addEventListener('resize', this.updateEditorSize)
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.dispose()
    }
    window.removeEventListener('resize', this.updateEditorSize)
  },
}
</script>

<style>
.editor-container {
  width: 100%;
  height: 100%;
  border: 1px solid #ebeef5;
  margin: 4px;
}
</style>
