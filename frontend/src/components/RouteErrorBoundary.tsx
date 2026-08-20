import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button, Result } from 'antd';

interface Props { children: ReactNode }
interface State { error: Error | null }

export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Route rendering failed', { error, componentStack: info.componentStack });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const chunkFailed = /chunk|dynamically imported module/i.test(this.state.error.message);
    return (
      <Result
        status="error"
        title={chunkFailed ? '页面资源已更新' : '页面加载失败'}
        subTitle={chunkFailed ? '请刷新以加载最新版本。' : '请重试；若问题持续，请联系管理员。'}
        extra={<Button type="primary" onClick={() => window.location.reload()}>刷新页面</Button>}
      />
    );
  }
}
