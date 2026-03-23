import { chatWithDeepSeek, hasDeepSeekApiKey } from '@/services/deepseek';
import type { EnterpriseDetail } from '@/types';

export interface ReportAiData {
  [key: string]: string;
}

const SYSTEM_PROMPT = `你是一位严谨的外贸市场调研分析师，正在为"常州跨境电商三中心"撰写企业市场调研报告。

## 你的任务

你将收到一份企业的基本信息（来自数据库），你的任务是**基于这些企业信息，进行市场调研分析**，生成报告中的市场分析章节内容。

## 核心原则（必须严格遵守）

1. **你不负责企业自身信息**：
   - 企业名称、注册资本、认证情况、联系方式等"企业固有属性"由数据库提供，你不需要生成
   - 你只负责"市场分析"部分：市场环境、买家画像、行业趋势、竞争格局、产品评估、风险分析、综合建议

2. **公开市场数据可以填写**：
   - 行业市场规模、增长率、贸易政策等公开数据，基于你的知识填写并标注"（公开数据）"
   - 基于行业常识的定性分析（行业趋势、一般性风险）可以填写

3. **推断必须基于已有数据**：
   - 基于企业的行业、产品、目标市场等信息做推断分析，标注"（基于已有信息推断）"
   - 不可编造具体竞争对手名称或虚假数据

4. **无法确定的内容**：
   - 对于需要实地调研才能获取的信息（如具体客户反馈、复购率），填写"【待实地调研】"

5. **输出格式**：
   - 返回纯 JSON 对象，key 为字段标识符，value 为填充内容
   - 不要包含 markdown 代码块标记
   - 表格数据用 JSON 数组格式

6. **语言**：使用中文`;

function buildEnterpriseContext(e: EnterpriseDetail): string {
  const a = e as any;
  const primaryContact = e.contacts?.find((c: any) => c.is_primary || c.isPrimary) || e.contacts?.[0];
  const lines: string[] = [
    `【企业基本信息】`,
    `企业名称：${e.enterprise_name || a.enterpriseName || ''}`,
    `所属行业：${e.industry || a.industryName || '未提供'}`,
    `企业类型：${e.enterprise_type || a.enterpriseType || '未提供'}`,
    `员工规模：${e.employee_scale || a.staffSizeLabel || '未提供'}`,
    `年营业额：${e.domestic_revenue || a.domesticRevenueLabel || '未提供'}`,
    `外贸/跨境收入：${e.crossborder_revenue || a.crossBorderRevenueLabel || '未提供'}`,
    `地址：${[e.province, e.city, e.district].filter(Boolean).join('') || '未提供'}`,
    `网站：${e.website || '未提供'}`,
    `是否有进出口资质：${e.has_import_export_license ? '是' : a.hasImportExportLicense ? '是' : '未提供'}`,
    `是否开展跨境业务：${e.has_crossborder ? '是' : '未提供'}`,
    `主要平台：${e.main_platforms || a.mainPlatforms || '未提供'}`,
    `目标市场：${e.target_markets || a.targetMarkets || '未提供'}`,
    `转型意愿：${e.transformation_willingness || '未提供'}`,
    `是否有自主品牌：${a.hasOwnBrand ? '是' : '未提供'}`,
    `品牌名称：${a.brandNames?.join?.('、') || a.brandNames || '未提供'}`,
    `ISO认证：${e.iso_certifications || a.isoCertifications || '未提供'}`,
    `AEO认证：${e.aeo_certification || a.aeoCertification || '未提供'}`,
    `其他资质：${e.other_certifications || a.otherCertifications || '未提供'}`,
    `是否有海外分销商：${e.has_overseas_distributors || a.hasOverseasDistributors ? '是' : e.has_overseas_distributors === false || a.hasOverseasDistributors === false ? '否' : '未提供'}`,
  ];

  if (primaryContact) {
    lines.push(``,
      `【主要联系人】`,
      `姓名：${primaryContact.name}`,
      `职务：${primaryContact.position || '未提供'}`,
    );
  }

  if (e.products?.length) {
    lines.push(``, `【产品信息】`);
    e.products.forEach((p, i) => {
      lines.push(`产品${i + 1}：${p.name}`,
        `  类别：${p.categoryName || '未提供'}`,
        `  认证：${p.certificationNames?.join('、') || '未提供'}`,
        `  目标区域：${p.targetRegionNames?.join('、') || '未提供'}`,
        `  目标国家：${p.targetCountryIds?.join('、') || '未提供'}`,
        `  年销售额：${p.annualSales || '未提供'}`,
        `  出口占比：${p.exportRatio || '未提供'}`,
        `  利润率：${p.profitMargin || '未提供'}`,
        `  年产能：${p.annualCapacity || '未提供'}`,
      );
    });
  }

  if (e.patents?.length) {
    lines.push(``, `【专利信息】`);
    e.patents.forEach(p => {
      lines.push(`${p.name}（专利号：${p.patentNo || '未提供'}）`);
    });
  }

  return lines.join('\n');
}

