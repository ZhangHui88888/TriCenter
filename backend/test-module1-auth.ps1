# ============================================================
# TriCenter API 测试脚本 - 模块1: 用户认证
# 使用方法: 在 backend 目录下运行 .\test-module1-auth.ps1
# ============================================================

$BaseUrl = "http://localhost:8080"
$Token = ""
$TestResults = @()
$PassCount = 0
$FailCount = 0

# 颜色输出函数
function Write-Pass { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Test { param($msg) Write-Host "`n=== $msg ===" -ForegroundColor Yellow }

# 记录测试结果
function Add-Result {
    param($api, $scenario, $expected, $actual, $passed)
    $script:TestResults += [PSCustomObject]@{
        API = $api
        Scenario = $scenario
        Expected = $expected
        Actual = $actual
        Passed = $passed
    }
    if ($passed) { $script:PassCount++ } else { $script:FailCount++ }
}

# 发送HTTP请求
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$UseToken = $true,
        [string]$CustomToken = ""
    )
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($UseToken -and $script:Token) {
        $headers["Authorization"] = "Bearer $script:Token"
    }
    if ($CustomToken) {
        $headers["Authorization"] = "Bearer $CustomToken"
    }
    
    $params = @{
        Method = $Method
        Uri = "$BaseUrl$Endpoint"
        Headers = $headers
        ContentType = "application/json"
    }

    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params -ErrorAction Stop
        return @{ Success = $true; Data = $response; StatusCode = 200 }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorBody = $null
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd() | ConvertFrom-Json
        } catch {}
        return @{ Success = $false; StatusCode = $statusCode; Error = $errorBody; Message = $_.Exception.Message }
    }
}

# ============================================================
# 模块1: 用户认证测试
# ============================================================

Write-Test "模块1: 用户认证测试"

# 1.1 登录测试
Write-Info "测试 POST /api/auth/login"

# 正常登录
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "admin123" } -UseToken $false
if ($result.Success -and $result.Data.data.token) {
    $script:Token = $result.Data.data.token
    Write-Pass "正常登录成功，获取到Token"
    Add-Result "POST /api/auth/login" "正常登录" "返回token" "成功" $true
} else {
    Write-Fail "正常登录失败: $($result.Message)"
    Add-Result "POST /api/auth/login" "正常登录" "返回token" "失败" $false
}

# 用户名为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = ""; password = "admin123" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "用户名为空 - 正确返回400"
    Add-Result "POST /api/auth/login" "用户名为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "用户名为空 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/login" "用户名为空" "400" "$($result.StatusCode)" $false
}

# 密码为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "密码为空 - 正确返回400"
    Add-Result "POST /api/auth/login" "密码为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "密码为空 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/login" "密码为空" "400" "$($result.StatusCode)" $false
}

# 用户名不存在
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "notexist"; password = "123456" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 401) {
    Write-Pass "用户名不存在 - 正确返回401"
    Add-Result "POST /api/auth/login" "用户名不存在" "401" "$($result.StatusCode)" $true
} else {
    Write-Fail "用户名不存在 - 预期401，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/login" "用户名不存在" "401" "$($result.StatusCode)" $false
}

# 密码错误
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "wrongpassword" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 401) {
    Write-Pass "密码错误 - 正确返回401"
    Add-Result "POST /api/auth/login" "密码错误" "401" "$($result.StatusCode)" $true
} else {
    Write-Fail "密码错误 - 预期401，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/login" "密码错误" "401" "$($result.StatusCode)" $false
}

# SQL注入测试
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin' OR '1'='1"; password = "test" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 401) {
    Write-Pass "SQL注入测试 - 正确拒绝"
    Add-Result "POST /api/auth/login" "SQL注入" "401" "$($result.StatusCode)" $true
} else {
    Write-Fail "SQL注入测试 - 可能存在漏洞"
    Add-Result "POST /api/auth/login" "SQL注入" "401" "$($result.StatusCode)" $false
}

# 超长用户名测试
$longUsername = "a" * 200
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = $longUsername; password = "test" } -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 400 -or $result.StatusCode -eq 401)) {
    Write-Pass "超长用户名 - 正确拒绝"
    Add-Result "POST /api/auth/login" "超长用户名" "400/401" "$($result.StatusCode)" $true
} else {
    Write-Fail "超长用户名 - 预期400/401"
    Add-Result "POST /api/auth/login" "超长用户名" "400/401" "$($result.StatusCode)" $false
}

# 特殊字符用户名测试
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "<script>alert(1)</script>"; password = "test" } -UseToken $false
if (-not $result.Success -and $result.StatusCode -eq 401) {
    Write-Pass "特殊字符用户名 - 安全处理"
    Add-Result "POST /api/auth/login" "特殊字符用户名" "401" "$($result.StatusCode)" $true
} else {
    Write-Fail "特殊字符用户名 - 预期401"
    Add-Result "POST /api/auth/login" "特殊字符用户名" "401" "$($result.StatusCode)" $false
}

