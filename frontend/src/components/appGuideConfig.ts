export type GuidePlacement =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'leftTop'
  | 'leftBottom'
  | 'rightTop'
  | 'rightBottom';

export interface GuideStepConfig {
  title: string;
  description: string;
  selector: string;
  placement?: GuidePlacement;
}

export interface GuideModuleConfig {
  path: string;
  label: string;
  steps: GuideStepConfig[];
}

export const GUIDE_MODULES: GuideModuleConfig[] = [
  {
    path: '/dashboard',
    label: '概览看板',
    steps: [
      {
        title: '先看整体经营概况',
        description: '这里汇总了企业总数、待跟进提醒和核心经营指标，适合快速了解当前工作盘面。',
        selector: '[data-tour="dashboard-overview"]',
        placement: 'bottom',
      },
      {
        title: '看板图表用于判断结构',
        description: '这里重点看漏斗阶段分布和行业分布，便于判断企业结构和当前重点方向。',
        selector: '[data-tour="dashboard-charts"]',
        placement: 'top',
      },
      {
        title: '快捷操作可直接跳转',
        description: '如果要继续录入企业、补跟进或查看分析，可以从这里直接进入对应模块。',
        selector: '[data-tour="dashboard-actions"]',
        placement: 'top',
      },
    ],
  },
  {
    path: '/enterprise',
    label: '企业管理',
    steps: [
      {
        title: '先看企业概览',
        description: '上方卡片会展示企业总量、出口营收和阶段分布，方便先建立全局认知。',
        selector: '[data-tour="enterprise-overview"]',
        placement: 'bottom',
      },
      {
        title: '从这里筛选和新增企业',
        description: '可按名称、阶段、区域、行业筛选，也能进入高级筛选、导入导出和新增企业。',
        selector: '[data-tour="enterprise-toolbar"]',
        placement: 'bottom',
      },
      {
        title: '列表是核心操作区',
        description:
          '这里查看企业明细、进入详情，并支持批量变更阶段和批量删除。点「下一步」将自动打开本页第一条企业，继续第 4 步起的详情引导（含九个标签页逐项说明）。',
        selector: '[data-tour="enterprise-table"]',
        placement: 'top',
      },
      {
        title: '（四）返回列表与导出',
        description: '可返回企业管理列表，或将当前企业档案导出为 Excel 备档或外发。',
        selector: '[data-tour="enterprise-detail-toolbar"]',
        placement: 'bottom',
      },
      {
        title: '（五）企业概要卡',
        description: '这里展示企业名称、区域与行业标签，并可快速调整漏斗阶段与查看录入时间。',
        selector: '[data-tour="enterprise-detail-header"]',
        placement: 'bottom',
      },
      {
        title: '（六）分标签维护档案',
        description:
          '下方内容按标签分块维护完整档案。接下来 9 步会依次高亮每个标签并自动切换到对应页，便于你对照查看；各板块标题旁的「?」仍可随时点开查看更细的填写说明。',
        selector: '[data-tour="enterprise-detail-tabs"]',
        placement: 'top',
      },
      {
        title: '（七）标签「基本信息」',
        description:
          '企业工商与资质主数据（名称、信用代码、地址、营收、进出口权、认证等）及联系人卡片。用于建档、筛选与对外材料；企业信息与联系人分区编辑。',
        selector: '[data-tour="enterprise-detail-tab-basic"]',
        placement: 'bottom',
      },
      {
        title: '（八）标签「产品信息」',
        description:
          '产品总体概览（区域/国家、认证等汇总）、产品列表、自主品牌与专利/核心技术。支撑产品画像与调研；可添加/编辑单条产品与专利。',
        selector: '[data-tour="enterprise-detail-tab-product"]',
        placement: 'bottom',
      },
      {
        title: '（九）标签「外贸信息」',
        description:
          '是否开展外贸总开关、外贸基础信息（模式、团队、分销商等）及外贸业绩分析（营业额、市场/模式/品类变化与原因）。适合评估传统外贸体量与趋势。',
        selector: '[data-tour="enterprise-detail-tab-trade"]',
        placement: 'bottom',
      },
      {
        title: '（十）标签「线上跨境电商」',
        description:
          '是否开展跨境电商、已布局平台、跨境运营基础信息（占比、物流、支付、团队、ERP、转型意愿等）及目标市场占比。与外贸标签区分「线上跨境」场景。',
        selector: '[data-tour="enterprise-detail-tab-crossborder"]',
        placement: 'bottom',
      },
      {
        title: '（十一）标签「需求分析」',
        description:
          '通过企业画像维度匹配标准需求清单，查看分阶段需求与统计概览，并可添加自定义需求。选项变化会重算匹配结果，用于辅导与方案对齐。',
        selector: '[data-tour="enterprise-detail-tab-requirements"]',
        placement: 'bottom',
      },
      {
        title: '（十二）标签「政策支持」',
        description:
          '是否享受过政策支持及已享受政策类型（多选）。便于政策申报辅导与资源对接。',
        selector: '[data-tour="enterprise-detail-tab-policy"]',
        placement: 'bottom',
      },
      {
        title: '（十三）标签「合作」',
        description:
          '三中心合作状态、合作项目或「未合作」顾虑；合作可能性评分、标杆可能性与补充说明；并可跳转查看合作服务档案记录。',
        selector: '[data-tour="enterprise-detail-tab-cooperation"]',
        placement: 'bottom',
      },
      {
        title: '（十四）标签「竞争力与风险」',
        description:
          '先标记是否完成调研，再维护行业竞争地位（梯队+描述）与当前面临风险（标签+说明）。用于内部评估与风险提示。',
        selector: '[data-tour="enterprise-detail-tab-competition"]',
        placement: 'bottom',
      },
      {
        title: '（十五）标签「跟进记录」',
        description:
          '本企业维度的跟进台账：查看条数、列表与新增跟进。与菜单「跟进记录」全局列表互补，此处聚焦单家企业的沟通历史。',
        selector: '[data-tour="enterprise-detail-tab-followup"]',
        placement: 'bottom',
      },
    ],
  },
  {
    path: '/follow-up',
    label: '跟进记录',
    steps: [
      {
        title: '先看跟进统计',
        description: '顶部卡片帮助你快速了解跟进总量、待办情况和当前节奏。',
        selector: '[data-tour="follow-up-stats"]',
        placement: 'bottom',
      },
      {
        title: '用筛选区定位记录',
        description: '可以先按企业名称、跟进内容和跟进类型过滤，再决定是否新增跟进。',
        selector: '[data-tour="follow-up-toolbar"]',
        placement: 'bottom',
      },
      {
        title: '在表格中查看和维护',
        description: '表格里可以查看完整跟进记录，结合分页持续维护企业的后续动作。',
        selector: '[data-tour="follow-up-table"]',
        placement: 'top',
      },
    ],
  },
  {
    path: '/service-records',
    label: '合作服务',
    steps: [
      {
        title: '先确认服务档案范围',
        description: '这里用于记录企业与三中心的合作和服务历史，包括服务类型、状态和负责人。',
        selector: '[data-tour="service-header"]',
        placement: 'bottom',
      },
      {
        title: '按状态和企业筛选',
        description: '先用服务状态、企业和服务类型缩小范围，再查看对应服务记录。',
        selector: '[data-tour="service-toolbar"]',
        placement: 'bottom',
      },
      {
        title: '在列表里查看服务详情',
        description: '每条记录都可以展开查看更多内容，后续该模块完善后也会从这里继续扩展操作。',
        selector: '[data-tour="service-table"]',
        placement: 'top',
      },
    ],
  },
  {
    path: '/market-research',
    label: '市场调研',
    steps: [
      {
        title: '先选企业再生成报告',
        description: '先搜索企业，再选择基础版或深度版报告，系统会自动回填已有数据。',
        selector: '[data-tour="market-research-toolbar"]',
        placement: 'bottom',
      },
      {
        title: '这里切换报告模板',
        description: '基础版适合快速输出，深度版适合做更完整的市场调研分析。',
        selector: '[data-tour="market-research-version"]',
        placement: 'bottom',
      },
      {
        title: '报告区支持预览与导出',
        description: '生成完成后可在这里预览内容，并配合打印或导出 PDF 交付使用。',
        selector: '[data-tour="market-research-content"]',
        placement: 'top',
      },
    ],
  },
  {
    path: '/data-analysis',
    label: '数据分析',
    steps: [
      {
        title: '先设定分析范围',
        description: '这里可按企业、漏斗阶段、区域、行业和高级条件筛选，再执行查询分析。',
        selector: '[data-tour="data-analysis-filters"]',
        placement: 'bottom',
      },
      {
        title: '再看核心指标与地图',
        description: '筛选完成后，先看顶部指标和全球客户分布，快速判断分析结果的整体规模。',
        selector: '[data-tour="data-analysis-summary"]',
        placement: 'top',
      },
      {
        title: '最后深入查看图表结构',
        description: '这里集中展示漏斗、趋势、行业、区域、平台和企业类型等统计图表。',
        selector: '[data-tour="data-analysis-charts"]',
        placement: 'top',
      },
    ],
  },
  {
    path: '/dictionary',
    label: '数据字典',
    steps: [
      {
        title: '先选择要维护的分类',
        description: '通过搜索或下拉选择数据字典分类，决定本次要维护的是哪一组系统选项。',
        selector: '[data-tour="dictionary-category"]',
        placement: 'bottom',
      },
      {
        title: '分类说明和数据都在这里',
        description: '选中分类后，这里会展示分类说明以及对应的表格或树结构，便于继续新增、编辑和清理。',
        selector: '[data-tour="dictionary-data"]',
        placement: 'top',
      },
    ],
  },
];

