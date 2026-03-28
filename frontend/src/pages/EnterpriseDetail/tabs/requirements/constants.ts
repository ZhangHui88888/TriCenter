export const PHASES = ['战略规划与资源准备', '渠道搭建与商品上线', '营销推广与规模增长', '品牌深耕与持续优化'];

export const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '战略规划与资源准备': { bg: 'rgba(102,126,234,0.08)', text: '#667eea', border: 'rgba(102,126,234,0.2)' },
  '渠道搭建与商品上线': { bg: 'rgba(67,233,123,0.08)', text: '#22c55e', border: 'rgba(67,233,123,0.2)' },
  '营销推广与规模增长': { bg: 'rgba(249,115,22,0.08)', text: '#f97316', border: 'rgba(249,115,22,0.2)' },
  '品牌深耕与持续优化': { bg: 'rgba(139,92,246,0.08)', text: '#8b5cf6', border: 'rgba(139,92,246,0.2)' },
};

export const DIMENSION_LABELS: Record<string, Record<string, string>> = {
  enterpriseType: {
    production: '生产型', trading: '贸易型', factoryTrading: '工贸一体',
    crossBorderSeller: '跨境卖家型', brandOperator: '品牌运营型',
    supplyChainService: '供应链服务型', technicalService: '技术服务型',
    comprehensiveService: '综合服务型', undefined: '未定义',
    factory: '生产型', startup: '未定义',
  },
  targetMode: { b2b: 'B2B平台', b2c: 'B2C平台', independent: '独立站', offline: '线下渠道' },
  currentStage: { observation: '观望期', startup: '启动期', growth: '增长期', bottleneck: '瓶颈期', mature: '成熟期' },
  brandStatus: { hasBrand: '有品牌', noBrand: '无品牌' },
  ecommerceExp: { hasExp: '有电商经验', noExp: '无电商经验' },
};

export const SOURCE_STYLES: Record<string, { bg: string; color: string }> = {
  '通用必选': { bg: 'rgba(67,233,123,0.1)', color: '#22c55e' },
  '增强项': { bg: 'rgba(249,115,22,0.1)', color: '#f97316' },
  _default: { bg: 'rgba(139,92,246,0.1)', color: '#8b5cf6' },
};
