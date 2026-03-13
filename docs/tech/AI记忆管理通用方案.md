# AI 多工具记忆管理通用方案

> 适用于同一项目中使用多个 AI 编码助手（Cursor、Windsurf/Cascade、Kiro、Claude Code、Copilot 等）的场景。
> 目标：**一份冷状态 + 各自热状态，所有工具共享项目认知，避免重复维护。**

---

## 一、核心架构：冷热分离

```
项目根目录/
├── AGENTS.md                    # 🧊 冷状态：项目入口（所有AI工具自动发现）
├── docs/                        # 🧊 冷状态：详细项目文档（AGENTS.md 指向这里）
│   ├── tech/                    #    技术架构、API设计、数据库设计
│   ├── design/                  #    需求文档、设计文档
│   ├── plan/                    #    开发计划、进度跟踪
│   └── ...
├── .cursor/
│   ├── rules/memory.mdc         # 🔧 Cursor 规则：指向热状态文件
│   └── memory/context.md        # 🔥 热状态：Cursor 会话断点
├── .kiro/
│   └── steering/project-context.md  # 🔧 Kiro 指引：精简为指向 AGENTS.md
├── .windsurfrules               # 🔧 Windsurf 规则：包含读取 AGENTS.md 指令
└── .gitignore                   # 热状态文件加入 gitignore
```

### 冷状态 vs 热状态

| 维度 | 🧊 冷状态 | 🔥 热状态 |
|------|----------|----------|
| 内容 | 项目架构、技术栈、约定、API设计、开发进度 | 当前任务、已完成、下一步、阻塞问题 |
| 变更频率 | 有新功能/架构变化时更新 | 每次会话结束时覆盖 |
| 版本控制 | ✅ Git 跟踪 | ❌ gitignore（本地状态） |
| 共享范围 | 所有 AI 工具 + 团队成员 | 单工具、单用户 |
| 大小 | 不限（可通过链接拆分） | ≤ 500 Token |
| 载体 | `AGENTS.md` + `docs/` | 各工具自有的状态文件 |

---

## 二、冷状态：`AGENTS.md` 编写规范

### 为什么放在根目录？

`AGENTS.md` 是行业事实标准，以下工具会**自动发现并读取**项目根目录的此文件：
- Claude Code
- Cursor（通过 rules 配置）
- Windsurf（通过 .windsurfrules 引用）
- Kiro（通过 steering 引用）
- GitHub Copilot（部分支持）

### 模板结构

```markdown
# AGENTS.md

> 本文件为 AI 编码助手提供项目上下文。所有 AI 工具应在会话开始时读取此文件。
> 详细文档见 `docs/` 目录，导航索引见 `docs/README.md`。

## Project Overview
<!-- 一句话描述项目 -->

## Build & Run Commands
<!-- 启动、测试、构建命令，直接可复制执行 -->

## Architecture
<!-- 分层架构、核心模块、技术选型摘要 -->

## API Namespaces
<!-- API 路由前缀和功能分组 -->

## Authentication
<!-- 认证方式、默认账号（仅限开发环境） -->

## Database
<!-- 数据库类型、ORM、关键约定 -->

## Key Conventions
<!-- 代码风格、Git 规范、文档规范 -->

## External Dependencies
<!-- 外部服务依赖（数据库、缓存、消息队列等） -->

## Documentation Map
<!-- 指向 docs/ 下详细文档的链接 -->
- 技术架构：`docs/tech/技术架构文档.md`
- API 设计：`docs/tech/API设计文档.md`
- 开发计划：`docs/plan/开发计划.md`
- ...
```

### 关键原则

1. **控制在 100-150 行以内** — 这是入口摘要，不是百科全书
2. **详细内容指向 `docs/`** — 避免在 AGENTS.md 中重复 docs 已有的信息
3. **包含可执行命令** — 构建、测试、启动命令必须直接可复制粘贴
4. **写给 AI 看** — 不需要花哨格式，重点是准确、结构化、无歧义

---

## 三、热状态：会话断点管理

### 3.1 通用热状态模板

```markdown
## 当前任务
<!-- 一句话描述正在做什么 -->

## 已完成
- [x] 具体完成的步骤

## 下一步
- [ ] 接下来要做的事

## 阻塞问题
<!-- 如果有卡住的地方 -->
```

### 3.2 各工具的热状态配置

#### Cursor

