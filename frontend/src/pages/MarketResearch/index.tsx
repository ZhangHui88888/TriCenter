import { useRef, useState, useEffect, useCallback } from 'react';
import { Typography, Button, Space, Spin, message, Select, Input, Modal, Card, Row, Col, Tag } from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SearchOutlined,
  KeyOutlined,
  RobotOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import ReportTemplate from './components/ReportTemplate';
import { enterpriseApi } from '@/services/api';
import { setDeepSeekApiKey, getDeepSeekApiKey, hasDeepSeekApiKey } from '@/services/deepseek';
import type { EnterpriseDetail } from '@/types';

const { Title, Text } = Typography;

function MarketResearch() {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [enterpriseList, setEnterpriseList] = useState<Array<{ id: number; enterprise_name: string; industry: string }>>([]);
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number | undefined>();
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseDetail | null>(null);
  const [loadingEnterprise, setLoadingEnterprise] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(hasDeepSeekApiKey());

  const fetchEnterpriseList = useCallback(async (keyword?: string) => {
    try {
      const res: any = await enterpriseApi.getList({ keyword: keyword || undefined, page: 1, pageSize: 50 });
      const raw = res.data?.records || res.data?.list || (Array.isArray(res.data) ? res.data : []);
      const list = raw.map((e: any) => ({
        id: e.id,
        enterprise_name: e.enterprise_name || e.enterpriseName || e.name || '未知企业',
        industry: e.industry || '',
      }));
      setEnterpriseList(list);
    } catch (err) {
      console.error('加载企业列表失败:', err);
    }
  }, []);

  useEffect(() => {
    fetchEnterpriseList();
  }, [fetchEnterpriseList]);

  const handleSelectEnterprise = async (id: number) => {
    setSelectedEnterpriseId(id);
    setLoadingEnterprise(true);
    try {
      const res: any = await enterpriseApi.getDetail(id);
      setEnterpriseData(res.data);
      const name = res.data?.enterprise_name || res.data?.enterpriseName || res.data?.name || '企业';
      message.success(`已加载企业「${name}」的数据`);
    } catch (err) {
      console.error('加载企业详情失败:', err);
      message.error('加载企业数据失败');
    } finally {
      setLoadingEnterprise(false);
    }
  };

  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => fetchEnterpriseList(value), 300);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      message.warning('请输入 API Key');
      return;
    }
    setDeepSeekApiKey(apiKeyInput.trim());
    setHasApiKey(true);
    setApiKeyModalOpen(false);
    message.success('DeepSeek API Key 已保存');
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const filename = enterpriseData
        ? `${enterpriseData.enterprise_name || (enterpriseData as any).name || '企业'}_市场调研报告.pdf`
        : '外贸企业市场调研报告.pdf';
      const opt = {
        margin: [10, 10, 10, 10] as [number, number, number, number],
        filename,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };
      await html2pdf().set(opt).from(reportRef.current).save();
      message.success('PDF导出成功');
    } catch (error) {
      console.error('PDF export failed:', error);
      message.error('PDF导出失败，请重试');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* ========== 工具栏 ========== */}
      <Card
        className="report-toolbar"
        style={{ marginBottom: 16, borderRadius: 12 }}
        styles={{ body: { padding: '16px 20px' } }}
      >
        <Row gutter={[16, 12]} align="middle">
          <Col flex="auto">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Title level={4} style={{ margin: 0 }}>
                <FilePdfOutlined style={{ color: '#1a56db', marginRight: 8 }} />
                外贸企业市场调研报告
              </Title>
              {enterpriseData && (
                <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>
                  {enterpriseData.enterprise_name || (enterpriseData as any).enterpriseName || (enterpriseData as any).name}
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 13 }}>
              选择企业 → 自动填充数据库信息 → AI补全缺失字段 → 导出PDF
            </Text>
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginTop: 12 }} align="middle">
          <Col flex="400px">
            <Select
              showSearch
              placeholder="搜索并选择企业..."
              value={selectedEnterpriseId}
              onChange={handleSelectEnterprise}
              onSearch={handleSearch}
              filterOption={false}
              loading={loadingEnterprise}
              style={{ width: '100%' }}
              size="large"
              suffixIcon={<SearchOutlined />}
              notFoundContent={searchKeyword ? '未找到匹配企业' : '输入关键词搜索'}
              options={enterpriseList.map(e => ({
                value: e.id,
                label: (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{e.enterprise_name}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>{e.industry}</span>
                  </div>
                ),
              }))}
            />
          </Col>
          <Col>
            <Button
              icon={hasApiKey ? <CheckCircleOutlined /> : <KeyOutlined />}
              onClick={() => {
                setApiKeyInput(getDeepSeekApiKey());
                setApiKeyModalOpen(true);
              }}
              type={hasApiKey ? 'default' : 'dashed'}
              size="large"
              style={{ borderRadius: 8 }}
            >
              {hasApiKey ? 'API Key 已配置' : '设置 DeepSeek API Key'}
            </Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                size="large"
                style={{ borderRadius: 8 }}
              >
                打印
              </Button>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={handleExportPDF}
                loading={exporting}
                size="large"
                style={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #1a56db 0%, #2563eb 100%)',
                  border: 'none',
                }}
              >
                导出 PDF
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ========== 报告内容 ========== */}
      <Spin spinning={exporting || loadingEnterprise} tip={loadingEnterprise ? '正在加载企业数据...' : '正在生成PDF，请稍候...'}>
        <ReportTemplate ref={reportRef} enterprise={enterpriseData} />
      </Spin>

      {/* ========== API Key 设置弹窗 ========== */}
      <Modal
        title={
          <span>
            <RobotOutlined style={{ color: '#1a56db', marginRight: 8 }} />
            设置 DeepSeek API Key
          </span>
        }
        open={apiKeyModalOpen}
        onOk={handleSaveApiKey}
        onCancel={() => setApiKeyModalOpen(false)}
        okText="保存"
        cancelText="取消"
      >
        <p style={{ color: '#666', fontSize: 13, marginBottom: 12 }}>
          用于 AI 联网查询生成报告中数据库缺失的字段信息。API Key 仅保存在浏览器本地，不会上传到服务器。
        </p>
        <Input.Password
          value={apiKeyInput}
          onChange={e => setApiKeyInput(e.target.value)}
          placeholder="输入 DeepSeek API Key (sk-...)"
          size="large"
          prefix={<KeyOutlined style={{ color: '#999' }} />}
        />
        <p style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
          获取 API Key：<a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer">platform.deepseek.com</a>
        </p>
      </Modal>
    </div>
  );
}

export default MarketResearch;
