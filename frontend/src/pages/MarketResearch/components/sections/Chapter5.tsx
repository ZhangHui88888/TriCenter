import {
  AppstoreOutlined,
  SearchOutlined,
  GlobalOutlined,
  BarChartOutlined,
  LineChartOutlined,
  DollarOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

function Chapter5() {
  return (
    <>
      <h2><AppstoreOutlined /> 五、产品深度分析</h2>
      <blockquote>💡 <strong>本章目的：</strong> 本报告核心章节。从产品线全景到逐国深度分析，系统评估产品竞争力、市场适配性、合规差距，并给出具体到每个国家的全方位策略建议。5.7节为本章重点。</blockquote>

      <h3><AppstoreOutlined /> 5.1 现有产品线全景</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>产品类别</th><th>产品名称</th><th>规格型号</th><th>出口占比</th><th>利润率</th><th>生命周期阶段</th><th>目标市场</th><th>年销量</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：产品线营收贡献矩阵（BCG矩阵：明星/金牛/问题/瘦狗）</div>

      <h3><BarChartOutlined /> 5.2 产品竞争力评估</h3>
      <ul>
        <li>产品技术含量与创新性：XXXXX</li>
        <li>产品质量水平（与国际标准对比）：XXXXX</li>
        <li>产品差异化程度：XXXXX</li>
        <li>产品性价比分析（与主要竞品逐一对比）：XXXXX</li>
        <li>产品专利与知识产权保护情况：XXXXX</li>
        <li>产品包装与品牌形象：XXXXX</li>
        <li>产品用户评价汇总（各平台）：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：产品竞争力雷达图（质量/价格/创新/品牌/服务/交期六维度）</div>

      <h3><CheckCircleOutlined /> 5.3 产品合规性分析（详细）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>产品</th><th>目标市场</th><th>认证要求</th><th>当前状态</th><th>缺口</th><th>整改建议</th><th>预计费用</th><th>预计周期</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>

      <h3><DollarOutlined /> 5.4 产品定价策略深度分析</h3>
      <ul>
        <li>当前定价模式（成本加成/市场导向/价值定价）：XXXXX</li>
        <li>成本结构拆解（原材料/人工/制造/物流/关税/平台费用占比）：XXXXX</li>
        <li>与竞品价格对比（逐一对比）：XXXXX</li>
        <li>不同市场的定价差异及原因：XXXXX</li>
        <li>汇率波动对定价的影响（敏感性分析）：XXXXX</li>
        <li>促销与折扣策略评估：XXXXX</li>
        <li>定价优化建议：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：成本结构瀑布图、竞品价格对比柱状图</div>

      <h3><SyncOutlined /> 5.5 产品生命周期管理</h3>
      <ul>
        <li>各产品所处生命周期阶段及判断依据：XXXXX</li>
        <li>产品迭代与升级计划：XXXXX</li>
        <li>新产品研发方向与管线：XXXXX</li>
        <li>淘汰产品处理策略：XXXXX</li>
        <li>产品组合优化建议：XXXXX</li>
      </ul>

      <h3>5.6 产品市场适配性分析（按市场）</h3>
      <div className="table-wrapper"><table>
        <thead><tr><th>目标市场</th><th>功能适配</th><th>外观适配</th><th>规格适配</th><th>包装适配</th><th>说明书适配</th><th>综合适配度</th></tr></thead>
        <tbody>
          {['北美', '欧洲', '东南亚', '其他'].map(m => (
            <tr key={m}><td>{m}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <h3><GlobalOutlined /> 5.7 产品按主要销售国家全面分析</h3>
      <blockquote>本节针对企业核心产品，按主要销售国家逐一进行深度分析，涵盖市场环境、消费者需求、竞争格局、销售渠道、合规要求及针对性策略建议。</blockquote>
      <hr />

      <h4><EnvironmentOutlined /> 5.7.1 国别市场总览</h4>
      <div className="table-wrapper"><table>
        <thead><tr><th>国家/地区</th><th>核心产品</th><th>年销售额</th><th>销售占比</th><th>增长率(YoY)</th><th>利润率</th><th>市场潜力评级</th><th>战略优先级</th></tr></thead>
        <tbody>
          {['美国', '德国', '英国', '日本', '韩国', '澳大利亚', '加拿大', '法国', '巴西', '印度', '沙特阿拉伯', '墨西哥', '泰国', '印尼', '其他：___'].map(c => (
            <tr key={c}><td>{c}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：国别销售额热力地图、国别利润率与增长率气泡图、战略优先级矩阵图</div>
      <hr />

      <h4><SearchOutlined /> 5.7.2 产品关键词搜索趋势对比（2024 vs 2025）</h4>
      <blockquote>通过Google Trends、各电商平台搜索数据、SEO工具获取产品核心关键词的搜索热度变化，识别需求变化信号与市场机会。</blockquote>
      <p><strong>全球维度关键词趋势总览</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>关键词</th><th>关键词类型</th><th>2024年月均搜索量</th><th>2025年月均搜索量</th><th>同比变化率</th><th>搜索趋势</th><th>竞争度</th><th>备注</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>
      <p><strong><LineChartOutlined /> 关键词趋势洞察</strong></p>
      <ul>
        <li>2025年显著上升的关键词及背后需求变化分析：XXXXX</li>
        <li>2025年显著下降的关键词及可能原因：XXXXX</li>
        <li>新兴关键词/热搜词发现（2024年未出现、2025年新增）：XXXXX</li>
        <li>季节性关键词波动规律（按月度/季度）：XXXXX</li>
        <li>关键词趋势对产品开发/选品的启示：XXXXX</li>
        <li>关键词趋势对营销策略调整的建议：XXXXX</li>
        <li>竞品品牌词搜索趋势变化：XXXXX</li>
      </ul>
      <div className="chart-suggestion">📊 建议配图：核心关键词2024vs2025搜索量对比柱状图、关键词月度搜索趋势折线图、新兴关键词词云图</div>
      <hr />

      <h4>5.7.3 重点国家逐一深度分析</h4>
      <blockquote>以下模块为每个重点销售国家的标准化分析框架，请根据企业实际销售国家复制使用。建议至少覆盖前5大销售国家。</blockquote>
      <hr />

      <h5>【国家模板】—— [国家名称]</h5>
      <p><strong>A. 市场环境概况</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          {['该产品在目标国市场规模', '市场年增长率', '进口依赖度', '中国产品市场份额', '主要进口来源国及份额', '消费者价格敏感度', '消费升级/降级趋势', '季节性波动特征'].map(i => (
            <tr key={i}><td>{i}</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>B. 目标消费者画像</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>维度</th><th>描述</th></tr></thead>
        <tbody>
          {['核心消费群体', '消费场景与使用习惯', '品牌偏好', '购买决策关键因素排序', '产品功能/规格偏好差异', '包装与外观审美偏好', '环保/可持续性关注度', '线上vs线下购买偏好', '社交媒体影响购买决策的程度', '复购率与品牌忠诚度特征'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>C. 竞争格局分析</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>竞争对手</th><th>来源国</th><th>市场份额</th><th>价格区间</th><th>核心优势</th><th>主要劣势</th><th>主力渠道</th></tr></thead>
        <tbody>
          {['本土品牌1', '本土品牌2', '国际品牌1', '中国竞品1', '中国竞品2'].map(c => (
            <tr key={c}><td>{c}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>D. 产品适配与本地化需求</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>适配维度</th><th>当前状态</th><th>目标国要求/偏好</th><th>差距</th><th>调整建议</th><th>调整成本预估</th></tr></thead>
        <tbody>
          {['产品功能/性能', '产品规格/尺寸', '外观/颜色/设计', '材质/用料', '包装设计与材料', '产品说明书', '电压/插头/度量衡标准', '文化适配', '气候/环境适配'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>E. 合规与认证要求</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>合规项目</th><th>具体要求</th><th>企业当前状态</th><th>是否达标</th><th>整改措施</th><th>预计费用</th><th>预计周期</th></tr></thead>
        <tbody>
          {['强制性产品认证', '安全标准', '环保法规', '标签与标识法规', '包装回收法规', '进口关税税率', '反倾销/反补贴措施', '数据隐私法规', '知识产权保护要求'].map(c => (
            <tr key={c}><td>{c}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>F. 销售渠道全景分析与建议</strong></p>
      <p><strong>F1. 线上渠道</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>渠道类型</th><th>具体平台/方式</th><th>市场影响力</th><th>当前使用情况</th><th>适配度评估</th><th>进入建议</th></tr></thead>
        <tbody>
          {['综合电商平台', '区域性电商平台', '社交电商', '品牌独立站', 'B2B平台', '团购/闪购平台'].map(ch => (
            <tr key={ch}><td>{ch}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <p><strong>F2. 线下渠道</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>渠道类型</th><th>具体方式</th><th>当前使用情况</th><th>适配度评估</th><th>进入建议</th></tr></thead>
        <tbody>
          {['进口商/批发商', '本地分销商/代理商', '大型零售连锁', '专业/垂直零售商', '工程/项目渠道', '国际展会'].map(ch => (
            <tr key={ch}><td>{ch}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>G. 物流与履约方案</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          {['推荐物流方式', '预计物流时效', '物流成本占比', '海外仓需求评估', '尾程配送方案', '退换货/逆向物流方案', '清关注意事项'].map(i => (
            <tr key={i}><td>{i}</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>H. 营销推广策略建议</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>营销方式</th><th>具体建议</th><th>预算建议</th><th>预期效果</th><th>优先级</th></tr></thead>
        <tbody>
          {['搜索引擎营销', '社交媒体营销', 'KOL/网红营销', '内容营销', '电商平台站内广告', '邮件营销(EDM)', '线下展会/路演', 'PR与媒体合作', '联盟营销/Affiliate', '本地化品牌活动'].map(m => (
            <tr key={m}><td>{m}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>I. 定价策略建议</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          {['目标市场主流价格带', '竞品价格区间', '建议零售价（含税）', '建议出厂价/FOB价', '定价策略', '促销定价建议', '不同渠道定价差异建议', '汇率波动缓冲机制'].map(i => (
            <tr key={i}><td>{i}</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>J. 售后服务方案</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>项目</th><th>内容</th></tr></thead>
        <tbody>
          {['该国消费者售后服务期望', '质保政策建议', '售后服务渠道', '客服语言与时区覆盖', '维修/更换方案', '退换货政策', '用户评价管理与口碑维护'].map(i => (
            <tr key={i}><td>{i}</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>K. 风险与挑战</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>风险类型</th><th>具体描述</th><th>影响程度</th><th>应对策略</th></tr></thead>
        <tbody>
          {['贸易壁垒/关税风险', '汇率波动风险', '本土品牌竞争压力', '政策法规变动风险', '文化/消费习惯差异风险', '物流与供应链风险', '知识产权风险', '地缘政治风险'].map(r => (
            <tr key={r}><td>{r}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>

      <p><strong>L. 综合建议与行动计划</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>阶段</th><th>行动事项</th><th>预期目标</th><th>所需资源</th><th>时间节点</th></tr></thead>
        <tbody>
          <tr><td>短期（0-6个月）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>中期（6-18个月）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          <tr><td>长期（18个月以上）</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
        </tbody>
      </table></div>
      <hr />
      <blockquote><strong>使用说明：</strong> 请为每个重点销售国家复制上述【国家模板】（A-L全部模块），逐一填写。建议至少完成前5大销售国家的完整分析。</blockquote>
      <hr />

      <h4>5.7.4 国别策略对比总结</h4>
      <p><strong>各国市场策略差异化对比</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>策略维度</th><th>美国</th><th>德国</th><th>英国</th><th>日本</th><th>其他</th></tr></thead>
        <tbody>
          {['产品策略', '定价策略', '主力销售渠道', '营销推广重点', '物流履约方案', '品牌定位差异', '合规重点', '售后服务模式', '资源投入优先级'].map(d => (
            <tr key={d}><td>{d}</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr>
          ))}
        </tbody>
      </table></div>
      <p><strong>资源配置建议</strong></p>
      <div className="table-wrapper"><table>
        <thead><tr><th>国家/地区</th><th>建议资源投入占比</th><th>预期回报排序</th><th>投入产出比预估</th><th>优先级</th></tr></thead>
        <tbody><tr><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td><td>XXXXX</td></tr></tbody>
      </table></div>
      <div className="chart-suggestion">📊 建议配图：国别策略差异化对比雷达图、资源配置优先级矩阵图、各国市场机会-风险象限图</div>
      <hr />
    </>
  );
}

export default Chapter5;