文件：`.cursor/rules/memory.mdc`
```yaml
---
description: "会话开始时读取热状态，保存/结束时写入"
alwaysApply: true
---

# 记忆协议

## 会话开始
读取 `.cursor/memory/context.md`，用 2-3 行确认当前状态。

## 用户说"保存"/"checkpoint"
将当前任务状态覆盖写入 `.cursor/memory/context.md`，≤500 Token。

## 用户说"结束"/"收工"
1. 提取经验追加到 `.cursor/memory/learnings.md`
2. 压缩 context.md 为最小可恢复摘要
```

热状态文件：`.cursor/memory/context.md`
加入 `.gitignore`：
```
.cursor/memory/
```

#### Windsurf / Cascade

在 `.windsurfrules` 中添加：
```markdown
## 记忆协议

1. 会话开始时，先读取 `AGENTS.md` 获取项目上下文
2. 如需了解详细架构/API/进度，读取 `docs/` 对应文档（参考 `docs/README.md` 导航）
3. Windsurf 内置 memory 系统用于热状态管理，无需额外文件
```

> Windsurf 有内置的 persistent memory 系统，不需要像 Cursor 那样用文件做热状态。

#### Kiro

文件：`.kiro/steering/project-context.md`，精简为：
```markdown
# 项目上下文

本项目的完整上下文信息维护在以下位置：
- **项目入口**：`AGENTS.md`（根目录）
- **详细文档**：`docs/`（参考 `docs/README.md`）

AI 助手应在会话开始时读取 `AGENTS.md`，按需深入 `docs/` 对应文档。
```

#### Claude Code

Claude Code 自动读取根目录 `AGENTS.md`，无需额外配置。

---

## 四、`docs/` 文档体系规范

### 目录结构

```
docs/
├── README.md          # 📋 文档导航索引（必须维护）
├── plan/              # 项目管理：开发计划、里程碑、进度
├── design/            # 需求与设计：需求文档、设计文档
├── tech/              # 技术文档：架构、API、数据库、集成
├── sql/               # 数据库脚本（按序号命名）
└── test/              # 测试文档：测试记录、测试规范
```

### 维护规则

1. **新建文档必须登记** — 同步更新 `docs/README.md`
2. **归入正确子目录** — 禁止散放在 `docs/` 根目录
3. **功能变更同步更新** — 代码改了，对应文档也要更新
4. **删除文档同步清理** — 从 `docs/README.md` 移除条目

---

## 五、新项目快速初始化清单

在新项目中应用此方案，按顺序执行：

### Step 1：创建 AGENTS.md
在项目根目录创建 `AGENTS.md`，按模板填写项目概览、构建命令、架构摘要。

### Step 2：建立 docs/ 体系
```bash
mkdir -p docs/{plan,design,tech,feature,sql,test}
```
创建 `docs/README.md` 作为导航索引。

### Step 3：配置各工具指向

| 工具 | 配置文件 | 操作 |
|------|---------|------|
| Cursor | `.cursor/rules/memory.mdc` | 热状态协议，指向 `.cursor/memory/context.md` |
| Cursor | `.gitignore` | 添加 `.cursor/memory/` |
| Windsurf | `.windsurfrules` | 添加"先读 AGENTS.md"指令 |
| Kiro | `.kiro/steering/project-context.md` | 精简为指向 AGENTS.md |
| Claude Code | 无需配置 | 自动读取 AGENTS.md |

### Step 4：验证
分别用每个 AI 工具开新会话，确认它们能正确读取项目上下文。

---

## 六、常见问题

### Q: 多个工具会不会互相覆盖冷状态？
不会。冷状态（`AGENTS.md` + `docs/`）是版本控制的，任何工具的修改都会体现在 Git diff 中，你可以审查后决定是否保留。

### Q: 热状态需要 Git 跟踪吗？
不需要。热状态是个人的、临时的会话断点，应该加入 `.gitignore`。Windsurf 用内置 memory 系统，Cursor 用 `.cursor/memory/`，都不需要提交。

### Q: AGENTS.md 和 README.md 什么区别？
- `README.md` — 写给人看的，项目介绍、安装说明、使用文档
- `AGENTS.md` — 写给 AI 看的，构建命令、架构摘要、开发约定、代码导航

### Q: 如果项目很小，需要这么复杂吗？
不需要。最小可行方案：只创建 `AGENTS.md`，把项目概览和构建命令写进去即可。`docs/` 体系和热状态管理按需添加。

### Q: Kiro 的 steering 文件能不能完全删除？
可以保留一个精简版指向 AGENTS.md。Kiro 的 steering 有一些特定功能（如自动更新进度），完全删除可能丢失这些能力，建议保留但精简。