# 1.3 获取当前用户
Write-Info "测试 GET /api/auth/me"

$result = Invoke-Api -Method "GET" -Endpoint "/api/auth/me"
if ($result.Success -and $result.Data.data.username -eq "admin") {
    Write-Pass "获取当前用户成功"
    Add-Result "GET /api/auth/me" "正常获取" "返回用户信息" "成功" $true
} else {
    Write-Fail "获取当前用户失败"
    Add-Result "GET /api/auth/me" "正常获取" "返回用户信息" "失败" $false
}

# 无Token访问
$result = Invoke-Api -Method "GET" -Endpoint "/api/auth/me" -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token访问 - 正确拒绝"
    Add-Result "GET /api/auth/me" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token访问 - 应该被拒绝"
    Add-Result "GET /api/auth/me" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 无效Token访问
$result = Invoke-Api -Method "GET" -Endpoint "/api/auth/me" -UseToken $false -CustomToken "invalid_token_12345"
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无效Token - 正确拒绝"
    Add-Result "GET /api/auth/me" "无效Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无效Token - 应该被拒绝"
    Add-Result "GET /api/auth/me" "无效Token" "401/403" "$($result.StatusCode)" $false
}

# 1.4 修改密码测试
Write-Info "测试 POST /api/auth/change-password"

# 原密码错误
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/change-password" -Body @{ oldPassword = "wrongpassword"; newPassword = "newpass123" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "原密码错误 - 正确返回400"
    Add-Result "POST /api/auth/change-password" "原密码错误" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "原密码错误 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/change-password" "原密码错误" "400" "$($result.StatusCode)" $false
}

# 新密码为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/change-password" -Body @{ oldPassword = "admin123"; newPassword = "" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "新密码为空 - 正确返回400"
    Add-Result "POST /api/auth/change-password" "新密码为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "新密码为空 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/change-password" "新密码为空" "400" "$($result.StatusCode)" $false
}

# 原密码为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/change-password" -Body @{ oldPassword = ""; newPassword = "newpass123" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "原密码为空 - 正确返回400"
    Add-Result "POST /api/auth/change-password" "原密码为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "原密码为空 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/change-password" "原密码为空" "400" "$($result.StatusCode)" $false
}

# 新密码过短
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/change-password" -Body @{ oldPassword = "admin123"; newPassword = "123" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "新密码过短 - 正确返回400"
    Add-Result "POST /api/auth/change-password" "新密码过短" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "新密码过短 - 预期400，实际$($result.StatusCode)"
    Add-Result "POST /api/auth/change-password" "新密码过短" "400" "$($result.StatusCode)" $false
}

# 无Token修改密码
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/change-password" -Body @{ oldPassword = "admin123"; newPassword = "newpass123" } -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token修改密码 - 正确拒绝"
    Add-Result "POST /api/auth/change-password" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token修改密码 - 应该被拒绝"
    Add-Result "POST /api/auth/change-password" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 1.2 登出测试（放在最后）
Write-Info "测试 POST /api/auth/logout"

$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/logout"
if ($result.Success) {
    Write-Pass "登出成功"
    Add-Result "POST /api/auth/logout" "正常登出" "200" "成功" $true
} else {
    Write-Fail "登出失败"
    Add-Result "POST /api/auth/logout" "正常登出" "200" "失败" $false
}

# 无Token登出
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/logout" -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token登出 - 正确拒绝"
    Add-Result "POST /api/auth/logout" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token登出 - 应该被拒绝"
    Add-Result "POST /api/auth/logout" "无Token" "401/403" "$($result.StatusCode)" $false
}

# ============================================================
# 测试汇总
# ============================================================

Write-Host "`n" -NoNewline
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "          模块1: 用户认证 - 测试汇总报告                    " -ForegroundColor Magenta
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host ""
Write-Host "总测试数: $($PassCount + $FailCount)" -ForegroundColor White
Write-Host "通过: $PassCount" -ForegroundColor Green
Write-Host "失败: $FailCount" -ForegroundColor Red
if (($PassCount + $FailCount) -gt 0) {
    $passRate = [math]::Round($PassCount / ($PassCount + $FailCount) * 100, 1)
    $rateColor = if ($FailCount -eq 0) { "Green" } else { "Yellow" }
    Write-Host "通过率: $passRate%" -ForegroundColor $rateColor
}
Write-Host ""

if ($FailCount -gt 0) {
    Write-Host "失败的测试用例:" -ForegroundColor Red
    $TestResults | Where-Object { -not $_.Passed } | ForEach-Object {
        Write-Host "  - $($_.API) | $($_.Scenario) | 预期: $($_.Expected) | 实际: $($_.Actual)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Magenta
