import {
  ShopOutlined,
  GlobalOutlined,
  TeamOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  ApartmentOutlined,
  HeartOutlined,
  AimOutlined,
  BankOutlined,
  ThunderboltOutlined,
  FlagOutlined,
  TrophyOutlined,
  SearchOutlined,
  PieChartOutlined,
  RadarChartOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';

import type { EnterpriseDetail } from '@/types';

interface Chapters1to4Props {
  enterprise?: EnterpriseDetail | null;
}

function Chapters1to4({ enterprise }: Chapters1to4Props) {
  const e = enterprise;
  const a = e as any; // 兼容后端 camelCase 字段
  const primaryContact = e?.contacts?.find((c: any) => c.is_primary || c.isPrimary) || e?.contacts?.[0];

  // 兼容 snake_case 和 camelCase
  const enterpriseName = e?.enterprise_name || a?.enterpriseName || a?.name || '';
  const creditCode = e?.unified_credit_code || a?.creditCode || '';
  const enterpriseType = e?.enterprise_type || a?.enterpriseType || '';
  const employeeScale = e?.employee_scale || a?.staffSizeLabel || '';
  const domesticRevenue = e?.domestic_revenue || a?.domesticRevenueLabel || '';
  const crossborderRevenue = e?.crossborder_revenue || a?.crossBorderRevenueLabel || '';

  return (
    <>
      {/* ==================== 一、企业基本信息概览 ==================== */}
      <h2><ShopOutlined /> 一、企业基本信息概览</h2>
      <blockquote>💡 <strong>本章目的：</strong> 全面掌握企业基本面，建立企业画像基线。重点关注企业发展阶段、外贸业务定位及核心诉求，为后续各章分析提供背景支撑。</blockquote>

      <h3><SafetyCertificateOutlined /> 1.1 企业基础资料</h3>
      <ul>
        <li>企业全称：{enterpriseName}</li>
        <li>统一社会信用代码：{creditCode}</li>
        <li>成立时间：XXXXX</li>
        <li>注册资本：XXXXX</li>
        <li>企业类型（民营/国企/外资/合资）：{enterpriseType}</li>
        <li>员工规模：{employeeScale}</li>
        <li>年营业额（近三年）：{domesticRevenue}</li>
        <li>外贸业务占比：{crossborderRevenue}</li>
        <li>主要联系人及职务：{primaryContact ? `${primaryContact.name}${primaryContact.position ? ` / ${primaryContact.position}` : ''}` : ''}</li>
        <li>联系方式：{primaryContact ? `${(primaryContact as any).phone || ''}${(primaryContact as any).email ? ` / ${(primaryContact as any).email}` : ''}` : ''}</li>
      </ul>

      <h3><SafetyCertificateOutlined /> 1.2 企业资质与认证</h3>
      <ul>
        <li>进出口经营权（有/无）：XXXXX</li>
        <li>ISO认证情况（具体版本及有效期）：XXXXX</li>
        <li>行业特定认证（CE/FDA/UL/RoHS/REACH等，逐一列明）：XXXXX</li>
        <li>海关AEO认证等级：XXXXX</li>
        <li>高新技术企业认证：XXXXX</li>
        <li>其他资质证书：XXXXX</li>
      </ul>

      <h3><RocketOutlined /> 1.3 企业发展历程与战略</h3>
      <ul>
        <li>成立背景：XXXXX</li>
        <li>关键发展节点（时间线）：XXXXX</li>
        <li>外贸业务起始时间：XXXXX</li>
        <li>跨境电商业务起始时间：XXXXX</li>
        <li>企业中长期战略规划：XXXXX</li>
        <li>外贸业务在整体战略中的定位：XXXXX</li>
      </ul>

      <h3><ApartmentOutlined /> 1.4 股权结构与关联企业</h3>
      <ul>
        <li>股权结构简述：XXXXX</li>
        <li>关联企业/子公司情况：XXXXX</li>
        <li>海外主体设立情况：XXXXX</li>
      </ul>

      <h3><BarChartOutlined /> 1.5 企业外贸成熟度自评</h3>
      <blockquote>💡 由企业方自评，调研方复核校准，用于快速定位企业发展阶段，指导后续分析深度与建议方向。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>维度</th><th>自评等级（初始/起步/成长/成熟/领先）</th><th>调研方校准</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td>外贸业务经验</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>跨境电商运营能力</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>品牌国际化程度</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>供应链出海能力</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>数字化营销能力</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>合规与风控体系</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>团队国际化水平</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <p><strong>企业发展阶段判定：</strong> <span className="checkbox">☐</span> 外贸初创期 <span className="checkbox">☐</span> 外贸成长期 <span className="checkbox">☐</span> 外贸成熟期 <span className="checkbox">☐</span> 全球化扩张期</p>

      <h3><HeartOutlined /> 1.6 企业核心诉求与期望</h3>
      <blockquote>💡 明确企业参与本次调研的核心诉求，确保报告建议精准匹配企业实际需求。</blockquote>
      <ul>
        <li>企业当前面临的最大挑战（Top 3）：XXXXX</li>
      </ul>
      <p>1. XXXXX</p><p>2. XXXXX</p><p>3. XXXXX</p>
      <ul>
        <li>企业最希望获得的支持（Top 3）：XXXXX</li>
      </ul>
      <p>1. XXXXX</p><p>2. XXXXX</p><p>3. XXXXX</p>
      <ul>
        <li>企业未来12个月的核心业务目标：XXXXX</li>
        <li>企业对常州三中心服务的具体期望：XXXXX</li>
        <li>企业愿意投入的资源预算范围（人力/资金/时间）：XXXXX</li>
      </ul>
      <hr />

      {/* ==================== 二、目标市场深度调研 ==================== */}
      <h2><GlobalOutlined /> 二、目标市场深度调研</h2>
      <blockquote>💡 <strong>本章目的：</strong> 从宏观到微观，系统评估企业现有市场与潜在市场的机会与风险。本章结论将直接影响第五章国别产品分析的市场选择与优先级排序。</blockquote>

      <h3><PieChartOutlined /> 2.1 现有市场分布</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>市场区域</th><th>销售占比</th><th>进入时间</th><th>年销售额</th><th>增长率</th><th>利润率</th><th>客户数量</th></tr></thead>
        <tbody>
          {['北美', '欧洲', '东南亚', '中东', '南美', '非洲', '大洋洲', '其他'].map(r => (
            <tr key={r}><td>{r}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：市场分布饼图（按销售额占比）、各市场近3年增长趋势折线图、市场-利润率气泡图</div>

      <h3><SearchOutlined /> 2.2 目标市场宏观环境分析（PEST分析）</h3>
      <h4><BankOutlined /> 政治与政策环境（Political）</h4>
      <ul>
        <li>目标国贸易政策及关税壁垒（具体税率）：XXXXX</li>
        <li>双边/多边贸易协定（RCEP/中欧CAI等）及具体优惠条款：XXXXX</li>
        <li>政治稳定性评估：XXXXX</li>
        <li>外资准入政策：XXXXX</li>
        <li>制裁与出口管制风险（实体清单等）：XXXXX</li>
        <li>目标国产业保护政策：XXXXX</li>
      </ul>
      <h4>经济环境（Economic）</h4>
      <ul>
        <li>目标市场GDP及增长率：XXXXX</li>
        <li>人均消费水平及购买力（PPP）：XXXXX</li>
        <li>汇率波动趋势（近3年走势）：XXXXX</li>
        <li>通货膨胀率：XXXXX</li>
        <li>市场容量及增长空间（TAM/SAM/SOM）：XXXXX</li>
        <li>目标市场进口依赖度：XXXXX</li>
      </ul>
      <h4>社会文化环境（Social）</h4>
      <ul>
        <li>人口结构（年龄/性别/城乡分布）：XXXXX</li>
        <li>消费习惯与偏好：XXXXX</li>
        <li>文化禁忌与敏感点：XXXXX</li>
        <li>环保与可持续消费意识：XXXXX</li>
        <li>社交媒体使用习惯与偏好平台：XXXXX</li>
        <li>消费升级/降级趋势：XXXXX</li>
      </ul>
      <h4>技术环境（Technological）</h4>
      <ul>
        <li>目标市场电商渗透率及增长趋势：XXXXX</li>
        <li>主流支付方式及占比：XXXXX</li>
        <li>物流基础设施水平：XXXXX</li>
        <li>移动互联网普及率：XXXXX</li>
        <li>新兴技术应用趋势（AI/AR购物等）：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：各目标市场PEST评分对比雷达图</div>

      <h3>2.3 目标市场准入要求（详细）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>市场</th><th>产品认证要求</th><th>标签法规</th><th>包装要求</th><th>环保法规</th><th>数据隐私法规</th><th>进口许可</th></tr></thead>
        <tbody>
          {['美国', '欧盟', '英国', '日本', '其他'].map(m => (
            <tr key={m}><td>{m}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><AimOutlined /> 2.4 市场进入模式分析</h3>
      <blockquote>💡 不同市场适合不同的进入模式，需结合企业资源、风险承受力与市场特征综合评估。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>进入模式</th><th>适用市场</th><th>当前使用情况</th><th>优势</th><th>劣势</th><th>资源投入</th><th>风险等级</th></tr></thead>
        <tbody>
          {['跨境电商直销（B2C）', 'B2B平台接单/外贸订单', '海外代理商/分销商', '海外合资/合作经营', '设立海外分公司/子公司', 'OEM/ODM代工合作', '品牌授权/特许经营', '海外并购'].map(m => (
            <tr key={m}><td>{m}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <ul>
        <li>各目标市场推荐进入模式及理由：XXXXX</li>
        <li>现有进入模式的效果评估与优化建议：XXXXX</li>
      </ul>

      <h3>2.5 贸易协定利用率评估</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>贸易协定</th><th>覆盖市场</th><th>关税优惠幅度</th><th>企业当前利用情况</th><th>原产地证书类型</th><th>利用障碍</th><th>优化建议</th></tr></thead>
        <tbody>
          {['RCEP', '中国-东盟FTA', '中国-澳大利亚FTA', '中国-韩国FTA', '中国-瑞士FTA', '中国-新西兰FTA', '其他双边/多边协定'].map(a => (
            <tr key={a}><td>{a}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><FlagOutlined /> 2.6 潜在新兴市场机会</h3>
      <ul>
        <li>高增长潜力市场识别（附数据支撑）：XXXXX</li>
        <li>市场空白点分析：XXXXX</li>
        <li>新兴消费群体画像：XXXXX</li>
        <li>蓝海市场进入策略建议：XXXXX</li>
        <li>市场进入优先级排序及理由：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：新兴市场机会矩阵图（以市场吸引力和进入难度为轴）、市场进入模式决策树</div>
      <hr />

      {/* ==================== 三、终端买家画像与需求深度分析 ==================== */}
      <h2><TeamOutlined /> 三、终端买家画像与需求深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 深入理解"谁在买、为什么买、怎么买"，识别买家核心痛点与未满足需求，为产品优化和营销策略提供精准靶向。</blockquote>

      <h3>3.1 买家分层画像</h3>
      {['A类买家（核心大客户）', 'B类买家（成长型客户）', 'C类买家（长尾/潜力客户）'].map(buyer => (
        <div key={buyer}>
          <h4><TeamOutlined /> {buyer}</h4>
          <div className="table-wrapper"><table>
            <thead><tr><th>维度</th><th>描述</th></tr></thead>
            <tbody>
              {['买家类型', '地域分布', '企业规模', '年采购额', '采购频次', '决策链路', '核心关注点', '信息获取渠道'].map(d => (
                <tr key={d}><td>{d}</td><td>XXXXX</td></tr>
              ))}
            </tbody>
          </table></div>
        </div>
      ))}

      <h3>3.2 买家采购行为分析</h3>
      <ul>
        <li>采购决策周期（从需求产生到下单的平均时长）：XXXXX</li>
        <li>采购决策关键影响因素排序：XXXXX</li>
        <li>供应商评估标准与流程：XXXXX</li>
        <li>采购渠道偏好（线上平台/线下展会/转介绍/招标）：XXXXX</li>
        <li>样品测试与验厂要求：XXXXX</li>
        <li>付款方式偏好：XXXXX</li>
      </ul>

      <h3>3.3 买家核心痛点（按严重程度排序）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>排序</th><th>痛点描述</th><th>影响程度（高/中/低）</th><th>企业当前解决能力</th></tr></thead>
        <tbody>{[1,2,3,4,5].map(i => <tr key={i}><td>{i}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>)}</tbody>
      </table></div>

      <h3>3.4 买家未被满足的需求</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>需求描述</th><th>需求紧迫度</th><th>市场上现有解决方案</th><th>企业可切入的机会</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3>3.5 买家流失分析</h3>
      <ul>
        <li>近一年流失客户数量及占比：XXXXX</li>
        <li>主要流失原因（价格/质量/交期/服务/竞品抢夺）：XXXXX</li>
        <li>流失客户挽回可能性评估：XXXXX</li>
        <li>客户流失预警机制现状：XXXXX</li>
      </ul>

      <h3>3.6 客户集中度与健康度分析</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>指标</th><th>数值</th><th>风险判定</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td>前1大客户销售额占比</td><td>XXXXX</td><td><span className="checkbox">☐</span> 安全(&lt;20%) <span className="checkbox">☐</span> 关注(20-40%) <span className="checkbox">☐</span> 高危(&gt;40%)</td><td>XXXXX</td></tr>
          <tr><td>前5大客户销售额占比</td><td>XXXXX</td><td><span className="checkbox">☐</span> 安全(&lt;50%) <span className="checkbox">☐</span> 关注(50-70%) <span className="checkbox">☐</span> 高危(&gt;70%)</td><td>XXXXX</td></tr>
          <tr><td>客户净推荐值（NPS）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>客户满意度评分（CSAT）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>年度新客户获取数量</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>客户留存率</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：买家决策链路流程图、客户分层金字塔图、客户流失原因饼图、客户集中度洛伦兹曲线</div>
      <hr />

      {/* ==================== 四、行业与竞争深度分析 ==================== */}
      <h2><BarChartOutlined /> 四、行业与竞争深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 从行业全局视角评估企业竞争位势，识别行业趋势与竞争格局变化，找到差异化竞争的切入点。</blockquote>

      <h3><BarChartOutlined /> 4.1 行业整体概况</h3>
      <ul>
        <li>全球行业市场规模（附数据来源）：XXXXX</li>
        <li>行业增长率（近5年趋势）：XXXXX</li>
        <li>行业生命周期阶段（导入期/成长期/成熟期/衰退期）：XXXXX</li>
        <li>行业价值链分析：XXXXX</li>
        <li>行业技术变革趋势：XXXXX</li>
        <li>行业政策监管趋势：XXXXX</li>
        <li>行业整合并购趋势：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：行业规模及增长趋势折线图、行业价值链示意图</div>

      <h3><RadarChartOutlined /> 4.2 行业五力模型分析（Porter&apos;s Five Forces）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>力量</th><th>强度（强/中/弱）</th><th>分析说明</th></tr></thead>
        <tbody>
          {['现有竞争者的竞争强度', '潜在进入者的威胁', '替代品的威胁', '供应商的议价能力', '买方的议价能力'].map(f => (
            <tr key={f}><td>{f}</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><FileSearchOutlined /> 4.3 竞争对手深度分析</h3>
      <h4>竞争对手全景</h4>
      <div className="table-wrapper"><table>
        <thead><tr><th>竞争对手</th><th>所在地</th><th>市场份额</th><th>核心产品</th><th>价格定位</th><th>目标市场</th><th>核心优势</th><th>主要劣势</th></tr></thead>
        <tbody>
          {['竞争对手A', '竞争对手B', '竞争对手C', '竞争对手D', '竞争对手E'].map(c => (
            <tr key={c}><td>{c}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <h4>重点竞争对手逐一分析（选取2-3家）</h4>
      <p><strong>竞争对手A：[名称]</strong></p>
      <ul>
        <li>企业背景：XXXXX</li><li>产品策略：XXXXX</li><li>定价策略：XXXXX</li><li>渠道布局：XXXXX</li>
        <li>营销策略：XXXXX</li><li>技术/研发能力：XXXXX</li><li>近期动态（新品/融资/扩张等）：XXXXX</li>
        <li>对我方的威胁程度及应对策略：XXXXX</li>
      </ul>

      <h3>4.4 竞争对手线上布局专项分析</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>竞争对手</th><th>Amazon排名</th><th>独立站流量</th><th>社媒粉丝量</th><th>用户评分</th><th>内容策略特点</th><th>广告投放力度</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3><ThunderboltOutlined /> 4.5 行业趋势预判与机会窗口</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>趋势维度</th><th>趋势描述</th><th>影响时间窗口</th><th>对企业的影响</th><th>建议应对策略</th></tr></thead>
        <tbody>
          {['技术趋势', '消费趋势', '政策/监管趋势', '渠道变革趋势', '供应链趋势', '可持续发展趋势'].map(t => (
            <tr key={t}><td>{t}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><TrophyOutlined /> 4.6 标杆企业对标分析</h3>
      <blockquote>💡 选取1-2家行业标杆企业（国内外均可），分析其成功要素，为企业提供可借鉴的发展路径。</blockquote>
      <p><strong>标杆企业：[名称]</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>对标维度</th><th>标杆企业表现</th><th>本企业现状</th><th>差距分析</th><th>可借鉴的做法</th></tr></thead>
        <tbody>
          {['产品策略', '市场布局', '品牌建设', '渠道策略', '数字化水平', '供应链管理', '团队建设'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>4.7 企业SWOT分析（含交叉策略）</h3>
      <div className="swot-grid">
        <div className="swot-item strength"><h4>优势(S)</h4><ul><li>XXXXX</li></ul></div>
        <div className="swot-item weakness"><h4>劣势(W)</h4><ul><li>XXXXX</li></ul></div>
        <div className="swot-item opportunity"><h4>机会(O)</h4><ul><li>XXXXX</li></ul></div>
        <div className="swot-item threat"><h4>威胁(T)</h4><ul><li>XXXXX</li></ul></div>
      </div>
      <p><strong>SWOT交叉策略矩阵：</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th></th><th>优势(S)</th><th>劣势(W)</th></tr></thead>
        <tbody>
          <tr><td><strong>机会(O)</strong></td><td>SO策略（利用优势抓住机会）：</td><td>WO策略（克服劣势抓住机会）：</td></tr>
          <tr><td><strong>威胁(T)</strong></td><td>ST策略（利用优势应对威胁）：</td><td>WT策略（减少劣势规避威胁）：</td></tr>
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：竞争格局象限图（以价格和质量为轴）、竞争对手对比雷达图</div>
      <hr />
    </>
  );
}

export default Chapters1to4;
