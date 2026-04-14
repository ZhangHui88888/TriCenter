// @ts-nocheck
import { Card, Select, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { FUNNEL_STAGES } from '../constants';
import { enterpriseApi } from '@/services/api';
import { message } from 'antd';

const { Title, Text } = Typography;

interface EnterpriseHeaderProps {
  enterprise: any;
  setEnterprise: (fn: any) => void;
  setSelectedStage: (v: string) => void;
}

export default function EnterpriseHeader({ enterprise, setEnterprise, setSelectedStage }: EnterpriseHeaderProps) {
  return (
    <Card
      data-tour="enterprise-detail-header"
      style={{
        marginBottom: 16,
        background: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        border: 'none',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}
      styles={{ body: { padding: 0 } }}
    >
      {/* 顶部装饰条 */}
      <div style={{
        height: 4,
        background: 'linear-gradient(90deg, #396aff 0%, rgba(57,106,255,0.38) 50%, transparent 100%)',
      }} />

      <div style={{ padding: '28px 32px' }}>
        {/* 主信息区 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {/* 企业头像 */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: 'linear-gradient(145deg, rgba(57,106,255,0.10) 0%, rgba(57,106,255,0.24) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
              fontWeight: 700,
              color: '#396aff',
              border: '2px solid rgba(57,106,255,0.16)',
              boxShadow: '0 8px 24px rgba(57,106,255,0.12)',
              position: 'relative',
            }}>
              {enterprise.enterprise_name.charAt(0)}
              {/* 状态指示器 */}
              <div style={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#396aff',
                border: '3px solid #fff',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
              }} />
            </div>

            {/* 企业名称和标签 */}
            <div>
              <Title level={3} style={{ margin: 0, fontWeight: 700, letterSpacing: -0.5, fontSize: 22 }}>
                {enterprise.enterprise_name}
              </Title>
              <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 14px',
                  background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)',
                  borderRadius: 20,
                  color: '#00838f',
                  fontWeight: 500,
                  fontSize: 13,
                }}>
                  <EnvironmentOutlined style={{ fontSize: 12 }} />{enterprise.district}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 14px',
                  background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
                  borderRadius: 20,
                  color: '#f57c00',
                  fontWeight: 500,
                  fontSize: 13,
                }}>
                  {enterprise.industry}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '5px 14px',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                  borderRadius: 20,
                  color: '#8e24aa',
                  fontWeight: 500,
                  fontSize: 13,
                }}>
                  {enterprise.enterprise_type}
                </span>
              </div>
            </div>
          </div>

          {/* 右侧操作区 */}
          <div style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            {/* 录入时间 */}
            <div style={{
              textAlign: 'center',
              padding: '12px 20px',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>录入时间</Text>
              <div style={{ fontWeight: 600, color: '#334155', marginTop: 4, fontSize: 14 }}>
                {enterprise.created_at}
              </div>
            </div>

            {/* 漏斗阶段下拉选择器 */}
            <div style={{
              padding: '12px 20px',
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <Text type="secondary" style={{ fontSize: 11, letterSpacing: 0.5 }}>当前阶段</Text>
              <Select
                value={enterprise.funnel_stage}
                onChange={async (value) => {
                  try {
                    await enterpriseApi.updateStage(enterprise.id, value);
                    setEnterprise({ ...enterprise, funnel_stage: value });
                    setSelectedStage(value);
                    message.success('阶段已更新');
                  } catch (error: any) {
                    message.error(error.message || '阶段更新失败');
                  }
                }}
                variant="borderless"
                style={{
                  marginTop: 2,
                  marginLeft: -8,
                  marginRight: -8,
                }}
                styles={{ popup: { root: { borderRadius: 8 } } }}
                options={FUNNEL_STAGES.map(stage => ({
                  label: (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: stage.color,
                      }} />
                      <span>{stage.name}</span>
                    </div>
                  ),
                  value: stage.code,
                }))}
                labelRender={(props) => {
                  const stage = FUNNEL_STAGES.find(s => s.code === props.value);
                  if (!stage) return props.label;
                  return (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      fontWeight: 600,
                      fontSize: 14,
                      color: stage.color,
                    }}>
                      <span style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: stage.color,
                      }} />
                      <span>{stage.name}</span>
                    </div>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
