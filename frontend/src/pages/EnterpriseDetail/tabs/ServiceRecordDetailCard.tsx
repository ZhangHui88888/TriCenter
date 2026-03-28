// @ts-nocheck
import type { CSSProperties } from 'react';
import { useState, useCallback } from 'react';
import { Row, Col, Space, Button, Rate, Typography, Popconfirm, message } from 'antd';
import {
  CalendarOutlined,
  TeamOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { SERVICE_TYPE_MAP, STATUS_MAP, LEVEL_MAP, ASSESSMENT_DIMENSIONS } from '../constants';
import ServiceRecordAttachmentsBlock from './ServiceRecordAttachmentsBlock';
import { normalizeAttachmentList } from '../components/CooperationAttachmentsEditor';
import ServiceRecordCardAttachmentActions from './ServiceRecordCardAttachmentActions';
import { buildServiceRecordUpdateBodyWithAssessmentPatch } from './serviceRecordUpdatePayload';
import { serviceRecordApi } from '@/services/api';

const { Text } = Typography;

/** 图书详情式排版：衬线标题 + 无衬线正文/元信息（参考 Open Library 类详情页） */
const EDITORIAL = {
  serif: 'Georgia, "Noto Serif SC", "Source Han Serif SC", "Songti SC", "SimSun", serif',
  sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  title: '#111827',
  body: '#1f2937',
  meta: '#6b7280',
  rule: '#e5e7eb',
};

const subjectPillStyle: CSSProperties = {
  display: 'inline-block',
  fontFamily: EDITORIAL.sans,
  fontSize: 13,
  fontWeight: 400,
  color: EDITORIAL.title,
  padding: '5px 12px',
  borderRadius: 999,
  border: '1px solid #e0e0e0',
  background: '#fff',
  lineHeight: 1.35,
  boxSizing: 'border-box',
};

export interface ServiceRecordDetailCardProps {
  enterpriseId: number;
  record: any;
  onEdit: (r: any) => void;
  onDelete: (r: any) => void;
  /** 附件保存成功后刷新列表，使卡片展示最新附件 */
  onAttachmentsChange?: () => void;
  /** 用后端返回的单条记录合并进列表（优先保证附件立即显示） */
  mergeServiceRecordInState?: (updated: any) => void;
}

export default function ServiceRecordDetailCard({
  enterpriseId,
  record: r,
  onEdit,
  onDelete,
  onAttachmentsChange,
  mergeServiceRecordInState,
}: ServiceRecordDetailCardProps) {
  const [savingDimensionKey, setSavingDimensionKey] = useState<string | null>(null);
  const typeInfo = SERVICE_TYPE_MAP[r.serviceType] || SERVICE_TYPE_MAP.other;
  const statusInfo = STATUS_MAP[r.status] || STATUS_MAP.pending;
  const levelInfo = r.projectLevel ? LEVEL_MAP[r.projectLevel] : null;
  const assessment = r.assessmentData as Record<string, number> | undefined;
  const attachmentMetas = normalizeAttachmentList(r.attachments);

  const handleAssessmentChange = useCallback(
    async (dimKey: string, value: number) => {
      setSavingDimensionKey(dimKey);
      try {
        const body = buildServiceRecordUpdateBodyWithAssessmentPatch(r, dimKey, value, attachmentMetas);
        const putRes = await serviceRecordApi.update(enterpriseId, r.id, body);
        if (putRes?.data) mergeServiceRecordInState?.(putRes.data);
        onAttachmentsChange?.();
      } catch {
        message.error('保存评分失败');
      } finally {
        setSavingDimensionKey(null);
      }
    },
    [r, enterpriseId, attachmentMetas, mergeServiceRecordInState, onAttachmentsChange],
  );

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${EDITORIAL.rule}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '22px 24px 18px', borderBottom: `1px solid ${EDITORIAL.rule}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 22,
                fontWeight: 500,
                color: EDITORIAL.title,
                lineHeight: 1.3,
                letterSpacing: '-0.02em',
              }}
            >
              {r.serviceName}
            </div>
            <ServiceRecordCardAttachmentActions
              enterpriseId={enterpriseId}
              record={r}
              mergeServiceRecordInState={mergeServiceRecordInState}
              onAttachmentsChange={onAttachmentsChange}
            />
          </div>
          <Space size={4}>
            <Button type="text" size="small" icon={<EditOutlined style={{ color: '#6b7280' }} />} onClick={() => onEdit(r)} />
            <Popconfirm title="确定删除这条记录吗？" onConfirm={() => onDelete(r)} okText="确定" cancelText="取消">
              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        </div>
        <div
          style={{
            fontFamily: EDITORIAL.sans,
            fontSize: 12,
            color: EDITORIAL.meta,
            marginTop: 14,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px 22px',
            lineHeight: 1.5,
          }}
        >
          {r.serviceDate && (
            <span>
              <CalendarOutlined style={{ marginRight: 6, opacity: 0.7 }} />
              {r.serviceDate}
            </span>
          )}
          {r.responsibleName && (
            <span>
              <TeamOutlined style={{ marginRight: 6, opacity: 0.7 }} />
              {r.responsibleName}
            </span>
          )}
          {r.providerName && <span>服务商 {r.providerName}</span>}
          {r.contractNo && (
            <span>
              <FileTextOutlined style={{ marginRight: 6, opacity: 0.7 }} />
              {r.contractNo}
            </span>
          )}
          {r.benchmarkPossibility != null && r.benchmarkPossibility > 0 && (
            <span>标杆企业可能性 {r.benchmarkPossibility}%</span>
          )}
        </div>
      </div>
      <div style={{ padding: '22px 24px 26px', fontFamily: EDITORIAL.sans }}>
        {r.description && (
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 16,
                fontWeight: 500,
                color: EDITORIAL.title,
                marginBottom: 10,
              }}
            >
              服务内容
            </div>
            <Text style={{ fontSize: 15, color: EDITORIAL.body, lineHeight: 1.65, display: 'block' }}>{r.description}</Text>
          </div>
        )}
        {r.result && (
          <div
            style={{
              marginBottom: 22,
              paddingLeft: 14,
              borderLeft: '2px solid #16DBCC',
            }}
          >
            <div
              style={{
                fontFamily: EDITORIAL.serif,
                fontSize: 16,
                fontWeight: 500,
                color: EDITORIAL.title,
                marginBottom: 10,
              }}
            >
              服务成果
            </div>
            <Text style={{ fontSize: 15, color: EDITORIAL.body, lineHeight: 1.65, display: 'block' }}>{r.result}</Text>
          </div>
        )}
        <ServiceRecordAttachmentsBlock
          raw={r.attachments}
          serifTitleStyle={{
            fontFamily: EDITORIAL.serif,
            fontSize: 16,
            fontWeight: 500,
            color: EDITORIAL.title,
            marginBottom: 10,
          }}
        />
        <div style={{ marginTop: 8 }}>
          <div
            style={{
              fontFamily: EDITORIAL.serif,
              fontSize: 16,
              fontWeight: 500,
              color: EDITORIAL.title,
              marginBottom: 8,
            }}
          >
            可行性评估（本条记录）
          </div>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 14, color: EDITORIAL.meta }}>
            点击星级立即保存；再次点击同一颗星可清空该维度。
          </Text>
          <Row gutter={[14, 14]}>
            {ASSESSMENT_DIMENSIONS.map((d) => (
              <Col span={12} key={d.key} xs={24} sm={12}>
                <div
                  style={{
                    padding: '14px 16px',
                    background: '#fafafa',
                    borderRadius: 6,
                    border: `1px solid ${EDITORIAL.rule}`,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: 600, color: EDITORIAL.body, lineHeight: 1.5, display: 'block' }}>
                    {d.label}{' '}
                    <span style={{ color: EDITORIAL.meta, fontSize: 12, fontWeight: 400 }}>({d.desc})</span>
                  </Text>
                  <Rate
                    allowClear
                    count={5}
                    value={assessment?.[d.key] ?? 0}
                    disabled={savingDimensionKey === d.key}
                    onChange={(v) => void handleAssessmentChange(d.key, v)}
                    style={{ fontSize: 14, display: 'block', marginTop: 8 }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: `1px solid ${EDITORIAL.rule}`,
          }}
        >
          <div
            style={{
              fontFamily: EDITORIAL.serif,
              fontSize: 15,
              fontWeight: 500,
              color: EDITORIAL.title,
              marginBottom: 10,
            }}
          >
            标签
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={subjectPillStyle}>{typeInfo.label}</span>
            <span style={subjectPillStyle}>{statusInfo.label}</span>
            {levelInfo && (
              <span style={subjectPillStyle}>
                {levelInfo.label}
                {r.feasibilityScore != null && r.feasibilityScore !== '' ? ` ${r.feasibilityScore}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
