# -*- coding: utf-8 -*-
"""
从源 Excel 读取"需求"列，匹配系统需求ID，生成 SQL UPDATE 语句更新 added_requirements。

用法: python scripts/import_requirements.py
输出: scripts/output/update_requirements.sql
"""
import openpyxl
import json
import os
import re

EXCEL_PATH = os.path.join('docs', 'data', '企业服务数据新表_品类已匹配.xlsx')
SHEET_NAME = '1.1 常州市产业带调研'
REQ_COL = 37        # 需求列（1-indexed）
NAME_COL = 2        # 企业名称列（1-indexed）
OUTPUT_DIR = os.path.join('scripts', 'output')
OUTPUT_FILE = os.path.join(OUTPUT_DIR, 'update_requirements.sql')

# ==================== 系统需求定义（从 requirementsData.ts 提取） ====================

REQUIREMENTS = [
    # 第一阶段：战略规划与资源准备
    {'id': '1.1.1', 'name': '品牌定位与规划/设计', 'category': '品牌规划'},
    {'id': '1.2.1', 'name': '市场/IP洞察', 'category': '市场洞察'},
    {'id': '1.3.1', 'name': '用户旅程设计', 'category': '搭建营销体系'},
    {'id': '1.3.2', 'name': '画像/要素/标签体系', 'category': '搭建营销体系'},
    {'id': '1.3.3', 'name': '营销活动与节奏规划', 'category': '搭建营销体系'},
    {'id': '1.3.4', 'name': 'O2O营销体系', 'category': '搭建营销体系'},
    {'id': '1.4.1', 'name': '平台测品、双轨选品', 'category': '测品选品与前置认证评估'},
    {'id': '1.4.2', 'name': '海外认证可行性评估', 'category': '测品选品与前置认证评估'},
    {'id': '1.4.3', 'name': '品类规划与产品矩阵', 'category': '测品选品与前置认证评估'},
    {'id': '1.4.4', 'name': '消费者洞察与调研', 'category': '测品选品与前置认证评估'},
    {'id': '1.5.1', 'name': '出海路径规划', 'category': '战略与预算'},
    {'id': '1.5.2', 'name': '营销战略与预算', 'category': '战略与预算'},
    {'id': '1.5.3', 'name': '资金预算与融资/政府资源', 'category': '战略与预算'},
    {'id': '1.5.4', 'name': '行业协会与展会资源', 'category': '战略与预算'},
    {'id': '1.5.5', 'name': '并购与战略投资', 'category': '战略与预算'},
    {'id': '1.6.1', 'name': '备货策略与库存预案', 'category': '供应链与物流准备'},
    {'id': '1.6.2', 'name': '物流渠道方案选型', 'category': '供应链与物流准备'},
    {'id': '1.6.3', 'name': '采购渠道拓展', 'category': '供应链与物流准备'},
    {'id': '1.6.4', 'name': '最小起订量谈判', 'category': '供应链与物流准备'},
    {'id': '1.7.1', 'name': '知识产权布局', 'category': '合规前置'},
    {'id': '1.7.2', 'name': '税务合规前置', 'category': '合规前置'},
    {'id': '1.7.3', 'name': '数据隐私合规前置', 'category': '合规前置'},
    {'id': '1.7.4', 'name': '合同管理前置', 'category': '合规前置'},
    {'id': '1.7.5', 'name': '进出口合规', 'category': '合规前置'},
    {'id': '1.8.1', 'name': '组织架构设计', 'category': '团队与组织准备'},
    {'id': '1.8.2', 'name': '人才招聘', 'category': '团队与组织准备'},
    {'id': '1.8.3', 'name': '人才培养', 'category': '团队与组织准备'},
    {'id': '1.8.4', 'name': '自建团队/代运营选择', 'category': '团队与组织准备'},
    {'id': '1.8.5', 'name': '跨时区与远程协作', 'category': '团队与组织准备'},
    {'id': '1.8.6', 'name': '办公场地与工位', 'category': '团队与组织准备'},
    # 第二阶段：渠道搭建与商品上线
    {'id': '2.1.1', 'name': '平台开店', 'category': '渠道与店铺建设'},
    {'id': '2.1.2', 'name': '独立站建设', 'category': '渠道与店铺建设'},
    {'id': '2.1.3', 'name': '线下渠道搭建', 'category': '渠道与店铺建设'},
    {'id': '2.1.4', 'name': '海外实体与本地化运营', 'category': '渠道与店铺建设'},
    {'id': '2.1.5', 'name': '海外分销商/代理商管理', 'category': '渠道与店铺建设'},
    {'id': '2.2.1', 'name': 'Listing与素材生产', 'category': '商品内容与上架'},
    {'id': '2.2.2', 'name': '合规材料与上架门槛', 'category': '商品内容与上架'},
    {'id': '2.2.3', 'name': '多语言翻译与本地化', 'category': '商品内容与上架'},
    {'id': '2.3.1', 'name': '达人合作与结算', 'category': '达人/社媒/直播启动'},
    {'id': '2.3.2', 'name': '直播间搭建与直播运营', 'category': '达人/社媒/直播启动'},
    {'id': '2.3.3', 'name': '种草内容生产与分发', 'category': '达人/社媒/直播启动'},
    {'id': '2.4.1', 'name': '外包装设计', 'category': '包装与样品管理'},
    {'id': '2.4.2', 'name': '防损包装', 'category': '包装与样品管理'},
    {'id': '2.4.3', 'name': '环保包材', 'category': '包装与样品管理'},
    {'id': '2.4.4', 'name': '样品流程', 'category': '包装与样品管理'},
    # 第三阶段：营销推广与规模增长
    {'id': '3.1.1', 'name': '流量推广与精准营销', 'category': '获客与投放'},
    {'id': '3.1.2', 'name': '站内外广告素材生产', 'category': '获客与投放'},
    {'id': '3.1.3', 'name': '大数据主动拓客', 'category': '获客与投放'},
    {'id': '3.1.4', 'name': '市场活动灵活用工', 'category': '获客与投放'},
    {'id': '3.1.5', 'name': '广告投放与优化', 'category': '获客与投放'},
    {'id': '3.1.6', 'name': 'A/B测试与实验', 'category': '获客与投放'},
    {'id': '3.1.7', 'name': 'B2B询盘与报价管理', 'category': '获客与投放'},
    {'id': '3.1.8', 'name': '数据分析与BI工具', 'category': '获客与投放'},
    {'id': '3.2.1', 'name': '生产融资', 'category': '订单、财务与收款'},
    {'id': '3.2.2', 'name': '跨境支付与资金管理', 'category': '订单、财务与收款'},
    {'id': '3.2.3', 'name': '财务核算与成本归集', 'category': '订单、财务与收款'},
    {'id': '3.2.4', 'name': '出口退税与税务申报', 'category': '订单、财务与收款'},
    {'id': '3.2.5', 'name': '国际贸易结算方式', 'category': '订单、财务与收款'},
    {'id': '3.3.1', 'name': '知识库/智能客服', 'category': '客服与售后'},
    {'id': '3.3.2', 'name': '报税/批税/税务咨询', 'category': '客服与售后'},
    {'id': '3.3.3', 'name': '退换货、维修、质保服务', 'category': '客服与售后'},
    {'id': '3.3.4', 'name': '评价与口碑管理', 'category': '客服与售后'},
    {'id': '3.3.5', 'name': '逆向物流与成本控制', 'category': '客服与售后'},
    {'id': '3.4.1', 'name': '平台合规', 'category': '合规与风险的持续运营'},
    {'id': '3.4.2', 'name': '产品认证管理', 'category': '合规与风险的持续运营'},
    {'id': '3.4.3', 'name': '知识产权维护', 'category': '合规与风险的持续运营'},
    {'id': '3.4.4', 'name': '风险管理', 'category': '合规与风险的持续运营'},
    {'id': '3.4.5', 'name': '保险与风险转移', 'category': '合规与风险的持续运营'},
    {'id': '3.4.6', 'name': '法律诉讼与争议解决', 'category': '合规与风险的持续运营'},
    {'id': '3.5.1', 'name': '多币种定价', 'category': '定价与利润管理'},
    {'id': '3.5.2', 'name': '毛利/净利核算模型', 'category': '定价与利润管理'},
    {'id': '3.6.1', 'name': '服务商类型', 'category': '外部服务商管理'},
    {'id': '3.6.2', 'name': '供应商评估', 'category': '外部服务商管理'},
    {'id': '3.6.3', 'name': '合同与结算', 'category': '外部服务商管理'},
    {'id': '3.7.1', 'name': '代运营独立站', 'category': '代运营'},
    {'id': '3.7.2', 'name': '代运营亚马逊（Amazon）', 'category': '代运营'},
    {'id': '3.7.3', 'name': '代运营TikTok Shop', 'category': '代运营'},
    {'id': '3.7.4', 'name': '代运营速卖通（AliExpress）', 'category': '代运营'},
    {'id': '3.7.5', 'name': '代运营eBay', 'category': '代运营'},
    {'id': '3.7.6', 'name': '代运营Shopee', 'category': '代运营'},
    {'id': '3.7.7', 'name': '代运营Lazada', 'category': '代运营'},
    {'id': '3.7.8', 'name': '代运营Temu', 'category': '代运营'},
    {'id': '3.7.9', 'name': '代运营SHEIN', 'category': '代运营'},
    {'id': '3.7.10', 'name': '代运营Walmart', 'category': '代运营'},
    {'id': '3.7.11', 'name': '代运营Mercado Libre', 'category': '代运营'},
    {'id': '3.7.12', 'name': '代运营Ozon', 'category': '代运营'},
    {'id': '3.7.13', 'name': '代运营阿里国际站（Alibaba.com）', 'category': '代运营'},
    # 第四阶段：品牌深耕与持续优化
    {'id': '4.1.1', 'name': '报关/清关异常处理', 'category': '履约升级与交付体验'},
    {'id': '4.1.2', 'name': '集运（门到门）', 'category': '履约升级与交付体验'},
    {'id': '4.1.3', 'name': '海外仓', 'category': '履约升级与交付体验'},
    {'id': '4.1.4', 'name': '一件代发', 'category': '履约升级与交付体验'},
    {'id': '4.1.5', 'name': '小额采购（拼团）', 'category': '履约升级与交付体验'},
    {'id': '4.1.6', 'name': '物流履约优化', 'category': '履约升级与交付体验'},
    {'id': '4.2.1', 'name': '合伙人转介、交叉销售、复购、防流失、会员体验', 'category': '私域与会员运营'},
    {'id': '4.2.2', 'name': '客户画像、自动化营销、社媒矩阵裂变', 'category': '私域与会员运营'},
    {'id': '4.3.1', 'name': '产品迭代机制', 'category': '产品与品牌迭代'},
    {'id': '4.3.2', 'name': '品牌推广与IP策略', 'category': '产品与品牌迭代'},
    {'id': '4.3.3', 'name': '竞争情报与平台政策跟踪', 'category': '产品与品牌迭代'},
    {'id': '4.3.4', 'name': '产品生命周期管理', 'category': '产品与品牌迭代'},
    {'id': '4.4.1', 'name': '商品洞察', 'category': '新品规划'},
    {'id': '4.4.2', 'name': '产品定义', 'category': '新品规划'},
    {'id': '4.4.3', 'name': '工业设计', 'category': '新品规划'},
    {'id': '4.4.4', 'name': '仿真验品', 'category': '新品规划'},
    {'id': '4.5.1', 'name': '履约与供应链降本', 'category': '规模化与降本增效'},
    {'id': '4.6.1', 'name': 'ESG合规、绿色供应链、社会责任', 'category': 'ESG与可持续'},
]

