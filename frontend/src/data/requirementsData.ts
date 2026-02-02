// 跨境电商企业需求分类与映射数据

// 维度定义
export interface Dimension {
  key: string;
  name: string;
  description: string;
  multiple: boolean; // 是否可多选
  options: DimensionOption[];
}

export interface DimensionOption {
  value: string;
  label: string;
  description?: string;
}

// 需求项定义
export interface RequirementItem {
  id: string;
  name: string;
  description: string;
  phase: string; // 所属阶段
  category: string; // 所属分类
}

// 维度配置
export const dimensions: Dimension[] = [
  {
    key: 'enterpriseType',
    name: '企业类型',
    description: '选择企业的业务类型',
    multiple: true,
    options: [
      { value: 'factory', label: '工厂型', description: '有自有生产线，原做OEM/ODM代工' },
      { value: 'trading', label: '贸易型', description: '有货源渠道和供应商资源，无自有生产能力' },
      { value: 'factoryTrading', label: '工贸一体', description: '既有生产能力，又有贸易渠道' },
      { value: 'startup', label: '初创/SOHO', description: '个人或小团队，资金有限，轻资产运营' },
    ],
  },
  {
    key: 'targetMode',
    name: '目标模式',
    description: '选择跨境电商的目标渠道模式',
    multiple: true,
    options: [
      { value: 'b2b', label: 'B2B平台', description: '阿里国际站、环球资源、中国制造网等' },
      { value: 'b2c', label: 'B2C平台', description: '亚马逊、eBay、TikTok Shop、Shopee、Temu等' },
      { value: 'independent', label: '独立站', description: 'Shopify、Magento、自建站等' },
      { value: 'offline', label: '线下渠道', description: '海外零售、展厅、分销' },
    ],
  },
  {
    key: 'currentStage',
    name: '当前阶段',
    description: '选择企业当前的发展阶段',
    multiple: false,
    options: [
      { value: 'observation', label: '观望期', description: '想做但还没开始' },
      { value: 'startup', label: '启动期', description: '0-6个月，还没稳定出单' },
      { value: 'growth', label: '增长期', description: '有稳定订单，想放量' },
      { value: 'bottleneck', label: '瓶颈期', description: '遇到具体问题卡住了' },
      { value: 'mature', label: '成熟期', description: '稳定运营，求突破或降本' },
    ],
  },
  {
    key: 'brandStatus',
    name: '品牌标签',
    description: '选择企业的品牌状态',
    multiple: false,
    options: [
      { value: 'hasBrand', label: '有品牌/正在建设品牌', description: '已有自主品牌或正在建设' },
      { value: 'noBrand', label: '无品牌/白牌出海', description: '以产品为主，暂无品牌' },
    ],
  },
  {
    key: 'ecommerceExp',
    name: '电商经验',
    description: '选择企业的电商运营经验',
    multiple: false,
    options: [
      { value: 'hasExp', label: '有电商运营经验', description: '有国内或跨境电商运营经验' },
      { value: 'noExp', label: '无电商运营经验', description: '从零开始学习' },
    ],
  },
];

