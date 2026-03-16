import {
  UnorderedListOutlined,
  BulbOutlined,
  ExperimentOutlined,
  StarOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { EnterpriseDetail } from '@/types';
import dayjs from 'dayjs';

interface ReportHeaderProps {
  enterprise?: EnterpriseDetail | null;
}

function ReportHeader({ enterprise }: ReportHeaderProps) {
  const e = enterprise;
  const today = dayjs().format('YYYY-MM-DD');
  const productNames = e?.products?.map(p => p.name).join('、') || '[核心产品类别]';
  // 兼容后端返回的 camelCase 字段名
  const enterpriseName = e?.enterprise_name || (e as any)?.enterpriseName || (e as any)?.name || '[企业名称]';
  const industryName = e?.industry || (e as any)?.industryName || '[行业类别]';
  return (
    <>
      <h1>外贸企业市场调研报告（深度版）</h1>
      <hr />
      <p><strong>报告编号：</strong> {e ? `MR-${e.id}-${dayjs().format('YYYYMMDD')}` : '[编号]'}</p>
      <p><strong>企业名称：</strong> {enterpriseName}</p>
      <p><strong>所属行业：</strong> {industryName}</p>
      <p><strong>主营产品：</strong> {productNames}</p>
      <p><strong>调研日期：</strong> {e ? today : '[日期]'}</p>
      <p><strong>报告版本：</strong> V1.0</p>

      {/* ==================== 报告目录导航 ==================== */}
      <h2><UnorderedListOutlined /> 报告目录导航</h2>
      <div className="table-wrapper"><table>
        <thead><tr><th>章节</th><th>内容</th><th>页码</th></tr></thead>
        <tbody>
          <tr><td>前置</td><td>调研方法说明</td><td></td></tr>
          <tr><td>第一章</td><td>企业基本信息概览</td><td></td></tr>
          <tr><td>第二章</td><td>目标市场深度调研</td><td></td></tr>
          <tr><td>第三章</td><td>终端买家画像与需求深度分析</td><td></td></tr>
          <tr><td>第四章</td><td>行业与竞争深度分析</td><td></td></tr>
          <tr><td>第五章</td><td>产品深度分析（含国别分析与关键词趋势）</td><td></td></tr>
          <tr><td>第六章</td><td>供应链与物流深度分析</td><td></td></tr>
          <tr><td>第七章</td><td>营销与品牌深度分析</td><td></td></tr>
          <tr><td>第八章</td><td>财务与风控深度分析</td><td></td></tr>
          <tr><td>第九章</td><td>数字化与技术能力深度评估</td><td></td></tr>
          <tr><td>第十章</td><td>团队与人才深度分析</td><td></td></tr>
          <tr><td>第十一章</td><td>政策与资源对接</td><td></td></tr>
          <tr><td>第十二章</td><td>风险评估与预警体系</td><td></td></tr>
          <tr><td>第十三章</td><td>综合评估与战略建议</td><td></td></tr>
          <tr><td>附录</td><td>参考资料、术语、图表索引等</td><td></td></tr>
        </tbody>
      </table></div>
      <hr />

      {/* ==================== 执行摘要 ==================== */}
      <h2><StarOutlined /> 执行摘要（Executive Summary）</h2>
      <p><strong>企业概况一句话：</strong> XXXXX</p>
      <p><strong>外贸综合评分：</strong> XXXXX/10（详见第十三章）</p>
      <p><strong><BulbOutlined /> 核心发现（Top 5）：</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>序号</th><th>关键发现</th><th>所属章节</th><th>影响程度</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>2</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>3</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>4</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>5</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <p><strong><ThunderboltOutlined /> 最紧迫的三项行动建议：</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>优先级</th><th>行动建议</th><th>预期效果</th><th>建议启动时间</th></tr></thead>
        <tbody>
          <tr><td>P0</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P0</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P1</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <p><strong>常州三中心可立即对接的服务：</strong></p>
      <p>- XXXXX</p><p>- XXXXX</p><p>- XXXXX</p>
      <hr />

      {/* ==================== 调研方法说明 ==================== */}
      <h2><ExperimentOutlined /> 调研方法说明（前置）</h2>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td>调研方式</td><td>XXXXX</td></tr>
          <tr><td>调研周期</td><td>XXXXX</td></tr>
          <tr><td>调研轮次</td><td>XXXXX</td></tr>
          <tr><td>参与人员</td><td>XXXXX</td></tr>
          <tr><td>一手数据来源</td><td>XXXXX</td></tr>
          <tr><td>二手数据来源</td><td>XXXXX</td></tr>
          <tr><td>数据可信度评估</td><td>XXXXX</td></tr>
          <tr><td>数据交叉验证情况</td><td>XXXXX</td></tr>
          <tr><td>调研局限性</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <hr />
    </>
  );
}

export default ReportHeader;