# ==================== 构建匹配索引 ====================

# 需求名称 → ID（精确匹配）
name_to_id = {}
for r in REQUIREMENTS:
    name_to_id[r['name']] = r['id']

# 分类名称 → ID 列表（分类级匹配：如 "代运营" → 所有代运营子项）
category_to_ids = {}
for r in REQUIREMENTS:
    cat = r['category']
    if cat not in category_to_ids:
        category_to_ids[cat] = []
    category_to_ids[cat].append(r['id'])

# 别名映射：Excel 中可能出现的简写/变体 → 精确需求名或分类名
ALIAS_MAP = {
    '品牌定位与规划设计': '品牌定位与规划/设计',
    '品牌规划': '品牌定位与规划/设计',
    '品牌设计': '品牌定位与规划/设计',
    '市场洞察': '市场/IP洞察',
    '获客': '获客与投放',       # 分类名
    '投放': '获客与投放',       # 分类名
    '代运营': '代运营',         # 分类名
    '人才培养': '人才培养',
    '人才招聘': '人才招聘',
    '办公场地': '办公场地与工位',
    '品牌推广': '品牌推广与IP策略',
    '知识产权': '知识产权布局',
    '合规': '合规前置',         # 分类名
    '物流': '供应链与物流准备',  # 分类名
    '客服': '客服与售后',       # 分类名
    '包装': '包装与样品管理',    # 分类名
}


