import {
  TeamOutlined,
  BankOutlined,
  AlertOutlined,
  TrophyOutlined,
  FlagOutlined,
  SolutionOutlined,
  SafetyCertificateOutlined,
  ScheduleOutlined,
  DashboardOutlined,
  AuditOutlined,
} from '@ant-design/icons';

function Chapters10to13() {
  return (
    <>
      {/* ==================== 十、团队与人才深度分析 ==================== */}
      <h2><TeamOutlined /> 十、团队与人才深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 评估团队能力是否匹配业务发展需求，识别关键人才缺口。"人"是所有战略落地的核心要素。</blockquote>

      <h3><SolutionOutlined /> 10.1 外贸团队配置</h3>
      <ul><li>外贸团队总人数：XXXXX</li><li>团队架构图：XXXXX</li></ul>
      <div className="table-wrapper"><table>
        <thead><tr><th>岗位类别</th><th>人数</th><th>平均从业年限</th><th>核心能力</th><th>缺口</th></tr></thead>
        <tbody>
          {['外贸业务/销售', '跨境电商运营', '产品开发/选品', '视觉设计/内容', '客服', '物流/供应链', '数字营销', '数据分析', '法务/合规'].map(j => (
            <tr key={j}><td>{j}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>10.2 语言能力覆盖</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>语种</th><th>人数</th><th>水平（母语/流利/基础）</th><th>是否满足业务需求</th></tr></thead>
        <tbody>
          {['英语', '西班牙语', '法语', '阿拉伯语', '日语', '其他'].map(l => (
            <tr key={l}><td>{l}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>10.3 人才缺口与招聘难点</h3>
      <ul>
        <li>当前急需岗位及原因：XXXXX</li>
        <li>招聘难点分析：XXXXX</li>
        <li>人才流失率及原因：XXXXX</li>
        <li>薪酬竞争力评估：XXXXX</li>
      </ul>

      <h3>10.4 培训与发展</h3>
      <ul>
        <li>现有培训体系：XXXXX</li>
        <li>外部培训资源利用情况：XXXXX</li>
        <li>行业交流与学习渠道：XXXXX</li>
        <li>培训需求评估：XXXXX</li>
        <li>建议培训方向：XXXXX</li>
      </ul>
      <hr />

      {/* ==================== 十一、政策与资源对接 ==================== */}
      <h2><BankOutlined /> 十一、政策与资源对接</h2>
      <blockquote>💡 <strong>本章目的：</strong> 盘点企业可利用的政策红利与三中心服务资源，确保"好政策不浪费"。本章是连接调研发现与实际服务落地的关键桥梁。</blockquote>

      <h3>11.1 已享受政策支持</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>政策/项目名称</th><th>支持类型</th><th>金额/内容</th><th>获得时间</th><th>执行情况</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3><FlagOutlined /> 11.2 可对接资源（常州三中心服务矩阵）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>服务类别</th><th>具体服务内容</th><th>企业匹配度</th><th>优先级</th><th>预期效果</th></tr></thead>
        <tbody>
          {['跨境电商培训与孵化', '平台入驻绿色通道', '物流与海外仓资源', '金融与信保服务', '品牌出海服务', '法律与合规咨询', '数字化转型支持', '产业集群协同', '人才培训与对接', '政策申报辅导'].map(s => (
            <tr key={s}><td>{s}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>11.3 政策红利深度挖掘</h3>
      <ul>
        <li>常州本地跨境电商扶持政策（逐条列明及适用性分析）：XXXXX</li>
        <li>江苏省外贸扶持政策：XXXXX</li>
        <li>国家级跨境电商综试区政策：XXXXX</li>
        <li>RCEP等贸易协定具体红利条款：XXXXX</li>
        <li>出口退税优化空间：XXXXX</li>
        <li>其他可申请的政府项目/补贴：XXXXX</li>
      </ul>
      <hr />

      {/* ==================== 十二、风险评估与预警体系 ==================== */}
      <h2><AlertOutlined /> 十二、风险评估与预警体系</h2>
      <blockquote>💡 <strong>本章目的：</strong> 系统识别和量化企业面临的各类风险，建立可操作的预警指标体系，从"事后救火"转向"事前预防"。</blockquote>

      <h3><SafetyCertificateOutlined /> 12.1 风险全景评估</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>风险类别</th><th>具体风险</th><th>发生概率(1-5)</th><th>影响程度(1-5)</th><th>风险值</th><th>现有应对</th><th>改进建议</th></tr></thead>
        <tbody>
          {[
            ['市场风险', '需求波动'], ['', '竞争加剧'], ['', '消费趋势变化'],
            ['政策风险', '贸易摩擦/关税'], ['', '目标国法规变化'], ['', '平台政策变化'], ['', '出口管制'],
            ['运营风险', '供应链中断'], ['', '物流延误'], ['', '质量事故'], ['', '知识产权纠纷'],
            ['财务风险', '汇率波动'], ['', '坏账'], ['', '资金链紧张'],
            ['合规风险', '数据隐私违规'], ['', '产品合规缺失'], ['', '税务合规'],
            ['不可抗力', '自然灾害'], ['', '公共卫生事件'], ['', '地缘政治冲突'],
            ['网络安全', '数据泄露'], ['', '网络攻击'],
          ].map((r, i) => (
            <tr key={i}><td>{r[0] ? <strong>{r[0]}</strong> : ''}</td><td>{r[1]}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <blockquote>风险值 = 发生概率 × 影响程度，风险值≥15为高风险（红色预警），10-14为中风险（黄色预警），&lt;10为低风险（绿色）</blockquote>
      <div className="chart-suggestion">📊 建议配图：风险热力图（以概率和影响为轴）</div>

      <h3><DashboardOutlined /> 12.2 风险预警指标体系</h3>
      <blockquote>💡 建立可量化、可监控的风险预警指标，实现从被动应对到主动预防的转变。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>风险领域</th><th>预警指标</th><th>绿灯（安全）</th><th>黄灯（关注）</th><th>红灯（预警）</th><th>当前状态</th><th>监控频率</th></tr></thead>
        <tbody>
          {[
            ['市场风险', '核心市场销售额月度环比', '>-5%', '-5%~-15%', '<-15%', '', '月度'],
            ['客户风险', '前5大客户集中度', '<50%', '50%-70%', '>70%', '', '季度'],
            ['供应链风险', '核心供应商交期达成率', '>95%', '85%-95%', '<85%', '', '月度'],
            ['财务风险', '应收账款逾期率', '<5%', '5%-15%', '>15%', '', '月度'],
            ['财务风险', '汇率波动对利润影响', '<2%', '2%-5%', '>5%', '', '周度'],
            ['合规风险', '产品认证到期预警', '>6个月', '3-6个月', '<3个月', '', '月度'],
            ['运营风险', '退货率', '<行业均值', '均值~1.5倍', '>1.5倍', '', '月度'],
          ].map((r, i) => (
            <tr key={i}><td>{r[0]}</td><td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td><td>{r[4]}</td><td>{r[5]}</td><td>{r[6]}</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>12.3 风险应对预案框架</h3>
      <ul>
        <li>高风险项应急预案：XXXXX</li>
        <li>中风险项监控机制：XXXXX</li>
        <li>风险定期复评机制建议（建议频率：季度）：XXXXX</li>
        <li>风险管理组织架构与职责分工建议：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：风险预警仪表盘示意图、风险应对流程图</div>
      <hr />

      {/* ==================== 十三、综合评估与战略建议 ==================== */}
      <h2><TrophyOutlined /> 十三、综合评估与战略建议</h2>
      <blockquote>💡 <strong>本章目的：</strong> 全报告的"诊断结论与处方"。将前十二章的分析发现提炼为可量化的综合评分、可排序的问题清单和可执行的行动路线图。</blockquote>

      <h3><AuditOutlined /> 13.1 企业外贸综合评分</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>评估维度</th><th>评分(1-10)</th><th>权重</th><th>加权得分</th><th>说明</th></tr></thead>
        <tbody>
          {[
            ['产品竞争力', '15%'], ['市场覆盖度', '10%'], ['品牌影响力', '10%'], ['供应链能力', '12%'], ['营销能力', '12%'],
            ['数字化水平', '8%'], ['团队能力', '10%'], ['财务健康度', '8%'], ['合规水平', '8%'], ['风险管理', '7%'],
          ].map(([d, w]) => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>{w}</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
          <tr><td><strong>加权综合评分</strong></td><td>XXXXX</td><td><strong>100%</strong></td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <p><strong>评分标准定义：</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>分数段</th><th>等级</th><th>含义</th><th>典型表现</th></tr></thead>
        <tbody>
          <tr><td>9-10</td><td>卓越</td><td>行业领先水平</td><td>该维度可作为行业标杆</td></tr>
          <tr><td>7-8</td><td>良好</td><td>高于行业平均</td><td>体系完善，有小幅优化空间</td></tr>
          <tr><td>5-6</td><td>一般</td><td>行业平均水平</td><td>基本功能具备，缺乏亮点</td></tr>
          <tr><td>3-4</td><td>较弱</td><td>低于行业平均</td><td>需重点改善</td></tr>
          <tr><td>1-2</td><td>薄弱</td><td>严重不足</td><td>需紧急补强</td></tr>
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：综合评分雷达图、各维度得分与行业平均对比柱状图</div>

      <h3>13.2 核心问题诊断（按严重程度排序）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>排序</th><th>问题描述</th><th>影响范围</th><th>紧迫程度</th><th>根因分析</th></tr></thead>
        <tbody>{[1,2,3,4,5].map(i => <tr key={i}><td>{i}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>)}</tbody>
      </table></div>

      <h3><ScheduleOutlined /> 13.3 短期行动建议（0-6个月）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>优先级</th><th>建议事项</th><th>预期效果</th><th>所需资源</th><th>责任方</th><th>里程碑节点</th></tr></thead>
        <tbody>
          <tr><td>P0-紧急</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P0-紧急</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P1-重要</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P1-重要</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>P2-建议</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>

      <h3>13.4 中期发展建议（6-18个月）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>优先级</th><th>建议事项</th><th>预期效果</th><th>所需资源</th><th>责任方</th><th>里程碑节点</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3>13.5 长期战略建议（18个月以上）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>战略方向</th><th>具体建议</th><th>预期目标</th><th>关键成功因素</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3><FlagOutlined /> 13.6 常州三中心服务对接方案</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>阶段</th><th>推荐服务</th><th>对接部门</th><th>预期效果</th><th>跟进时间</th></tr></thead>
        <tbody>
          <tr><td>短期（0-6月）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>中期（6-18月）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>长期（18月+）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>

      <h3>13.7 投入产出预估</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>建议事项</th><th>预计投入</th><th>预计回报</th><th>回报周期</th><th>ROI预估</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3>13.8 战略路线图（时间轴）</h3>
      <blockquote>💡 将全部建议整合为可视化路线图，明确关键里程碑与依赖关系。</blockquote>
      <pre><code>{`时间轴：
├── 第1-3个月（启动期）
│   ├── [P0行动项1]
│   ├── [P0行动项2]
│   └── 里程碑：________________
├── 第4-6个月（推进期）
│   ├── [P1行动项1]
│   ├── [P1行动项2]
│   └── 里程碑：________________
├── 第7-12个月（深化期）
│   ├── [中期行动项1]
│   ├── [中期行动项2]
│   └── 里程碑：________________
├── 第13-18个月（扩展期）
│   ├── [中期行动项3]
│   └── 里程碑：________________
└── 18个月以上（战略期）
    ├── [长期战略项1]
    └── 目标愿景：________________`}</code></pre>

      <h3>13.9 调研结论与下一步</h3>
      <ul><li><strong>总体结论（一段话概括）：</strong>XXXXX</li></ul>
      <ul><li><strong>企业外贸发展阶段判定：</strong> <span className="checkbox">☐</span> 初创探索期 <span className="checkbox">☐</span> 能力构建期 <span className="checkbox">☐</span> 规模增长期 <span className="checkbox">☐</span> 品牌升级期 <span className="checkbox">☐</span> 全球化成熟期</li></ul>
      <ul><li><strong>最具价值的3个突破口：</strong>XXXXX</li></ul>
      <p>1.</p><p>2.</p><p>3.</p>
      <ul><li><strong>下一步跟进计划：</strong>XXXXX</li></ul>
      <div className="table-wrapper"><table>
        <thead><tr><th>跟进事项</th><th>责任人</th><th>计划时间</th><th>交付物</th></tr></thead>
        <tbody>
          <tr><td>调研报告宣讲与答疑</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>重点建议落地方案细化</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>三中心服务对接启动</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>首次复盘回访</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <hr />
    </>
  );
}

export default Chapters10to13;
