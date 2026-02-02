import React from 'react';
import { Skeleton, Card, Row, Col } from 'antd';

interface PageLoadingProps {
  type?: 'list' | 'detail' | 'dashboard' | 'table';
}

const PageLoading: React.FC<PageLoadingProps> = ({ type = 'list' }) => {
  if (type === 'dashboard') {
    return (
      <div style={{ padding: 24 }}>
        <Row gutter={[16, 16]}>
          {[1, 2, 3, 4].map((i) => (
            <Col span={6} key={i}>
              <Card>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={16}>
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  if (type === 'detail') {
    return (
      <div style={{ padding: 24 }}>
        <Card style={{ marginBottom: 16 }}>
          <Skeleton avatar active paragraph={{ rows: 2 }} />
        </Card>
        <Card>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <Skeleton.Input active style={{ width: 200, marginRight: 16 }} />
            <Skeleton.Button active style={{ marginRight: 8 }} />
            <Skeleton.Button active />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <Skeleton.Input active style={{ width: 150 }} />
              <Skeleton.Input active style={{ width: 100 }} />
              <Skeleton.Input active style={{ width: 80 }} />
              <Skeleton.Input active style={{ width: 120 }} />
              <Skeleton.Button active size="small" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    </div>
  );
};

export default PageLoading;
