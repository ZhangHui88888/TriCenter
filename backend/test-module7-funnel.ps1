# 模块7：漏斗分析 API测试脚本
# 使用方法：在 backend 目录下执行 .\test-module7-funnel.ps1

$baseUrl = "http://localhost:8080/api"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "模块7：漏斗分析 API测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. 登录获取Token
Write-Host "`n[1] 登录获取Token..." -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "登录成功，Token: $($token.Substring(0, 20))..." -ForegroundColor Green
} catch {
    Write-Host "登录失败: $_" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. 测试 7.1 漏斗数据
Write-Host "`n[2] 测试 7.1 漏斗数据 GET /api/funnel/data" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/funnel/data" -Method Get -Headers $headers
    Write-Host "响应: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response.code -eq 200 -and $response.data.Count -eq 7) {
        Write-Host "✅ 漏斗数据获取成功，共 $($response.data.Count) 个阶段" -ForegroundColor Green
        foreach ($stage in $response.data) {
            Write-Host "   - $($stage.name): $($stage.count)家" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ 漏斗数据获取失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

# 3. 测试 7.2 转化率数据
Write-Host "`n[3] 测试 7.2 转化率数据 GET /api/funnel/conversion" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/funnel/conversion" -Method Get -Headers $headers
    Write-Host "响应: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response.code -eq 200 -and $response.data.Count -eq 7) {
        Write-Host "✅ 转化率数据获取成功，共 $($response.data.Count) 条转化路径" -ForegroundColor Green
        foreach ($item in $response.data) {
            Write-Host "   - $($item.fromName) → $($item.toName): $($item.count)家 ($($item.rate)%)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ 转化率数据获取失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

# 4. 测试 7.3 趋势数据（默认6个月）
Write-Host "`n[4] 测试 7.3 趋势数据 GET /api/funnel/trend（默认）" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/funnel/trend" -Method Get -Headers $headers
    Write-Host "响应: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response.code -eq 200 -and $response.data.Count -gt 0) {
        Write-Host "✅ 趋势数据获取成功，共 $($response.data.Count) 个月数据" -ForegroundColor Green
        foreach ($item in $response.data) {
            Write-Host "   - $($item.month): 潜在=$($item.potential), 有需求=$($item.hasDemand), 签约=$($item.signed), 入驻=$($item.settled)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ 趋势数据获取失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

# 5. 测试 7.3 趋势数据（指定日期范围）
Write-Host "`n[5] 测试 7.3 趋势数据 GET /api/funnel/trend（指定日期）" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/funnel/trend?startDate=2025-11-01&endDate=2026-02-03" -Method Get -Headers $headers
    Write-Host "响应: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor Gray
    if ($response.code -eq 200) {
        Write-Host "✅ 指定日期范围趋势数据获取成功，共 $($response.data.Count) 个月数据" -ForegroundColor Green
    } else {
        Write-Host "❌ 趋势数据获取失败" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ 请求失败: $_" -ForegroundColor Red
}

# 6. 测试无Token访问
Write-Host "`n[6] 测试无Token访问" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/funnel/data" -Method Get
    Write-Host "❌ 应该返回401，但请求成功了" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Message -match "401") {
        Write-Host "✅ 无Token访问正确返回401" -ForegroundColor Green
    } else {
        Write-Host "响应: $_" -ForegroundColor Gray
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "模块7测试完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
