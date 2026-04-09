import { Card, Row, Col, Select, Typography } from 'antd';
import {
  EnterpriseDetailSectionHint,
  enterpriseDetailCardTitle,
} from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';
import { dimensions } from '@/data/requirementsData';

const { Text } = Typography;

interface RequirementDimensionSelectorProps {
  dimensionSelections: Record<string, string[]>;
  setDimensionSelections: (v: Record<string, string[]>) => void;
  saveEnterpriseFields: (fields: Record<string, any>, msg: string) => Promise<void>;
}

export default function RequirementDimensionSelector({
  dimensionSelections,
  setDimensionSelections,
  saveEnterpriseFields,
}: RequirementDimensionSelectorProps) {
  return (
    <Card
      title={enterpriseDetailCardTitle('企业画像维度选择', 'req-dimensions')}
      size="small"
      style={{ marginBottom: 16, borderRadius: 12, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
      headStyle={{ borderBottom: '1px solid #f0f0f0' }}
    >
      <Row gutter={[16, 16]}>
        {dimensions.map(dim => (
          <Col span={dim.key === 'ecommerceExp' ? 24 : 12} key={dim.key}>
            <div style={{ marginBottom: 4 }}>
              <Text strong style={{ fontSize: 13 }}>{dim.name}</Text>
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                {dim.multiple ? '（可多选）' : '（单选）'}
              </Text>
              <EnterpriseDetailSectionHint sectionKey={`req-dimension-${dim.key}`} />
            </div>
            <Select
              mode={dim.multiple ? 'multiple' : undefined}
              style={{ width: '100%' }}
              placeholder={`请选择${dim.name}`}
              value={dimensionSelections[dim.key] || (dim.multiple ? [] : undefined)}
              onChange={(value) => {
                const newSelections = {
                  ...dimensionSelections,
                  [dim.key]: Array.isArray(value) ? value : (value ? [value] : []),
                };
                setDimensionSelections(newSelections);
                saveEnterpriseFields({ dimensionSelections: newSelections }, '维度选择已保存');
              }}
              allowClear
              options={dim.options.map(opt => ({
                label: (
                  <div>
                    <span>{opt.label}</span>
                    {opt.description && (
                      <span style={{ fontSize: 11, color: '#999', marginLeft: 8 }}>{opt.description}</span>
                    )}
                  </div>
                ),
                value: opt.value,
              }))}
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
}
