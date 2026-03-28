// @ts-nocheck
import { Card, Row, Col, Space, Button, Typography } from 'antd';
import {
  EditOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { enterpriseDetailCardTitle } from '@/components/enterpriseDetail/EnterpriseDetailSectionHint';

const { Text } = Typography;

interface ProductInfoTabProps {
  enterprise: any;
  regionOptions: any[];
  onEditOverview: () => void;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
  onEditBrand: () => void;
  onAddPatent: () => void;
  onEditPatent: (patent: any) => void;
  onDeletePatent: (patent: any) => void;
}

function mergeUniqueLabels(primary: string[], secondary: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of [...primary, ...secondary]) {
    if (s == null || s === '' || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export default function ProductInfoTab({
  enterprise,
  regionOptions,
  onEditOverview,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onEditBrand,
  onAddPatent,
  onEditPatent,
  onDeletePatent,
}: ProductInfoTabProps) {
  const products = (enterprise.products || []) as any[];
  const allCategories = [...new Set(products.map((p: any) => p.categoryName).filter(Boolean))];
  const allCerts = [...new Set(products.flatMap((p: any) => p.certificationNames || []))];
  const allLogistics = [...new Set(products.flatMap((p: any) => p.logisticsPartnerNames || []))];
  const totalSales = products.reduce((s: number, p: any) => {
    const v = parseFloat(String(p.annualSales || '0').replace(/[^\d.]/g, ''));
    return s + (isNaN(v) ? 0 : v);
  }, 0);

  const regionLabelForId = (id: number) =>
    regionOptions.find((o: any) => Number(o.value) === Number(id))?.label;

  const regionIds: number[] = enterprise.target_region_ids || (enterprise as any).targetRegionIds || [];
  const enterpriseRegionLabels = regionIds.map((id: number) => regionLabelForId(id)).filter(Boolean) as string[];
  const productRegionLabels = products.flatMap((p: any) => {
    const names = p.targetRegionNames || p.target_region_names;
    if (Array.isArray(names) && names.length) return names.filter(Boolean);
    const ids = p.targetRegionIds || p.target_region_ids || [];
    return ids.map((id: number) => regionLabelForId(id)).filter(Boolean);
  });
  const clientRegionNames = mergeUniqueLabels(enterpriseRegionLabels, productRegionLabels);

  const enterpriseCountryRaw = enterprise.target_country_ids ?? (enterprise as any).targetCountryIds ?? [];
  const enterpriseCountryLabels: string[] = Array.isArray(enterpriseCountryRaw) ? enterpriseCountryRaw.filter(Boolean) : [];
  const productCountryLabels = products.flatMap((p: any) => {
    const ids = p.targetCountryIds || p.target_country_ids;
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  });
  const clientCountryNames = mergeUniqueLabels(enterpriseCountryLabels, productCountryLabels);

  const serverRegionNames = Array.isArray((enterprise as any).overviewMergedTargetRegionNames)
    ? ((enterprise as any).overviewMergedTargetRegionNames as string[]).filter(Boolean)
    : null;
  const serverCountryNames = Array.isArray((enterprise as any).overviewMergedTargetCountryNames)
    ? ((enterprise as any).overviewMergedTargetCountryNames as string[]).filter(Boolean)
    : null;
  const regionNames = serverRegionNames != null ? mergeUniqueLabels(serverRegionNames, clientRegionNames) : clientRegionNames;
  const countryNames = serverCountryNames != null ? mergeUniqueLabels(serverCountryNames, clientCountryNames) : clientCountryNames;

  const licRaw = enterprise.has_import_export_license ?? (enterprise as any).hasImportExportLicense;
  const hasImportExportLicenseYes = licRaw === true || licRaw === 1 || licRaw === '1';

  return (
    <div style={{ padding: 16 }}>
      <Card
        size="small"
        title={enterpriseDetailCardTitle('产品总体概览', 'product-overview')}
        style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditOverview}>编辑</Button>}
      >
        <Row gutter={[20, 20]}>
          {[
            { label: '主要销售区域', value: regionNames.length > 0 ? regionNames.join('、') : '-' },
            { label: '主要销售国家', value: countryNames.length > 0 ? countryNames.join('、') : '-' },
            { label: '是否有进出口资质', value: hasImportExportLicenseYes ? '是' : '否' },
            { label: '产品数量', value: <>{products.length} <span style={{ fontSize: 13, fontWeight: 400, color: '#888' }}>个</span></>, bold: true },
            { label: '产品品类', value: allCategories.length > 0 ? allCategories.join('、') : '-' },
            { label: '年销售额合计', value: totalSales > 0 ? `${totalSales}万元` : '-', highlight: true },
            { label: '产品认证', value: allCerts.length > 0 ? allCerts.join('、') : '-' },
            { label: '物流合作方', value: allLogistics.length > 0 ? allLogistics.join('、') : '-' },
          ].map((item, idx) => (
            <Col span={6} key={idx}>
              <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>{item.label}</Text>
                <div style={{ fontWeight: item.bold ? 600 : 500, color: item.highlight ? '#667eea' : '#333', fontSize: item.highlight ? 16 : undefined }}>{item.value}</div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card
        title={enterpriseDetailCardTitle('产品列表', 'product-list')}
        size="small"
        style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddProduct} style={{ borderRadius: 6 }}>添加产品</Button>}
      >
        {products.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {products.map((product: any) => (
              <div key={product.id} style={{ padding: '16px 20px', borderRadius: 8, background: '#fafbfc', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text strong style={{ fontSize: 15 }}>{product.name}</Text>
                    {product.categoryName && (
                      <span style={{ padding: '3px 10px', background: 'rgba(102,126,234,0.08)', borderRadius: 4, color: '#667eea', fontSize: 13 }}>{product.categoryName}</span>
                    )}
                    {product.certificationNames?.map((cert: string, idx: number) => (
                      <span key={idx} style={{ padding: '3px 10px', background: 'rgba(67,233,123,0.08)', borderRadius: 4, color: '#389e0d', fontSize: 13 }}>{cert}</span>
                    ))}
                  </div>
                  <Space size={8}>
                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEditProduct(product)}>编辑</Button>
                    <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDeleteProduct(product)}>删除</Button>
                  </Space>
                </div>
                {(product.exportRatio || product.profitMargin) && (
                  <div style={{ fontSize: 13, color: '#666' }}>
                    {[product.exportRatio ? `出口占比 ${product.exportRatio}` : null, product.profitMargin ? `利润率 ${product.profitMargin}` : null]
                      .filter(Boolean)
                      .join('  ·  ')}
                  </div>
                )}
              </div>
            ))}
          </Space>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无产品信息，点击"添加产品"按钮添加</div>
        )}
      </Card>

      <Card
        size="small"
        title={enterpriseDetailCardTitle('自主品牌', 'product-brand')}
        style={{ marginBottom: 16, borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="link" size="small" icon={<EditOutlined />} style={{ fontWeight: 500 }} onClick={onEditBrand}>编辑</Button>}
      >
        <Row gutter={[20, 20]}>
          <Col span={6}>
            <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>是否有自主品牌</Text>
              <div style={{ fontWeight: 500, color: enterprise.has_own_brand ? '#333' : '#999' }}>
                {enterprise.has_own_brand ? '是' : '否'}
              </div>
            </div>
          </Col>
          <Col span={18}>
            <div style={{ padding: '16px', background: '#fafbfc', borderRadius: 10 }}>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>品牌名称</Text>
              {enterprise.brand_names && enterprise.brand_names.length > 0 ? (
                <Space size={12} wrap>
                  {enterprise.brand_names.map((brand: string, idx: number) => (
                    <span key={idx} style={{
                      padding: '6px 20px',
                      background: '#fff',
                      border: '1px solid #e8e8e8',
                      borderRadius: 6,
                      color: '#333',
                      fontSize: 14,
                      fontWeight: 600,
                      letterSpacing: 1,
                    }}>{brand}</span>
                  ))}
                </Space>
              ) : <span style={{ color: '#999' }}>-</span>}
            </div>
          </Col>
        </Row>
      </Card>

      <Card
        size="small"
        title={enterpriseDetailCardTitle('核心技术/专利', 'product-patent')}
        style={{ borderRadius: 8, border: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        headStyle={{ borderBottom: '1px solid #f0f0f0' }}
        extra={<Button type="primary" size="small" icon={<PlusOutlined />} onClick={onAddPatent} style={{ borderRadius: 6 }}>添加专利</Button>}
      >
        {enterprise.patents && enterprise.patents.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {enterprise.patents.map((patent: any) => (
              <div key={patent.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 16px', borderRadius: 8, background: '#fafbfc', border: '1px solid #f0f0f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 6, background: 'rgba(102,126,234,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SafetyCertificateOutlined style={{ color: '#667eea', fontSize: 16 }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Text strong style={{ fontSize: 14 }}>{patent.name}</Text>
                    <span style={{ fontSize: 12, color: '#888' }}>
                      专利号: <span style={{ fontFamily: 'monospace' }}>{patent.patentNo || '-'}</span>
                    </span>
                  </div>
                </div>
                <Space size={4}>
                  <Button type="link" size="small" icon={<EditOutlined />} onClick={() => onEditPatent(patent)}>编辑</Button>
                  <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => onDeletePatent(patent)}>删除</Button>
                </Space>
              </div>
            ))}
          </Space>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>暂无专利信息，点击"添加专利"按钮添加</div>
        )}
      </Card>
    </div>
  );
}
