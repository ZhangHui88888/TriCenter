# 项目背景

## 项目名称
常州跨境电商三中心 - 企业信息管理系统（TriCenter）

## 项目目的
管理和跟踪区域内跨境电商相关企业的信息、转化状态和跟进记录，支持企业孵化和服务工作。

## 技术栈
- 前端：React + TypeScript + Ant Design + ECharts
- 后端：Java + Spring Boot 3.2.x + MyBatis-Plus
- 数据库：MySQL 8.0+（数据库名：tricenter）
- 缓存：Redis 7.x
- 认证：Spring Security + JWT
- API文档：Knife4j (Swagger)

## 核心功能模块
1. 用户认证（4个API）
2. 基础数据/数据字典（8个API）
3. 企业管理（12个API）- 核心模块
4. 企业产品管理（4个API）
5. 跟进记录（5个API）
6. 看板统计（5个API）
7. 漏斗分析（3个API）

## 关键文档
- 需求文档：`doc/数据分析系统项目需求文档.md`
- API设计：`doc/后端API模块设计.md`
- 技术架构：`doc/技术架构文档.md`
- 数据库设计：`doc/数据库设计文档.md`
- SQL脚本：`doc/sql/` 目录
- API测试记录：`doc/test/` 目录

## 环境配置
- 开发环境：`.env` / `application-dev.yml`
- 生产环境：`.env.production` / `application-prod.yml`

## 当前进度
- [x] 前端开发完成
- [x] 前端登录页面完成
- [x] 数据库设计完成
- [x] SQL脚本执行完成
- [x] 环境配置完成
- [x] 后端项目框架搭建完成
- [x] 模块1：用户认证（4个API）✅ 已完成
- [x] 模块2：基础数据/数据字典（8个API）✅ 已完成
- [x] 模块3：企业管理（11/12个API）✅ 基本完成
  - ✅ 3.1 企业列表 GET /api/enterprises
  - ✅ 3.2 企业详情 GET /api/enterprises/:id
  - ✅ 3.3 新增企业 POST /api/enterprises
  - ✅ 3.4 编辑企业 PUT /api/enterprises/:id
  - ✅ 3.5 删除企业 DELETE /api/enterprises/:id
  - ✅ 3.6 变更漏斗阶段 PATCH /api/enterprises/:id/stage
  - ✅ 3.7 批量导入 POST /api/enterprises/import
  - ✅ 3.8 导出企业 GET /api/enterprises/export
  - ✅ 3.9 获取导入模板 GET /api/enterprises/template
  - ✅ 3.10 获取企业跟进记录 GET /api/enterprises/:id/follow-ups
  - ✅ 3.11 更新企业联系人 PUT /api/enterprises/:id/contacts
  - ⏳ 3.12 企业数据分析 GET /api/enterprises/analysis（待开发）
- [x] 模块4：企业产品管理（4个API）✅ 已完成
  - ✅ 4.1 添加企业产品 POST /api/enterprises/:id/products
  - ✅ 4.2 更新企业产品 PUT /api/enterprises/:id/products/:productId
  - ✅ 4.3 删除企业产品 DELETE /api/enterprises/:id/products/:productId
  - ✅ 4.4 企业专利管理 POST/PUT/DELETE /api/enterprises/:id/patents
- [x] 模块5：跟进记录（5个API）✅ 已完成
  - ✅ 5.1 跟进记录列表 GET /api/follow-ups
  - ✅ 5.2 新增跟进记录 POST /api/follow-ups
  - ✅ 5.3 编辑跟进记录 PUT /api/follow-ups/:id
  - ✅ 5.4 删除跟进记录 DELETE /api/follow-ups/:id
  - ✅ 5.5 跟进统计 GET /api/follow-ups/stats
  - ✅ 附加 获取企业跟进记录 GET /api/enterprises/:id/follow-ups
- [x] 模块6：看板统计（5个API）✅ 已完成
  - ✅ 6.1 统计概览 GET /api/dashboard/overview
  - ✅ 6.2 漏斗阶段分布 GET /api/dashboard/funnel
  - ✅ 6.3 区域分布 GET /api/dashboard/districts
  - ✅ 6.4 行业分布 GET /api/dashboard/industries
  - ✅ 6.5 待跟进提醒 GET /api/dashboard/pending-follow-ups
- [x] 模块7：漏斗分析（3个API）✅ 已完成（测试通过 2026-02-03）
  - ✅ 7.1 漏斗数据 GET /api/funnel/data
  - ✅ 7.2 转化率数据 GET /api/funnel/conversion
  - ✅ 7.3 趋势数据 GET /api/funnel/trend
