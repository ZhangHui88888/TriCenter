import { useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography, Checkbox } from 'antd';
import { UserOutlined, LockOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import AnimatedCharacters from '@/components/AnimatedCharacters';

const { Title, Text } = Typography;

interface LoginForm {
  username: string;
  password: string;
}

function Login() {
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(0);
  const [typingTrigger, setTypingTrigger] = useState(0);
  const [errorTrigger, setErrorTrigger] = useState(0);
  const [pageEntered, setPageEntered] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    let raf1: number;
    let raf2: number;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setPageEntered(true);
      });
    });
    return () => { cancelAnimationFrame(raf1); cancelAnimationFrame(raf2); };
  }, []);

  const onFinish = async (values: LoginForm) => {
    setLoading(true);
    try {
      const res: any = await authApi.login(values);
      const { token, user } = res.data;
      setAuth(token, user);
      message.success(`欢迎回来，${user.name}！`);
      navigate('/dashboard', { replace: true });
    } catch {
      setErrorTrigger((v) => v + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: '#1f2129',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 点阵背景 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          opacity: 0.35,
          pointerEvents: 'none',
        }}
      />

      {/* 主卡片 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1080,
          minHeight: 620,
          display: 'grid',
          gridTemplateColumns: '1.08fr 0.92fr',
          background: '#f7f7fb',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
          opacity: pageEntered ? 1 : 0,
          transform: pageEntered ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.985)',
          transition: 'opacity 0.6s ease, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* 左侧 — 动画角色区 */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#efeff4',
            padding: '56px 24px 40px',
          }}
        >
          <div
            style={{
              transform: pageEntered ? 'scale(0.82)' : 'scale(0.76)',
              transformOrigin: 'center center',
              opacity: pageEntered ? 1 : 0,
              transition: 'opacity 0.7s ease 0.12s, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.12s',
            }}
          >
            <AnimatedCharacters
              isTyping={isTyping}
              showPassword={showPassword}
              passwordLength={passwordLength}
              typingTrigger={typingTrigger}
              errorTrigger={errorTrigger}
            />
          </div>
        </div>

        {/* 右侧 — 登录表单区 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#ffffff',
            padding: '48px 56px',
            opacity: pageEntered ? 1 : 0,
            transform: pageEntered ? 'translateX(0)' : 'translateX(24px)',
            transition: 'opacity 0.65s ease 0.18s, transform 0.75s cubic-bezier(0.22, 1, 0.36, 1) 0.18s',
          }}
        >
          <div style={{ width: '100%', maxWidth: 360 }}>
            {/* Logo + 标题 */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ width: 28, height: 28, margin: '0 auto 20px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: 11, top: 0, width: 6, height: 28, borderRadius: 999, background: '#151515' }} />
                <span style={{ position: 'absolute', left: 0, top: 11, width: 28, height: 6, borderRadius: 999, background: '#151515' }} />
              </div>
              <Title level={2} style={{ marginBottom: 8, color: '#161616', fontWeight: 700 }}>
                Welcome back!
              </Title>
              <Text style={{ color: '#7a7a7a', fontSize: 13 }}>请输入账号信息登录系统</Text>
            </div>

            {/* 表单 */}
            <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical" size="large">
              <Form.Item
                label={<span style={{ fontSize: 13, color: '#1f1f1f' }}>用户名</span>}
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
                style={{ marginBottom: 18 }}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#9b9b9b' }} />}
                  placeholder="请输入用户名"
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onChange={() => setTypingTrigger((v) => v + 1)}
                  style={{ height: 46, border: 'none', borderBottom: '1px solid #d8d8dd', borderRadius: 0, boxShadow: 'none', paddingLeft: 0 }}
                />
              </Form.Item>

              <Form.Item
                label={<span style={{ fontSize: 13, color: '#1f1f1f' }}>密码</span>}
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
                style={{ marginBottom: 18 }}
              >
                <Input
                  prefix={<LockOutlined style={{ color: '#9b9b9b' }} />}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  onFocus={() => setIsTyping(true)}
                  onBlur={() => setIsTyping(false)}
                  onChange={(e) => { setPasswordLength(e.target.value.length); setTypingTrigger((v) => v + 1); }}
                  suffix={
                    <span onClick={() => setShowPassword(!showPassword)} style={{ cursor: 'pointer', color: '#9b9b9b', display: 'flex', alignItems: 'center' }}>
                      {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                    </span>
                  }
                  style={{ height: 46, border: 'none', borderBottom: '1px solid #d8d8dd', borderRadius: 0, boxShadow: 'none', paddingLeft: 0 }}
                />
              </Form.Item>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, marginTop: 2 }}>
                <Checkbox style={{ color: '#7a7a7a', fontSize: 12 }}>记住登录</Checkbox>
                <span style={{ color: '#9a9a9a', fontSize: 12 }}>默认账号：admin / admin123</span>
              </div>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 48, borderRadius: 999, fontSize: 15, fontWeight: 600, background: '#1f2129', border: 'none', boxShadow: 'none' }}
                >
                  {loading ? '登录中...' : 'Log In'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <Title level={4} style={{ marginBottom: 4, color: '#222', fontWeight: 700 }}>常州跨境电商三中心</Title>
              <Text style={{ fontSize: 12, color: '#8a8a8a' }}>企业信息管理系统</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
