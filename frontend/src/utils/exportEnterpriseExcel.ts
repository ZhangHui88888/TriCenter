import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// 主题色
export const THEME = {
  primary: '667EEA',
  primaryDark: '4C63D2',
  green: '43E97B',
  orange: 'F97316',
  purple: '8B5CF6',
  cyan: '06B6D4',
  pink: 'EC4899',
  red: 'EF4444',
  white: 'FFFFFF',
  lightGray: 'F8FAFC',
  gray: 'E2E8F0',
  darkText: '1E293B',
  subText: '64748B',
};

/** 设置标题行样式 */
export function applyHeaderStyle(row: ExcelJS.Row, colCount: number) {
  row.height = 32;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= colCount) {
      cell.font = { name: '微软雅黑', size: 11, bold: true, color: { argb: THEME.white } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.primary } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: THEME.primaryDark } },
        bottom: { style: 'thin', color: { argb: THEME.primaryDark } },
        left: { style: 'thin', color: { argb: THEME.primaryDark } },
        right: { style: 'thin', color: { argb: THEME.primaryDark } },
      };
    }
  });
}

/** 设置数据行样式 */
export function applyDataRowStyle(row: ExcelJS.Row, colCount: number, isEven: boolean) {
  row.height = 24;
  row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    if (colNumber <= colCount) {
      cell.font = { name: '微软雅黑', size: 10, color: { argb: THEME.darkText } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isEven ? THEME.lightGray : THEME.white },
      };
      cell.border = {
        top: { style: 'thin', color: { argb: THEME.gray } },
        bottom: { style: 'thin', color: { argb: THEME.gray } },
        left: { style: 'thin', color: { argb: THEME.gray } },
        right: { style: 'thin', color: { argb: THEME.gray } },
      };
    }
  });
}

/** 添加 Sheet 标题行（合并单元格） */
export function addSheetTitle(ws: ExcelJS.Worksheet, title: string, colCount: number) {
  const row = ws.addRow([title]);
  ws.mergeCells(row.number, 1, row.number, colCount);
  row.height = 40;
  const cell = row.getCell(1);
  cell.font = { name: '微软雅黑', size: 14, bold: true, color: { argb: THEME.primary } };
  cell.alignment = { vertical: 'middle', horizontal: 'center' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.white } };
  cell.border = {
    bottom: { style: 'medium', color: { argb: THEME.primary } },
  };
}

/** 添加分区标题行 */
export function addSectionTitle(ws: ExcelJS.Worksheet, title: string, colCount: number, color = THEME.primary) {
  const row = ws.addRow([title]);
  ws.mergeCells(row.number, 1, row.number, colCount);
  row.height = 28;
  const cell = row.getCell(1);
  cell.font = { name: '微软雅黑', size: 11, bold: true, color: { argb: color } };
  cell.alignment = { vertical: 'middle', horizontal: 'left' };
  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: THEME.lightGray } };
  cell.border = {
    left: { style: 'medium', color: { argb: color } },
    bottom: { style: 'thin', color: { argb: THEME.gray } },
  };
}

/** 添加键值对行 */
export function addKeyValueRows(
  ws: ExcelJS.Worksheet,
  data: Array<[string, string]>,
  colCount: number,
) {
  // 每行放2组键值对
  for (let i = 0; i < data.length; i += 2) {
    const rowData: string[] = [];
    rowData.push(data[i][0], data[i][1]);
    if (i + 1 < data.length) {
      // 填充到第3、4列
      while (rowData.length < Math.min(colCount, 2)) rowData.push('');
      rowData.push(data[i + 1][0], data[i + 1][1]);
    }
    const row = ws.addRow(rowData);
    row.height = 24;
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      if (colNumber <= colCount) {
        cell.font = { name: '微软雅黑', size: 10, color: { argb: THEME.darkText } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = {
          bottom: { style: 'thin', color: { argb: THEME.gray } },
        };
        // 标签列加粗
        if (colNumber === 1 || colNumber === 3) {
          cell.font = { name: '微软雅黑', size: 10, bold: true, color: { argb: THEME.subText } };
        }
      }
    });
  }
}

