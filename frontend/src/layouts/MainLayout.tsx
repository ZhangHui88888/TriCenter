import { useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Avatar, Button, Drawer, Dropdown, Grid, Space, Switch, Tag, Tooltip, Modal, message } from 'antd';
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
  BarChartOutlined,
  ApartmentOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  DownOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useThemeStore } from '@/stores/themeStore';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api';
import AppGuide from '@/components/AppGuide';
import { citySwitchTransaction } from '@/services/citySession';
import { publishAuthSync } from '@/services/authSync';
import { useCitySwitchGuardStore } from '@/stores/citySwitchGuardStore';

const { Header, Sider, Content } = Layout;

const baseMenuItems: MenuProps['items'] = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '概览看板' },
  { key: '/data-analysis', icon: <BarChartOutlined />, label: '数据分析' },
  { key: '/enterprise', icon: <ShopOutlined />, label: '企业管理' },
  { key: '/providers', icon: <ApartmentOutlined />, label: '服务商管理' },
  { key: '/follow-up', icon: <FileTextOutlined />, label: '跟进记录' },
  { key: '/service-records', icon: <CustomerServiceOutlined />, label: '合作服务' },
  { key: '/market-research', icon: <SearchOutlined />, label: '市场调研' },
];

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
  { type: 'divider' },
  { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
];

function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const screens = Grid.useBreakpoint();
  const isMobile = !screens.md;
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleTheme } = useThemeStore();
  const {
    clearAuth,
    currentCity,
    availableCities,
    hasPermission,
  } = useAuthStore();
  const switchingCity = useCitySwitchGuardStore((state) => state.switching);
  const menuItems = useMemo<MenuProps['items']>(() => {
    const items = [...(baseMenuItems || [])];
    if (hasPermission('dictionary:manage')) {
      items.push({ key: '/dictionary', icon: <BookOutlined />, label: '数据字典' });
    }
    if (hasPermission('user:manage')) {
      items.push({ key: '/admin/users', icon: <TeamOutlined />, label: '用户与城市权限' });
    }
    return items;
  }, [hasPermission]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    setMobileNavOpen(false);
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
          publishAuthSync('AUTH_CLEARED', '/login');
          message.success('已退出登录');
          navigate('/login', { replace: true });
        },
      });
    }
  };

  const switchCity = async (cityId: number) => {
    if (cityId === currentCity?.id || switchingCity) return;
    try {
      const session = await citySwitchTransaction.switchCity(cityId);
      message.success(`已切换到${session.currentCity?.name || '目标城市'}`);
      navigate('/dashboard', { replace: true });
    } catch {
      // 失败提示由请求拦截器统一处理，当前城市和页面保持不变。
    }
  };

  const handleCityMenuClick: MenuProps['onClick'] = ({ key }) => {
    const cityId = Number(key);
    if (cityId === currentCity?.id) return;
    const guard = useCitySwitchGuardStore.getState();
    if (guard.hasBusy()) {
      message.warning('当前有数据正在提交，请稍候再切换城市');
      return;
    }
    if (guard.hasDirty()) {
      const labels = guard.dirtyLabels();
      Modal.confirm({
        title: '确认切换城市',
        content: `切换后将返回概览看板，未保存内容会被放弃${labels.length ? `：${labels.join('、')}` : ''}。`,
        okText: '确认切换',
        cancelText: '取消',
        onOk: () => switchCity(cityId),
      });
      return;
    }
    void switchCity(cityId);
  };

  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/enterprise')) return ['/enterprise'];
    if (path.startsWith('/service-records')) return ['/service-records'];
    if (path.startsWith('/market-research')) return ['/market-research'];
    if (path.startsWith('/data-analysis')) return ['/data-analysis'];
    if (path.startsWith('/providers')) return ['/providers'];
    if (path.startsWith('/admin/users')) return ['/admin/users'];
    return [path];
  };

  const currentTitle =
    (menuItems || []).find((item) => item && 'key' in item && getSelectedKeys().includes(item.key as string));
  const cityMenuItems: MenuProps['items'] = availableCities.map((city) => ({
    key: String(city.id),
    icon: <EnvironmentOutlined />,
    label: city.name,
    disabled: city.id === currentCity?.id,
  }));
  const navigation = (navigationCollapsed: boolean) => (
    <>
      <div style={{
        height: isMobile ? 76 : 100, display: 'flex', alignItems: 'center',
        padding: navigationCollapsed ? '0 16px' : '0 28px',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: 'linear-gradient(135deg, #396AFF 0%, #2948FF 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, color: '#fff', fontWeight: 700, flexShrink: 0,
        }}>
          三
        </div>
        {!navigationCollapsed && (
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
        style={{ border: 'none', padding: '16px 0', fontSize: 18 }}
      />
    </>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          placement="left"
          width={280}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          styles={{ body: { padding: 0 } }}
          aria-label="主导航"
        >
          {navigation(false)}
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          style={{ background: '#fff', borderRight: '1px solid #E6EFF5' }}
        >
          {navigation(collapsed)}
        </Sider>
      )}

      <Layout>
        {/* 顶栏 */}
        <Header style={{
          padding: isMobile ? '0 16px' : '0 40px', height: isMobile ? 72 : 100,
          lineHeight: isMobile ? '72px' : '100px',
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #E6EFF5',
          boxShadow: 'none',
        }}>
          <Space size="large" align="center">
            <Button
              type="text"
              aria-label={isMobile ? '打开主导航' : collapsed ? '展开侧边导航' : '收起侧边导航'}
              aria-expanded={isMobile ? mobileNavOpen : !collapsed}
              icon={isMobile || collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => isMobile ? setMobileNavOpen(true) : setCollapsed(!collapsed)}
              style={{ fontSize: 22, color: '#333' }}
            />
            <span style={{ fontSize: isMobile ? 20 : 28, fontWeight: 600, color: '#343C6A' }}>
              {currentTitle && 'label' in currentTitle ? currentTitle.label : '概览看板'}
            </span>
          </Space>

          <Space size={20} align="center">
            {currentCity && availableCities.length > 1 ? (
              <Dropdown
                menu={{ items: cityMenuItems, onClick: handleCityMenuClick }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  loading={switchingCity}
                  icon={<EnvironmentOutlined />}
                  style={{ borderRadius: 10, position: 'relative', zIndex: 1101 }}
                >
                  {currentCity.name}<DownOutlined style={{ fontSize: 11 }} />
                </Button>
              </Dropdown>
            ) : currentCity ? (
              <Tag icon={<EnvironmentOutlined />} color="blue" style={{ margin: 0, padding: '5px 10px', borderRadius: 10 }}>
                {currentCity.name}
              </Tag>
            ) : null}
            {!isMobile && <AppGuide />}
            <Tooltip title={mode === 'dark' ? '切换亮色' : '切换暗色'}>
              <Switch
                checked={mode === 'dark'} onChange={toggleTheme}
                checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />}
                style={{ background: mode === 'dark' ? '#396AFF' : '#d9d9d9' }}
              />
            </Tooltip>
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar
                  size={isMobile ? 40 : 60}
                  style={{ background: 'linear-gradient(135deg, #396AFF 0%, #2948FF 100%)' }}
                  icon={<UserOutlined />}
                />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 内容区 */}
        <Content style={{
          padding: isMobile ? 16 : '28px 40px',
          background: mode === 'dark' ? '#111827' : '#F5F7FA',
          overflow: 'auto',
          transition: 'background 0.3s ease',
        }}>
          <Outlet key={currentCity?.id} />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout;
