# TriCenter

> 常州跨境电商三中心 — 企业信息管理系统（企业CRUD、跟进记录、看板统计、漏斗分析、市场调研报告）

## 构建与运行

```bash
# 后端（backend，端口 8081）
cd backend && mvn spring-boot:run
cd backend && mvn test                    # 运行测试
cd backend && mvn package -DskipTests     # 构建

# 前端（frontend，端口 3000）
cd frontend && npm install && npm run dev

# Windows 一键启动
start-all.bat
```

## 部署

```bash
# 生产部署（与 Booking-miniapp 共用服务器）
bash deploy.sh
```

| 项目 | 域名 | 后端端口 | Redis DB | 部署路径 |
|------|------|----------|----------|----------|
| Booking-miniapp | admin/api.cz3zx.top | 8080 | 0 | /opt/booking/ |
| TriCenter | czcrop.top / api.czcrop.top | 8081 | 1 | /opt/tricenter/ |

- **Nginx 配置**：`nginx/czcrop.top.conf`（前端）+ `nginx/api.czcrop.top.conf`（API）
- **systemd 服务**：`tricenter.service`（由 deploy.sh 自动创建）
- **Spring Profile**：生产环境使用 `-Dspring.profiles.active=prod`

## 架构概览

- **技术栈**：Spring Boot 3.2 (JDK 17) + React 18 + TypeScript + Vite 5 + MySQL 8.0 + Redis
- **架构模式**：Spring MVC 分层（Controller → Service → Mapper），MyBatis-Plus ORM
- **认证**：JWT（人工用户）+ API Key（系统间调用，如 Booking-miniapp 同步企业数据）
- **前端UI**：Ant Design 5 + Zustand + ECharts 5
- **详细设计**：见 [`docs/tech/技术架构文档.md`](docs/tech/技术架构文档.md)

## 编码约定

- **Git**：Conventional Commits，分支 `main` + `feature/*`
- **后端**：Alibaba Java Coding Guidelines
- **前端**：ESLint，Axios 封装 (`src/services/request.ts`)，**组件文件上限 300 行**，复杂页面按 `tabs/modals/constants/utils` 拆分
- **API 文档**：Knife4j (Swagger) `http://localhost:8081/doc.html`

## 外部依赖

| 依赖 | 用途 |
|------|------|
| MySQL 8.0 | 主数据库（database: tricenter） |
| Redis | 会话缓存（database: 1） |
| Booking-miniapp API | 跨系统企业数据同步（API Key 认证） |
| DeepSeek API | AI 生成市场调研报告内容 |

## 文档导航

- **开发计划** → [`docs/plan/`](docs/plan/)
- **需求与设计** → [`docs/design/`](docs/design/)
- **技术文档** → [`docs/tech/`](docs/tech/)
- **测试记录** → [`docs/test/`](docs/test/)
- **数据库脚本** → [`docs/sql/`](docs/sql/)

完整文档索引见 [`docs/README.md`](docs/README.md)
