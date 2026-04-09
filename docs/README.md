# 文档目录说明

> TriCenter — 常州跨境电商三中心企业信息管理系统

---

## 目录结构

```
docs/
├── README.md          # 本文件 — 文档导航索引
├── plan/              # 项目管理：里程碑、模块级任务清单
├── design/            # 需求与设计：需求文档、功能规格、交互流程（按模块拆分）
├── tech/              # 技术文档：架构、API设计、数据库、部署、运维
├── test/              # 测试记录（按模块组织）
└── sql/               # 数据库脚本（schema.sql + init.sql + scripts/）
```

---

## `plan/` — 项目管理

| 文档 | 说明 |
|------|------|
| [开发计划.md](./plan/开发计划.md) | 项目开发进度总览，已完成功能与待开发任务 |
| [数据分析系统开发计划.md](./plan/数据分析系统开发计划.md) | 数据分析模块开发计划与里程碑 |

## `design/` — 需求与设计

| 文档 | 说明 |
|------|------|
| [跨境电商企业需求文档.md](./design/跨境电商企业需求文档.md) | 核心需求文档：业务背景、用户角色、功能需求 |
| [数据分析系统项目需求文档.md](./design/数据分析系统项目需求文档.md) | 数据分析模块需求：看板、阶段分布、报表、企业列表筛选交互 |
| [企业管理页面设计.md](./design/企业管理页面设计.md) | 企业管理页顶部概览区设计：两张卡片与柱状图空态骨架 |
| [企业需求分类与映射表v2.md](./design/企业需求分类与映射表v2.md) | 企业需求分类体系与维度→需求ID映射（与 `frontend/src/data/requirementsData.ts` 对账） |
| [调研Excel导入导出功能.md](./design/调研Excel导入导出功能.md) | 调研表 Excel 导入导出的业务流程和技术实现 |
| [企业详情-导出Excel功能.md](./design/企业详情-导出Excel功能.md) | 企业详情页导出 Excel 的 Sheet 结构与字段映射 |
| [市场调研模块设计文档.md](./design/市场调研模块设计文档.md) | 市场调研模块需求设计：总览、数据查询、AI分析、竞品分析、报告模板 |
| [调研报告字段映射分析.md](./design/调研报告字段映射分析.md) | 调研报告所需企业字段与数据库字段的对照分析，含缺失字段建议 |
| [服务商管理页面设计.md](./design/服务商管理页面设计.md) | 服务商管理页面设计：列表筛选、CRUD、后端接口 |
| [Trooly AI企业分析报告.md](./design/Trooly%20AI企业分析报告.md) | 基于企业手册提炼的 Trooly AI 优势、劣势、风险与合作建议报告 |
| [Trooly AI合作沟通提问清单.md](./design/Trooly%20AI合作沟通提问清单.md) | 与 Trooly 会前准备的甲方提问提纲，聚焦样本质量、访谈可信度、交付与合作风险 |
| [企业数据导入字段映射.md](./design/企业数据导入字段映射.md) | Excel 企业数据批量导入字段映射：36列→企业详情页各标签页字段对照与待确认问题 |

## `tech/` — 技术文档

| 文档 | 说明 |
|------|------|
| [技术架构文档.md](./tech/技术架构文档.md) | 技术选型、分层架构、核心依赖 |
| [API设计文档.md](./tech/API设计文档.md) | 后端 API 接口定义、参数、响应结构（含企业列表高级筛选参数） |
| [数据库设计文档.md](./tech/数据库设计文档.md) | 表结构（17张表）、字段说明、外键关系 |
| [前后端审核基线.md](./tech/前后端审核基线.md) | 前端页面、API 封装、后端 Controller/DTO 的当前契约基线与增量复审入口 |
| [数据库审核基线.md](./tech/数据库审核基线.md) | 功能到数据表/字段的复审基线、重点风险与数据库增量复审入口 |
| [跨系统数据连通设计.md](./tech/跨系统数据连通设计.md) | TriCenter ↔ Booking-miniapp 数据互通方案 |
| [AI记忆管理通用方案.md](./tech/AI记忆管理通用方案.md) | 多 AI 工具冷热分离记忆管理方案 |
| [SonarQube-Maven终端分析.md](./tech/SonarQube-Maven终端分析.md) | 本地 Docker / SonarCloud + `mvn sonar:sonar` 终端全量分析（可与 IDE 扩展并存） |

## `test/` — 测试记录

按模块组织的 API 测试文档，详见 [test/README.md](./test/README.md)。

| 文档 | 模块 | 状态 |
|------|------|------|
| [企业全字段数据库验收清单.md](./test/企业全字段数据库验收清单.md) | 企业字段 **仅「详情编辑落库」一列** + 查库；列表空创建不占列 | ✅ 已按 HTTP API+DB（2026-03-23）勾选 |
| [企业字段-前端API库映射.md](./test/企业字段-前端API库映射.md) | 列表/详情 Tab/Modal → `PUT` 字段 → 库列溯源，供上表配套 | 2026-03-23 首版 |
| [企业API验收执行记录-20260323.md](./test/企业API验收执行记录-20260323.md) | 本地 `POST`/`PUT` + MySQL 核对摘要（样例企业 id=6/7） | 2026-03-23 |
| [模块1-用户认证.md](./test/模块1-用户认证.md) | 用户认证（4个API） | ✅ 已测试 |
| [模块2-基础数据.md](./test/模块2-基础数据.md) | 基础数据/数据字典（8个API） | ✅ 已测试 |
| [模块3-企业管理.md](./test/模块3-企业管理.md) | 企业管理（12个API） | ⏳ 待测试 |
| [模块4-企业产品.md](./test/模块4-企业产品.md) | 企业产品管理（4个API） | ⏳ 待测试 |
| [模块5-跟进记录.md](./test/模块5-跟进记录.md) | 跟进记录（5个API） | ⏳ 待测试 |
| [模块6-看板统计.md](./test/模块6-看板统计.md) | 看板统计（5个API） | ⏳ 待测试 |
| [Java后端-SonarQube-IDE分批分析清单.md](./test/Java后端-SonarQube-IDE分批分析清单.md) | 本地 IDE 按目录/大文件拆分扫 Java，控制上下文 | 2026-03-23 首版 |

## `sql/` — 数据库脚本

| 文档 | 说明 |
|------|------|
| [tricenter_schema.sql](./sql/tricenter_schema.sql) | 表结构定义（19张表：users、enterprises、follow_ups、providers、market_reports 等） |
| [tricenter_init.sql](./sql/tricenter_init.sql) | 初始化数据（系统选项、行业分类、产品品类、需求、默认用户） |
| scripts/ | 上线后每次更新的迁移脚本 |
| [scripts/06_add_requirement_recommended.sql](./sql/scripts/06_add_requirement_recommended.sql) | requirements 表新增 is_recommended 字段（推荐需求优先展示） |
| [scripts/06_merge_crossborder_revenue.sql](./sql/scripts/06_merge_crossborder_revenue.sql) | 跨境营收字段统一：废弃 cross_border_revenue_wan/id，合并到 last_year_revenue |
