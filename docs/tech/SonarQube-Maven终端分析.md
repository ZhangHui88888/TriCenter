# SonarQube：Maven 终端分析（供自动化 / AI 读日志）

> 目标：不依赖 Cursor 扩展，在**终端**执行分析，输出上传至 SonarQube / SonarCloud；AI 助手可通过运行同一命令并阅读终端结果，协助解读与排期修复。  
> 本仓库已在 `backend/pom.xml` 中声明 `sonar-maven-plugin` 与 `sonar.*` 项目属性；**Token 与服务器地址不得写入 Git**。

---

## 1. 能力与边界

| 能力 | 说明 |
|------|------|
| **可以做到** | 本机或 CI 执行 `mvn … sonar:sonar`，终端有扫描日志；浏览器打开 Sonar 项目页查看全部问题。 |
| **做不到** | AI **无法**直接操作你 IDE 里的 SonarQube for IDE 扩展；自动化指的是 **Maven + 服务端**。 |
| **前置条件** | 可访问的 **SonarQube 实例**（本地 Docker 或公司服务器）或 **SonarCloud** 项目 + **User Token**。 |

---

## 2. 本地 SonarQube（Docker，适合个人）

1. 启动（首次需等待初始化，内存建议 ≥ 4GB）：

```bash
docker run -d --name sonarqube -p 9000:9000 -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true sonarqube:community
```

若 `docker pull` 报错含 **`auth.docker.io`**、**`EOF`**、**`failed to authorize`**，说明本机到 **Docker Hub** 的网络不通或被拦截，AI 在你电脑上也无法绕过。可按序尝试：

1. **Docker Desktop 登录**：右上角登录 **Docker Hub**（免费账号即可），再执行 `docker pull sonarqube:community`。  
2. **代理**：若本机需代理才能访问外网，在 Docker Desktop → **Settings → Resources → Proxies**（或 **Docker Engine** 里配置 `proxies`）与系统代理一致。  
3. **镜像加速**：在云厂商控制台申请 **Docker 镜像加速器**，在 Docker Desktop → **Settings → Docker Engine** 的 JSON 中增加 `"registry-mirrors": ["https://你的加速器地址"]`，**Apply & restart** 后再拉取。  
4. **备用**：在能访问 Docker Hub 的机器上 `docker pull` + `docker save`，将 tar 拷到本机后 `docker load -i xxx.tar`，再按原命令 `docker run …`（镜像名与 `docker images` 一致即可）。

2. 浏览器打开 `http://localhost:9000`，默认 `admin` / `admin`，按提示改密码。
3. **My Account → Security → Generate Token**，复制 Token（只显示一次）。  
4. 在 SonarQube 内若提示创建项目，可按 `sonar.projectKey` 与 Maven 分析向导创建；或首次分析时由 Scanner 自动关联（视版本与设置而定）。

5. 在仓库中执行（**将 `YOUR_TOKEN` 换为真实 Token，勿提交到 Git**）：

```bash
cd backend
mvn clean verify sonar:sonar ^
  -Dsonar.host.url=http://localhost:9000 ^
  -Dsonar.token=YOUR_TOKEN
```

（Linux / macOS 将 `^` 换为行尾 `\`，或写成一行。）

6. 终端若显示 `ANALYSIS SUCCESSFUL`，回到 SonarQube 网页打开对应项目即可浏览问题列表。

---

## 3. SonarCloud（适合开源与 CI）

1. 在 [SonarCloud](https://sonarcloud.io) 导入 Git 仓库或手动创建项目，记录 **Organization**、**Project Key**。  
2. 生成 **Token**，并视官方文档配置 `sonar.organization` 等参数。示例：

```bash
cd backend
mvn clean verify sonar:sonar \
  -Dsonar.host.url=https://sonarcloud.io \
  -Dsonar.token=YOUR_TOKEN \
  -Dsonar.organization=你的组织Key \
  -Dsonar.projectKey=你的项目Key
```

（若与 `pom.xml` 中 `sonar.projectKey` 不一致，以命令行 `-D` 为准。）

---

## 4. Windows 一键脚本（可选）

使用 `backend/run-sonar.ps1`：

**方式 A**：当前会话环境变量（勿把 Token 提交到 Git）：

```powershell
$env:SONAR_TOKEN = '你的Token'
$env:SONAR_HOST_URL = 'http://localhost:9000'   # 可选，默认即此
.\run-sonar.ps1
```

**方式 B**（适合 Cursor 代跑脚本）：在 `backend` 目录新建 **`.sonar-token.local`**，**仅一行**粘贴 Token；该文件已列入 `backend/.gitignore`，不要提交。未设置 `SONAR_TOKEN` 时脚本会自动读取该文件。

---

## 5. 与 IDE 扩展的关系

- **IDE 扩展**：改代码时即时提示，体验好。  
- **Maven + 服务端**：全量扫描、历史趋势、质量门禁、**终端可重复执行**，便于 AI 在同一命令下协助你对比前后两次分析。

两者可同时使用；规则集在「连接模式」下可与服务器对齐（见 Sonar 官方文档）。

---

## 6. 本项目已配置的 Maven 属性（摘要）

| 属性 | 值 |
|------|-----|
| `sonar.projectKey` | `com.tricenter:tricenter-backend` |
| `sonar.projectName` | `TriCenter Backend` |
| `sonar.sources` / `sonar.tests` | `src/main/java`、`src/test/java` |
| `sonar.java.binaries` | `target/classes` |

分析前需成功执行 **`compile`/`verify`**（`clean verify sonar:sonar` 已包含编译）。

---

*最后更新：2026-03-23*
