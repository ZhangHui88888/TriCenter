import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import EnterpriseList from './pages/EnterpriseList'
import EnterpriseDetail from './pages/EnterpriseDetail'
import FollowUpRecords from './pages/FollowUpRecords'
import FunnelAnalysis from './pages/FunnelAnalysis'
import DataDictionary from './pages/DataDictionary'
import Login from './pages/Login'
import AuthGuard from './components/AuthGuard'
import { useThemeStore } from './stores/themeStore'
import { lightTheme, darkTheme } from './theme/themeConfig'

function App() {
  const { mode } = useThemeStore()
  const themeConfig = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <div className={mode === 'dark' ? 'dark-mode' : 'light-mode'}>
        <BrowserRouter>
          <Routes>
            {/* 登录页面 */}
            <Route path="/login" element={<Login />} />
            
            {/* 需要认证的页面 */}
            <Route path="/" element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="enterprise" element={<EnterpriseList />} />
              <Route path="enterprise/:id" element={<EnterpriseDetail />} />
              <Route path="funnel" element={<FunnelAnalysis />} />
              <Route path="follow-up" element={<FollowUpRecords />} />
              <Route path="dictionary" element={<DataDictionary />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </div>
    </ConfigProvider>
  )
}

export default App