const BASIC_MARKET_ANALYSIS_PROMPT = `请根据"已有数据"中的企业行业、产品、目标市场等信息，进行市场调研分析，生成报告第二至第四章内容。

注意：第一章"企业基本信息"完全由数据库提供，你不需要生成。

返回 JSON 对象，包含以下 key：

{
  "marketDistribution": [
    {"region": "区域名", "salesRatio": "占比", "entryTime": "进入时间", "annualSales": "年销售额", "trend": "↑/→/↓"}
  ],
  "tradePolicies": "主要目标市场的贸易政策与关税情况",
  "consumptionLevel": "目标市场消费水平与购买力",
  "ecommPenetration": "目标市场电商渗透率与主流平台",
  "culturalPreferences": "目标市场文化偏好与消费习惯",
  "tradeAgreements": "相关贸易协定利好",
  "certRequirements": "目标市场的产品认证与标准要求",
  "labelRegulations": "标签与包装法规",
  "envCompliance": "环保合规要求",
  "importRestrictions": "进口许可与配额限制",

  "buyerProfile": {
    "buyerType": "买家类型",
    "regionDistribution": "地域分布",
    "purchaseScale": "采购规模",
    "decisionChain": "决策链路",
    "coreFocus": "核心关注点",
    "infoChannel": "信息获取渠道"
  },
  "buyerPainPoints": ["痛点1", "痛点2", "痛点3"],
  "unmetDemands": ["需求1", "需求2", "需求3"],

  "industryMarketSize": "所属行业全球市场规模",
  "industryGrowthRate": "行业近3年增长率",
  "industryStage": "行业发展阶段",
  "industryTrends": "行业主要趋势（2-3条）",
  "competitors": [
    {"name": "竞争对手类型描述（不要编造具体公司名）", "marketShare": "", "coreAdvantage": "", "mainWeakness": "", "pricePosition": ""}
  ],
  "swot": {
    "strengths": ["基于已有数据分析的优势"],
    "weaknesses": ["基于已有数据分析的劣势"],
    "opportunities": ["基于市场环境分析的机会"],
    "threats": ["基于市场环境分析的威胁"]
  }
}`;

