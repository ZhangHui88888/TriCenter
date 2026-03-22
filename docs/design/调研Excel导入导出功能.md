# 调研Excel导入导出功能

> 用于线下拜访企业数据收集的完整闭环：导出调研表 → 线下填写 → 导入回收数据

---

## 业务流程

```
导出调研表 → 分发给线下人员 → 拜访企业填写 → 回收Excel → 导入系统更新数据
```

---

## API接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/survey-excel/export/{enterpriseId}` | 导出单个企业调研表 |
| POST | `/api/survey-excel/export/batch` | 批量导出（Body: 企业ID数组） |
| POST | `/api/survey-excel/import` | 导入调研数据（multipart/form-data） |

---

## Excel模板结构（6个Sheet）

### Sheet1: 企业基本信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填**，用于匹配更新 | enterprises.id |
| 企业名称 | | enterprises.name |
| 统一社会信用代码 | | enterprises.credit_code |
| 所属区域 | 如：武进区、新北区 | enterprises.district |
| 详细地址 | | enterprises.address |
| 所属行业 | 按名称匹配industry_categories | enterprises.industry_id |
| 企业类型 | 生产型/贸易型/工贸一体/跨境卖家型/品牌运营型/供应链服务型/技术服务型/综合服务型/未定义 | enterprises.enterprise_type |
| 人员规模 | 按label匹配system_options | enterprises.staff_size_id |
| 官网 | | enterprises.website |
| 国内营收 | 按label匹配system_options | enterprises.domestic_revenue_id |
| 跨境营收 | 优先填数字（万元）；无法解析时按 label 匹配 system_options 档位 | enterprises.cross_border_revenue_wan 或 cross_border_revenue_id |
| 企业来源 | 按label匹配system_options | enterprises.source_id |
| 是否有自主品牌 | 是/否 | enterprises.has_own_brand |
| 品牌名称 | | enterprises.brand_names |
| 漏斗阶段 | 仅导出展示，导入不更新 | - |

### Sheet2: 联系人信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填** | enterprise_contacts.enterprise_id |
| 企业名称 | 仅展示 | - |
| 联系人姓名 | **必填**（空行跳过） | enterprise_contacts.name |
| 联系电话 | | enterprise_contacts.phone |
| 职位 | | enterprise_contacts.position |
| 邮箱 | | enterprise_contacts.email |
| 微信 | | enterprise_contacts.wechat |
| 是否主要联系人 | 是/否 | enterprise_contacts.is_primary |
| 备注 | | enterprise_contacts.remark |

> 导入时按企业ID分组，**全量替换**该企业的联系人

### Sheet3: 产品信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填** | enterprise_products.enterprise_id |
| 企业名称 | 仅展示 | - |
| 产品名称 | **必填**（空行跳过） | enterprise_products.name |
| 产品品类 | 按名称匹配product_categories | enterprise_products.category_id |
| 认证资质 | 顿号分隔，按label匹配 | enterprise_products.certification_ids |
| 主要销售区域 | 顿号分隔，按label匹配 | enterprise_products.target_region_ids |
| 年销售额 | | enterprise_products.annual_sales |
| 原材料本地采购比例 | | enterprise_products.local_procurement_ratio |
| 设备自动化程度 | 按label匹配system_options | enterprise_products.automation_level_id |
| 年产能 | | enterprise_products.annual_capacity |

> 导入时按企业ID分组，**全量替换**该企业的产品

### Sheet4: 外贸信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填** | enterprises.id |
| 企业名称 | 仅展示 | - |
| 主要销售区域 | 顿号分隔 | enterprises.target_region_ids |
| 外贸模式 | 按label匹配 | enterprises.trade_mode_id |
| 是否有进出口资质 | 是/否 | enterprises.has_import_export_license |
| 报关申报主体模式 | | enterprises.customs_declaration_mode |
| 外贸团队模式 | 按label匹配 | enterprises.trade_team_mode_id |
| 外贸团队人数 | 数字 | enterprises.trade_team_size |
| 是否有国内电商经验 | 是/否 | enterprises.has_domestic_ecommerce |
| 上年外贸营业额(万元) | 数字 | enterprises.last_year_revenue |
| 上上年外贸营业额(万元) | 数字 | enterprises.year_before_last_revenue |

