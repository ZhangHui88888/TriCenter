import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { THEME, STAGE_MAP, applyHeaderStyle, applyDataRowStyle, addSheetTitle } from './exportEnterpriseExcel';

export interface EnterpriseListItem {
  id: number;
  enterprise_name: string;
  district?: string;
  industry?: string;
  enterprise_type?: string;
  funnel_stage?: string;
  contacts?: Array<{ name?: string; phone?: string; position?: string; is_primary?: boolean; isPrimary?: boolean }>;
  has_crossborder?: boolean;
  main_platforms?: string;
  target_markets?: string;
  created_at?: string;
}

export async function exportEnterpriseListExcel(enterprises: EnterpriseListItem[]) {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'TriCenter';
  wb.created = new Date();

  const ws = wb.addWorksheet('企业列表', { properties: { tabColor: { argb: THEME.primary } } });

  const colCount = 11;
  ws.columns = [
    { width: 6 },   // 序号
    { width: 28 },  // 企业名称
    { width: 12 },  // 区域
    { width: 16 },  // 行业
    { width: 12 },  // 企业类型
    { width: 14 },  // 漏斗阶段
    { width: 12 },  // 主要联系人
    { width: 16 },  // 联系电话
    { width: 10 },  // 是否跨境
    { width: 24 },  // 主要平台
    { width: 18 },  // 录入时间
  ];

  // Sheet 标题
  const dateStr = new Date().toISOString().slice(0, 10);
  addSheetTitle(ws, `企业列表 — 导出于 ${dateStr}`, colCount);
  ws.addRow([]);

  // 表头
  const headers = ['序号', '企业名称', '区域', '行业', '企业类型', '漏斗阶段', '主要联系人', '联系电话', '是否跨境', '主要平台', '录入时间'];
  const hRow = ws.addRow(headers);
  applyHeaderStyle(hRow, colCount);

  // 数据行
  enterprises.forEach((e, idx) => {
    const primaryContact = e.contacts?.find(c => c.is_primary || c.isPrimary) || e.contacts?.[0];
    const row = ws.addRow([
      idx + 1,
      e.enterprise_name || '-',
      e.district || '-',
      e.industry || '-',
      e.enterprise_type || '-',
      STAGE_MAP[e.funnel_stage || ''] || e.funnel_stage || '-',
      primaryContact?.name || '-',
      primaryContact?.phone || '-',
      e.has_crossborder ? '是' : '否',
      e.main_platforms || '-',
      e.created_at ? e.created_at.slice(0, 10) : '-',
    ]);
    applyDataRowStyle(row, colCount, idx % 2 === 0);
    // 序号列居中
    row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // 底部统计
  ws.addRow([]);
  const summaryRow = ws.addRow([`共 ${enterprises.length} 家企业`]);
  ws.mergeCells(summaryRow.number, 1, summaryRow.number, colCount);
  summaryRow.getCell(1).font = { name: '微软雅黑', size: 10, bold: true, color: { argb: THEME.primary } };
  summaryRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'right' };

  // 导出
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `企业列表_${dateStr}.xlsx`;
  saveAs(blob, fileName);
}
