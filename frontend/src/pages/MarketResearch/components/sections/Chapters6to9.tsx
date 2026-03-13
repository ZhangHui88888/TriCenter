import {
  CarOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CloudServerOutlined,
  ToolOutlined,
  ShopOutlined,
  LineChartOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined,
  RobotOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

function Chapters6to9() {
  return (
    <>
      {/* ==================== 六、供应链与物流深度分析 ==================== */}
      <h2><CarOutlined /> 六、供应链与物流深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 评估企业供应链的稳定性、弹性与成本竞争力，特别关注ESG合规这一日益重要的准入门槛。</blockquote>

      <h3><ToolOutlined /> 6.1 供应链现状</h3>
      <ul>
        <li>核心供应商数量及分布：XXXXX</li>
        <li>核心原材料/零部件清单及来源：XXXXX</li>
        <li>供应商集中度风险（前3大供应商占比）：XXXXX</li>
        <li>供应链稳定性评估：XXXXX</li>
        <li>备选供应商储备情况：XXXXX</li>
        <li>供应链成本结构拆解：XXXXX</li>
      </ul>

      <h3>6.2 生产能力评估</h3>
      <ul>
        <li>现有产能（日/月产量）：XXXXX</li>
        <li>产能利用率：XXXXX</li>
        <li>产能扩展空间与成本：XXXXX</li>
        <li>生产周期（从下单到出货）：XXXXX</li>
        <li>柔性生产能力（小批量/定制化/快速换线）：XXXXX</li>
        <li>质量控制体系与不良率：XXXXX</li>
        <li>生产自动化水平：XXXXX</li>
      </ul>

      <h3><CarOutlined /> 6.3 物流与仓储</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>物流方式</th><th>使用占比</th><th>平均时效</th><th>单位成本</th><th>适用场景</th></tr></thead>
        <tbody>
          {['海运', '空运', '铁路（中欧班列等）', '国际快递', '多式联运'].map(m => (
            <tr key={m}><td>{m}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <ul>
        <li>海外仓布局情况（位置/面积/库存周转率）：XXXXX</li>
        <li>头程与尾程物流方案：XXXXX</li>
        <li>退换货逆向物流能力：XXXXX</li>
        <li>物流时效与客户满意度：XXXXX</li>
        <li>物流成本优化空间：XXXXX</li>
      </ul>

      <h3>6.4 供应链风险管理</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>风险类型</th><th>风险描述</th><th>发生概率</th><th>影响程度</th><th>现有应对措施</th><th>改进建议</th></tr></thead>
        <tbody>
          {['供应商断供', '原材料涨价', '物流中断', '地缘政治', '自然灾害'].map(r => (
            <tr key={r}><td>{r}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>6.5 绿色供应链与ESG合规</h3>
      <blockquote>💡 欧美市场对ESG要求日趋严格，碳足迹与可持续供应链已成为准入门槛和竞争差异化要素。</blockquote>
      <div className="table-wrapper"><table>
        <thead><tr><th>评估维度</th><th>当前状态</th><th>目标市场要求</th><th>差距</th><th>改进建议</th><th>优先级</th></tr></thead>
        <tbody>
          {['碳足迹核算与披露', '产品碳标签/环保标识', '包装材料可回收/可降解', '生产环节节能减排', '供应商ESG审核机制', '欧盟CBAM应对', '欧盟CSRD/供应链尽职调查合规', '社会责任（劳工权益/安全生产）', 'ESG报告/可持续发展报告'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：ESG合规差距雷达图、绿色供应链成熟度评估图</div>
      <hr />

      {/* ==================== 七、营销与品牌深度分析 ==================== */}
      <h2><ShoppingCartOutlined /> 七、营销与品牌深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 全面诊断企业营销体系的效率与效果，从品牌建设到渠道运营、从内容营销到预算ROI，找出营销投入的"漏水点"和"增长点"。</blockquote>

      <h3>7.1 品牌建设现状</h3>
      <ul>
        <li>品牌定位（一句话描述）：XXXXX</li>
        <li>品牌价值主张：XXXXX</li>
        <li>品牌故事：XXXXX</li>
        <li>品牌知名度（国内/各目标市场）：XXXXX</li>
        <li>品牌视觉体系国际化程度：XXXXX</li>
        <li>商标国际注册情况（马德里体系/逐国注册）：XXXXX</li>
        <li>品牌资产评估：XXXXX</li>
      </ul>

      <h3><ShopOutlined /> 7.2 跨境电商平台深度分析</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>平台</th><th>入驻时间</th><th>店铺等级</th><th>月销售额</th><th>月订单量</th><th>评分</th><th>退货率</th><th>广告费占比</th><th>利润率</th><th>运营状况</th></tr></thead>
        <tbody>
          {['Amazon', 'eBay', 'AliExpress', 'Shopee', 'Lazada', 'Temu', 'TikTok Shop', '独立站', '1688国际站', '其他'].map(p => (
            <tr key={p}><td>{p}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><GlobalOutlined /> 7.3 独立站专项分析（如有）</h3>
      <ul>
        <li>网站域名与建站时间：XXXXX</li>
        <li>建站平台（Shopify/WordPress/自建等）：XXXXX</li>
        <li>月均流量及来源构成：XXXXX</li>
        <li>转化率：XXXXX</li>
        <li>平均客单价：XXXXX</li>
        <li>网站加载速度（移动端/PC端）：XXXXX</li>
        <li>多语言/多币种支持：XXXXX</li>
        <li>用户体验评估：XXXXX</li>
        <li>SEO健康度评估：XXXXX</li>
      </ul>

      <h3>7.4 社交媒体营销深度分析</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>平台</th><th>账号状态</th><th>粉丝数</th><th>发布频率</th><th>平均互动率</th><th>内容类型</th><th>投放预算/月</th><th>ROI</th></tr></thead>
        <tbody>
          {['Facebook', 'Instagram', 'TikTok', 'LinkedIn', 'YouTube', 'Pinterest', 'X (Twitter)', 'WhatsApp Business'].map(p => (
            <tr key={p}><td>{p}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>7.5 搜索引擎营销分析</h3>
      <ul>
        <li>Google Ads账户状态与月预算：XXXXX</li>
        <li>核心关键词及排名情况：XXXXX</li>
        <li>广告点击率（CTR）：XXXXX</li>
        <li>广告转化率：XXXXX</li>
        <li>单次获客成本（CAC）：XXXXX</li>
        <li>SEO自然流量占比及趋势：XXXXX</li>
      </ul>

      <h3>7.6 线下营销渠道分析</h3>
      <ul>
        <li>国际展会参展情况（展会名称/频次/效果评估）：XXXXX</li>
        <li>海外代理商/分销商网络：XXXXX</li>
        <li>线下体验店/展厅：XXXXX</li>
        <li>B2B业务拓展渠道与效果：XXXXX</li>
      </ul>

      <h3>7.7 内容营销与KOL合作</h3>
      <ul>
        <li>内容营销策略与执行情况：XXXXX</li>
        <li>KOL/网红合作情况：XXXXX</li>
        <li>用户生成内容（UGC）运营：XXXXX</li>
        <li>邮件营销（EDM）策略与打开率/转化率：XXXXX</li>
        <li>视频营销能力（短视频/直播）：XXXXX</li>
      </ul>

      <h3><LineChartOutlined /> 7.8 营销预算分配与ROI综合评估</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>营销渠道</th><th>月度预算</th><th>占总预算比</th><th>月均获客数</th><th>CAC</th><th>月均销售额贡献</th><th>ROI</th><th>效果评级</th></tr></thead>
        <tbody>
          {['Amazon站内广告', 'Google Ads', '社交媒体广告', 'KOL/网红合作', 'SEO/内容营销', '邮件营销', '展会参展', '独立站运营', '其他'].map(ch => (
            <tr key={ch}><td>{ch}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
          <tr><td><strong>合计</strong></td><td>XXXXX</td><td><strong>100%</strong></td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>

      <h3>7.9 客户关系管理（深度）</h3>
      <ul>
        <li>CRM系统使用情况及数据完整度：XXXXX</li>
        <li>客户分层管理策略（RFM模型应用）：XXXXX</li>
        <li>客户复购率及复购周期：XXXXX</li>
        <li>客户生命周期价值（LTV）：XXXXX</li>
        <li>客户满意度调查机制与结果：XXXXX</li>
        <li>客户投诉处理流程与响应时效：XXXXX</li>
        <li>私域流量运营情况：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：营销渠道贡献占比饼图、各平台ROI对比柱状图、流量来源桑基图、客户RFM分层图</div>
      <hr />

      {/* ==================== 八、财务与风控深度分析 ==================== */}
      <h2><DollarOutlined /> 八、财务与风控深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 从财务视角验证外贸业务的健康度与可持续性，评估资金效率、汇率风险敞口与合规成本。</blockquote>

      <h3>8.1 外贸业务财务概况</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>指标</th><th>前年</th><th>去年</th><th>今年（预估）</th><th>趋势</th></tr></thead>
        <tbody>
          {['外贸业务收入', '外贸业务利润率', '外贸业务占总收入比', '应收账款周转天数', '存货周转天数', '外贸业务现金流'].map(i => (
            <tr key={i}><td>{i}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>8.2 支付与结算</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>结算方式</th><th>使用占比</th><th>平均账期</th><th>风险等级</th></tr></thead>
        <tbody>
          {['T/T（电汇）', 'L/C（信用证）', 'D/P（付款交单）', 'D/A（承兑交单）', '在线支付（PayPal等）', '其他'].map(p => (
            <tr key={p}><td>{p}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>8.3 汇率风险管理</h3>
      <ul>
        <li>主要结算币种及占比：XXXXX</li>
        <li>汇率对冲工具使用情况（远期结汇/期权等）：XXXXX</li>
        <li>汇率波动对利润的敏感性分析：XXXXX</li>
        <li>自然对冲策略：XXXXX</li>
        <li>汇率风险管理改进建议：XXXXX</li>
      </ul>

      <h3><SafetyCertificateOutlined /> 8.4 贸易合规与风控</h3>
      <ul>
        <li>出口退税政策利用情况及优化空间：XXXXX</li>
        <li>反倾销/反补贴风险评估：XXXXX</li>
        <li>贸易信用保险覆盖情况（中信保等）：XXXXX</li>
        <li>合同法律风险管理：XXXXX</li>
        <li>知识产权侵权风险评估：XXXXX</li>
        <li>出口管制与制裁合规审查：XXXXX</li>
      </ul>

      <h3>8.5 税务筹划</h3>
      <ul>
        <li>目标市场税务政策了解程度：XXXXX</li>
        <li>VAT/GST注册与合规情况（逐市场）：XXXXX</li>
        <li>转让定价策略（如有海外主体）：XXXXX</li>
        <li>税收优惠政策利用情况：XXXXX</li>
        <li>税务筹划优化建议：XXXXX</li>
      </ul>

      <h3>8.6 融资与资金管理</h3>
      <ul>
        <li>外贸业务融资渠道（银行/供应链金融/政策性贷款）：XXXXX</li>
        <li>融资成本：XXXXX</li>
        <li>资金周转效率：XXXXX</li>
        <li>跨境资金流动管理：XXXXX</li>
      </ul>
      <hr />

      {/* ==================== 九、数字化与技术能力深度评估 ==================== */}
      <h2><CloudServerOutlined /> 九、数字化与技术能力深度评估</h2>
      <blockquote>💡 <strong>本章目的：</strong> 评估企业数字化基础设施与应用水平，识别数字化转型的优先方向。</blockquote>

      <h3><DatabaseOutlined /> 9.1 企业数字化现状</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>系统/工具</th><th>是否使用</th><th>具体产品</th><th>使用深度</th><th>与其他系统集成情况</th></tr></thead>
        <tbody>
          {['ERP', 'CRM', 'WMS（仓储管理）', 'OMS（订单管理）', '财务系统', 'BI（数据分析）', '跨境电商ERP', '其他'].map(s => (
            <tr key={s}><td>{s}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3>9.2 跨境电商技术能力</h3>
      <ul>
        <li>独立站技术架构与性能：XXXXX</li>
        <li>多语言/多币种/多站点支持能力：XXXXX</li>
        <li>移动端适配与体验：XXXXX</li>
        <li>网站安全（SSL/防DDoS/PCI DSS等）：XXXXX</li>
        <li>数据安全与隐私保护措施（GDPR合规等）：XXXXX</li>
        <li>API对接能力（平台/物流/支付/ERP）：XXXXX</li>
      </ul>

      <h3><RobotOutlined /> 9.3 AI与新技术应用</h3>
      <ul>
        <li>AI在客服中的应用（智能客服/翻译）：XXXXX</li>
        <li>AI在选品与市场分析中的应用：XXXXX</li>
        <li>AI在内容生成中的应用（产品描述/广告素材）：XXXXX</li>
        <li>大数据分析在决策中的应用：XXXXX</li>
        <li>自动化营销工具使用情况：XXXXX</li>
        <li>数字化转型规划与预算：XXXXX</li>
      </ul>

      <h3><BarChartOutlined /> 9.4 数字化成熟度评估</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>维度</th><th>评分（1-5）</th><th>说明</th></tr></thead>
        <tbody>
          {['基础设施', '数据管理', '流程自动化', '数据驱动决策', '创新应用'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：数字化成熟度雷达图</div>
      <hr />
    </>
  );
}

export default Chapters6to9;
