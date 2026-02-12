import type { FunnelStageInfo, Enterprise, FollowUpRecord, ConversionData, DistrictStat, IndustryStat, TrendData } from '@/types';

export const funnelStages: FunnelStageInfo[] = [
  { code: 'POTENTIAL', name: '潜在企业', color: '#94a3b8', count: 156 },
  { code: 'NO_DEMAND', name: '无明确需求', color: '#fbbf24', count: 42 },
  { code: 'NO_INTENTION', name: '没有合作意向', color: '#ef4444', count: 28 },
  { code: 'HAS_DEMAND', name: '有明确需求', color: '#3b82f6', count: 65 },
  { code: 'SIGNED', name: '已签约', color: '#8b5cf6', count: 34 },
  { code: 'SETTLED', name: '已入驻', color: '#10b981', count: 23 },
  { code: 'INCUBATING', name: '重点孵化', color: '#f97316', count: 8 },
];

export const districts = ['武进区', '新北区', '天宁区', '钟楼区', '经开区', '金坛区', '溧阳市'];

export const industries = ['园艺制品', '电动工具', '汽车零部件', '家居建材', '机械设备', '纺织服装', '电子产品', '其他'];

export const industryCategories = [
  {
    value: '制造业',
    label: '制造业',
    children: [
      {
        value: '机械设备',
        label: '机械设备',
        children: [
          { value: '电动工具', label: '电动工具' },
          { value: '通用设备', label: '通用设备' },
          { value: '专用设备', label: '专用设备' },
        ],
      },
      {
        value: '汽车制造',
        label: '汽车制造',
        children: [
          { value: '汽车零部件', label: '汽车零部件' },
          { value: '整车制造', label: '整车制造' },
          { value: '新能源汽车', label: '新能源汽车' },
        ],
      },
      {
        value: '电子信息',
        label: '电子信息',
        children: [
          { value: '电子产品', label: '电子产品' },
          { value: '通信设备', label: '通信设备' },
          { value: '半导体', label: '半导体' },
        ],
      },
      {
        value: '纺织服装',
        label: '纺织服装',
        children: [
          { value: '纺织品', label: '纺织品' },
          { value: '服装', label: '服装' },
          { value: '家纺', label: '家纺' },
        ],
      },
      {
        value: '家居建材',
        label: '家居建材',
        children: [
          { value: '家具', label: '家具' },
          { value: '建材', label: '建材' },
          { value: '装饰材料', label: '装饰材料' },
        ],
      },
    ],
  },
  {
    value: '农林牧渔',
    label: '农林牧渔',
    children: [
      {
        value: '园艺产品',
        label: '园艺产品',
        children: [
          { value: '园艺制品', label: '园艺制品' },
          { value: '花卉苗木', label: '花卉苗木' },
          { value: '园林工具', label: '园林工具' },
        ],
      },
      {
        value: '农产品加工',
        label: '农产品加工',
        children: [
          { value: '食品加工', label: '食品加工' },
          { value: '饲料加工', label: '饲料加工' },
        ],
      },
    ],
  },
  {
    value: '其他行业',
    label: '其他行业',
    children: [
      { value: '其他', label: '其他' },
    ],
  },
];