def match_requirement_text(text: str) -> list[str]:
    """将单个需求文本匹配为系统需求ID列表"""
    text = text.strip()
    if not text:
        return []

    matched_ids = []

    # 1) 精确匹配需求名称
    if text in name_to_id:
        return [name_to_id[text]]

    # 2) 精确匹配分类名称 → 返回该分类下所有需求ID
    if text in category_to_ids:
        return category_to_ids[text]

    # 3) 别名映射
    if text in ALIAS_MAP:
        mapped = ALIAS_MAP[text]
        if mapped in name_to_id:
            return [name_to_id[mapped]]
        if mapped in category_to_ids:
            return category_to_ids[mapped]

    # 4) 模糊匹配：文本包含需求名称或反向包含
    for r in REQUIREMENTS:
        if r['name'] in text or text in r['name']:
            matched_ids.append(r['id'])
    if matched_ids:
        return matched_ids

    # 5) 模糊匹配分类
    for cat, ids in category_to_ids.items():
        if cat in text or text in cat:
            return ids

    return []


def process_enterprise(name: str, req_text: str) -> tuple[list[str], list[str]]:
    """处理单个企业的需求文本，返回 (匹配的ID列表, 未匹配的文本列表)"""
    # 按中英文逗号、顿号分隔
    tokens = re.split(r'[,，、;；\n]+', req_text)
    all_ids = set()
    unmatched = []

    for token in tokens:
        token = token.strip()
        if not token:
            continue
        ids = match_requirement_text(token)
        if ids:
            all_ids.update(ids)
        else:
            unmatched.append(token)

    return sorted(all_ids), unmatched


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    wb = openpyxl.load_workbook(EXCEL_PATH, read_only=True)
    ws = wb[SHEET_NAME]

    results = []       # (企业名, 匹配ID列表)
    all_unmatched = []  # 所有未匹配的文本

    for row in ws.iter_rows(min_row=3, values_only=False):
        name = row[NAME_COL - 1].value
        if not name or not str(name).strip():
            continue
        name = str(name).strip()

        req_val = row[REQ_COL - 1].value if REQ_COL - 1 < len(row) else None
        if not req_val or not str(req_val).strip():
            continue

        req_text = str(req_val).strip()
        matched_ids, unmatched = process_enterprise(name, req_text)

        if matched_ids:
            results.append((name, matched_ids))
        if unmatched:
            all_unmatched.append((name, unmatched))

    wb.close()

    # 输出匹配报告
    print(f"共 {len(results)} 个企业有需求匹配结果：")
    print("=" * 70)
    for name, ids in results:
        print(f"\n  {name}")
        print(f"    匹配 {len(ids)} 个需求ID: {ids}")

    if all_unmatched:
        print(f"\n{'=' * 70}")
        print(f"未匹配的需求文本（{len(all_unmatched)} 个企业）：")
        for name, texts in all_unmatched:
            print(f"  {name}: {texts}")

    # 生成 SQL
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("-- 自动生成：根据源 Excel 需求列更新 added_requirements\n")
        f.write(f"-- 共 {len(results)} 个企业\n\n")

        for name, ids in results:
            json_str = json.dumps(ids, ensure_ascii=False)
            # 使用企业名称匹配（因为企业ID可能不同）
            escaped_name = name.replace("'", "\\'")
            f.write(f"UPDATE enterprises SET added_requirements = '{json_str}' "
                    f"WHERE name = '{escaped_name}' AND is_deleted = 0;\n")

        f.write(f"\n-- 完成，共更新 {len(results)} 条\n")

    print(f"\n{'=' * 70}")
    print(f"SQL 已生成: {OUTPUT_FILE}")
    print(f"共 {len(results)} 条 UPDATE 语句")


if __name__ == '__main__':
    main()
