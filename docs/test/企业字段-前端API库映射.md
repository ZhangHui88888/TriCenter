# 企业字段 · 前端 → API → 库（溯源清单）

> 供 [`企业全字段数据库验收清单.md`](./企业全字段数据库验收清单.md) 使用：先据此核对「页面上有没有、点保存走哪条 API、对应哪列」，再 **查库** 打勾。  
> **代码基准**（有变更请改本文日期与路径）：`frontend/src/pages/EnterpriseList.tsx`、`frontend/src/pages/EnterpriseDetail.original.tsx`；后端 `EnterpriseCreateRequest` / `EnterpriseUpdateRequest`、`EnterpriseServiceImpl#createEnterprise`。

---

## 1. 新建企业（列表页）

| 项目 | 说明 |
|------|------|
| 入口 | `EnterpriseList.tsx` → `handleAddEnterprise`（按钮文案「新增企业」） |
| 请求 | `POST /api/enterprises`，body **`{}`（空对象）** → 成功后 **跳转详情** |
| 含义 | **不在此步提交**信用代码、行业等业务字段；用户录入主路径在 **详情页编辑**（`PUT` / 子资源）。同文件内另有「新增企业」Modal 表单，但 **无 `setIsModalOpen(true)`，未启用**。 |
| 后端行为 | `EnterpriseServiceImpl#createEnterprise`：无名称则生成 `新建企业_{timestamp}`；补默认 `province/city/district/enterpriseType`，`stage=POTENTIAL` 等（以代码为准）。 |

**结论**：列表空 POST 仅插空白行；**验收清单只列「详情编辑落库」**，与本路径对应。

---

## 2. 详情页 Tab 一览

| Tab `key` | 名称（约） | 主要编辑方式 |
|-----------|------------|--------------|
| `basic` | 基本信息 | 「编辑」→ 企业 Modal、`openEditModal('enterprise')`；联系人 Modal |
| `product` | 产品 | 产品总体概览 Modal；品牌 Modal；产品列表添加/编辑 Modal |
| `trade` | 外贸 | 外贸信息 Modal；业绩分析 Modal（见 §4 假保存）；变化/原因子弹窗 + **须父级外贸 Modal 保存** |
| `crossborder` | 跨境 | 平台 Modal；跨境基本信息 Modal；目标市场 Modal；跨境需求 Modal 等 |
| `requirements` | 需求分析 | 维度选择、移除/恢复需求、自定义需求等 → `saveEnterpriseFields` |
| `policy` | 政策 | 政策支持 Modal |
| `cooperation` | 合作 | 行内/卡片控件 + 三中心合作 Modal；部分与 `tricenter_demands` 多入口重复 |
| `competition` | 竞争力 | 竞争地位卡片 + 描述 blur；竞争/风险/竞争对手 Modal（见 §4） |
| `followup` | 跟进 | 跟进 CRUD（独立接口，非本清单主表列） |

页头：**漏斗阶段** → `PATCH .../stage`（`enterpriseApi.updateStage`）。

---

## 3. 主表 `enterprises`：库列 ↔ 编辑路径 ↔ `PUT` 体字段

表内 **camelCase** 为前端 `enterpriseApi.update` 常用 JSON 字段（与 `EnterpriseUpdateRequest` 一致）。