const BASIC_PRODUCT_EVAL_PROMPT = `请根据"已有数据"中的企业产品、行业、目标市场信息，进行产品竞争力评估和综合分析，生成报告第五至第八章内容。

注意：产品基础信息（名称/类别/认证/区域）已由数据库提供。你需要做的是"评估分析"。

返回 JSON 对象，包含以下 key：

{
  "productQuality": "产品质量水平评估（基于已有认证和行业标准对比）",
  "productDifferentiation": "产品差异化程度分析",
  "productValueForMoney": "产品性价比分析",
  "productCertStatus": "产品认证合规状态评估（基于已有认证信息）",
  "productPackaging": "产品包装与品牌呈现评估",
  "pricingModel": "定价模式分析（基于已有信息推断）",
  "priceComparison": "与行业平均价格对比分析",
  "tariffImpact": "关税与物流成本对终端价格的影响分析",
  "localizationNeeds": "不同目标市场的本地化需求分析",
  "productAdjustment": "产品功能/外观/规格调整建议",
  "afterSalesCapability": "售后服务能力评估",

  "socialMediaStatus": "社交媒体运营建议（基于行业特点）",
  "exhibitionStatus": "国际展会参展建议",
  "distributorNetwork": "海外分销网络建议",
  "seoAdsStatus": "数字营销投入建议",
  "crmUsage": "CRM系统使用建议",
  "repurchaseRate": "【待实地调研】",
  "customerFeedback": "【待实地调研】",

  "riskAssessment": [
    {"category": "风险类别", "description": "风险描述", "level": "高/中/低", "suggestion": "应对建议"}
  ],

  "comprehensiveScoring": [
    {"dimension": "评估维度", "score": "评分（1-10）", "note": "说明"}
  ],
  "coreIssues": ["核心问题1", "核心问题2", "核心问题3"],
  "actionSuggestions": [
    {"priority": "P0-紧急/P1-重要/P2-建议", "item": "建议事项", "effect": "预期效果", "timeline": "建议时间"}
  ],
  "recommendedServices": "推荐三中心服务项目",
  "servicePriority": "服务优先级排序",
  "expectedEffect": "预期服务效果",
  "followUpPlan": "后续跟进计划建议"
}`;

function parseAiResponse(text: string): Record<string, any> {
  let cleaned = text.trim();
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // JSON 可能被截断，尝试修复：逐步删除末尾字符直到能解析
        let truncated = jsonMatch[0];
        for (let i = 0; i < 20; i++) {
          truncated = truncated.replace(/,?\s*"[^"]*"?\s*:?\s*(?:\[[^\]]*)?$/, '');
          try {
            // 补全可能缺失的闭合括号
            const opens = (truncated.match(/{/g) || []).length;
            const closes = (truncated.match(/}/g) || []).length;
            const arrOpens = (truncated.match(/\[/g) || []).length;
            const arrCloses = (truncated.match(/]/g) || []).length;
            const fixed = truncated + ']'.repeat(Math.max(0, arrOpens - arrCloses)) + '}'.repeat(Math.max(0, opens - closes));
            return JSON.parse(fixed);
          } catch { /* continue */ }
        }
        console.error('AI 返回内容解析失败（可能被截断）:', cleaned.slice(0, 300));
        return {};
      }
    }
    return {};
  }
}

const EXPECTED_MARKET_KEYS = [
  'marketDistribution', 'tradePolicies', 'consumptionLevel', 'ecommPenetration',
  'culturalPreferences', 'tradeAgreements', 'certRequirements', 'labelRegulations',
  'envCompliance', 'importRestrictions', 'buyerProfile', 'buyerPainPoints',
  'unmetDemands', 'industryMarketSize', 'industryGrowthRate', 'industryStage',
  'industryTrends', 'competitors', 'swot',
];

const EXPECTED_PRODUCT_KEYS = [
  'productQuality', 'productDifferentiation', 'productValueForMoney',
  'productCertStatus', 'productPackaging', 'pricingModel', 'priceComparison',
  'tariffImpact', 'localizationNeeds', 'productAdjustment', 'afterSalesCapability',
  'socialMediaStatus', 'exhibitionStatus', 'distributorNetwork', 'seoAdsStatus',
  'crmUsage', 'riskAssessment', 'comprehensiveScoring', 'coreIssues',
  'actionSuggestions', 'recommendedServices', 'servicePriority', 'expectedEffect',
  'followUpPlan',
];

