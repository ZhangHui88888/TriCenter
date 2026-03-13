import {
  BookOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  ToolOutlined,
  LinkOutlined,
} from '@ant-design/icons';

function ReportAppendix() {
  return (
    <>
      <h2><BookOutlined /> 附录</h2>

      <h3><FileTextOutlined /> 附录A：参考数据与资料来源</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>序号</th><th>资料名称</th><th>来源</th><th>发布时间</th><th>引用章节</th></tr></thead>
        <tbody>
          <tr><td>1</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>2</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>

      <h3><BookOutlined /> 附录B：术语解释</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>术语</th><th>解释</th></tr></thead>
        <tbody>
          {[
            ['PEST', '政治(Political)、经济(Economic)、社会(Social)、技术(Technological)宏观环境分析框架'],
            ['五力模型', '波特五力分析，评估行业竞争格局的经典框架'],
            ['SWOT', '优势(Strengths)、劣势(Weaknesses)、机会(Opportunities)、威胁(Threats)分析'],
            ['BCG矩阵', '波士顿矩阵，用于产品组合分析（明星/金牛/问题/瘦狗）'],
            ['TAM/SAM/SOM', '总可用市场/可服务市场/可获得市场'],
            ['RFM', '最近消费(Recency)、消费频率(Frequency)、消费金额(Monetary)客户分层模型'],
            ['AEO', '经认证的经营者(Authorized Economic Operator)，海关信用认证'],
            ['LTV', '客户生命周期价值(Lifetime Value)'],
            ['CAC', '单次获客成本(Customer Acquisition Cost)'],
            ['ROI', '投资回报率(Return on Investment)'],
            ['DTC', '直接面向消费者(Direct to Consumer)'],
            ['MFN', '最惠国待遇(Most Favored Nation)'],
            ['FOB', '离岸价(Free on Board)'],
            ['PPC', '按点击付费(Pay Per Click)'],
            ['YoY', '同比增长(Year over Year)'],
            ['EDM', '电子邮件直投营销(Electronic Direct Mail)'],
            ['NPS', '净推荐值(Net Promoter Score)'],
            ['CSAT', '客户满意度评分(Customer Satisfaction Score)'],
            ['ESG', '环境(Environmental)、社会(Social)、治理(Governance)'],
            ['CBAM', '碳边境调节机制(Carbon Border Adjustment Mechanism)'],
            ['FTA', '自由贸易协定(Free Trade Agreement)'],
            ['KPI', '关键绩效指标(Key Performance Indicator)'],
            ['UGC', '用户生成内容(User Generated Content)'],
            ['KOL', '关键意见领袖(Key Opinion Leader)'],
            ['CTR', '点击率(Click Through Rate)'],
            ['JIT', '准时制生产(Just In Time)'],
          ].map(([term, desc]) => (
            <tr key={term}><td>{term}</td><td>{desc}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>附录C：调研问卷/访谈提纲</h3>
      <p>（附原始调研工具）</p>

      <h3>附录D：企业提供的原始数据与资料清单</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>序号</th><th>资料名称</th><th>提供日期</th><th>备注</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3>附录E：图表索引</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>图表编号</th><th>图表名称</th><th>所在章节</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3><LinkOutlined /> 附录F：章节交叉引用索引</h3>
      <blockquote>💡 本报告各章节之间存在密切关联，以下索引帮助读者快速定位相关分析。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>主题</th><th>涉及章节</th><th>说明</th></tr></thead>
        <tbody>
          {[
            ['产品合规性', '第二章2.3 + 第五章5.3/5.7E + 第十二章12.1', '市场准入要求→产品合规差距→合规风险评估'],
            ['定价策略', '第五章5.4/5.7I + 第四章4.3 + 第八章8.3', '成本结构→竞品对比→汇率影响→国别定价'],
            ['销售渠道', '第五章5.7F + 第七章7.2-7.6 + 第三章3.2', '国别渠道分析→平台运营现状→买家渠道偏好'],
            ['客户管理', '第三章3.1-3.6 + 第七章7.9 + 第十二章12.2', '买家画像→CRM管理→客户风险预警'],
            ['供应链与物流', '第六章6.1-6.5 + 第五章5.7G + 第十二章12.1', '供应链现状→国别物流方案→供应链风险'],
            ['品牌建设', '第七章7.1 + 第五章5.7H + 第四章4.7', '品牌现状→国别营销→SWOT中品牌定位'],
            ['团队与能力', '第十章10.1-10.4 + 第九章9.1-9.4', '团队配置→数字化能力→能力缺口'],
            ['政策与合规', '第十一章11.1-11.3 + 第二章2.5 + 第八章8.4-8.5', '政策红利→贸易协定→税务合规'],
          ].map(([topic, chapters, desc]) => (
            <tr key={topic}><td>{topic}</td><td>{chapters}</td><td>{desc}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><CheckSquareOutlined /> 附录G：调研质量自检清单</h3>
      <blockquote>💡 调研人员在提交报告前，请逐项核对以下清单，确保报告质量。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>序号</th><th>检查项</th><th>是否完成</th><th>备注</th></tr></thead>
        <tbody>
          {[
            '所有章节均已填写，无遗漏空白',
            '关键数据均标注了来源与获取时间',
            '定量数据已进行交叉验证',
            '竞品分析至少覆盖3家主要竞争对手',
            '国别分析至少覆盖前5大销售国家',
            '所有建议均附有可量化的预期效果与时间节点',
            'SWOT分析与综合评分逻辑一致',
            '风险评估覆盖所有关键风险类别',
            '三中心服务对接建议具体且可执行',
            '执行摘要已在全文完成后撰写',
            '报告已经过内部审核',
            '图表索引已更新完整',
          ].map((item, i) => (
            <tr key={i}><td>{i + 1}</td><td>{item}</td><td><span className="checkbox">☐</span></td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><ToolOutlined /> 附录H：常用数据获取工具与平台参考</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>数据类型</th><th>推荐工具/平台</th><th>用途说明</th></tr></thead>
        <tbody>
          {[
            ['海关进出口数据', '中国海关总署、ImportGenius、Panjiva、TradeMap', '贸易流向、进出口量价分析'],
            ['行业市场规模', 'Statista、Euromonitor、IBISWorld、Grand View Research', '行业规模、增长率、细分市场'],
            ['关键词搜索趋势', 'Google Trends、Ahrefs、SEMrush、Jungle Scout', '产品需求趋势、竞品分析'],
            ['电商平台数据', 'Helium 10、Keepa、卖家精灵、Marketplace Pulse', '平台销量、排名、评价分析'],
            ['社交媒体分析', 'SocialBlade、Hootsuite、BuzzSumo', '社媒表现、KOL筛选、内容分析'],
            ['企业信息查询', '天眼查、企查查、Dun & Bradstreet、Crunchbase', '企业背景、信用、关联关系'],
            ['关税与贸易政策', 'WTO关税数据库、中国FTA网络、各国海关官网', '关税税率、原产地规则'],
            ['合规与认证', '各国标准化机构官网（ANSI/CEN/JIS等）', '产品认证要求、标准查询'],
            ['汇率与金融', '中国外汇交易中心、XE、Bloomberg', '汇率走势、金融风险'],
            ['物流与仓储', 'Freightos、17Track、各物流商官网', '运费查询、物流时效'],
          ].map(([type, tools, desc]) => (
            <tr key={type}><td>{type}</td><td>{tools}</td><td>{desc}</td></tr>
          ))}
        </tbody>
      </table></div>
      <hr />

      {/* ==================== 免责声明 ==================== */}
      <h2>免责声明</h2>
      <ul>
        <li>本报告基于调研期间获取的信息与数据编制，调研方已尽合理努力确保信息的准确性，但不对数据的绝对准确性和完整性做出保证。</li>
        <li>本报告中的分析、判断和建议仅供参考，不构成任何商业决策的唯一依据。</li>
        <li>市场环境、政策法规等外部因素可能随时变化，报告中的分析结论具有时效性，建议定期更新。</li>
        <li>本报告涉及的企业商业信息属于保密范畴，未经授权不得向第三方披露。</li>
        <li>本报告版权归长三角跨境电商常州三中心所有。</li>
      </ul>
      <hr />
      <p><strong>报告撰写人：</strong> [姓名]</p>
      <p><strong>审核人：</strong> [姓名]</p>
      <p><strong>终审人：</strong> [姓名]</p>
      <p><strong>报告日期：</strong> [日期]</p>
      <p><strong>下次跟进日期：</strong> [日期]</p>
      <p><strong>报告有效期：</strong> 自报告日期起 [6/12] 个月</p>
      <hr />
      <div className="report-footer">
        <p><em>本报告由长三角跨境电商常州三中心提供，仅供内部使用。未经书面授权，不得复制、转发或用于其他用途。</em></p>
      </div>
    </>
  );
}

export default ReportAppendix;