| 库列 | 编辑入口（摘要） | `PUT` 字段名 | 备注 |
|------|------------------|--------------|------|
| `name` | 基本信息 Modal | `name` | |
| `credit_code` | 基本信息 Modal | `creditCode` | |
| `established_date` | 基本信息 Modal | `establishedDate` | |
| `registered_capital` | 基本信息 Modal | `registeredCapital` | 前端拼 `万元` 后缀 |
| `province` `city` `district` | 基本信息 Modal | `province` `city` `district` | |
| `address` | 基本信息 Modal | `address` | |
| `industry_id` | 基本信息 Modal | `industryId` | Cascader 取叶子 |
| `enterprise_type` | 基本信息 Modal | `enterpriseType` | |
| `staff_size_id` | 基本信息 Modal | `staffSizeId` | |
| `website` | 基本信息 Modal | `website` | |
| `domestic_revenue_wan` | 基本信息 Modal | `domesticRevenueWan` + `domesticRevenueWanTouched` | |
| `cross_border_revenue_wan` | 基本信息 Modal | `crossBorderRevenueWan` + `crossBorderRevenueWanTouched` | |
| `domestic_revenue_id` | 同上路径可能置空档位 | 随万元逻辑 | 与后端「万元优先」一致 |
| `cross_border_revenue_id` | 同上 | 随万元逻辑 | |
| `source_id` | 基本信息 Modal | `sourceId` | |
| `stage` | 页头阶段 Select | （非 PUT）`PATCH .../stage` | |
| `has_own_brand` `brand_names` | 品牌 Modal | `hasOwnBrand` `brandNames` | |
| `target_region_ids` `target_country_ids` `has_import_export_license` | 产品总体概览 Modal | `targetRegionIds` `targetCountryIds` `hasImportExportLicense` | |
| `iso_certifications` `aeo_certification` `other_certifications` | 基本信息 Modal | `isoCertifications` `aeoCertification` `otherCertifications` | |
| `trade_mode_id` `customs_declaration_mode` `trade_team_mode_id` `trade_team_size` `has_domestic_ecommerce` `has_overseas_distributors` | 外贸信息 Tab 网格只读展示；**编辑** 打开外贸信息 Modal 一并保存 | `tradeModeId` 等 | `market_changes` 等仍可在该 Modal 保存时一并写入 |
| `market_changes` `mode_changes` `category_changes` | 外贸 Tab 市场/模式/品类 **添加/编辑 Modal** 与 **Tag 关闭** | `marketChanges` `modeChanges` `categoryChanges` | **`persistTradePerformanceJson` 立即 `PUT`** |
| `growth_reasons` `decline_reasons` | 原因 Modal **立即** `saveEnterpriseFields`；外贸 Modal 也会带上当前 state | `growthReasons` `declineReasons` | |
| `last_year_revenue` `year_before_last_revenue` | 「编辑外贸业绩分析」Modal | `lastYearRevenue` `yearBeforeLastRevenue` | 保存时 `PUT` |
| `has_cross_border` `cross_border_ratio` 等跨境基础字段 | 跨境基本信息 Modal | `hasCrossBorder` `crossBorderRatio` 等 | 顶栏「是否开展跨境」Switch **仅 UI**，须用 Modal |
| `using_erp` | 跨境基本信息 Modal | `usingErp`：`1`/`0` | 与后端 `Integer` 一致 |
| `cross_border_platforms` | 跨境平台 Modal | `crossBorderPlatforms` | |
| `target_markets` | 目标市场 Modal | `targetMarkets` | |
| `tricenter_demands` | 合作 Tab 行内、跨境需求 Modal、三中心合作 Modal 等 | `tricenterDemands` | 多入口、选项集合 **不一致**，验收时注意用哪条 UI |
| `tricenter_concerns` | 合作 Tab / 三中心合作 Modal | `tricenterConcerns` | |
| `service_cooperation_rating` … `overall_cooperation_rating` | 合作 Tab 行内 Rate | `serviceCooperationRating` 等 | |
| `benchmark_possibility` | 合作 Tab Slider；初步评估 Modal | `benchmarkPossibility` | |
| `transformation_willingness` `investment_willingness` | 跨境基本信息 Modal；初步评估 Modal | 同名字段 | |
| `additional_notes` | 合作 Tab 文本 + 按钮；补充说明 Modal | `additionalNotes` | |
| `has_policy_support` `enjoyed_policies` | 政策 Tab Modal | `hasPolicySupport` `enjoyedPolicies` | |
| `competition_position` | 竞争力 Tab **三张卡片** | `competitionPosition` | 值应为 `leader`/`medium`/`startup` |
| `competition_position`（弹窗） | 「编辑行业竞争地位」Modal | 同上 | 选项值为 **中文**，与库枚举 **不一致**，勿作准 |
| `competition_description` | 竞争力 Tab 描述框 onBlur | `competitionDescription` | |
| `pain_points` | 跨境痛点 Modal | `painPoints` | |
| `dimension_selections` `removed_requirements` `custom_requirements` | 需求分析 Tab | `dimensionSelections` `removedRequirements` `customRequirements` | |
| `booking_user_id` | 详情无编辑 | — | 跨系统同步 |

---

## 4. 假保存 / 无落库 / 展示非库（阻塞项）

| 现象 | 位置 | 说明 |
|------|------|------|
| （已接库） | 外贸业绩分析 Modal | `saveEnterpriseFields` → `PUT` |
| （已接库） | 竞争力 Tab「当前面临风险」Modal | `currentRiskTags`、`riskDescription` → `current_risk_tags`、`risk_description` |
| （已接库） | 跨境基本信息 `usingErp` | `Select` 传 `1`/`0`，与库 `using_erp` 一致 |
| （已接库） | 外贸 Tab 市场/模式/品类 | 子弹窗确定与 Tag 删除即 `PUT` 三项 JSON |
| （已接库） | 竞争力 Tab 风险卡片 | 读 `current_risk_tags` + `risk_description` |

---

## 5. 空 `POST {}` 创建后后端写入（便于你 `SELECT` 核对）

以 `EnterpriseServiceImpl#createEnterprise` 为准（无请求体时）：

- `name` = `新建企业_{timestamp}`
- `province` = `江苏省`，`city` = `常州市`，`district` = `待填写`
- `enterprise_type` = `待确认`
- `stage` = `POTENTIAL`
- `is_deleted` = 0  
其余列多为默认 `null`/未设置，**不以用户表单为准**。

---

## 6. 子资源

| 库表 | 入口 | API |
|------|------|-----|
| `enterprise_contacts` | 基本信息 Tab → 编辑联系人 | `PUT /api/enterprises/{id}/contacts` |
| `enterprise_products` | 产品 Tab | `POST`/`PUT` …`/products` |
| `enterprise_patents` | 产品 Tab（专利区） | `POST`/`PUT` …`/patents` |

新建企业时：列表 **`create({})` 不传联系人**；若将来在其他入口传 `contactName`+`contactPhone`，才命中创建接口里的联系人插入逻辑。

---

## 7. 修订记录

| 日期 | 说明 |
|------|------|
| 2026-03-23 | 首版：列表空创建 + `EnterpriseDetail.original.tsx` 静态溯源 |
| 2026-03-23 | 外贸业绩 Modal 接 `PUT`；风险接 `currentRiskTags`/`riskDescription`；删除主要竞争对手 Modal |
| 2026-03-23 | 下线 `desired_support` / `cooperation_demands`（库列与 `EnterpriseUpdateRequest`/详情响应一并移除） |
| 2026-03-23 | `usingErp` 改 `1`/`0`；外贸 `market/mode/category` 变化即时 `PUT` |
