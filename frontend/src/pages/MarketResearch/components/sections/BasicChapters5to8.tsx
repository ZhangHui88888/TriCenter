import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  AlertOutlined,
  TrophyOutlined,
  FlagOutlined,
  DollarOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import type { ReportAiData } from '../../services/reportAiService';
import { parseJsonField } from '../../services/reportAiService';
import type { EnterpriseDetail } from '@/types';

const BLANK = '【待企业确认】';

interface BasicChapters5to8Props {
  enterprise?: EnterpriseDetail | null;
  aiData?: ReportAiData;
}

function BasicChapters5to8({ enterprise, aiData }: BasicChapters5to8Props) {
  const ai = aiData || {};

  const productLines = parseJsonField<Array<Record<string, string>>>(ai.productLines, []);
  const platformLayout = parseJsonField<Array<Record<string, string>>>(ai.platformLayout, []);
  const riskAssessment = parseJsonField<Array<Record<string, string>>>(ai.riskAssessment, []);
  const scoring = parseJsonField<Array<Record<string, string>>>(ai.comprehensiveScoring, []);
  const coreIssues = parseJsonField<string[]>(ai.coreIssues, []);
  const actionSuggestions = parseJsonField<Array<Record<string, string>>>(ai.actionSuggestions, []);

  const defaultPlatforms = ['Amazon', 'eBay', 'AliExpress', 'Shopee', 'TikTok Shop', '独立站'];
  const defaultRisks = ['市场风险', '政策与关税风险', '汇率风险', '供应链风险', '合规风险', '平台政策风险'];
  const defaultDimensions = ['产品竞争力', '市场覆盖度', '营销能力', '供应链能力', '团队能力', '合规水平'];

  const e = enterprise as any;

  // 企业整体目标市场（合并企业级 + 所有产品的目标区域去重）
  const allRegions = new Set<string>();
  enterprise?.products?.forEach(p => {
    p.targetRegionNames?.forEach(r => allRegions.add(r));
  });
  const enterpriseTargetMarket = allRegions.size > 0 ? Array.from(allRegions).join('、') : (e?.target_markets || '');

  // 产品名称列表
  const productNames = enterprise?.products?.map(p => p.name).filter(Boolean) || [];

  // 产品类别汇总（去重）
  const categories = [...new Set(enterprise?.products?.map(p => p.categoryName).filter(Boolean) || [])];

  // AI 返回的产品线信息（有则优先用）
  const finalProductLines = productLines.length > 0 ? productLines : [];

  return (
    <>
      {/* ==================== 五、产品分析 ==================== */}
      <h2><AppstoreOutlined /> 五、产品分析</h2>

      <h3>5.1 现有产品线梳理</h3>
      <ul>
        <li>产品类别：{categories.length > 0 ? categories.join('、') : BLANK}</li>
        <li>主要产品：{productNames.length > 0 ? productNames.join('、') : BLANK}</li>
        <li>目标市场：{enterpriseTargetMarket || BLANK}</li>
      </ul>
      {finalProductLines.length > 0 && (
        <div className="table-wrapper"><table>
          <thead><tr><th>产品类别</th><th>主要产品</th><th>出口占比</th><th>利润率</th><th>目标市场</th></tr></thead>
          <tbody>
            {finalProductLines.map((p, i) => (
              <tr key={i}><td>{p.category}</td><td>{p.mainProducts}</td><td>{p.exportRatio}</td><td>{p.profitMargin}</td><td>{p.targetMarket}</td></tr>
            ))}
          </tbody>
        </table></div>
      )}

      <h3><BarChartOutlined /> 5.2 产品竞争力评估</h3>
      <ul>
        <li>产品质量水平（与国际标准对比）：{ai.productQuality || BLANK}</li>
        <li>产品差异化程度：{ai.productDifferentiation || BLANK}</li>
        <li>产品性价比（与主要竞品对比）：{ai.productValueForMoney || BLANK}</li>
        <li>产品认证与合规状态：{ai.productCertStatus || BLANK}</li>
        <li>产品包装与品牌呈现：{ai.productPackaging || BLANK}</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：产品竞争力雷达图（质量/价格/创新/品牌/服务五维度）</div>

      <h3><DollarOutlined /> 5.3 产品定价分析</h3>
      <ul>
        <li>当前定价模式（成本加成/市场导向/价值定价）：{ai.pricingModel || BLANK}</li>
        <li>与竞品价格对比（高/持平/低，差异百分比）：{ai.priceComparison || BLANK}</li>
        <li>关税与物流成本对终端价格的影响：{ai.tariffImpact || BLANK}</li>
      </ul>

      <h3>5.4 产品市场适配性</h3>
      <ul>
        <li>不同市场的本地化需求：{ai.localizationNeeds || BLANK}</li>
        <li>产品功能/外观/规格调整建议：{ai.productAdjustment || BLANK}</li>
        <li>售后服务与配件供应能力：{ai.afterSalesCapability || BLANK}</li>
      </ul>
      <hr />

      {/* ==================== 六、营销渠道概览 ==================== */}
      <h2><ShoppingCartOutlined /> 六、营销渠道概览</h2>

      <h3>6.1 跨境电商平台布局</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>平台</th><th>是否入驻</th><th>月销售额</th><th>店铺评分</th><th>运营状况</th></tr></thead>
        <tbody>
          {platformLayout.length > 0 ? platformLayout.map((p, i) => (
            <tr key={i}><td>{p.platform}</td><td>{p.joined}</td><td>{p.monthlySales}</td><td>{p.rating}</td><td>{p.status}</td></tr>
          )) : (
            defaultPlatforms.map(p => <tr key={p}><td>{p}</td><td></td><td></td><td></td><td></td></tr>)
          )}
        </tbody>
      </table></div>

      <h3>6.2 其他营销渠道</h3>
      <ul>
        <li>社交媒体运营情况（简述）：{ai.socialMediaStatus || BLANK}</li>
        <li>国际展会参展情况：{ai.exhibitionStatus || BLANK}</li>
        <li>海外代理商/分销商网络：{ai.distributorNetwork || BLANK}</li>
        <li>Google Ads/SEO投入情况：{ai.seoAdsStatus || BLANK}</li>
      </ul>

      <h3>6.3 客户关系管理</h3>
      <ul>
        <li>是否使用CRM系统：{ai.crmUsage || BLANK}</li>
        <li>客户复购率：{ai.repurchaseRate || BLANK}</li>
        <li>客户主要投诉/反馈：{ai.customerFeedback || BLANK}</li>
      </ul>
      <hr />

      {/* ==================== 七、基础风险评估 ==================== */}
      <h2><AlertOutlined /> 七、基础风险评估</h2>

      <div className="table-wrapper"><table>
        <thead><tr><th>风险类别</th><th>风险描述</th><th>风险等级（高/中/低）</th><th>应对建议</th></tr></thead>
        <tbody>
          {riskAssessment.length > 0 ? riskAssessment.map((r, i) => (
            <tr key={i}><td>{r.category}</td><td>{r.description}</td><td>{r.level}</td><td>{r.suggestion}</td></tr>
          )) : (
            defaultRisks.map(r => <tr key={r}><td>{r}</td><td></td><td></td><td></td></tr>)
          )}
        </tbody>
      </table></div>
      <hr />

      {/* ==================== 八、综合评估与建议 ==================== */}
      <h2><TrophyOutlined /> 八、综合评估与建议</h2>

      <h3>8.1 企业外贸综合评分</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>评估维度</th><th>评分（1-10）</th><th>说明</th></tr></thead>
        <tbody>
          {scoring.length > 0 ? (
            <>
              {scoring.map((s, i) => <tr key={i}><td>{s.dimension}</td><td>{s.score}</td><td>{s.note}</td></tr>)}
              <tr>
                <td><strong>综合评分</strong></td>
                <td><strong>{(scoring.reduce((sum, s) => sum + (parseFloat(s.score) || 0), 0) / scoring.length).toFixed(1)}</strong></td>
                <td></td>
              </tr>
            </>
          ) : (
            <>
              {defaultDimensions.map(d => <tr key={d}><td>{d}</td><td></td><td></td></tr>)}
              <tr><td><strong>综合评分</strong></td><td></td><td></td></tr>
            </>
          )}
        </tbody>
      </table></div>

      <p><strong>评分标准定义：</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>分数段</th><th>等级</th><th>含义</th></tr></thead>
        <tbody>
          <tr><td>9-10</td><td>卓越</td><td>行业领先水平，具备明显竞争优势，可作为标杆</td></tr>
          <tr><td>7-8</td><td>良好</td><td>高于行业平均水平，有一定优势，仍有提升空间</td></tr>
          <tr><td>5-6</td><td>一般</td><td>处于行业平均水平，无明显优劣势</td></tr>
          <tr><td>3-4</td><td>较弱</td><td>低于行业平均水平，存在明显短板，需重点改善</td></tr>
          <tr><td>1-2</td><td>薄弱</td><td>严重不足，存在重大风险或缺失，需紧急补强</td></tr>
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：综合评分雷达图</div>

      <h3>8.2 核心问题诊断</h3>
      {coreIssues.length > 0
        ? coreIssues.map((issue, i) => <p key={i}>{i + 1}. {issue}</p>)
        : <><p>1.</p><p>2.</p><p>3.</p></>
      }

      <h3>8.3 行动建议（按优先级排序）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>优先级</th><th>建议事项</th><th>预期效果</th><th>建议时间</th></tr></thead>
        <tbody>
          {actionSuggestions.length > 0 ? actionSuggestions.map((s, i) => (
            <tr key={i}><td>{s.priority}</td><td>{s.item}</td><td>{s.effect}</td><td>{s.timeline}</td></tr>
          )) : (
            <>
              <tr><td>P0-紧急</td><td></td><td></td><td></td></tr>
              <tr><td>P1-重要</td><td></td><td></td><td></td></tr>
              <tr><td>P2-建议</td><td></td><td></td><td></td></tr>
            </>
          )}
        </tbody>
      </table></div>

      <h3><FlagOutlined /> 8.4 常州三中心服务对接方案</h3>
      <ul>
        <li>推荐服务项目：{ai.recommendedServices || BLANK}</li>
        <li>服务优先级排序：{ai.servicePriority || BLANK}</li>
        <li>预期服务效果：{ai.expectedEffect || BLANK}</li>
        <li>后续跟进计划：{ai.followUpPlan || BLANK}</li>
      </ul>
      <hr />

      {/* ==================== 尾部信息 ==================== */}
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          <tr><td>报告撰写人</td><td>[姓名]</td></tr>
          <tr><td>审核人</td><td>[姓名]</td></tr>
          <tr><td>报告日期</td><td>[日期]</td></tr>
          <tr><td>下次跟进日期</td><td>[日期]</td></tr>
        </tbody>
      </table></div>

      <hr />
      <div className="report-footer">
        <p><em>本报告由长三角跨境电商常州三中心提供，仅供内部使用。</em></p>
      </div>
    </>
  );
}

export default BasicChapters5to8;