/** 企业管理：0～2 列表；3～5 详情页工具栏/头/标签总览；6～14 九个标签逐项说明（共 15 步，`/enterprise/:id`） */
export const ENTERPRISE_GUIDE_DETAIL_START_INDEX = 3;

/** 详情页「逐标签」Tour 起始步骤下标（与 GUIDE_MODULES 中企业管理 steps 顺序一致） */
export const ENTERPRISE_GUIDE_TAB_STEPS_START_INDEX = 6;

/** 顶栏 Tour 与详情页之间同步当前标签 */
export const ENTERPRISE_GUIDE_TAB_EVENT = 'tricenter-enterprise-guide-tab';

/** 与 steps 中（七）～（十五）顺序一致，用于切换 activeTab */
export const ENTERPRISE_GUIDE_DETAIL_TAB_KEYS = [
  'basic',
  'product',
  'trade',
  'crossborder',
  'requirements',
  'policy',
  'cooperation',
  'competition',
  'followup',
] as const;

export function isEnterpriseDetailPath(pathname: string): boolean {
  return /^\/enterprise\/[^/]+$/.test(pathname);
}

/** 从企业管理列表表格取第一条企业的 id（用于引导自动进入详情） */
export function pickFirstEnterpriseIdFromListTable(): string | null {
  if (typeof document === 'undefined') return null;
  const root = document.querySelector('[data-tour="enterprise-table"]');
  if (!root) return null;
  const row = root.querySelector('tbody tr.ant-table-row[data-row-key]');
  if (!row) return null;
  const id = (row as HTMLElement).dataset.rowKey;
  return id && id !== '' ? id : null;
}

export function getGuideModuleForPathname(pathname: string): GuideModuleConfig {
  const base = resolveGuidePath(pathname);
  if (!base) {
    return GUIDE_MODULES[0];
  }
  return getGuideModule(base) ?? GUIDE_MODULES[0];
}

export const GUIDE_MODULE_OPTIONS = GUIDE_MODULES.map((module) => ({
  value: module.path,
  label: module.label,
}));

export function getGuideModule(path: string) {
  return GUIDE_MODULES.find((module) => module.path === path);
}

export function resolveGuidePath(pathname: string) {
  if (pathname === '/' || pathname === '') return '/dashboard';
  if (pathname.startsWith('/enterprise')) return '/enterprise';
  if (pathname.startsWith('/follow-up')) return '/follow-up';
  if (pathname.startsWith('/service-records')) return '/service-records';
  if (pathname.startsWith('/market-research')) return '/market-research';
  if (pathname.startsWith('/data-analysis')) return '/data-analysis';
  if (pathname.startsWith('/dictionary')) return '/dictionary';
  if (pathname.startsWith('/dashboard')) return '/dashboard';
  return undefined;
}