export const enterprises: Enterprise[] = [
  {
    id: 1,
    enterprise_name: '常州绿源园艺科技有限公司',
    unified_credit_code: '91320411MA1XXXXXXXXXL',
    province: '江苏省',
    city: '常州市',
    district: '武进区',
    detailed_address: '湖塘镇工业园区A栋',
    enterprise_type: '工厂型',
    industry: '园艺制品',
    employee_scale: '50-200人',
    domestic_revenue: '1000-5000',
    crossborder_revenue: '200-500',
    funnel_stage: 'HAS_DEMAND',
    source: '调研',
    contacts: [
      { name: '王总', phone: '13800138001', position: '总经理', is_primary: true },
      { name: '李经理', phone: '13800138002', position: '外贸经理', is_primary: false }
    ],
    has_crossborder: true,
    main_platforms: '亚马逊,阿里国际站',
    target_markets: '北美,欧洲',
    transformation_willingness: '强烈',
    created_at: '2025-11-15'
  },
  {
    id: 2,
    enterprise_name: '江苏精工电动工具有限公司',
    unified_credit_code: '91320411MA2XXXXXXXXXK',
    province: '江苏省',
    city: '常州市',
    district: '新北区',
    detailed_address: '科技城B区12号',
    enterprise_type: '工贸一体',
    industry: '电动工具',
    employee_scale: '200-500人',
    domestic_revenue: '5000以上',
    crossborder_revenue: '1000-5000',
    funnel_stage: 'SIGNED',
    source: '转介绍',
    contacts: [
      { name: '陈董', phone: '13900139001', position: '董事长', is_primary: true }
    ],
    has_crossborder: true,
    main_platforms: '亚马逊,独立站',
    target_markets: '北美,东南亚',
    transformation_willingness: '有',
    created_at: '2025-10-20'
  },
  {
    id: 3,
    enterprise_name: '常州天宁家居用品有限公司',
    unified_credit_code: '91320411MA3XXXXXXXXXJ',
    province: '江苏省',
    city: '常州市',
    district: '天宁区',
    detailed_address: '红梅西路88号',
    enterprise_type: '贸易型',
    industry: '家居建材',
    employee_scale: '10-50人',
    domestic_revenue: '500-1000',
    crossborder_revenue: '0',
    funnel_stage: 'POTENTIAL',
    source: '活动',
    contacts: [
      { name: '刘总', phone: '13700137001', position: '总经理', is_primary: true }
    ],
    has_crossborder: false,
    main_platforms: '',
    target_markets: '',
    transformation_willingness: '可以考虑',
    created_at: '2026-01-10'
  },
  {
    id: 4,
    enterprise_name: '溧阳汽车零部件制造有限公司',
    unified_credit_code: '91320411MA4XXXXXXXXXH',
    province: '江苏省',
    city: '常州市',
    district: '溧阳市',
    detailed_address: '昆仑经济开发区C区',
    enterprise_type: '工厂型',
    industry: '汽车零部件',
    employee_scale: '500-1000人',
    domestic_revenue: '5000以上',
    crossborder_revenue: '500-1000',
    funnel_stage: 'SETTLED',
    source: '主动咨询',
    contacts: [
      { name: '赵总', phone: '13600136001', position: '总经理', is_primary: true },
      { name: '周经理', phone: '13600136002', position: '跨境电商经理', is_primary: false }
    ],
    has_crossborder: true,
    main_platforms: '阿里国际站,TikTok Shop',
    target_markets: '东南亚,中东',
    transformation_willingness: '强烈',
    created_at: '2025-08-05'
  },
  {
    id: 5,
    enterprise_name: '金坛纺织服装有限公司',
    unified_credit_code: '91320411MA5XXXXXXXXXG',
    province: '江苏省',
    city: '常州市',
    district: '金坛区',
    detailed_address: '经济开发区纺织园',
    enterprise_type: '工贸一体',
    industry: '纺织服装',
    employee_scale: '200-500人',
    domestic_revenue: '1000-5000',
    crossborder_revenue: '200以下',
    funnel_stage: 'NO_DEMAND',
    source: '调研',
    contacts: [
      { name: '孙总', phone: '13500135001', position: '总经理', is_primary: true }
    ],
    has_crossborder: false,
    main_platforms: '',
    target_markets: '',
    transformation_willingness: '无',
    created_at: '2025-12-01'
  },
  {
    id: 6,
    enterprise_name: '常州钟楼机械设备有限公司',
    unified_credit_code: '91320411MA6XXXXXXXXXF',
    province: '江苏省',
    city: '常州市',
    district: '钟楼区',
    detailed_address: '机械产业园',
    enterprise_type: '工厂型',
    industry: '机械设备',
    employee_scale: '50-200人',
    domestic_revenue: '1000-5000',
    crossborder_revenue: '0',
    funnel_stage: 'NO_INTENTION',
    source: '调研',
    contacts: [
      { name: '吴总', phone: '13400134001', position: '总经理', is_primary: true }
    ],
    has_crossborder: false,
    main_platforms: '',
    target_markets: '',
    transformation_willingness: '无',
    created_at: '2025-09-15'
  },
  {
    id: 7,
    enterprise_name: '常州经开电子科技有限公司',
    unified_credit_code: '91320411MA7XXXXXXXXXE',
    province: '江苏省',
    city: '常州市',
    district: '经开区',
    detailed_address: '电子产业园',
    enterprise_type: '工贸一体',
    industry: '电子产品',
    employee_scale: '50-200人',
    domestic_revenue: '500-1000',
    crossborder_revenue: '200-500',
    funnel_stage: 'INCUBATING',
    source: '转介绍',
    contacts: [
      { name: '郑总', phone: '13300133001', position: '总经理', is_primary: true },
      { name: '钱经理', phone: '13300133002', position: '品牌总监', is_primary: false }
    ],
    has_crossborder: true,
    main_platforms: 'TikTok Shop,独立站,SHEIN',
    target_markets: '欧洲,北美,东南亚',
    transformation_willingness: '强烈',
    created_at: '2025-06-20'
  },
];

