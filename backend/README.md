# TriCenter Backend

常州跨境电商三中心 - 企业信息管理系统后端

## 技术栈

- Java 17
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0+
- Redis 7.x
- JWT认证
- Knife4j (Swagger)

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.9+
- MySQL 8.0+
- Redis 7.x

### 2. 数据库初始化

```bash
# 执行SQL脚本（按顺序）
mysql -u root -p tricenter < ../doc/sql/01_create_tables.sql
mysql -u root -p tricenter < ../doc/sql/02_init_system_options.sql
mysql -u root -p tricenter < ../doc/sql/03_init_industry.sql
mysql -u root -p tricenter < ../doc/sql/04_init_product_category.sql
mysql -u root -p tricenter < src/main/resources/db/init_admin.sql
```

### 3. 配置环境变量

修改 `src/main/resources/application-dev.yml` 中的数据库连接信息，或设置环境变量：

```bash
set DB_PASSWORD=your_password
set JWT_SECRET=your_jwt_secret
```

### 4. 启动应用

```bash
# Windows
start.bat

# 或使用Maven
mvn spring-boot:run
```

### 5. 访问API文档

启动后访问: http://localhost:8080/doc.html

## 默认账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| manager | admin123 | 业务主管 |
| user | admin123 | 普通用户 |

## API模块

- `/api/auth/*` - 用户认证
- `/api/options/*` - 基础数据/数据字典
- `/api/enterprises/*` - 企业管理
- `/api/follow-ups/*` - 跟进记录
- `/api/dashboard/*` - 看板统计
- `/api/funnel/*` - 漏斗分析

## 项目结构

```
src/main/java/com/tricenter/
├── TriCenterApplication.java    # 启动类
├── config/                      # 配置类
├── controller/                  # 控制器
├── service/                     # 服务层
├── mapper/                      # 数据访问层
├── entity/                      # 实体类
├── dto/                         # 数据传输对象
├── common/                      # 公共模块
├── security/                    # 安全相关
└── util/                        # 工具类
```
