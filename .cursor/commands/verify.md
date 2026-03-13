# 提交前全面验证

在提交代码前执行以下检查清单：

## 1. 构建检查
- 后端：`cd backend && mvn package -DskipTests`
- 前端：`cd frontend && npm run build`
- 确认无编译错误

## 2. 测试检查
- 后端：`cd backend && mvn test`
- 确认测试覆盖率不低于现有水平
- 检查是否有跳过的测试（skip/xfail）

## 3. 代码质量
- 运行 linter 检查
- 检查是否有 `console.log`、`debugger`、`TODO` 遗留
- 确认无硬编码的密钥或凭据

## 4. 安全扫描
- 检查依赖是否有已知漏洞
- 确认无 .env 文件被提交
- 检查 SQL 注入、XSS 等常见安全问题

## 5. 输出
以清单形式报告每项检查的通过/失败状态，标注需要修复的问题。
