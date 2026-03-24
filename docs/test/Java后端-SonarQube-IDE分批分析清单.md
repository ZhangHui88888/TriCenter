# Java 后端 — SonarQube for IDE 分批分析清单

> 用途：在 Cursor 中已安装 **SonarQube for IDE** 时，按**目录 / 体量**拆分，逐批完成静态分析，避免一次扫全库难以消化；同时便于将「本批 Sonar 问题」交给 AI 修复时控制上下文大小。  
> 范围：`backend/src/main/java`（`src/test/java` 当前无测试类，日后若有请追加批次 **T-测试**）。

---

## 1. 重要说明（AI 与 IDE 的边界）

| 项 | 说明 |
|----|------|
| **谁能跑 Sonar** | Sonar 规则在 **本机 Cursor 扩展** 内执行；**仓库内的 AI 无法替你触发扩展或读取其完整问题列表**。 |
| **本清单怎么用** | 你按批次在资源管理器中展开目录、逐个打开文件（或 `Ctrl+S` 触发分析），把 **Problems / Sonar 视图** 中的问题记下来或截图；需要改代码时再让 AI 针对「具体规则 ID + 文件路径 + 片段」协助。 |
| **建议前置** | 本地已能编译后端（JDK 17）：`cd backend && mvn -q compile`，有利于 Java 语言服务与 Sonar 分析稳定。 |

---

## 2. 每批统一操作步骤（复制即用）

1. 在 Cursor 中 **打开文件夹**：`TriCenter` 仓库根（或至少 `backend`）。  
2. 在左侧资源管理器中定位到本批 **路径**（见下表）。  
3. 展开后 **从左到右、从上到下** 打开每个 `.java`，每个文件 **保存一次**（`Ctrl+S`），等待 Sonar 跑完（状态栏/右下角可能有分析提示）。  
4. 打开 **问题** 面板：`Ctrl+Shift+M`；并打开 Sonar 专用视图：`Ctrl+Shift+P` → 输入 `Sonar` → 选择聚焦 Sonar 视图（具体名称随扩展版本略有不同）。  
5. 在本文件 **§5 进度表** 对应行勾选「已扫」，并记下 **问题条数**（可选：仅记 Blocker/Critical/Major）。  
6. 若本批要与 AI 共读：优先只贴 **当前文件** 中带波浪线的代码块 + Sonar 规则说明，避免一次贴整目录。

---

## 3. 分批原则

| 原则 | 做法 |
|------|------|
| **按包目录** | 与分层架构一致（config、entity、mapper、controller、service…），便于归因。 |
| **控制「单批文件数」** | 多数批次约 **13～26** 个文件，适合单次人工扫完。 |
| **控制「单批代码量」** | `dto/response` 单文件较小但个数多，拆成 **R-1 / R-2** 两批，便于 AI 上下文。 |
| **巨型实现类单独成批** | `EnterpriseServiceImpl`、`SurveyExcelServiceImpl` 行数极大，**各单独一批**，避免与 AI 对话时撑爆上下文。 |

**统计（约数，随提交变化）**：`main/java` 下约 **147** 个 `.java`（不含测试）。

---

## 4. 批次定义（按顺序执行）

### 4.1 常规目录批次

| 批次 ID | 路径（相对 `backend/src/main/java`） | 约文件数 | 备注 |
|---------|----------------------------------------|----------|------|
| **B-01** | `com/tricenter/TriCenterApplication.java` + `com/tricenter/annotation/` + `com/tricenter/aspect/` + `com/tricenter/common/` | 7 | 启动类、AOP、统一返回与异常 |
| **B-02** | `com/tricenter/config/` | 7 | 含 `RequirementsConfig` 等较大配置类 |
| **B-03** | `com/tricenter/security/` + `com/tricenter/util/` | 8 | 安全过滤器、JWT、导出/工具类 |
| **B-04** | `com/tricenter/entity/` | 18 | 实体与表映射 |
| **B-05** | `com/tricenter/mapper/` | 15 | MyBatis Mapper 接口 |
| **B-06** | `com/tricenter/dto/request/` + `com/tricenter/dto/excel/` | 26 | 入参 + Excel 行模型 |
| **B-07-R1** | `com/tricenter/dto/response/` **前半**（见 §4.2） | 13 | 字母序 A～F 段 |
| **B-07-R2** | `com/tricenter/dto/response/` **后半**（见 §4.2） | 13 | 字母序 F～U 段 |
| **B-08** | `com/tricenter/controller/` | 13 | HTTP 入口 |
| **B-09** | `com/tricenter/service/`（**不含** `service/impl`） | 14 | Service 接口与非 impl 的类（如缓存服务） |

