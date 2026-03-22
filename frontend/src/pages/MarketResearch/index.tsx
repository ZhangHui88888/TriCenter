import { useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Typography, Button, Space, message, Select, Input, InputNumber, Modal, Card, Row, Col, Tag, Form, Segmented, DatePicker } from 'antd';
import {
  FilePdfOutlined,
  PrinterOutlined,
  DownloadOutlined,
  SearchOutlined,
  KeyOutlined,
  RobotOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  FundProjectionScreenOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import ReportTemplate from './components/ReportTemplate';
import BasicReportTemplate from './components/BasicReportTemplate';
import NeonLoader from '@/components/NeonLoader';
import { enterpriseApi, marketReportApi } from '@/services/api';
import { setDeepSeekApiKey, getDeepSeekApiKey, hasDeepSeekApiKey } from '@/services/deepseek';
import { generateBasicReportAi, type ReportAiData } from './services/reportAiService';
import type { EnterpriseDetail } from '@/types';

type ReportVersion = 'basic' | 'deep';

interface MissingField {
  key: string;
  label: string;
  type: 'input' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
  addonAfter?: string;
}

const { Title, Text } = Typography;

/**
 * 第一层：阻断性检查 — 缺了不让生成
 * 从企业整体角度检查，不逐个产品要求
 */
function checkBlockingErrors(detail: EnterpriseDetail): string[] {
  const a = detail as any;
  const errors: string[] = [];

  if (!detail.enterprise_name && !a.name) errors.push('企业名称为空');
  if (!detail.industry && !a.industryName) errors.push('所属行业未填写');
  if (!detail.products?.length) {
    errors.push('至少需要录入1个产品信息');
    return errors;
  }

  // 目标市场：企业级 或 任一产品级有就行
  const hasTargetMarket = detail.products.some(p => p.targetRegionNames?.length) ||
    (detail as any).target_markets || (detail as any).targetMarkets;
  if (!hasTargetMarket) errors.push('目标市场未填写（企业级或产品级至少填一个）');

  return errors;
}

/**
 * 第二层：质量警告 — 从企业整体角度看缺失，给警告但允许继续
 */
function checkQualityWarnings(detail: EnterpriseDetail): string[] {
  const a = detail as any;
  const warnings: string[] = [];
  if (!detail.enterprise_type && !a.enterpriseType) warnings.push('企业类型');
  if (!detail.employee_scale && !a.staffSizeLabel) warnings.push('员工规模');
  if (!detail.domestic_revenue && !a.domesticRevenueLabel) warnings.push('年营业额');
  if (!detail.crossborder_revenue && !a.crossBorderRevenueLabel) warnings.push('外贸/跨境收入');
  if (detail.products?.length) {
    const hasCategory = detail.products.some(p => p.categoryName);
    const hasExportRatio = detail.products.some(p => (p as any).exportRatio);
    const hasProfitMargin = detail.products.some(p => (p as any).profitMargin);
    if (!hasCategory) warnings.push('产品类别');
    if (!hasExportRatio) warnings.push('产品出口占比');
    if (!hasProfitMargin) warnings.push('产品利润率');
  }
  return warnings;
}

/**
 * 第三层：可补填字段 — 在弹窗中直接填写的简单字段
 */
function checkMissingFields(detail: EnterpriseDetail): MissingField[] {
  const a = detail as any;
  const missing: MissingField[] = [];

  if (!detail.established_date && !a.establishedDate)
    missing.push({ key: 'established_date', label: '成立日期', type: 'date' });
  if (!detail.registered_capital && !a.registeredCapital)
    missing.push({ key: 'registered_capital', label: '注册资本', type: 'number', addonAfter: '万元' });
  if (!detail.iso_certifications && !a.isoCertifications)
    missing.push({ key: 'iso_certifications', label: 'ISO认证情况', type: 'input' });
  if (!detail.aeo_certification && !a.aeoCertification)
    missing.push({ key: 'aeo_certification', label: 'AEO认证等级', type: 'select', options: [
      { label: '高级认证', value: '高级认证' }, { label: '一般认证', value: '一般认证' }, { label: '无', value: '无' },
    ]});
  if (!detail.other_certifications && !a.otherCertifications)
    missing.push({ key: 'other_certifications', label: '其他资质证书', type: 'input' });

  return missing;
}

function MarketResearch() {
  const navigate = useNavigate();
  const reportRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [exporting, setExporting] = useState(false);
  const [enterpriseList, setEnterpriseList] = useState<Array<{ id: number; enterprise_name: string; industry: string }>>([]);
  const [selectedEnterpriseId, setSelectedEnterpriseId] = useState<number | undefined>();
  const [enterpriseData, setEnterpriseData] = useState<EnterpriseDetail | null>(null);
  const [loadingEnterprise, setLoadingEnterprise] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reportVersion, setReportVersion] = useState<ReportVersion>('basic');
  const [aiData, setAiData] = useState<ReportAiData>({});
  const [loadingStage, setLoadingStage] = useState('');
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [hasApiKey, setHasApiKey] = useState(hasDeepSeekApiKey());

  const [missingFieldsModalOpen, setMissingFieldsModalOpen] = useState(false);
  const [missingFields, setMissingFields] = useState<MissingField[]>([]);
  const [pendingVersion, setPendingVersion] = useState<ReportVersion>('basic');
  const [pendingDetail, setPendingDetail] = useState<EnterpriseDetail | null>(null);
  const [missingForm] = Form.useForm();

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

  const handleSelectEnterprise = (id: number) => {
    setSelectedEnterpriseId(id);
  };

  const handleCancelGenerate = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoadingEnterprise(false);
    setLoadingStage('');
    message.info('已终止生成');
  };

  const loadExistingReport = (version: ReportVersion, detail: EnterpriseDetail, aiData: Record<string, any>) => {
    setReportVersion(version);
    setEnterpriseData(detail);
    setAiData(aiData);
    const fieldCount = Object.keys(aiData).filter(k => !k.startsWith('_')).length;
    message.success(`已加载已有${version === 'basic' ? '基础版' : '深度版'}报告（${fieldCount} 个分析字段）`);
    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  };

  const startAiGeneration = async (version: ReportVersion, detail: EnterpriseDetail, existingReportData?: Record<string, any>) => {
    setReportVersion(version);
    setLoadingEnterprise(true);
    setAiData({});
    setLoadingStage('正在获取企业数据...');
    setEnterpriseData(detail);

    const controller = new AbortController();
    abortRef.current = controller;

    if (hasDeepSeekApiKey()) {
      setLoadingStage('AI 正在分析企业数据并生成报告...');
      try {
        const generated = await generateBasicReportAi(detail, (stage) => {
          if (controller.signal.aborted) return;
          setLoadingStage(stage);
        }, existingReportData);
        if (controller.signal.aborted) return;
        setAiData(generated);
        const name = detail.enterprise_name || (detail as any).enterpriseName || '企业';
        const versionLabel = version === 'basic' ? '基础版' : '深度版';
        const fieldCount = Object.keys(generated).filter(k => !k.startsWith('_')).length;
        const aiErrors = generated._errors ? JSON.parse(generated._errors) as string[] : [];
        if (aiErrors.length > 0) {
          message.warning({ content: `部分章节 AI 生成失败：${aiErrors.join('；')}`, duration: 8 });
        }
        if (fieldCount > 0) {
          message.success(`已生成企业「${name}」的${versionLabel}报告（AI 生成了 ${fieldCount} 个分析字段）`);
          // 自动保存到数据库
          try {
            const saveData = { ...generated };
            delete saveData._errors;
            delete saveData._missingKeys;
            await marketReportApi.save(detail.id, version, saveData);
          } catch (saveErr) {
            console.error('保存报告到数据库失败:', saveErr);
          }
        } else {
          message.error({ content: 'AI 分析内容全部为空，请检查 API Key 和网络连接', duration: 8 });
        }
      } catch (aiErr: any) {
        if (controller.signal.aborted) return;
        console.error('AI 补全失败:', aiErr);
        message.warning('AI 补全失败，已使用数据库数据生成报告');
      }
    } else {
      const name = detail.enterprise_name || (detail as any).enterpriseName || '企业';
      const versionLabel = version === 'basic' ? '基础版' : '深度版';
      message.success(`已生成企业「${name}」的${versionLabel}报告（未配置 API Key，空白字段待手动填写）`);
    }

    if (!controller.signal.aborted) {
      setLoadingEnterprise(false);
      setLoadingStage('');
      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
    abortRef.current = null;
  };

  const proceedWithGeneration = async (version: ReportVersion, detail: EnterpriseDetail, existingReportData?: Record<string, any>) => {
    // 第一层：阻断性检查
    const blockingErrors = checkBlockingErrors(detail);
    if (blockingErrors.length > 0) {
      Modal.warning({
        title: '关键信息缺失，无法生成报告',
        content: (
          <div>
            {blockingErrors.map((err, i) => (
              <div key={i} style={{ padding: '6px 12px', marginBottom: 4, background: '#fff2f0', borderRadius: 4, border: '1px solid #ffccc7', color: '#cf1322' }}>
                {err}
              </div>
            ))}
            <p style={{ marginTop: 12, color: '#666' }}>请前往企业详情页完善以上信息后再生成报告。</p>
          </div>
        ),
        okText: '前往企业详情',
        onOk: () => navigate(`/enterprises/${detail.id}`),
      });
      return;
    }

    // 第二层：质量警告 — 提示但允许继续
    const qualityWarnings = checkQualityWarnings(detail);

    const doGenerate = async () => {
      // 第三层：可补填字段
      const missing = checkMissingFields(detail);
      if (missing.length > 0) {
        setMissingFields(missing);
        setPendingVersion(version);
        setPendingDetail(detail);
        missingForm.resetFields();
        setMissingFieldsModalOpen(true);
        return;
      }
      await startAiGeneration(version, detail, existingReportData);
    };

    if (qualityWarnings.length > 0) {
      Modal.confirm({
        title: '部分推荐字段未填写',
        content: (
          <div>
            <p>以下字段未填写，可能影响 AI 分析质量：</p>
            <p style={{ color: '#d97706', fontWeight: 500, margin: '8px 0' }}>{qualityWarnings.join('、')}</p>
            <p style={{ color: '#999' }}>建议前往企业详情页补充后再生成，也可以直接继续。</p>
          </div>
        ),
        okText: '继续生成',
        cancelText: '前往补充',
        onOk: doGenerate,
        onCancel: () => navigate(`/enterprises/${detail.id}`),
      });
      return;
    }

    await doGenerate();
  };

  const handleGenerate = async (version: ReportVersion) => {
    if (!selectedEnterpriseId) {
      message.warning('请先选择企业');
      return;
    }

    try {
      const res: any = await enterpriseApi.getDetail(selectedEnterpriseId);
      const detail = res.data as EnterpriseDetail;

      // 检查数据库是否已有该版本报告
      let existingData: Record<string, any> | null = null;
      let generatedAt: string | null = null;
      try {
        const reportRes: any = await marketReportApi.get(selectedEnterpriseId);
        const report = reportRes.data;
        if (report) {
          existingData = version === 'basic' ? report.basicReportData : report.deepReportData;
          const rawTime = version === 'basic' ? report.basicGeneratedAt : report.deepGeneratedAt;
          generatedAt = rawTime ? dayjs(rawTime).format('YYYY-MM-DD HH:mm') : null;
        }
      } catch { /* 无已有报告，继续 */ }

      if (existingData && Object.keys(existingData).length > 0 && generatedAt) {
        const versionLabel = version === 'basic' ? '基础版' : '深度版';
        Modal.confirm({
          title: '已有调研报告',
          content: `该企业已有${versionLabel}报告（生成于 ${generatedAt}），可直接加载，或重新生成覆盖。`,
          okText: '加载已有报告',
          cancelText: '重新生成',
          onOk: () => loadExistingReport(version, detail, existingData!),
          onCancel: () => proceedWithGeneration(version, detail, existingData!),
        });
        return;
      }

      await proceedWithGeneration(version, detail);
    } catch (err) {
      console.error('加载企业详情失败:', err);
      message.error('加载企业数据失败');
    }
  };

  const handleMissingFieldsSubmit = async () => {
    if (!pendingDetail) return;
    const values = missingForm.getFieldsValue();

    const patched = { ...pendingDetail } as any;
    const updatePayload: Record<string, any> = {};

    Object.entries(values).forEach(([key, val]) => {
      if (val != null && key !== 'contact_name' && key !== 'product_hint') {
        if (key === 'established_date' && dayjs.isDayjs(val)) {
          const dateStr = (val as dayjs.Dayjs).format('YYYY-MM-DD');
          patched[key] = dateStr;
          updatePayload.establishedDate = dateStr;
        } else if (key === 'registered_capital') {
          patched[key] = `${val}万元`;
          updatePayload.registeredCapital = `${val}万元`;
        } else if (key === 'enterprise_type') {
          patched[key] = val;
          updatePayload.enterpriseType = val;
        } else if (key === 'iso_certifications') {
          patched[key] = val;
          updatePayload.isoCertifications = val;
        } else if (key === 'aeo_certification') {
          patched[key] = val;
          updatePayload.aeoCertification = val;
        } else if (key === 'other_certifications') {
          patched[key] = val;
          updatePayload.otherCertifications = val;
        } else if (key === 'industry') {
          patched[key] = val;
        } else {
          patched[key] = val;
        }
      }
    });

    // 保存到数据库
    if (Object.keys(updatePayload).length > 0 && pendingDetail.id) {
      try {
        await enterpriseApi.update(pendingDetail.id, updatePayload);
        message.success('已保存补充的企业信息');
      } catch (err) {
        console.error('保存企业信息失败:', err);
        message.warning('企业信息保存失败，但报告仍将使用填写的数据生成');
      }
    }

    setMissingFieldsModalOpen(false);
    await startAiGeneration(pendingVersion, patched as EnterpriseDetail);
  };

  const handleSkipMissingFields = async () => {
    if (!pendingDetail) return;
    setMissingFieldsModalOpen(false);
    await startAiGeneration(pendingVersion, pendingDetail);
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
      const versionLabel = reportVersion === 'basic' ? '基础版' : '深度版';
      const filename = enterpriseData
        ? `${enterpriseData.enterprise_name || (enterpriseData as any).name || '企业'}_市场调研报告_${versionLabel}.pdf`
        : `外贸企业市场调研报告_${versionLabel}.pdf`;
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

  const isLoading = loadingEnterprise;

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
              选择企业 → 选择报告版本 → 自动填充数据库信息 → AI补全缺失字段 → 导出PDF
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
            <Space>
              <Button
                icon={<FileTextOutlined />}
                onClick={() => handleGenerate('basic')}
                loading={loadingEnterprise && reportVersion === 'basic'}
                disabled={!selectedEnterpriseId || (loadingEnterprise && reportVersion !== 'basic')}
                size="large"
                style={{ borderRadius: 8 }}
              >
                生成基础版
              </Button>
              <Button
                icon={<FundProjectionScreenOutlined />}
                onClick={() => handleGenerate('deep')}
                loading={loadingEnterprise && reportVersion === 'deep'}
                disabled={!selectedEnterpriseId || (loadingEnterprise && reportVersion !== 'deep')}
                size="large"
                style={{ borderRadius: 8 }}
              >
                生成深度版
              </Button>
            </Space>
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

      {/* ========== 模板切换 ========== */}
      {!isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <Segmented
            size="large"
            value={reportVersion}
            onChange={v => setReportVersion(v as ReportVersion)}
            options={[
              { value: 'basic', icon: <FileTextOutlined />, label: '基础版模板' },
              { value: 'deep', icon: <FundProjectionScreenOutlined />, label: '深度版模板' },
            ]}
            style={{ borderRadius: 8 }}
          />
        </div>
      )}

      {/* ========== 报告内容 ========== */}
      {isLoading && (
        <NeonLoader
          text={`AI 正在生成${reportVersion === 'basic' ? '基础版' : '深度版'}报告`}
          subText={loadingStage || '正在获取企业信息并填充报告数据...'}
          onCancel={handleCancelGenerate}
        />
      )}
      <div style={{ display: isLoading ? 'none' : 'block' }}>
        {reportVersion === 'basic' ? (
          <BasicReportTemplate ref={reportRef} enterprise={enterpriseData} aiData={aiData} />
        ) : (
          <ReportTemplate ref={reportRef} enterprise={enterpriseData} />
        )}
      </div>

      {/* ========== 缺失字段提示弹窗 ========== */}
      <Modal
        title={
          <span>
            <WarningOutlined style={{ color: '#d97706', marginRight: 8 }} />
            以下企业信息尚未填写
          </span>
        }
        open={missingFieldsModalOpen}
        onCancel={() => setMissingFieldsModalOpen(false)}
        width={560}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setMissingFieldsModalOpen(false)}>取消</Button>
            <Space>
              <Button onClick={handleSkipMissingFields}>
                跳过，直接生成
              </Button>
              <Button type="primary" onClick={handleMissingFieldsSubmit}>
                填写后生成
              </Button>
            </Space>
          </div>
        }
      >
        <p style={{ color: '#666', fontSize: 13, marginBottom: 16 }}>
          以下字段在数据库中未填写，填写后可提升报告质量。也可跳过直接生成（缺失部分显示为"待企业确认"）。
        </p>
        <Form form={missingForm} layout="vertical" size="middle">
          <Row gutter={16}>
            {missingFields.map(field => (
              <Col span={12} key={field.key}>
                <Form.Item name={field.key} label={field.label}>
                  {field.type === 'select' ? (
                    <Select placeholder="请选择" options={field.options} allowClear />
                  ) : field.type === 'date' ? (
                    <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                  ) : field.type === 'number' ? (
                    <InputNumber style={{ width: '100%' }} min={0} placeholder={`请输入${field.label}`} addonAfter={field.addonAfter} />
                  ) : (
                    <Input placeholder={`请输入${field.label}`} />
                  )}
                </Form.Item>
              </Col>
            ))}
          </Row>
        </Form>
      </Modal>

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