function mergeAiData(result: ReportAiData, parsed: Record<string, any>) {
  Object.entries(parsed).forEach(([k, v]) => {
    if (!result[k]) {
      result[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }
  });
}

function getMissingKeys(result: ReportAiData, expectedKeys: string[]): string[] {
  return expectedKeys.filter(k => !result[k]);
}

async function callAiStep(
  context: string,
  prompt: string,
  result: ReportAiData,
  expectedKeys: string[],
  stepLabel: string,
  onProgress?: (stage: string) => void,
): Promise<string | null> {
  const messages = [
    { role: 'system' as const, content: SYSTEM_PROMPT },
    { role: 'user' as const, content: `【已有数据】\n${context}\n\n${prompt}` },
  ];

  // 首次调用
  onProgress?.(stepLabel);
  try {
    const resp = await chatWithDeepSeek(messages, { temperature: 0.3, maxTokens: 8192 });
    const parsed = parseAiResponse(resp);
    mergeAiData(result, parsed);
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error(`${stepLabel} 失败:`, msg);
    return `${stepLabel}：${msg.includes('timeout') ? '请求超时' : msg.slice(0, 80)}`;
  }

  // 校验缺失
  const missing = getMissingKeys(result, expectedKeys);
  if (missing.length === 0) return null;

  // 自动重试一次
  console.warn(`${stepLabel} 缺失 ${missing.length} 个字段，自动重试:`, missing);
  onProgress?.(`${stepLabel}（补充 ${missing.length} 个缺失字段）...`);
  try {
    const resp = await chatWithDeepSeek(messages, { temperature: 0.3, maxTokens: 8192 });
    const parsed = parseAiResponse(resp);
    mergeAiData(result, parsed);
  } catch (err: any) {
    console.error(`${stepLabel} 重试失败:`, err?.message);
  }

  const stillMissing = getMissingKeys(result, expectedKeys);
  if (stillMissing.length > 0) {
    result._missingKeys = JSON.stringify(stillMissing);
    return `${stepLabel}：仍有 ${stillMissing.length} 个字段缺失`;
  }
  return null;
}

export async function generateBasicReportAi(
  enterprise: EnterpriseDetail,
  onProgress?: (stage: string) => void,
  existingData?: ReportAiData,
): Promise<ReportAiData> {
  if (!hasDeepSeekApiKey()) {
    throw new Error('请先配置 DeepSeek API Key');
  }

  const context = buildEnterpriseContext(enterprise);
  const result: ReportAiData = existingData ? { ...existingData } : {};
  delete result._errors;
  delete result._missingKeys;
  const errors: string[] = [];

  const marketMissing = getMissingKeys(result, EXPECTED_MARKET_KEYS);
  const productMissing = getMissingKeys(result, EXPECTED_PRODUCT_KEYS);
  const needMarket = marketMissing.length > 0;
  const needProduct = productMissing.length > 0;
  const totalSteps = (needMarket ? 1 : 0) + (needProduct ? 1 : 0);

  if (totalSteps === 0) {
    onProgress?.('报告字段已完整，无需重新生成');
    return result;
  }

  let step = 0;
  if (needMarket) {
    step++;
    const label = existingData
      ? `正在补充市场分析缺失的 ${marketMissing.length} 个字段（${step}/${totalSteps}）`
      : `正在分析目标市场与行业竞争环境（${step}/${totalSteps}）`;
    const err = await callAiStep(
      context, BASIC_MARKET_ANALYSIS_PROMPT, result, EXPECTED_MARKET_KEYS,
      label, onProgress,
    );
    if (err) errors.push(err);
  }

  if (needProduct) {
    step++;
    const label = existingData
      ? `正在补充产品评估缺失的 ${productMissing.length} 个字段（${step}/${totalSteps}）`
      : `正在评估产品竞争力与生成综合建议（${step}/${totalSteps}）`;
    const err = await callAiStep(
      context, BASIC_PRODUCT_EVAL_PROMPT, result, EXPECTED_PRODUCT_KEYS,
      label, onProgress,
    );
    if (err) errors.push(err);
  }

  if (errors.length > 0) {
    result._errors = JSON.stringify(errors);
  }

  return result;
}

export function parseJsonField<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
