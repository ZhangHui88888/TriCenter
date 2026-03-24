import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // echarts / html2pdf+exceljs 单包即约 1MB+，拆出后仍超默认 500k 阈值
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // 仅拆独立大图依赖，避免与默认 vendor 形成循环 chunk；其余由 Rollup 自动分包
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('echarts')) return 'echarts'
          if (id.includes('exceljs') || id.includes('html2pdf')) return 'export-libs'
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // 使用 127.0.0.1，避免 Windows 上 localhost 解析到 ::1 而后端只监听 IPv4 导致 ECONNREFUSED
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
})
