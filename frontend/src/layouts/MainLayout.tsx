import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Switch, Tooltip, Modal, message, Input } from 'antd';
import {
  DashboardOutlined,
  ShopOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SunOutlined,
  MoonOutlined,
  BookOutlined,
  SearchOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  SettingOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '概览看板' },
  { key: '/enterprise', icon: <ShopOutlined />, label: '企业管理' },
  { key: '/follow-up', icon: <FileTextOutlined />, label: '跟进记录' },
  { key: '/service-records', icon: <CustomerServiceOutlined />, label: '合作服务' },
  { key: '/market-research', icon: <SearchOutlined />, label: '市场调研' },
  { key: '/data-analysis', icon: <BarChartOutlined />, label: '数据分析' },
  { key: '/dictionary', icon: <BookOutlined />, label: '数据字典' },
];

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeStore();
  const { clearAuth } = useAuthStore();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      Modal.confirm({
        title: '确认退出',
        content: '确定要退出登录吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: async () => {
          try { await authApi.logout(); } catch { /* ignore */ }
          clearAuth();
          message.success('已退出登录');
          navigate('/login', { replace: true });
        },
      });
    }
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/enterprise')) return ['/enterprise'];
    if (path.startsWith('/service-records')) return ['/service-records'];
    if (path.startsWith('/market-research')) return ['/market-research'];
    if (path.startsWith('/data-analysis')) return ['/data-analysis'];
    return [path];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{ background: '#fff', borderRight: '1px solid #E6EFF5' }}
      >
        <div style={{
          height: 100, display: 'flex', alignItems: 'center',
          padding: collapsed ? '0 16px' : '0 28px',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 12,
            background: 'linear-gradient(135deg, #396AFF 0%, #2948FF 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0,
          }}>
            三
          </div>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#343C6A', lineHeight: 1.2 }}>
                TriCenter
              </div>
              <div style={{ fontSize: 11, color: '#B1B1B1', marginTop: 2 }}>
                企业信息管理
              </div>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            padding: '16px 0',
            fontSize: 18,
          }}
        />
      </Sider>

      <Layout>
        {/* 顶栏 */}
        <Header style={{
          padding: '0 40px', height: 100, lineHeight: '100px',
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #E6EFF5',
          boxShadow: 'none',
        }}>
          <Space size="large" align="center">
            <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', fontSize: 22, color: '#333' }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <span style={{ fontSize: 28, fontWeight: 600, color: '#343C6A' }}>
              {menuItems?.find(item => item && 'key' in item && getSelectedKeys().includes(item.key as string))
                ? (menuItems.find(item => item && 'key' in item && getSelectedKeys().includes(item.key as string)) as any)?.label
                : '概览看板'}
            </span>
          </Space>

          <Space size={20} align="center">
            <Input
              prefix={<SearchOutlined style={{ color: '#8BA3CB' }} />}
              placeholder="搜索..."
              style={{
                width: 255, height: 50, borderRadius: 40,
                background: '#F5F7FA', border: 'none',
                fontSize: 15,
              }}
            />
            <Tooltip title={mode === 'dark' ? '切换亮色' : '切换暗色'}>
              <Switch
                checked={mode === 'dark'} onChange={toggleTheme}
                checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />}
                style={{ background: mode === 'dark' ? '#396AFF' : '#d9d9d9' }}
              />
            </Tooltip>
            <div style={{
              width: 50, height: 50, borderRadius: '50%',
              background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#396AFF', fontSize: 20,
            }}>
              <SettingOutlined />
            </div>
            <div style={{
              width: 50, height: 50, borderRadius: '50%', position: 'relative',
              background: '#F5F7FA', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#FE5C73', fontSize: 20,
            }}>
              <BellOutlined />
              <div style={{
                position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                borderRadius: 4, background: '#FE5C73', border: '2px solid #fff',
              }} />
            </div>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={60}
                  style={{ background: 'linear-gradient(135deg, #396AFF 0%, #2948FF 100%)' }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区 */}
        <Content style={{
          padding: '28px 40px',
          background: mode === 'dark' ? '#111827' : '#F5F7FA',
          overflow: 'auto',
          transition: 'background 0.3s ease',
        }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
