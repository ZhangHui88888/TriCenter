import { Select, Row, Col, Button, Space, Modal, Form, Tabs, InputNumber, DatePicker, theme } from 'antd';
import type { CSSProperties } from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { requirements } from '@/data/requirementsData';
import { CROSSBORDER_PLATFORMS, ENTERPRISE_TYPE_OPTIONS, TRANSFORMATION_WILLINGNESS } from '@/utils/constants';
import { FUNNEL_STAGES } from './types';
import type { useDataAnalysis } from './useDataAnalysis';

export default function AnalysisFiltersModal({ state }: { state: ReturnType<typeof useDataAnalysis> }) {
  const { token } = theme.useToken();
  const { isFilterModalOpen, setIsFilterModalOpen, handleResetFilters, handleApplyFilters, filterForm,
    staffSizeOptions, domesticRevenueOptions, sourceOptions, districts, automationLevelOptions, logisticsOptions } = state;
  return (
      <Modal
        forceRender
        className="analysis-filter-dialog"
        style={{ '--filter-fill': token.colorFillQuaternary, '--filter-border': token.colorTextQuaternary, '--filter-muted': token.colorTextSecondary } as CSSProperties}
        styles={{ body: { maxHeight: 'min(65vh, 640px)', overflowY: 'auto', overflowX: 'hidden', paddingInline: 8 } }}
        maskClosable={false}
        title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FilterOutlined style={{ color: 'var(--primary-color)' }} /><span>高级筛选条件</span></div>}
        open={isFilterModalOpen}
        onCancel={() => setIsFilterModalOpen(false)}
        width={800}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={handleResetFilters}>重置全部</Button>
            <Space>
              <Button onClick={() => setIsFilterModalOpen(false)}>取消</Button>
              <Button type="primary" onClick={handleApplyFilters} style={{ background: 'var(--primary-color)', border: 'none', borderRadius: 12 }}>应用筛选</Button>
            </Space>
          </div>
        }
      >
        <Form form={filterForm} layout="vertical" style={{ marginTop: 16 }}>
          <Tabs items={[
            { key: 'basic', label: '基本信息', children: (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}><Form.Item name="entry_date_range" label="录入时间"><DatePicker.RangePicker allowClear style={{ width: '100%' }} placeholder={['开始日期', '结束日期']} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="enterprise_type" label="企业类型"><Select placeholder="请选择" allowClear options={ENTERPRISE_TYPE_OPTIONS} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="employee_scale" label="人员规模"><Select placeholder="请选择" allowClear options={staffSizeOptions} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="domestic_revenue" label="国内营收(万元)"><Select placeholder="请选择" allowClear options={domesticRevenueOptions} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="crossborder_revenue_min_wan" label="跨境营收≥(万元)"><InputNumber min={0} placeholder="最小" style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="crossborder_revenue_max_wan" label="跨境营收≤(万元)"><InputNumber min={0} placeholder="最大" style={{ width: '100%' }} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="source" label="企业来源"><Select mode="multiple" maxTagCount="responsive" placeholder="请选择" allowClear options={sourceOptions} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="district" label="区县"><Select placeholder="请选择" allowClear options={districts.map(d => ({ label: d, value: d }))} /></Form.Item></Col>
              </Row>
            )},
            { key: 'product', label: '产品信息', children: (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}><Form.Item name="automation_level" label="设备自动化程度"><Select placeholder="请选择" allowClear options={automationLevelOptions} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="logistics_partners" label="物流合作方"><Select mode="multiple" placeholder="请选择" allowClear options={logisticsOptions} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="local_procurement_ratio" label="本地采购比例"><Select placeholder="请选择" allowClear options={['90%以上', '70%-90%', '50%-70%', '30%-50%', '30%以下'].map(v => ({ label: v, value: v }))} /></Form.Item></Col>
              </Row>
            )},
            { key: 'crossborder', label: '跨境电商', children: (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}><Form.Item name="has_crossborder" label="是否开展跨境电商"><Select placeholder="请选择" allowClear options={[{ label: '是', value: true }, { label: '否', value: false }]} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="main_platforms" label="主要跨境平台"><Select mode="multiple" placeholder="请选择" allowClear options={CROSSBORDER_PLATFORMS.map(p => ({ label: p, value: p }))} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="transformation_willingness" label="跨境转型意愿"><Select placeholder="请选择" allowClear options={TRANSFORMATION_WILLINGNESS.map(w => ({ label: w, value: w }))} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="has_erp" label="是否在用ERP"><Select placeholder="请选择" allowClear options={[{ label: '是', value: true }, { label: '否', value: false }]} /></Form.Item></Col>
              </Row>
            )},
            { key: 'followup', label: '跟进记录', children: (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}><Form.Item name="funnel_stage" label="漏斗阶段"><Select mode="multiple" maxTagCount="responsive" placeholder="请选择" allowClear options={FUNNEL_STAGES.map(s => ({ label: s.name, value: s.code }))} /></Form.Item></Col>
                <Col xs={24} sm={12} md={8}><Form.Item name="last_followup_days" label="最近跟进时间"><Select placeholder="请选择" allowClear options={[{ label: '7天内', value: 7 }, { label: '15天内', value: 15 }, { label: '30天内', value: 30 }, { label: '超过30天', value: -30 }]} /></Form.Item></Col>
              </Row>
            )},
            { key: 'requirements', label: '需求分析', children: (
              <div>
                <div style={{ marginBottom: 12, color: 'inherit', fontSize: 13 }}>选择需求项，筛选具有相关需求的企业</div>
                {['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'].map(phase => {
                  const phaseReqs = requirements.filter(r => r.phase === phase);
                  const cats = [...new Set(phaseReqs.map(r => r.category))];
                  return (
                    <div key={phase} style={{ marginBottom: 16 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, padding: '4px 10px', background: 'rgba(67,97,238,0.1)', color: 'var(--primary-color)', borderRadius: 6, display: 'inline-block' }}>{phase}</div>
                      <Row gutter={[12, 8]}>
                        {cats.map(cat => (
                          <Col xs={24} sm={12} key={cat}>
                            <Form.Item name={['requirements', `${phase}_${cat}`]} label={<span style={{ fontSize: 12, color: 'inherit' }}>{cat}</span>} style={{ marginBottom: 8 }}>
                              <Select mode="multiple" placeholder="选择需求" allowClear maxTagCount={2} options={phaseReqs.filter(r => r.category === cat).map(r => ({ label: `${r.id} ${r.name}`, value: r.id }))} />
                            </Form.Item>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  );
                })}
              </div>
            )},
          ]} />
        </Form>
      </Modal>
  );
}
