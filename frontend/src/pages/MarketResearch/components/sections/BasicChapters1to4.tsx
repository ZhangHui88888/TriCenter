import {
  ShopOutlined,
  GlobalOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { EnterpriseDetail } from '@/types';
import type { ReportAiData } from '../../services/reportAiService';
import { parseJsonField } from '../../services/reportAiService';

const BLANK = '【待企业确认】';

interface BasicChapters1to4Props {
  enterprise?: EnterpriseDetail | null;
  aiData?: ReportAiData;
}

function BasicChapters1to4({ enterprise, aiData }: BasicChapters1to4Props) {
  const e = enterprise;
  const a = e as any;
  const ai = aiData || {};
  const primaryContact = e?.contacts?.find((c: any) => c.is_primary || c.isPrimary) || e?.contacts?.[0];

  const enterpriseName = e?.enterprise_name || a?.enterpriseName || a?.name || '';
  const creditCode = e?.unified_credit_code || a?.creditCode || '';
  const establishedDate = e?.established_date || a?.establishedDate || '';
  const enterpriseType = e?.enterprise_type || a?.enterpriseType || '';
  const employeeScale = e?.employee_scale || a?.staffSizeLabel || '';
  const domesticRevenue = e?.domestic_revenue || a?.domesticRevenueLabel || '';
  const crossborderRevenue = e?.crossborder_revenue || a?.crossBorderRevenueLabel || '';
  const registeredCapital = e?.registered_capital || a?.registeredCapital || '';
  const productCertSummary = e?.products
    ?.flatMap(p => p.certificationNames || [])
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join('、') || '';

  const marketDist = parseJsonField<Array<Record<string, string>>>(ai.marketDistribution, []);
  const buyerProfile = parseJsonField<Record<string, string>>(ai.buyerProfile, {});
  const buyerPainPoints = parseJsonField<string[]>(ai.buyerPainPoints, []);
  const unmetDemands = parseJsonField<string[]>(ai.unmetDemands, []);
  const competitors = parseJsonField<Array<Record<string, string>>>(ai.competitors, []);
  const swot = parseJsonField<Record<string, string[]>>(ai.swot, {});

  const buyerDimensions = [
    { key: 'buyerType', label: '买家类型（B端批发商 / B端零售商 / C端消费者 / 平台采购商）' },
    { key: 'regionDistribution', label: '地域分布' },
    { key: 'purchaseScale', label: '采购规模（大额低频 / 中额中频 / 小额高频）' },
    { key: 'decisionChain', label: '决策链路（谁发起需求→谁评估→谁拍板→谁付款）' },
    { key: 'coreFocus', label: '核心关注点（价格/质量/交期/认证/售后，按优先级排列）' },
    { key: 'infoChannel', label: '信息获取渠道（Google搜索/B2B平台/展会/社媒/行业推荐）' },
  ];

  return (
    <>
      {/* ==================== 一、企业基本信息概览 ==================== */}
      <h2><ShopOutlined /> 一、企业基本信息概览</h2>

      <h3><SafetyCertificateOutlined /> 1.1 企业基础资料</h3>
      <ul>
        <li>企业全称：{enterpriseName || BLANK}</li>
        <li>统一社会信用代码：{creditCode || BLANK}</li>
        <li>成立时间：{establishedDate || BLANK}</li>
        <li>注册资本：{registeredCapital || BLANK}</li>
        <li>企业类型（民营/国企/外资/合资）：{enterpriseType || BLANK}</li>
        <li>员工规模：{employeeScale || BLANK}</li>
        <li>年营业额（近三年）：{domesticRevenue || BLANK}</li>
        <li>外贸业务占比：{crossborderRevenue || BLANK}</li>
        <li>主要联系人及职务：{primaryContact ? `${primaryContact.name}${primaryContact.position ? ` / ${primaryContact.position}` : ''}` : BLANK}</li>
        <li>联系方式：{primaryContact ? `${(primaryContact as any).phone || ''}${(primaryContact as any).email ? ` / ${(primaryContact as any).email}` : ''}` : BLANK}</li>
      </ul>

      <h3><SafetyCertificateOutlined /> 1.2 企业资质与认证</h3>
      <ul>
        <li>进出口经营权（有/无）：{e?.has_import_export_license || a?.hasImportExportLicense ? '有' : BLANK}</li>
        <li>ISO认证情况：{e?.iso_certifications || a?.isoCertifications || BLANK}</li>
        <li>行业特定认证（CE/FDA/UL/RoHS等）：{productCertSummary || BLANK}</li>
        <li>海关AEO认证等级：{e?.aeo_certification || a?.aeoCertification || BLANK}</li>
        <li>其他资质证书：{e?.other_certifications || a?.otherCertifications || BLANK}</li>
      </ul>
      <hr />

      {/* ==================== 二、目标市场调研 ==================== */}
      <h2><GlobalOutlined /> 二、目标市场调研</h2>

      <h3>2.1 现有市场分布</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>市场区域</th><th>销售占比</th><th>进入时间</th><th>年销售额</th><th>增长趋势（↑/→/↓）</th></tr></thead>
        <tbody>
          {marketDist.length > 0 ? marketDist.map((m, i) => (
            <tr key={i}><td>{m.region}</td><td>{m.salesRatio}</td><td>{m.entryTime}</td><td>{m.annualSales}</td><td>{m.trend}</td></tr>
          )) : (
            Array.from({ length: 4 }).map((_, i) => <tr key={i}><td></td><td></td><td></td><td></td><td></td></tr>)
          )}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：市场分布饼图（按销售额占比）、增长趋势柱状图</div>

      <h3>2.2 目标市场核心环境分析</h3>
      <ul>
        <li>主要目标市场的贸易政策与关税情况：{ai.tradePolicies || BLANK}</li>
        <li>目标市场消费水平与购买力：{ai.consumptionLevel || BLANK}</li>
        <li>目标市场电商渗透率与主流平台：{ai.ecommPenetration || BLANK}</li>
        <li>目标市场文化偏好与消费习惯：{ai.culturalPreferences || BLANK}</li>
        <li>相关贸易协定利好（RCEP等）：{ai.tradeAgreements || BLANK}</li>
      </ul>

      <h3>2.3 目标市场准入要求</h3>
      <ul>
        <li>产品认证与标准要求：{ai.certRequirements || BLANK}</li>
        <li>标签与包装法规：{ai.labelRegulations || BLANK}</li>
        <li>环保合规要求：{ai.envCompliance || BLANK}</li>
        <li>进口许可与配额限制：{ai.importRestrictions || BLANK}</li>
      </ul>
      <hr />

      {/* ==================== 三、终端买家画像与需求分析 ==================== */}
      <h2><TeamOutlined /> 三、终端买家画像与需求分析</h2>

      <h3>3.1 核心买家画像</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>维度</th><th>描述</th></tr></thead>
        <tbody>
          {buyerDimensions.map(d => (
            <tr key={d.key}><td>{d.label}</td><td>{buyerProfile[d.key] || ''}</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：买家决策链路流程图、买家关注点优先级雷达图</div>

      <h3>3.2 买家核心痛点</h3>
      {buyerPainPoints.length > 0
        ? buyerPainPoints.map((p, i) => <p key={i}>{i + 1}. {p}</p>)
        : <><p>1.</p><p>2.</p><p>3.</p></>
      }

      <h3>3.3 买家未被满足的需求</h3>
      {unmetDemands.length > 0
        ? unmetDemands.map((d, i) => <p key={i}>{i + 1}. {d}</p>)
        : <><p>1.</p><p>2.</p><p>3.</p></>
      }
      <hr />

      {/* ==================== 四、行业与竞争概览 ==================== */}
      <h2><BarChartOutlined /> 四、行业与竞争概览</h2>

      <h3>4.1 行业基本面</h3>
      <ul>
        <li>所属行业全球市场规模：{ai.industryMarketSize || BLANK}</li>
        <li>行业近3年增长率：{ai.industryGrowthRate || BLANK}</li>
        <li>行业发展阶段（导入期/成长期/成熟期/衰退期）：{ai.industryStage || BLANK}</li>
        <li>行业主要趋势（2-3条）：{ai.industryTrends || BLANK}</li>
      </ul>

      <h3>4.2 主要竞争对手</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>竞争对手</th><th>市场份额</th><th>核心优势</th><th>主要劣势</th><th>价格定位</th></tr></thead>
        <tbody>
          {competitors.length > 0 ? competitors.map((c, i) => (
            <tr key={i}><td>{c.name}</td><td>{c.marketShare}</td><td>{c.coreAdvantage}</td><td>{c.mainWeakness}</td><td>{c.pricePosition}</td></tr>
          )) : (
            Array.from({ length: 3 }).map((_, i) => <tr key={i}><td></td><td></td><td></td><td></td><td></td></tr>)
          )}
        </tbody>
      </table></div>

      <h3>4.3 企业SWOT分析</h3>
      <div className="swot-grid">
        <div className="swot-item strength"><h4>优势(S)</h4><ul>{(swot.strengths || ['']).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
        <div className="swot-item weakness"><h4>劣势(W)</h4><ul>{(swot.weaknesses || ['']).map((w, i) => <li key={i}>{w}</li>)}</ul></div>
        <div className="swot-item opportunity"><h4>机会(O)</h4><ul>{(swot.opportunities || ['']).map((o, i) => <li key={i}>{o}</li>)}</ul></div>
        <div className="swot-item threat"><h4>威胁(T)</h4><ul>{(swot.threats || ['']).map((t, i) => <li key={i}>{t}</li>)}</ul></div>
      </div>
      <div className="chart-suggestion">📊 建议配图：竞争格局象限图（以价格和质量为轴）</div>
      <hr />
    </>
  );
}

export default BasicChapters1to4;