### 4.2 `dto/response` 两批文件清单（避免半批遗漏）

**B-07-R1（13 个）** — 文件名 A～F 为主：

- `AnalysisStatsResponse.java`
- `CategoryStatsResponse.java`
- `DashboardOverviewResponse.java`
- `DistrictStatsResponse.java`
- `EnterpriseDetailResponse.java`
- `EnterpriseListResponse.java`
- `EnterpriseOverviewStatsResponse.java`
- `FollowUpResponse.java`
- `FollowUpStatsResponse.java`
- `FunnelConversionResponse.java`
- `FunnelStageResponse.java`
- `FunnelTrendResponse.java`
- `ImportResultResponse.java`

**B-07-R2（13 个）**：

- `IndustryStatsResponse.java`
- `LoginResponse.java`
- `MonthlyTrendResponse.java`
- `OptionResponse.java`
- `PatentResponse.java`
- `PendingFollowUpsResponse.java`
- `ProductResponse.java`
- `RequirementConfigResponse.java`
- `RequirementItemAdminResponse.java`
- `TreeCategoryResponse.java`
- `TreeNodeResponse.java`
- `UserOptionResponse.java`
- `UserResponse.java`

### 4.3 实现类批次（大文件单独做）

| 批次 ID | 路径 | 约行数（量级） | 备注 |
|---------|------|----------------|------|
| **B-10a** | `com/tricenter/service/impl/EnterpriseServiceImpl.java` | 1400+ | 企业核心逻辑，建议整文件扫完再记问题 |
| **B-10b** | `com/tricenter/service/impl/SurveyExcelServiceImpl.java` | 1600+ | 调研 Excel，规则易集中在 IO/空指针 |
| **B-10c** | `com/tricenter/service/impl/` **除上述两个以外** 的其余 `*Impl.java` | 11 | 其它 Service 实现 |

---

## 5. 执行进度与结果记录（自行勾选）

| 批次 | 已分析（□/☑） | Sonar 问题数（可选） | 备注 |
|------|----------------|----------------------|------|
| B-01 | □ | | |
| B-02 | □ | | |
| B-03 | □ | | |
| B-04 | □ | | |
| B-05 | □ | | |
| B-06 | □ | | |
| B-07-R1 | □ | | |
| B-07-R2 | □ | | |
| B-08 | □ | | |
| B-09 | □ | | |
| B-10a | □ | | EnterpriseServiceImpl |
| B-10b | □ | | SurveyExcelServiceImpl |
| B-10c | □ | | 其余 impl |

**问题摘录区（可选）**

```
规则键 / 严重级别 / 文件:行 — 一句话描述
```

---

## 6. 终端全量分析（自动化 / 供 AI 跑命令）

若需要**不依赖 IDE 扩展**、在终端重复执行并由 AI 读取 Maven 输出：见 [`docs/tech/SonarQube-Maven终端分析.md`](../tech/SonarQube-Maven终端分析.md)（`backend/pom.xml` 已配置 `sonar-maven-plugin`，需自备 SonarQube 或 SonarCloud + Token）。

---

## 7. 日后扩展

- 若在 `backend/src/test/java` 增加测试代码：新增批次 **T-01**（测试包路径），同样按目录或每 15 文件拆分。  
- 若接入 SonarQube Server / SonarCloud：**Connected Mode** 与 IDE 规则对齐后，本清单仍适用，仅问题列表可能与服务器同步。

---

*文档版本：2026-03-23（与当前 `backend` 包结构一致；文件数随迭代可能变化，以资源管理器为准。）*
