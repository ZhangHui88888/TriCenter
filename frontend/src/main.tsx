import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/** 语言与主题仅在 App.tsx 的 ConfigProvider 中配置一层，避免双层 Provider 导致 message/notification 不显示 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