/** 漏斗阶段名称映射 */
export const STAGE_MAP: Record<string, string> = {
  POTENTIAL: '潜在企业',
  NO_DEMAND: '无明确需求',
  NO_INTENTION: '没有合作意向',
  HAS_DEMAND: '有明确需求',
  SIGNED: '已签约',
  SETTLED: '已入驻',
  INCUBATING: '重点孵化',
};

export interface ExportEnterpriseData {
  enterprise: any;
  followUpRecords: any[];
  // 外贸信息（前端状态数据）
  hasForeignTrade: boolean;
  marketChanges: { up: any[]; down: any[] };
  modeChanges: { up: any[]; down: any[] };
  categoryChanges: { up: any[]; down: any[] };
  growthReasons: string[];
  declineReasons: string[];
  // 跨境电商
  hasCrossborderEcommerce: boolean;
  selectedCrossborderPlatforms: string[];
  targetMarkets: { market: string; percentage: number }[];
  // 合作
  isCooperating: boolean;
  // 竞争力与风险
  isSurveyed: boolean;
  competitionPosition: string;
  competitionDesc: string;
  // 需求分析
  dimensionSelections: Record<string, string[]>;
  customRequirements: { id: string; name: string; description: string; phase: string; category: string }[];
}

export async function exportEnterpriseExcel(data: ExportEnterpriseData) {
  const { enterprise } = data;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'TriCenter';
  wb.created = new Date();

  // ========== Sheet 1: 基本信息 ==========
  buildBasicInfoSheet(wb, data);

  // ========== Sheet 2: 产品信息 ==========
  buildProductInfoSheet(wb, data);

  // ========== Sheet 3: 外贸信息 ==========
  buildTradeInfoSheet(wb, data);

  // ========== Sheet 4: 跨境电商 ==========
  buildCrossborderSheet(wb, data);

  // ========== Sheet 5: 需求分析 ==========
  buildRequirementsSheet(wb, data);

  // ========== Sheet 6: 合作 ==========
  buildCooperationSheet(wb, data);

  // ========== Sheet 7: 竞争力与风险 ==========
  buildCompetitionSheet(wb, data);

  // ========== Sheet 8: 跟进记录 ==========
  buildFollowUpSheet(wb, data);

  // 导出
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `${enterprise.enterprise_name}_企业信息_${new Date().toISOString().slice(0, 10)}.xlsx`;
  saveAs(blob, fileName);
}

// ==================== Sheet Builders ====================

function buildBasicInfoSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise } = data;
  const ws = wb.addWorksheet('基本信息', { properties: { tabColor: { argb: THEME.primary } } });
  const contactColCount = 7;
  ws.columns = [
    { width: 18 }, { width: 32 }, { width: 18 }, { width: 32 }, { width: 20 }, { width: 18 }, { width: 22 },
  ];
  const kvColCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 基本信息`, contactColCount);
  ws.addRow([]);

  // 企业信息
  addSectionTitle(ws, '企业信息', contactColCount);
  addKeyValueRows(ws, [
    ['企业名称', enterprise.enterprise_name || '-'],
    ['统一社会信用代码', enterprise.unified_credit_code || '-'],
    ['所属区域', enterprise.district || '-'],
    ['所属行业', enterprise.industry || '-'],
    ['企业类型', enterprise.enterprise_type || '-'],
    ['人员规模', enterprise.employee_scale || '-'],
    ['省/市/区', [enterprise.province, enterprise.city, enterprise.district].filter(Boolean).join(' / ') || '-'],
    ['详细地址', enterprise.detailed_address || '-'],
    ['国内营收(万元)', enterprise.domestic_revenue || '-'],
    ['跨境营收(万元)', enterprise.crossborder_revenue || '-'],
    ['企业来源', enterprise.source || '-'],
    ['官网', enterprise.website || '-'],
    ['漏斗阶段', STAGE_MAP[enterprise.funnel_stage] || enterprise.funnel_stage || '-'],
    ['录入时间', enterprise.created_at || '-'],
  ], kvColCount);

  ws.addRow([]);

  // 联系人信息
  addSectionTitle(ws, '联系人信息', contactColCount);
  const contactHeaders = ['姓名', '电话', '职位', '邮箱', '微信', '备注', '是否主要联系人'];
  const hRow = ws.addRow(contactHeaders);
  applyHeaderStyle(hRow, contactColCount);

  if (enterprise.contacts && enterprise.contacts.length > 0) {
    enterprise.contacts.forEach((c: any, idx: number) => {
      const isPrimary = c.is_primary || c.isPrimary;
      const row = ws.addRow([
        c.name || '-',
        c.phone || '-',
        c.position || '-',
        c.email || '-',
        c.wechat || '-',
        c.remark || '-',
        isPrimary ? '是' : '否',
      ]);
      applyDataRowStyle(row, contactColCount, idx % 2 === 0);
    });
  } else {
    const row = ws.addRow(['暂无联系人信息', '', '', '', '', '', '']);
    ws.mergeCells(row.number, 1, row.number, contactColCount);
    applyDataRowStyle(row, contactColCount, false);
  }
}

function buildProductInfoSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise } = data;
  const ws = wb.addWorksheet('产品信息', { properties: { tabColor: { argb: THEME.green } } });
  ws.columns = [
    { width: 16 }, { width: 16 }, { width: 20 }, { width: 16 },
    { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 18 },
  ];
  const colCount = 9;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 产品信息`, colCount);
  ws.addRow([]);

  // 产品列表
  addSectionTitle(ws, '产品列表', colCount);
  const headers = ['产品名称', '产品品类', '认证资质', '主要销售区域', '主要销售国家', '年销售额', '原材料本地采购', '设备自动化程度', '年产能'];
  const hRow = ws.addRow(headers);
  applyHeaderStyle(hRow, colCount);

  if (enterprise.products && enterprise.products.length > 0) {
    enterprise.products.forEach((p: any, idx: number) => {
      const row = ws.addRow([
        p.name || '-',
        p.categoryName || '-',
        p.certificationNames?.join('、') || '-',
        p.targetRegionNames?.join('、') || '-',
        p.targetCountryIds?.join('、') || '-',
        p.annualSales || '-',
        p.localProcurementRatio || '-',
        p.automationLevelName || '-',
        p.annualCapacity || '-',
      ]);
      applyDataRowStyle(row, colCount, idx % 2 === 0);
    });
  } else {
    const row = ws.addRow(['暂无产品信息', '', '', '', '', '', '', '', '']);
    ws.mergeCells(row.number, 1, row.number, colCount);
    applyDataRowStyle(row, colCount, false);
  }

  ws.addRow([]);

  // 自主品牌
  addSectionTitle(ws, '自主品牌', colCount, THEME.green);
  addKeyValueRows(ws, [
    ['是否有自主品牌', enterprise.has_own_brand ? '是' : '否'],
    ['品牌名称', enterprise.brand_names?.join('、') || '-'],
  ], 4);

  ws.addRow([]);

  // 核心技术/专利
  addSectionTitle(ws, '核心技术/专利', colCount, THEME.orange);
  const patentHeaders = ['专利名称', '专利号'];
  const phRow = ws.addRow([...patentHeaders, '', '', '', '', '', '', '']);
  applyHeaderStyle(phRow, 2);

  if (enterprise.patents && enterprise.patents.length > 0) {
    enterprise.patents.forEach((p: any, idx: number) => {
      const row = ws.addRow([p.name || '-', p.patentNo || '-']);
      applyDataRowStyle(row, 2, idx % 2 === 0);
    });
  } else {
    const row = ws.addRow(['暂无专利信息', '']);
    ws.mergeCells(row.number, 1, row.number, 2);
    applyDataRowStyle(row, 2, false);
  }
}

function buildTradeInfoSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, hasForeignTrade, marketChanges, modeChanges, categoryChanges, growthReasons, declineReasons } = data;
  const ws = wb.addWorksheet('外贸信息', { properties: { tabColor: { argb: THEME.orange } } });
  ws.columns = [
    { width: 20 }, { width: 30 }, { width: 20 }, { width: 30 },
  ];
  const colCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 外贸信息`, colCount);
  ws.addRow([]);

  addKeyValueRows(ws, [
    ['是否开展外贸业务', hasForeignTrade ? '是' : '否'],
  ], colCount);

  if (!hasForeignTrade) return;

  ws.addRow([]);
  addSectionTitle(ws, '外贸基本信息', colCount);
  addKeyValueRows(ws, [
    ['主要销售区域', '欧洲、东南亚'],
    ['主要销售国家', '美国、德国'],
    ['外贸模式', '直接出口'],
    ['是否有进出口资质', '是'],
    ['报关申报主体模式', '自营'],
    ['外贸业务团队模式', '自建'],
    ['外贸团队人数', '8人'],
    ['是否有国内电商经验', '是'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '外贸业绩分析', colCount);
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  const yearBeforeLast = currentYear - 2;
  const lastYearRevenue = enterprise.last_year_revenue || 1500;
  const yearBeforeLastRevenue = enterprise.year_before_last_revenue || 1280;
  const growthRate = yearBeforeLastRevenue > 0
    ? ((lastYearRevenue - yearBeforeLastRevenue) / yearBeforeLastRevenue * 100).toFixed(1)
    : '0';

  addKeyValueRows(ws, [
    [`${yearBeforeLast}年外贸营业额`, `${yearBeforeLastRevenue}万元`],
    [`${lastYear}年外贸营业额`, `${lastYearRevenue}万元`],
    ['同比增长率', `${Number(growthRate) >= 0 ? '+' : ''}${growthRate}%`],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '市场变化', colCount);
  addKeyValueRows(ws, [
    ['增长市场', marketChanges.up.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
    ['下降市场', marketChanges.down.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '模式变化', colCount);
  addKeyValueRows(ws, [
    ['增长模式', modeChanges.up.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
    ['下降模式', modeChanges.down.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '品类变化', colCount);
  addKeyValueRows(ws, [
    ['增长品类', categoryChanges.up.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
    ['下降品类', categoryChanges.down.map(i => `${i.name} ${i.rate}`).join('、') || '-'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '原因分析', colCount);
  addKeyValueRows(ws, [
    ['增长原因', growthReasons.join('；') || '-'],
    ['下降原因', declineReasons.join('；') || '-'],
  ], colCount);
}

function buildCrossborderSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, hasCrossborderEcommerce, selectedCrossborderPlatforms, targetMarkets } = data;
  const ws = wb.addWorksheet('跨境电商', { properties: { tabColor: { argb: THEME.purple } } });
  ws.columns = [
    { width: 20 }, { width: 30 }, { width: 20 }, { width: 30 },
  ];
  const colCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 跨境电商`, colCount);
  ws.addRow([]);

  addKeyValueRows(ws, [
    ['是否开展跨境电商业务', hasCrossborderEcommerce ? '是' : '否'],
  ], colCount);

  if (!hasCrossborderEcommerce) return;

  ws.addRow([]);
  addSectionTitle(ws, '主要跨境平台', colCount);
  addKeyValueRows(ws, [
    ['跨境平台', selectedCrossborderPlatforms.join('、') || '-'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '跨境基本信息', colCount);
  addKeyValueRows(ws, [
    ['跨境业务占比', '25%'],
    ['跨境物流模式', '海运、FBA'],
    ['支付结算方式', 'FOB'],
    ['跨境电商团队规模', '5人'],
    ['是否在用ERP', '是（用友U8）'],
    ['跨境转型意愿', enterprise.transformation_willingness || '-'],
    ['愿意投入转型程度', '高'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '目标市场及占比', colCount);
  const marketHeaders = ['市场', '占比'];
  const mhRow = ws.addRow([...marketHeaders, '', '']);
  applyHeaderStyle(mhRow, 2);
  targetMarkets.forEach((m, idx) => {
    const row = ws.addRow([m.market || '-', `${m.percentage}%`]);
    applyDataRowStyle(row, 2, idx % 2 === 0);
  });
}

function buildRequirementsSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, dimensionSelections, customRequirements } = data;
  const ws = wb.addWorksheet('需求分析', { properties: { tabColor: { argb: THEME.cyan } } });
  ws.columns = [
    { width: 20 }, { width: 20 }, { width: 30 }, { width: 30 },
  ];
  const colCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 需求分析`, colCount);
  ws.addRow([]);

  // 维度选择
  addSectionTitle(ws, '企业画像维度选择', colCount);
  const dimLabels: Record<string, string> = {
    enterpriseType: '企业类型',
    targetMode: '目标模式',
    currentStage: '当前阶段',
    brandStatus: '品牌状态',
    ecommerceExp: '电商经验',
  };
  const dimValueLabels: Record<string, Record<string, string>> = {
    enterpriseType: { factory: '工厂型', trading: '贸易型', factoryTrading: '工贸一体', startup: '初创/SOHO' },
    targetMode: { b2b: 'B2B平台', b2c: 'B2C平台', independent: '独立站', offline: '线下渠道' },
    currentStage: { observation: '观望期', startup: '启动期', growth: '增长期', bottleneck: '瓶颈期', mature: '成熟期' },
    brandStatus: { hasBrand: '有品牌', noBrand: '无品牌' },
    ecommerceExp: { hasExp: '有电商经验', noExp: '无电商经验' },
  };

  const dimEntries: Array<[string, string]> = Object.entries(dimensionSelections).map(([key, values]) => {
    const label = dimLabels[key] || key;
    const valueStr = values.map(v => dimValueLabels[key]?.[v] || v).join('、') || '-';
    return [label, valueStr];
  });
  if (dimEntries.length > 0) {
    addKeyValueRows(ws, dimEntries, colCount);
  } else {
    const row = ws.addRow(['未选择维度', '', '', '']);
    ws.mergeCells(row.number, 1, row.number, colCount);
    applyDataRowStyle(row, colCount, false);
  }

  ws.addRow([]);

  // 自定义需求
  addSectionTitle(ws, '自定义需求', colCount, THEME.orange);
  if (customRequirements.length > 0) {
    const crHeaders = ['需求名称', '描述', '阶段', '分类'];
    const crRow = ws.addRow(crHeaders);
    applyHeaderStyle(crRow, colCount);
    customRequirements.forEach((r, idx) => {
      const row = ws.addRow([r.name, r.description, r.phase, r.category]);
      applyDataRowStyle(row, colCount, idx % 2 === 0);
    });
  } else {
    const row = ws.addRow(['暂无自定义需求', '', '', '']);
    ws.mergeCells(row.number, 1, row.number, colCount);
    applyDataRowStyle(row, colCount, false);
  }
}

function buildCooperationSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, isCooperating } = data;
  const ws = wb.addWorksheet('合作', { properties: { tabColor: { argb: THEME.pink } } });
  ws.columns = [
    { width: 22 }, { width: 30 }, { width: 22 }, { width: 30 },
  ];
  const colCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 合作`, colCount);
  ws.addRow([]);

  addSectionTitle(ws, '三中心合作', colCount);
  addKeyValueRows(ws, [
    ['合作状态', isCooperating ? '已合作' : '未合作'],
  ], colCount);

  if (isCooperating) {
    addKeyValueRows(ws, [
      ['合作项目', '跨境电商运营培训、平台资源对接、品牌孵化服务'],
    ], colCount);
  } else {
    addKeyValueRows(ws, [
      ['不合作主要顾虑', '暂无合作意向、企业自有团队较完善'],
    ], colCount);
  }

  ws.addRow([]);
  addSectionTitle(ws, '三中心评估 - 合作可能性评分', colCount);
  const scores = [
    ['企业服务合作', '4星'],
    ['招商入驻合作', '3星'],
    ['孵化转型合作', '5星'],
    ['品牌营销合作', '4星'],
    ['人才培训合作', '3星'],
    ['跨境整体方案', '4星'],
  ] as Array<[string, string]>;
  addKeyValueRows(ws, scores, colCount);

  ws.addRow([]);
  addSectionTitle(ws, '标杆企业可能性', colCount);
  addKeyValueRows(ws, [
    ['成为标杆企业的可能性', '75%'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '其它补充说明', colCount);
  const noteRow = ws.addRow(['该企业在园艺工具领域有较强的生产能力和品牌基础，跨境电商转型意愿强烈，建议重点跟进孵化转型合作。']);
  ws.mergeCells(noteRow.number, 1, noteRow.number, colCount);
  noteRow.height = 36;
  noteRow.getCell(1).font = { name: '微软雅黑', size: 10, color: { argb: THEME.darkText } };
  noteRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
}

function buildCompetitionSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, isSurveyed, competitionPosition, competitionDesc } = data;
  const ws = wb.addWorksheet('竞争力与风险', { properties: { tabColor: { argb: THEME.red } } });
  ws.columns = [
    { width: 22 }, { width: 30 }, { width: 22 }, { width: 30 },
  ];
  const colCount = 4;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 竞争力与风险`, colCount);
  ws.addRow([]);

  addKeyValueRows(ws, [
    ['是否经过调研', isSurveyed ? '是' : '否'],
  ], colCount);

  if (!isSurveyed) return;

  ws.addRow([]);
  addSectionTitle(ws, '行业竞争地位', colCount);
  const positionMap: Record<string, string> = { leader: '头部企业', medium: '中型企业', startup: '初创企业' };
  addKeyValueRows(ws, [
    ['竞争地位', positionMap[competitionPosition] || competitionPosition || '-'],
    ['描述', competitionDesc || '-'],
  ], colCount);

  ws.addRow([]);
  addSectionTitle(ws, '当前面临风险', colCount, THEME.red);
  const riskHeaders = ['风险名称', '风险描述', '风险等级', ''];
  const rhRow = ws.addRow(riskHeaders);
  applyHeaderStyle(rhRow, 3);

  const risks = [
    { title: '原材料价格波动风险', desc: '近期钢材、塑料等原材料价格波动较大，影响生产成本', level: '高' },
    { title: '跨境物流成本上涨', desc: '国际运费持续高位运行，压缩利润空间', level: '中' },
    { title: '人才流失风险', desc: '跨境电商运营人才稀缺，存在核心员工流失风险', level: '低' },
  ];
  risks.forEach((r, idx) => {
    const row = ws.addRow([r.title, r.desc, r.level]);
    applyDataRowStyle(row, 3, idx % 2 === 0);
  });
}

function buildFollowUpSheet(wb: ExcelJS.Workbook, data: ExportEnterpriseData) {
  const { enterprise, followUpRecords } = data;
  const ws = wb.addWorksheet('跟进记录', { properties: { tabColor: { argb: THEME.primaryDark } } });
  ws.columns = [
    { width: 14 }, { width: 12 }, { width: 50 }, { width: 12 },
    { width: 16 }, { width: 16 },
  ];
  const colCount = 6;

  addSheetTitle(ws, `${enterprise.enterprise_name} - 跟进记录`, colCount);
  ws.addRow([]);

  const headers = ['日期', '类型', '跟进内容', '跟进人', '阶段(前)', '阶段(后)'];
  const hRow = ws.addRow(headers);
  applyHeaderStyle(hRow, colCount);

  if (followUpRecords && followUpRecords.length > 0) {
    followUpRecords.forEach((r: any, idx: number) => {
      const row = ws.addRow([
        r.follow_up_date || '-',
        r.follow_up_type || '-',
        r.content || '-',
        r.follow_up_person || '-',
        r.stage_before ? (STAGE_MAP[r.stage_before] || r.stage_before) : '-',
        r.stage_after ? (STAGE_MAP[r.stage_after] || r.stage_after) : '-',
      ]);
      applyDataRowStyle(row, colCount, idx % 2 === 0);
      row.height = Math.max(24, Math.ceil((r.content?.length || 0) / 30) * 16);
    });
  } else {
    const row = ws.addRow(['暂无跟进记录', '', '', '', '', '']);
    ws.mergeCells(row.number, 1, row.number, colCount);
    applyDataRowStyle(row, colCount, false);
  }

  // 底部统计
  ws.addRow([]);
  const summaryRow = ws.addRow([`共 ${followUpRecords?.length || 0} 条跟进记录`, '', '', '', '', '']);
  ws.mergeCells(summaryRow.number, 1, summaryRow.number, colCount);
  summaryRow.getCell(1).font = { name: '微软雅黑', size: 10, bold: true, color: { argb: THEME.primary } };
  summaryRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right' };
}
