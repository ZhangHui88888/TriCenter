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
