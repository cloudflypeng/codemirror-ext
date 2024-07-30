import { defineConfig } from 'vite'

// 库模式
export default defineConfig({
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'codemirror-ext',
      fileName: 'codemirror-ext'
    },
    rollupOptions: {
      external: ['codemirror']
    }
  }
})