// 所有需求项
export const requirements: RequirementItem[] = [
  // 第一阶段：战略规划与资源准备
  { id: '1.1.1', name: '品牌定位与规划/设计', description: '客群定位、价格带、差异化卖点、品牌故事', phase: '战略规划与资源准备', category: '品牌规划' },
  { id: '1.2.1', name: '市场/IP洞察', description: '市场容量、趋势、竞品对标', phase: '战略规划与资源准备', category: '市场洞察' },
  { id: '1.3.1', name: '用户旅程设计', description: '认知-考虑-购买-复购', phase: '战略规划与资源准备', category: '搭建营销体系' },
  { id: '1.3.2', name: '画像/要素/标签体系', description: '人货场标签体系', phase: '战略规划与资源准备', category: '搭建营销体系' },
  { id: '1.3.3', name: '营销活动与节奏规划', description: '年度营销日历、关键节点规划', phase: '战略规划与资源准备', category: '搭建营销体系' },
  { id: '1.3.4', name: 'O2O营销体系', description: '线上线下联动、全渠道触达', phase: '战略规划与资源准备', category: '搭建营销体系' },
  { id: '1.4.1', name: '平台测品、双轨选品', description: '小批量测试、供应链+市场双向筛选', phase: '战略规划与资源准备', category: '测品选品与前置认证评估' },
  { id: '1.4.2', name: '海外认证可行性评估', description: '目标市场所需认证、成本、周期', phase: '战略规划与资源准备', category: '测品选品与前置认证评估' },
  { id: '1.4.3', name: '品类规划与产品矩阵', description: '核心品类/延伸品类/机会品类，引流款/利润款', phase: '战略规划与资源准备', category: '测品选品与前置认证评估' },
  { id: '1.4.4', name: '消费者洞察与调研', description: '用户调研、NPS/CSAT、行为分析', phase: '战略规划与资源准备', category: '测品选品与前置认证评估' },
  { id: '1.5.1', name: '出海路径规划', description: '平台/独立站/线下组合', phase: '战略规划与资源准备', category: '战略与预算' },
  { id: '1.5.2', name: '营销战略与预算', description: '阶段目标、预算分配', phase: '战略规划与资源准备', category: '战略与预算' },
  { id: '1.5.3', name: '资金预算与融资/政府资源', description: '出口补贴、综试区、海关便利化', phase: '战略规划与资源准备', category: '战略与预算' },
  { id: '1.5.4', name: '行业协会与展会资源', description: '商会、广交会、CES、行业峰会', phase: '战略规划与资源准备', category: '战略与预算' },
  { id: '1.5.5', name: '并购与战略投资', description: '品牌收购、渠道投资、战略联盟', phase: '战略规划与资源准备', category: '战略与预算' },
  { id: '1.6.1', name: '备货策略与库存预案', description: '销售预测、安全库存、应对预案', phase: '战略规划与资源准备', category: '供应链与物流准备' },
  { id: '1.6.2', name: '物流渠道方案选型', description: '集运/海外仓/一件代发等', phase: '战略规划与资源准备', category: '供应链与物流准备' },
  { id: '1.6.3', name: '采购渠道拓展', description: '货源开发、供应商筛选', phase: '战略规划与资源准备', category: '供应链与物流准备' },
  { id: '1.6.4', name: '最小起订量谈判', description: '小单采购支持', phase: '战略规划与资源准备', category: '供应链与物流准备' },
  { id: '1.7.1', name: '知识产权布局', description: '商标/专利/版权', phase: '战略规划与资源准备', category: '合规前置' },
  { id: '1.7.2', name: '税务合规前置', description: 'VAT等注册与口径确认', phase: '战略规划与资源准备', category: '合规前置' },
  { id: '1.7.3', name: '数据隐私合规前置', description: 'GDPR、CCPA等合规', phase: '战略规划与资源准备', category: '合规前置' },
  { id: '1.7.4', name: '合同管理前置', description: '跨境合同模板、供应商/渠道协议', phase: '战略规划与资源准备', category: '合规前置' },
  { id: '1.7.5', name: '进出口合规', description: '进出口许可证、报关单、退税证明', phase: '战略规划与资源准备', category: '合规前置' },
  { id: '1.8.1', name: '组织架构设计', description: '跨境电商部门设置、岗位分工', phase: '战略规划与资源准备', category: '团队与组织准备' },
  { id: '1.8.2', name: '人才招聘与培养', description: '专业技能、语言能力', phase: '战略规划与资源准备', category: '团队与组织准备' },
  { id: '1.8.3', name: '自建团队/代运营选择', description: '自建vs代运营决策', phase: '战略规划与资源准备', category: '团队与组织准备' },
  { id: '1.8.4', name: '跨时区与远程协作', description: '会议安排、异步协作、文化融合', phase: '战略规划与资源准备', category: '团队与组织准备' },
  { id: '1.8.5', name: '办公场地与工位', description: '自有办公室、共享工位、产业园入驻', phase: '战略规划与资源准备', category: '团队与组织准备' },
  
  // 第二阶段：渠道搭建与商品上线
  { id: '2.1.1', name: '平台开店', description: '账号与主体、上传产品详情页、店铺运营', phase: '渠道搭建与商品上线', category: '渠道与店铺建设' },
  { id: '2.1.2', name: '独立站建设', description: '内容管理、用户管理', phase: '渠道搭建与商品上线', category: '渠道与店铺建设' },
  { id: '2.1.3', name: '线下渠道搭建', description: '开口官店/店中店/渠道对接', phase: '渠道搭建与商品上线', category: '渠道与店铺建设' },
  { id: '2.1.4', name: '海外实体与本地化运营', description: '海外公司注册、本地办公与团队', phase: '渠道搭建与商品上线', category: '渠道与店铺建设' },
  { id: '2.1.5', name: '海外分销商/代理商管理', description: '分销体系建设、代理商招募', phase: '渠道搭建与商品上线', category: '渠道与店铺建设' },
  { id: '2.2.1', name: 'Listing与素材生产', description: '图片/文案/视频/品牌故事/关键词优化', phase: '渠道搭建与商品上线', category: '商品内容与上架' },
  { id: '2.2.2', name: '合规材料与上架门槛', description: '类目准入、资质/证书/测试报告', phase: '渠道搭建与商品上线', category: '商品内容与上架' },
  { id: '2.2.3', name: '多语言翻译与本地化', description: '详情页、客服、说明书本地化', phase: '渠道搭建与商品上线', category: '商品内容与上架' },
  { id: '2.3.1', name: '达人合作与结算', description: 'KOL/KOC合作、结算机制', phase: '渠道搭建与商品上线', category: '达人/社媒/直播启动' },
  { id: '2.3.2', name: '直播间搭建与直播运营', description: '直播空间、直播团队、直播运营', phase: '渠道搭建与商品上线', category: '达人/社媒/直播启动' },
  { id: '2.3.3', name: '种草内容生产与分发', description: '图文、短视频、用户测评', phase: '渠道搭建与商品上线', category: '达人/社媒/直播启动' },
  { id: '2.4.1', name: '外包装设计', description: '品牌包装、防伪标识、开箱体验', phase: '渠道搭建与商品上线', category: '包装与样品管理' },
  { id: '2.4.2', name: '防损包装', description: '易碎品保护、运输测试', phase: '渠道搭建与商品上线', category: '包装与样品管理' },
  { id: '2.4.3', name: '环保包材', description: '可降解材料、FSC认证、减塑', phase: '渠道搭建与商品上线', category: '包装与样品管理' },
  { id: '2.4.4', name: '样品流程', description: '打样申请、样品追踪、成本核销', phase: '渠道搭建与商品上线', category: '包装与样品管理' },
  
  // 第三阶段：营销推广与规模增长
  { id: '3.1.1', name: '流量推广与精准营销', description: '搜索广告、展示广告、人群定向', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.2', name: '站内外广告素材生产', description: '适配各广告位的素材', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.3', name: '大数据主动拓客', description: '线索挖掘/触达', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.4', name: '市场活动灵活用工', description: '活动执行/外包协同', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.5', name: '广告投放与优化', description: '竞价策略、ACOS/ROAS/TACOS', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.6', name: 'A/B测试与实验', description: 'Listing测试、价格测试、广告素材测试', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.7', name: 'B2B询盘与报价管理', description: '询盘处理、报价策略、跟进转化', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.1.8', name: '数据分析与BI工具', description: '运营看板、决策支持系统', phase: '营销推广与规模增长', category: '获客与投放' },
  { id: '3.2.1', name: '生产融资', description: '供应链金融产品', phase: '营销推广与规模增长', category: '订单、财务与收款' },
  { id: '3.2.2', name: '跨境支付与资金管理', description: '多币种账户、本地支付、汇率管理', phase: '营销推广与规模增长', category: '订单、财务与收款' },
  { id: '3.2.3', name: '财务核算与成本归集', description: '多币种记账、SKU/渠道利润归属', phase: '营销推广与规模增长', category: '订单、财务与收款' },
  { id: '3.2.4', name: '出口退税与税务申报', description: '退税资质/单证/申报，VAT/所得税', phase: '营销推广与规模增长', category: '订单、财务与收款' },
  { id: '3.2.5', name: '国际贸易结算方式', description: 'T/T、L/C、D/P、D/A', phase: '营销推广与规模增长', category: '订单、财务与收款' },
  { id: '3.3.1', name: '知识库/智能客服', description: '多渠道客服、智能客服机器人', phase: '营销推广与规模增长', category: '客服与售后' },
  { id: '3.3.2', name: '报税/批税/税务咨询', description: '客户税务问题响应', phase: '营销推广与规模增长', category: '客服与售后' },
  { id: '3.3.3', name: '退换货、维修、质保服务', description: '退换货政策、维修服务、质保', phase: '营销推广与规模增长', category: '客服与售后' },
  { id: '3.3.4', name: '评价与口碑管理', description: '邀评策略、差评监控、Review分析', phase: '营销推广与规模增长', category: '客服与售后' },
  { id: '3.3.5', name: '逆向物流与成本控制', description: '退货集运、翻新/二次销售', phase: '营销推广与规模增长', category: '客服与售后' },
  { id: '3.4.1', name: '平台合规', description: '材料提交、抽检/下架/申诉', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.4.2', name: '产品认证管理', description: '认证矩阵/标签说明书/证据链', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.4.3', name: '知识产权维护', description: '侵权监控、平台投诉、诉讼策略', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.4.4', name: '风险管理', description: '汇率/政策/供应链/账号/信用风险', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.4.5', name: '保险与风险转移', description: '货运险/仓储险/产品责任险/信用险', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.4.6', name: '法律诉讼与争议解决', description: '跨境诉讼、仲裁与调解', phase: '营销推广与规模增长', category: '合规与风险的持续运营' },
  { id: '3.5.1', name: '多币种定价', description: '税费/运费/平台费联动定价', phase: '营销推广与规模增长', category: '定价与利润管理' },
  { id: '3.5.2', name: '毛利/净利核算模型', description: '促销、清仓、生命周期定价', phase: '营销推广与规模增长', category: '定价与利润管理' },
  { id: '3.6.1', name: '服务商类型', description: '物流商、代运营、翻译、设计等', phase: '营销推广与规模增长', category: '外部服务商管理' },
  { id: '3.6.2', name: '供应商评估', description: '准入标准、绩效考核、淘汰机制', phase: '营销推广与规模增长', category: '外部服务商管理' },
  { id: '3.6.3', name: '合同与结算', description: '服务协议、SLA、账期管理', phase: '营销推广与规模增长', category: '外部服务商管理' },
  
  // 第四阶段：品牌深耕与持续优化
  { id: '4.1.1', name: '报关/清关异常处理', description: '报关单证、海关查验、清关延误', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.1.2', name: '集运（门到门）', description: '全程物流服务', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.1.3', name: '海外仓', description: '布局、入仓、履约', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.1.4', name: '一件代发', description: '无库存模式', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.1.5', name: '小额采购（拼团）', description: '小额采购、拼团模式', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.1.6', name: '物流履约优化', description: '时效与成本、丢损/破损', phase: '品牌深耕与持续优化', category: '履约升级与交付体验' },
  { id: '4.2.1', name: '合伙人转介、交叉销售、复购、防流失、会员体验', description: '私域运营全链路', phase: '品牌深耕与持续优化', category: '私域与会员运营' },
  { id: '4.2.2', name: '客户画像、自动化营销、社媒矩阵裂变', description: '用户运营与裂变', phase: '品牌深耕与持续优化', category: '私域与会员运营' },
  { id: '4.3.1', name: '产品迭代机制', description: '评价/退货/售后驱动', phase: '品牌深耕与持续优化', category: '产品与品牌迭代' },
  { id: '4.3.2', name: '品牌推广与IP策略', description: 'IP授权、IP合作、IP销售', phase: '品牌深耕与持续优化', category: '产品与品牌迭代' },
  { id: '4.3.3', name: '竞争情报与平台政策跟踪', description: '竞品监控、政策变化', phase: '品牌深耕与持续优化', category: '产品与品牌迭代' },
  { id: '4.3.4', name: '产品生命周期管理', description: '各阶段策略与SKU精简', phase: '品牌深耕与持续优化', category: '产品与品牌迭代' },
  { id: '4.4.1', name: '商品洞察', description: '市场机会、用户需求、趋势捕捉', phase: '品牌深耕与持续优化', category: '新品规划' },
  { id: '4.4.2', name: '产品定义', description: '功能规格、卖点提炼、差异化设计', phase: '品牌深耕与持续优化', category: '新品规划' },
  { id: '4.4.3', name: '工业设计', description: '外观、结构、模具', phase: '品牌深耕与持续优化', category: '新品规划' },
  { id: '4.4.4', name: '仿真验品', description: '3D渲染、样品评审、小批量试产', phase: '品牌深耕与持续优化', category: '新品规划' },
  { id: '4.5.1', name: '履约与供应链降本', description: '运费结构、仓配策略、妥投率', phase: '品牌深耕与持续优化', category: '规模化与降本增效' },
  { id: '4.6.1', name: 'ESG合规、绿色供应链、社会责任', description: 'ESG合规与可持续', phase: '品牌深耕与持续优化', category: 'ESG与可持续' },
];

// 通用型需求 - 必选底座
export const universalRequiredIds = [
  '1.4.2', '1.7.1', '1.7.2', '1.7.3', '1.7.4', '1.7.5', // 合规底线
  '3.4.1', '3.4.2', // 平台合规
  '3.2.2', '3.2.3', // 收款与财务基础
  '1.6.2', // 物流方案选型
  '3.3.1', '3.3.3', // 基础客服售后
  '3.4.4', // 基础风险管理
  '1.2.1', '1.4.4', // 市场洞察
];

// 通用型需求 - 增强项
export const universalEnhancedIds = [
  '4.1.2', '4.1.3', '4.1.6', // 履约增强
  '3.3.4', '3.3.5', // 售后与口碑增强
  '3.4.5', // 保险与风险转移
  '3.1.8', '4.3.3', // 数据与经营分析
  '3.2.4', '3.2.5', // 税务与结算进阶
];

// 维度映射：维度选项 -> 对应的需求ID列表
export const dimensionRequirementMapping: Record<string, Record<string, string[]>> = {
  // 维度1：企业类型（扩充映射，覆盖更多基础需求）
  enterpriseType: {
    factory: [ // 工厂型 - 有生产能力，缺品牌和营销
      // 品牌建设（核心短板）
      '1.1.1', '1.7.1', '4.3.2',
      // 市场认知（终端市场认知不足）
      '1.2.1', '1.4.4', '1.4.3',
      // 运营能力（从0到1）
      '1.8.1', '1.8.2', '1.8.3', '1.8.4',
      // 渠道开拓
      '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5',
      // 商品内容
      '2.2.1', '2.2.2', '2.2.3',
      // 营销推广（补短板）
      '1.3.1', '1.3.2', '1.3.3', '3.1.1', '3.1.2',
      // 知识产权（保护自有技术/设计）
      '3.4.3', '3.4.6',
      // 定价（利用成本优势）
      '3.5.1', '3.5.2',
      // 产品迭代
      '4.3.1', '4.4.1', '4.4.2', '4.4.3', '4.4.4',
    ],
    trading: [ // 贸易型 - 有货源，缺差异化和利润空间
      // 选品与测品（核心竞争力）
      '1.4.1', '1.4.3', '1.2.1', '1.4.4',
      // 供应商管理（供应链稳定性）
      '1.6.1', '1.6.3', '3.6.1', '3.6.2', '3.6.3',
      // 渠道建设
      '2.1.1', '2.1.2', '2.1.3',
      // 商品内容（差异化展示）
      '2.2.1', '2.2.2', '2.2.3',
      // 差异化（突破同质化）
      '2.4.1', '2.4.2', '2.4.3', '4.4.2',
      // 成本与定价（利润空间保障）
      '3.5.1', '3.5.2', '3.2.3',
      // 营销推广
      '1.3.3', '3.1.1', '3.1.5',
      // 快速迭代
      '4.3.1', '4.3.4',
    ],
    factoryTrading: [ // 工贸一体 - 既有生产能力，又有贸易渠道
      // 品牌建设（兼具工厂和贸易优势）
      '1.1.1', '1.7.1', '4.3.2',
      // 市场洞察
      '1.2.1', '1.2.2', '1.2.3',
      // 选品与产品开发
      '1.4.1', '1.4.3', '1.4.4',
      // 供应链优化
      '1.3.1', '1.3.2', '1.3.3',
      // 渠道建设
      '2.1.1', '2.1.2', '2.1.3',
      // 营销推广
      '3.1.1', '3.1.5', '3.2.1',
      // 产品迭代与优化
      '4.3.1', '4.4.1', '4.4.2',
    ],
    startup: [ // 初创/SOHO - 资金有限，轻资产运营
      // 低成本启动（轻资产模式）
      '4.1.4', '1.6.4', '4.1.5',
      // 资金规划（突破资金瓶颈）
      '1.5.1', '1.5.2', '1.5.3', '3.2.1',
      // 选品策略（快速试错迭代）
      '1.4.1', '1.4.3', '1.2.1',
      // 学习资源（能力快速提升）
      '1.8.2', '1.5.4', '1.8.3',
      // 基础渠道建设
      '2.1.1', '2.1.2',
      // 商品内容
      '2.2.1', '2.2.2',
      // 基础营销
      '3.1.1', '3.1.5',
      // 成本控制
      '3.5.1', '3.5.2',
      // 风险管理（抗风险能力弱）
      '3.4.4', '3.4.1',
    ],
  },
  
  // 维度2：目标模式
  targetMode: {
    b2b: [ // B2B平台
      '2.1.1', '2.2.1', // 平台运营
      '3.1.7', // 询盘与报价
      '2.4.4', // 样品转化
      '3.1.3', // 海外客户开发
      '1.7.4', '3.6.3', // 合同与大客户管理
      '3.2.5', // 结算方式
      '1.5.4', // 展会资源
    ],
    b2c: [ // B2C平台
      '2.1.1', '2.2.2', // 开店入驻
      '2.2.1', '2.2.3', // Listing优化
      '3.1.5', '3.1.2', '3.1.6', // 广告投放
      '2.3.1', '2.3.2', '2.3.3', // 达人/社媒/直播
      '2.4.2', '3.3.5', // 防损与退货成本
    ],
    independent: [ // 独立站
      '2.1.2', // 建站搭建
      '3.1.1', '3.1.5', // 流量获取
      '2.3.3', '4.2.2', // 社媒运营
      '2.3.1', '2.3.2', // 达人合作
      '4.2.2', // 邮件营销
      '4.2.1', // 私域运营
      '1.7.3', // 数据隐私
      '3.1.6', '1.3.1', // 转化优化
    ],
    offline: [ // 线下渠道
      '2.1.3', '2.1.5', // 渠道开发
      '1.3.4', // 展厅/快闪店
      '2.1.4', '4.1.3', // 本地化运营
      '4.3.2', '1.3.3', // 品牌推广
    ],
  },
  
  // 维度3：当前阶段
  currentStage: {
    observation: [ // 观望期
      '1.5.3', '3.5.2', // 成本测算
      '1.5.1', // 路径规划
      '1.8.1', '1.8.3', // 团队规划
      '3.4.4', // 风险预判
    ],
    startup: [ // 启动期
      '2.1.1', '2.1.2', // 开店落地
      '2.2.1', '2.2.2', // 产品上架
      '2.4.1', '2.4.2', '2.4.3', '2.4.4', // 包装与样品
      '3.1.1', // 基础推广
      '3.3.4', // 口碑启动
    ],
    growth: [ // 增长期
      '3.1.5', '3.1.6', // 广告放量
      '2.2.1', '3.5.1', '1.3.3', // 转化优化
      '1.6.1', // 供应链扩容
      '1.8.2', '1.8.1', // 团队扩张
      '1.5.1', '2.1.1', '2.1.2', '2.1.3', // 多渠道拓展
      '3.2.4', '3.2.5', // 税务与结算
      '3.1.8', // 数据化运营
    ],
    bottleneck: [ // 瓶颈期 - 常见问题对应
      '3.1.5', '3.1.6', '3.1.2', '4.3.3', // 流量下滑
      '2.2.1', '3.5.1', '3.3.4', // 转化率低
      '3.2.3', '3.5.2', '4.5.1', // 利润越做越薄
      '3.4.1', '3.4.2', '3.4.4', // 账号风险
      '3.3.3', '3.3.4', '3.3.5', '2.4.2', // 退货率高
      '1.6.1', '4.3.4', // 库存积压
      '1.8.1', '1.8.3', '3.6.1', // 团队管理混乱
    ],
    mature: [ // 成熟期
      '4.3.2', '1.1.1', // 品牌升级
      '4.3.1', '4.3.4', '4.4.1', '4.4.2', '4.4.3', '4.4.4', // 产品迭代
      '4.5.1', '4.1.6', // 降本增效
      '4.2.1', '4.2.2', // 私域深耕
      '2.1.1', '2.1.2', '2.1.3', '1.5.1', // 多渠道协同
      '4.6.1', '2.4.3', // ESG合规
      '1.5.5', // 资本运作
    ],
  },
  
  // 维度4：品牌标签
  brandStatus: {
    hasBrand: [ // 有品牌
      '1.1.1', '1.3.3', // 品牌战略
      '2.4.1', // 品牌视觉
      '1.7.1', '3.4.3', // 知识产权
      '2.3.3', '3.1.2', '4.3.2', // 品牌传播
      '3.4.6', // 品牌保护
      '3.3.1', '3.3.3', // 品牌体验
      '4.2.1', '4.2.2', // 用户运营
    ],
    noBrand: [ // 无品牌/白牌
      '1.4.1', '1.2.1', // 选品为王
      '3.2.3', '4.5.1', '1.6.2', // 成本优先
      '4.3.1', '4.3.4', // 快速迭代
      '3.1.5', '3.1.6', // 流量效率
      '2.1.1', '2.1.2', '2.1.3', '1.5.1', // 风险分散
      '1.7.1', '1.7.2', '1.7.3', '1.7.4', '1.7.5', '3.4.1', '3.4.4', // 合规底线
    ],
  },
  
  // 补充维度：电商经验
  ecommerceExp: {
    hasExp: [ // 有电商运营经验
      '2.1.1', '3.4.1', // 平台差异
      '1.7.1', '1.7.2', '1.7.3', '1.7.4', '1.7.5', '3.4.2', // 合规适配
      '1.6.2', '4.1.1', '4.1.2', '4.1.3', '4.1.4', '4.1.5', '4.1.6', // 物流体系
      '3.2.2', '3.2.4', '3.2.5', // 支付与税务
      '2.2.3', // 本地化
    ],
    noExp: [ // 无电商运营经验
      '1.8.2', // 基础培训
      '2.1.1', '2.1.2', '2.1.3', '2.1.4', '2.1.5', // 全流程辅导-渠道
      '2.2.1', '2.2.2', '2.2.3', // 全流程辅导-商品
      '3.3.1', '3.3.2', '3.3.3', '3.3.4', '3.3.5', // 全流程辅导-客服
      '3.1.8', // 工具使用
      '3.4.4', '3.4.1', // 避坑指南
      '1.8.3', '3.6.1', '3.6.2', '3.6.3', // 代运营过渡
    ],
  },
};

// 根据选择的维度值计算需求清单
export function calculateRequirements(selections: Record<string, string[]>): {
  universal: RequirementItem[];
  enhanced: RequirementItem[];
  dimensional: RequirementItem[];
  all: RequirementItem[];
} {
  const requirementIds = new Set<string>();
  
  // 添加通用必选需求
  universalRequiredIds.forEach(id => requirementIds.add(id));
  
  // 根据各维度选择添加差异化需求
  Object.entries(selections).forEach(([dimensionKey, selectedValues]) => {
    if (!selectedValues || selectedValues.length === 0) return;
    
    const dimensionMapping = dimensionRequirementMapping[dimensionKey];
    if (!dimensionMapping) return;
    
    selectedValues.forEach(value => {
      const ids = dimensionMapping[value];
      if (ids) {
        ids.forEach(id => requirementIds.add(id));
      }
    });
  });
  
  // 转换为需求对象
  const universalRequired = requirements.filter(r => universalRequiredIds.includes(r.id));
  const enhanced = requirements.filter(r => universalEnhancedIds.includes(r.id));
  const dimensional = requirements.filter(r => 
    requirementIds.has(r.id) && 
    !universalRequiredIds.includes(r.id) && 
    !universalEnhancedIds.includes(r.id)
  );
  const all = requirements.filter(r => requirementIds.has(r.id));
  
  return {
    universal: universalRequired,
    enhanced,
    dimensional,
    all: [...new Set([...universalRequired, ...all])],
  };
}

// 按阶段分组需求
export function groupRequirementsByPhase(items: RequirementItem[]): Record<string, RequirementItem[]> {
  const groups: Record<string, RequirementItem[]> = {};
  items.forEach(item => {
    if (!groups[item.phase]) {
      groups[item.phase] = [];
    }
    groups[item.phase].push(item);
  });
  return groups;
}

// 按分类分组需求
export function groupRequirementsByCategory(items: RequirementItem[]): Record<string, RequirementItem[]> {
  const groups: Record<string, RequirementItem[]> = {};
  items.forEach(item => {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  });
  return groups;
}
