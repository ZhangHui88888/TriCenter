---
inclusion: fileMatch
fileMatchPattern: "**/test-module*.ps1"
---

# API测试脚本开发规范

## 测试脚本命名规则
- 按模块命名：`test-module{N}-{name}.ps1`
- 例如：`test-module1-auth.ps1`、`test-module2-options.ps1`

## 已知问题与避免方法

### 1. 中文字符编码问题
**问题**：PowerShell脚本中使用中文字符串进行断言比较时，可能因编码问题导致比较失败。

**解决方案**：
- 在断言比较中使用英文字符串，避免中文
- 例如：用 `"Updated_Label"` 而不是 `"更新后的名称"`
- 中文仅用于日志输出（Write-Pass/Write-Fail/Write-Info）

**示例**：
```powershell
# 错误示例 - 可能因编码问题失败
$result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/$id" -Body @{ label = "更新后的名称" }
if ($result.Data.data.label -eq "更新后的名称") { ... }

# 正确示例 - 使用英文进行断言
$result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/$id" -Body @{ label = "Updated_Label" }
if ($result.Data.data.label -eq "Updated_Label") { ... }
```

### 2. 文件编码保存
**问题**：通过工具创建的脚本可能存在编码问题。

**解决方案**：创建脚本后执行以下命令确保UTF-8编码：
```powershell
$content = Get-Content "test-module{N}-{name}.ps1" -Raw -Encoding UTF8
Set-Content "test-module{N}-{name}.ps1" -Value $content -Encoding UTF8 -NoNewline
```

### 3. 需要登录的模块
**问题**：模块2及之后的模块都需要先登录获取Token。

**解决方案**：在脚本开头添加登录前置条件：
```powershell
# 前置条件：登录获取Token
Write-Test "前置条件：登录获取Token"
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "admin123" } -UseToken $false
if ($result.Success -and $result.Data.data.token) {
    $script:Token = $result.Data.data.token
    Write-Pass "登录成功，获取到Token"
} else {
    Write-Fail "登录失败，无法继续测试"
    exit 1
}
```

## 测试脚本模板结构

```powershell
# ============================================================
# TriCenter API 测试脚本 - 模块N: 模块名称
# 使用方法: 在 backend 目录下运行 .\test-moduleN-name.ps1
# ============================================================

$BaseUrl = "http://localhost:8080"
$Token = ""
$TestResults = @()
$PassCount = 0
$FailCount = 0

# 公共函数定义...

# 前置条件（如需要登录）...

# 测试用例...

# 测试汇总报告...
```

## 运行测试
```powershell
# 在 backend 目录下运行
.\test-module1-auth.ps1      # 模块1：用户认证
.\test-module2-options.ps1   # 模块2：基础数据/数据字典
```
