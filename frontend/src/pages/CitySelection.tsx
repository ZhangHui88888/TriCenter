import { useState } from 'react';
import { Alert, Button, Card, Space, Typography, message } from 'antd';
import { EnvironmentOutlined, ArrowRightOutlined, LogoutOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import type { LoginResponseData } from '@/types/auth';

const { Title, Text } = Typography;

export default function CitySelection() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    requiresCitySelection,
    currentCity,
    availableCities,
    setAuth,
    clearAuth,
  } = useAuthStore();
  const [selectingId, setSelectingId] = useState<number | null>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!requiresCitySelection && currentCity) {
    return <Navigate to="/dashboard" replace />;
  }

  const selectCity = async (cityId: number) => {
    setSelectingId(cityId);
    try {
      const response = await authApi.selectCity(cityId);
      const session = response.data as LoginResponseData;
      setAuth(session);
      message.success(`已进入${session.currentCity?.name || '所选城市'}`);
      navigate('/dashboard', { replace: true });
    } finally {
      setSelectingId(null);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // 待选令牌失效时仍应允许本地退出。
    }
    clearAuth();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'linear-gradient(135deg, #f4f7ff 0%, #eefbf9 100%)',
      }}
    >
      <Card
        style={{ width: '100%', maxWidth: 720, borderRadius: 24, border: 'none', boxShadow: '0 24px 70px rgba(45, 72, 150, 0.14)' }}
        styles={{ body: { padding: '44px 48px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 58,
              height: 58,
              margin: '0 auto 18px',
              borderRadius: 18,
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              fontSize: 26,
              background: 'linear-gradient(135deg, #396AFF, #16DBCC)',
            }}
          >
            <EnvironmentOutlined />
          </div>
          <Title level={2} style={{ color: '#343C6A', marginBottom: 8 }}>选择工作城市</Title>
          <Text type="secondary">本次会话只能访问所选城市的数据，进入系统后仍可切换。</Text>
        </div>

        {availableCities.length === 0 ? (
          <Alert
            type="warning"
            showIcon
            message="当前账号没有可用城市"
            description="请联系系统管理员为账号分配至少一个城市权限。"
          />
        ) : (
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            {availableCities.map((city) => (
              <Button
                key={city.id}
                block
                size="large"
                loading={selectingId === city.id}
                disabled={selectingId !== null && selectingId !== city.id}
                onClick={() => void selectCity(city.id)}
                style={{
                  height: 68,
                  padding: '0 22px',
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 17,
                  color: '#343C6A',
                }}
              >
                <span><EnvironmentOutlined style={{ color: '#396AFF', marginRight: 12 }} />{city.name}</span>
                <ArrowRightOutlined />
              </Button>
            ))}
          </Space>
        )}

        <Button type="text" icon={<LogoutOutlined />} onClick={() => void logout()} style={{ display: 'block', margin: '24px auto 0' }}>
          退出登录
        </Button>
      </Card>
    </div>
  );
}