- [x] 前端mock数据迁移 ✅ 已完成
  - ✅ Dashboard.tsx - 改用 dashboardApi
  - ✅ EnterpriseList.tsx - 改用 enterpriseApi + optionsApi
  - ✅ FollowUpRecords.tsx - 改用 followUpApi
  - ✅ FunnelAnalysis.tsx - 改用 dashboardApi.getFunnelStats
  - ✅ EnterpriseDetail.original.tsx - 改用 enterpriseApi + optionsApi

## 开发完成度
- 总API数：41个
- 已完成：40个（97.6%）
- 待开发：1个（3.12 企业数据分析）

## 开发顺序
按 `doc/后端API模块设计.md` 中的"开发顺序建议"执行

## 后端项目结构
```
backend/
├── pom.xml
├── start.bat
├── README.md
└── src/main/java/com/tricenter/
    ├── TriCenterApplication.java
    ├── config/
    │   ├── SecurityConfig.java
    │   ├── MybatisPlusConfig.java
    │   ├── RedisConfig.java
    │   ├── SwaggerConfig.java
    │   └── DataInitializer.java
    ├── controller/
    │   └── AuthController.java
    ├── service/
    │   ├── AuthService.java
    │   └── impl/AuthServiceImpl.java
    ├── mapper/
    │   └── UserMapper.java
    ├── entity/
    │   └── User.java
    ├── dto/
    │   ├── request/
    │   │   ├── LoginRequest.java
    │   │   └── ChangePasswordRequest.java
    │   └── response/
    │       ├── LoginResponse.java
    │       └── UserResponse.java
    ├── security/
    │   ├── JwtAuthenticationFilter.java
    │   └── LoginUser.java
    ├── common/
    │   ├── result/
    │   │   ├── Result.java
    │   │   └── PageResult.java
    │   └── exception/
    │       ├── BusinessException.java
    │       └── GlobalExceptionHandler.java
    └── util/
        └── JwtUtil.java
```

## 前端登录相关文件
- `frontend/src/pages/Login.tsx` - 登录页面
- `frontend/src/stores/authStore.ts` - 认证状态管理
- `frontend/src/components/AuthGuard.tsx` - 路由守卫

## 默认账号
- 用户名：admin
- 密码：admin123

## 启动方式
- 一键启动：双击 `start-all.bat`
- 单独启动后端：`start-backend.bat` 或在 backend 目录执行 `mvn spring-boot:run "-Dspring-boot.run.profiles=dev"`
- 单独启动前端：`start-frontend.bat` 或在 frontend 目录执行 `npm run dev`

## 访问地址
- 前端：http://localhost:3000
- 后端：http://localhost:8080
- API文档：http://localhost:8080/doc.html

## 注意事项
- 数据库密码配置在 `.env` 文件中（DB_PASSWORD）
- 后端会在启动时自动初始化/更新 admin 用户密码
- JWT 密钥需要至少 512 bits（已在 application-dev.yml 中配置）
- **每次有新进展时必须更新本 steering 文档的"当前进度"部分**


## 测试要求

### 基本要求
- 每个后端API开发完成后必须进行功能测试
- 测试结果按模块记录在 `doc/test/` 目录下对应文件
- 测试脚本位于 `backend/test-api.ps1`

### 测试文档规范
每个API的测试记录必须包含：
1. **认证要求** - 标明是公开(🔓)、需认证(🔒)还是需管理员(🔐)
2. **前置条件** - 说明需要先调用哪些API（如登录获取Token）
3. **前置API调用步骤** - 详细列出每一步的入参和出参
4. **请求格式** - 完整的请求路径、Header、Body格式
5. **响应格式** - 预期的响应JSON结构
6. **测试用例表** - 包含：测试场景、前置条件、请求入参、预期响应、实际结果、状态

### 边际测试覆盖
每个API必须测试以下边际情况（适用的）：
- 空值（空字符串、null）
- 超长值（超过字段长度限制）
- 特殊字符（<script>、SQL关键字等）
- SQL注入（' OR '1'='1 等）
- 负数和零值
- 不存在的ID（如99999）
- 无效的枚举值
- 无Token访问需认证API
- 无效/过期Token
- 权限不足（普通用户访问管理员API）

### 测试流程
1. 开发完成API后，先运行测试脚本验证
2. 更新测试文档，记录测试结果
3. 失败的测试记录到"问题记录"表
4. 修复后重新测试并更新状态
