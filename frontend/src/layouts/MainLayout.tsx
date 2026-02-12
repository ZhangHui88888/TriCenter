import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, theme, Switch, Tooltip, Modal, message } from 'antd';
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
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '概览看板',
  },
  {
    key: '/enterprise',
    icon: <ShopOutlined />,
    label: '企业管理',
  },
  {
    key: '/follow-up',
    icon: <FileTextOutlined />,
    label: '跟进记录',
  },
  {
    key: '/dictionary',
    icon: <BookOutlined />,
    label: '数据字典',
  },
];

const userMenuItems: MenuProps['items'] = [
  {
    key: 'profile',
    icon: <UserOutlined />,
    label: '个人中心',
  },
  {
    type: 'divider',
  },
  {
    key: 'logout',
    icon: <LogoutOutlined />,
    label: '退出登录',
  },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { mode, toggleTheme } = useThemeStore();
  const { user, clearAuth } = useAuthStore();

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
          try {
            await authApi.logout();
          } catch (e) {
            // 忽略登出接口错误
          }
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
    return [path];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: 'linear-gradient(180deg, #1a1f35 0%, #2d1f47 100%)',
        }}
        width={240}
      >
        <div
          style={{
            height: 64,
            padding: collapsed ? '16px 8px' : '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h1
            style={{
              color: '#fff',
              fontSize: collapsed ? 14 : 16,
              fontWeight: 'bold',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            }}
          >
            {collapsed ? '三中心' : '常州跨境电商三中心'}
          </h1>
          {!collapsed && (
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, margin: '4px 0 0 0' }}>
              企业信息管理系统
            </p>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            background: 'transparent',
            borderRight: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
              icon={<UserOutlined />}
            />
            {!collapsed && (
              <div>
                <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{user?.name || '用户'}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>
                  {user?.email || user?.username}
                </div>
              </div>
            )}
          </div>
        </div>
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Space size="large">
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{ cursor: 'pointer', fontSize: 18 }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>
            <Tooltip title={mode === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}>
              <Switch
                checked={mode === 'dark'}
                onChange={toggleTheme}
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
              />
            </Tooltip>
          </Space>
          <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} icon={<UserOutlined />} />
              <span>{user?.name || '用户'}</span>
            </Space>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: 0,
            padding: 24,
            background: mode === 'dark' ? '#111827' : '#f5f7fa',
            overflow: 'auto',
            transition: 'background 0.3s ease',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