### Sheet5: 跨境电商信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填** | enterprises.id |
| 企业名称 | 仅展示 | - |
| 是否开展跨境电商 | 是/否 | enterprises.has_cross_border |
| 跨境平台 | 顿号分隔 | enterprises.cross_border_platforms |
| 跨境业务占比 | | enterprises.cross_border_ratio |
| 跨境物流模式 | 顿号分隔 | enterprises.cross_border_logistics |
| 支付结算方式 | 顿号分隔 | enterprises.payment_settlement |
| 跨境电商团队规模 | 数字 | enterprises.cross_border_team_size |
| 是否在用ERP | 是/否 | enterprises.using_erp |
| 跨境转型意愿 | | enterprises.transformation_willingness |
| 愿意投入转型程度 | | enterprises.investment_willingness |

### Sheet6: 合作与政策信息

| 列名 | 说明 | 导入映射 |
|------|------|----------|
| 企业ID | **必填** | enterprises.id |
| 企业名称 | 仅展示 | - |
| 企业服务合作(1-5星) | 1-5的数字 | enterprises.service_cooperation_rating |
| 招商入驻合作(1-5星) | 1-5的数字 | enterprises.investment_cooperation_rating |
| 孵化转型合作(1-5星) | 1-5的数字 | enterprises.incubation_cooperation_rating |
| 品牌营销合作(1-5星) | 1-5的数字 | enterprises.brand_cooperation_rating |
| 人才培训合作(1-5星) | 1-5的数字 | enterprises.training_cooperation_rating |
| 跨境整体方案(1-5星) | 1-5的数字 | enterprises.overall_cooperation_rating |
| 标杆企业可能性(%) | 0-100的数字 | enterprises.benchmark_possibility |
| 是否享受过政策支持 | 是/否 | enterprises.has_policy_support |
| 已享受政策 | 顿号分隔 | enterprises.enjoyed_policies |
| 行业竞争地位 | | enterprises.competition_position |
| 竞争地位描述 | | enterprises.competition_description |
| 跨境业务痛点 | | enterprises.pain_points |
| 补充说明 | | enterprises.additional_notes |

---

## 导入规则

1. **企业ID为必填项**，用于匹配数据库中的企业记录
2. **只更新有值的字段**，空单元格不会清空已有数据
3. 联系人和产品采用**全量替换**策略（按企业ID分组后删除旧数据再插入新数据）
4. 选项类字段（如区域、行业等）按**显示名称(label)**反向查找ID
5. 多选字段使用**顿号（、）或逗号（,）**分隔
6. 是/否字段只接受"是"和"否"两个值

---

## 前端入口

| 位置 | 操作 | 说明 |
|------|------|------|
| 企业详情页 | 导出Excel按钮 | 导出单个企业的调研表 |
| 企业列表页 | 导出按钮 | 批量导出当前列表/选中企业的调研表 |
| 企业列表页 | 导入按钮 | 上传回收的调研Excel |

---

## 代码文件

### 后端

| 文件 | 说明 |
|------|------|
| `controller/SurveyExcelController.java` | 调研Excel控制器 |
| `service/SurveyExcelService.java` | 服务接口 |
| `service/impl/SurveyExcelServiceImpl.java` | 服务实现（导出/导入核心逻辑） |
| `dto/excel/SurveyBasicInfoData.java` | Sheet1 数据模型 |
| `dto/excel/SurveyContactData.java` | Sheet2 数据模型 |
| `dto/excel/SurveyProductData.java` | Sheet3 数据模型 |
| `dto/excel/SurveyTradeData.java` | Sheet4 数据模型 |
| `dto/excel/SurveyCrossBorderData.java` | Sheet5 数据模型 |
| `dto/excel/SurveyCooperationData.java` | Sheet6 数据模型 |

### 前端

| 文件 | 说明 |
|------|------|
| `services/api.ts` | surveyExcelApi 接口定义 |
| `pages/EnterpriseDetail.original.tsx` | 详情页导出按钮 |
| `pages/EnterpriseList.tsx` | 列表页导入/导出弹窗 |

### 已废弃

| 文件 | 说明 |
|------|------|
| `utils/exportEnterpriseExcel.ts` | 旧的前端导出（已无引用，可删除） |
