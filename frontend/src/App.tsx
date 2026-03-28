import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { App as AntdApp, ConfigProvider, Spin } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import MainLayout from './layouts/MainLayout'
import AuthGuard from './components/AuthGuard'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const EnterpriseList = lazy(() => import('./pages/EnterpriseList'))
const EnterpriseDetail = lazy(() => import('./pages/EnterpriseDetail'))
const FollowUpRecords = lazy(() => import('./pages/FollowUpRecords'))
const MarketResearch = lazy(() => import('./pages/MarketResearch'))
const DataDictionary = lazy(() => import('./pages/DataDictionary'))
const ServiceRecords = lazy(() => import('./pages/ServiceRecords'))
const DataAnalysis = lazy(() => import('./pages/DataAnalysis'))
const ProviderList = lazy(() => import('./pages/ProviderList'))
import { useThemeStore } from './stores/themeStore'
import { lightTheme, darkTheme } from './theme/themeConfig'

function App() {
  const { mode } = useThemeStore()
  const themeConfig = mode === 'dark' ? darkTheme : lightTheme

  return (
    <ConfigProvider theme={themeConfig} locale={zhCN}>
      <AntdApp>
        <div className={mode === 'dark' ? 'dark-mode' : 'light-mode'}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Spin size="large" />
              </div>
            }
          >
            <Routes>
              {/* 登录页面 */}
              <Route path="/login" element={<Login />} />

              {/* 需要认证的页面 */}
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <MainLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="enterprise" element={<EnterpriseList />} />
                <Route path="providers" element={<ProviderList />} />
                <Route path="enterprise/:id" element={<EnterpriseDetail />} />
                <Route path="market-research" element={<MarketResearch />} />
                <Route path="follow-up" element={<FollowUpRecords />} />
                <Route path="service-records" element={<ServiceRecords />} />
                <Route path="data-analysis" element={<DataAnalysis />} />
                <Route path="dictionary" element={<DataDictionary />} />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
        </div>
      </AntdApp>
    </ConfigProvider>
  )
}

export default App
