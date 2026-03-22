import {
  UnorderedListOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import type { EnterpriseDetail } from '@/types';
import dayjs from 'dayjs';

interface BasicReportHeaderProps {
  enterprise?: EnterpriseDetail | null;
}

function BasicReportHeader({ enterprise }: BasicReportHeaderProps) {
  const e = enterprise;
  const today = dayjs().format('YYYY-MM-DD');
  const productNames = e?.products?.map(p => p.name).join('、') || '[核心产品类别]';
  const enterpriseName = e?.enterprise_name || (e as any)?.enterpriseName || (e as any)?.name || '[企业名称]';
  const industryName = e?.industry || (e as any)?.industryName || '[行业类别]';

  return (
    <>
      <h1>外贸企业市场调研报告（基础版）</h1>
      <p style={{ textAlign: 'center', color: 'var(--rpt-text-secondary)', marginTop: -20, marginBottom: 20 }}>
        基础版 · 快速摸底调研模板
      </p>
      <hr />

      {/* 报告基本信息 */}
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          <tr><td>报告编号</td><td>{e ? `MR-${e.id}-${dayjs().format('YYYYMMDD')}` : '[编号]'}</td></tr>
          <tr><td>企业名称</td><td>{enterpriseName}</td></tr>
          <tr><td>所属行业</td><td>{industryName}</td></tr>
          <tr><td>主营产品</td><td>{productNames}</td></tr>
          <tr><td>调研日期</td><td>{e ? today : '[日期]'}</td></tr>
          <tr><td>报告版本</td><td>V1.0</td></tr>
        </tbody>
      </table></div>

      <blockquote>💡 本模板为基础版，适用于初次接触、快速摸底的外贸企业调研场景。如需更深入的分析，请使用深度版模板。</blockquote>

      {/* 报告目录导航 */}
      <h2><UnorderedListOutlined /> 报告目录导航</h2>
      <div className="table-wrapper"><table>
        <thead><tr><th>章节</th><th>内容</th></tr></thead>
        <tbody>
          <tr><td>前置</td><td>调研方法说明</td></tr>
          <tr><td>第一章</td><td>企业基本信息概览</td></tr>
          <tr><td>第二章</td><td>目标市场调研</td></tr>
          <tr><td>第三章</td><td>终端买家画像与需求分析</td></tr>
          <tr><td>第四章</td><td>行业与竞争概览</td></tr>
          <tr><td>第五章</td><td>产品分析</td></tr>
          <tr><td>第六章</td><td>营销渠道概览</td></tr>
          <tr><td>第七章</td><td>基础风险评估</td></tr>
          <tr><td>第八章</td><td>综合评估与建议</td></tr>
        </tbody>
      </table></div>
      <hr />

      {/* 调研方法说明 */}
      <h2><ExperimentOutlined /> 调研方法说明（前置）</h2>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td>调研方式</td><td>（问卷 / 电话访谈 / 实地走访 / 线上会议，请勾选）</td></tr>
          <tr><td>调研周期</td><td>[起始日期] 至 [结束日期]</td></tr>
          <tr><td>数据来源</td><td>（企业自报 / 公开数据 / 第三方平台 / 海关数据，请注明）</td></tr>
          <tr><td>数据可信度评估</td><td>（高 / 中 / 低，并简要说明原因）</td></tr>
          <tr><td>调研局限性</td><td>（如样本量不足、企业未提供完整数据等，请如实说明）</td></tr>
        </tbody>
      </table></div>
      <hr />
    </>
  );
}

export default BasicReportHeader;