export const followUpRecords: FollowUpRecord[] = [
  {
    id: 1,
    enterprise_id: 1,
    enterprise_name: '常州绿源园艺科技有限公司',
    follow_up_date: '2026-01-20',
    follow_up_person: '张明',
    follow_up_type: '拜访',
    content: '拜访企业了解跨境电商转型需求，企业表示对亚马逊运营有强烈兴趣，希望获得专业培训支持。',
    overall_status: '积极配合',
    next_step: '安排亚马逊运营培训课程',
    stage_before: 'POTENTIAL',
    stage_after: 'HAS_DEMAND'
  },
  {
    id: 2,
    enterprise_id: 2,
    enterprise_name: '江苏精工电动工具有限公司',
    follow_up_date: '2026-01-18',
    follow_up_person: '李华',
    follow_up_type: '会议',
    content: '签署服务合作协议，企业将入驻三中心共享办公区域，计划3月正式入驻。',
    overall_status: '已签约',
    next_step: '准备入驻相关材料',
    stage_before: 'HAS_DEMAND',
    stage_after: 'SIGNED'
  },
  {
    id: 3,
    enterprise_id: 4,
    enterprise_name: '溧阳汽车零部件制造有限公司',
    follow_up_date: '2026-01-15',
    follow_up_person: '张明',
    follow_up_type: '电话',
    content: '回访入驻企业，了解运营情况，企业反馈TikTok Shop销售增长明显，需要品牌建设支持。',
    overall_status: '运营良好',
    next_step: '对接品牌孵化团队',
    stage_before: 'SETTLED',
    stage_after: 'SETTLED'
  },
  {
    id: 4,
    enterprise_id: 7,
    enterprise_name: '常州经开电子科技有限公司',
    follow_up_date: '2026-01-12',
    follow_up_person: '张明',
    follow_up_type: '拜访',
    content: '重点孵化企业月度回访，企业独立站月销售额突破50万美元，准备进行品牌升级。',
    overall_status: '孵化进展顺利',
    next_step: '协助品牌升级方案制定',
    stage_before: 'INCUBATING',
    stage_after: 'INCUBATING'
  },
];

export const conversionData: ConversionData[] = [
  { from: '潜在企业', to: '有明确需求', count: 45, rate: 28.8 },
  { from: '潜在企业', to: '无明确需求', count: 32, rate: 20.5 },
  { from: '无明确需求', to: '有明确需求', count: 12, rate: 28.6 },
  { from: '无明确需求', to: '没有合作意向', count: 8, rate: 19.0 },
  { from: '有明确需求', to: '已签约', count: 28, rate: 43.1 },
  { from: '已签约', to: '已入驻', count: 20, rate: 58.8 },
  { from: '已入驻', to: '重点孵化', count: 6, rate: 26.1 },
];

export const districtStats: DistrictStat[] = [
  { name: '武进区', count: 68 },
  { name: '新北区', count: 52 },
  { name: '天宁区', count: 38 },
  { name: '钟楼区', count: 32 },
  { name: '经开区', count: 45 },
  { name: '金坛区', count: 28 },
  { name: '溧阳市', count: 35 },
];

export const industryStats: IndustryStat[] = [
  { name: '园艺制品', count: 45 },
  { name: '电动工具', count: 38 },
  { name: '汽车零部件', count: 52 },
  { name: '家居建材', count: 35 },
  { name: '机械设备', count: 48 },
  { name: '纺织服装', count: 32 },
  { name: '电子产品', count: 28 },
  { name: '其他', count: 20 },
];

export const trendData: TrendData[] = [
  { month: '8月', potential: 120, hasDemand: 42, signed: 18, settled: 12 },
  { month: '9月', potential: 132, hasDemand: 48, signed: 22, settled: 14 },
  { month: '10月', potential: 141, hasDemand: 52, signed: 25, settled: 16 },
  { month: '11月', potential: 148, hasDemand: 58, signed: 28, settled: 18 },
  { month: '12月', potential: 152, hasDemand: 62, signed: 31, settled: 20 },
  { month: '1月', potential: 156, hasDemand: 65, signed: 34, settled: 23 },
];

export const pendingFollowUpEnterprises = [
  { id: 3, name: '常州天宁家居用品有限公司', lastFollowUp: '2025-12-10', days: 48 },
  { id: 5, name: '金坛纺织服装有限公司', lastFollowUp: '2025-12-15', days: 43 },
  { id: 6, name: '常州钟楼机械设备有限公司', lastFollowUp: '2025-12-20', days: 38 },
];

export const weeklyFollowUpEnterprises = [
  { id: 1, name: '常州绿源园艺科技有限公司', nextFollowUp: '2026-01-28', type: '培训跟进' },
  { id: 2, name: '江苏精工电动工具有限公司', nextFollowUp: '2026-01-29', type: '入驻准备' },
  { id: 4, name: '溧阳汽车零部件制造有限公司', nextFollowUp: '2026-01-30', type: '品牌对接' },
];
