# ============================================================
# TriCenter API 测试脚本 - 模块2: 基础数据/数据字典
# 使用方法: 在 backend 目录下运行 .\test-module2-options.ps1
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
# 前置条件：登录获取Token
# ============================================================

Write-Test "前置条件：登录获取Token"

$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "admin123" } -UseToken $false
if ($result.Success -and $result.Data.data.token) {
    $script:Token = $result.Data.data.token
    Write-Pass "登录成功，获取到Token"
} else {
    Write-Fail "登录失败，无法继续测试: $($result.Message)"
    exit 1
}

# ============================================================
# 模块2: 基础数据/数据字典测试
# ============================================================

Write-Test "模块2: 基础数据/数据字典测试"

# 2.1 获取系统选项列表
Write-Info "测试 GET /api/options/{category}"

$categories = @(
    @{ name = "stage"; minCount = 7; desc = "漏斗阶段" },
    @{ name = "district"; minCount = 7; desc = "区域" },
    @{ name = "enterprise_type"; minCount = 3; desc = "企业类型" },
    @{ name = "staff_size"; minCount = 6; desc = "人员规模" },
    @{ name = "revenue"; minCount = 5; desc = "营收规模" },
    @{ name = "source"; minCount = 4; desc = "企业来源" },
    @{ name = "follow_type"; minCount = 4; desc = "跟进类型" },
    @{ name = "trade_mode"; minCount = 5; desc = "外贸模式" },
    @{ name = "certification"; minCount = 10; desc = "产品认证" },
    @{ name = "cross_border_platform"; minCount = 18; desc = "跨境平台" }
)

foreach ($cat in $categories) {
    $result = Invoke-Api -Method "GET" -Endpoint "/api/options/$($cat.name)"
    if ($result.Success -and $result.Data.data.Count -ge $cat.minCount) {
        Write-Pass "获取$($cat.desc)成功，共$($result.Data.data.Count)条"
        Add-Result "GET /api/options/$($cat.name)" "获取$($cat.desc)" ">=$($cat.minCount)条" "$($result.Data.data.Count)条" $true
    } else {
        Write-Fail "获取$($cat.desc)失败或数量不足"
        Add-Result "GET /api/options/$($cat.name)" "获取$($cat.desc)" ">=$($cat.minCount)条" "$($result.Data.data.Count)条" $false
    }
}

# 不存在的分类
$result = Invoke-Api -Method "GET" -Endpoint "/api/options/notexist"
if ($result.Success -and $result.Data.data.Count -eq 0) {
    Write-Pass "不存在的分类 - 返回空数组"
    Add-Result "GET /api/options/notexist" "不存在的分类" "空数组" "空数组" $true
} else {
    Write-Fail "不存在的分类 - 应返回空数组"
    Add-Result "GET /api/options/notexist" "不存在的分类" "空数组" "非空" $false
}

# 特殊字符分类
$result = Invoke-Api -Method "GET" -Endpoint "/api/options/test%3Cscript%3E"
if ($result.Success) {
    Write-Pass "特殊字符分类 - 安全处理"
    Add-Result "GET /api/options/<script>" "特殊字符" "安全处理" "成功" $true
} else {
    Write-Fail "特殊字符分类 - 处理异常"
    Add-Result "GET /api/options/<script>" "特殊字符" "安全处理" "失败" $false
}

# 无Token访问options
$result = Invoke-Api -Method "GET" -Endpoint "/api/options/stage" -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token访问options - 正确拒绝"
    Add-Result "GET /api/options/stage" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token访问options - 应该被拒绝"
    Add-Result "GET /api/options/stage" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 2.2 获取行业分类树
Write-Info "测试 GET /api/options/industries"

$result = Invoke-Api -Method "GET" -Endpoint "/api/options/industries"
if ($result.Success -and $result.Data.data -is [array]) {
    Write-Pass "获取行业分类树成功，共$($result.Data.data.Count)个顶级分类"
    Add-Result "GET /api/options/industries" "获取行业树" "返回树结构" "成功" $true
} else {
    Write-Fail "获取行业分类树失败"
    Add-Result "GET /api/options/industries" "获取行业树" "返回树结构" "失败" $false
}

# 验证行业树结构（检查children字段）
if ($result.Success -and $result.Data.data.Count -gt 0) {
    $hasChildren = $result.Data.data[0].PSObject.Properties.Name -contains "children"
    if ($hasChildren) {
        Write-Pass "行业树结构正确，包含children字段"
        Add-Result "GET /api/options/industries" "验证树结构" "包含children" "正确" $true
    } else {
        Write-Fail "行业树结构缺少children字段"
        Add-Result "GET /api/options/industries" "验证树结构" "包含children" "缺失" $false
    }
}

# 2.3 获取产品品类树
Write-Info "测试 GET /api/options/product-categories"

$result = Invoke-Api -Method "GET" -Endpoint "/api/options/product-categories"
if ($result.Success -and $result.Data.data -is [array]) {
    Write-Pass "获取产品品类树成功，共$($result.Data.data.Count)个顶级分类"
    Add-Result "GET /api/options/product-categories" "获取品类树" "返回树结构" "成功" $true
} else {
    Write-Fail "获取产品品类树失败"
    Add-Result "GET /api/options/product-categories" "获取品类树" "返回树结构" "失败" $false
}

# 2.4 获取用户列表
Write-Info "测试 GET /api/options/users"

$result = Invoke-Api -Method "GET" -Endpoint "/api/options/users"
if ($result.Success -and $result.Data.data.Count -ge 1) {
    Write-Pass "获取用户列表成功，共$($result.Data.data.Count)个用户"
    Add-Result "GET /api/options/users" "获取用户列表" ">=1个用户" "成功" $true
    
    # 验证用户列表格式
    $firstUser = $result.Data.data[0]
    if ($firstUser.PSObject.Properties.Name -contains "value" -and $firstUser.PSObject.Properties.Name -contains "label") {
        Write-Pass "用户列表格式正确（value/label）"
        Add-Result "GET /api/options/users" "验证格式" "value/label" "正确" $true
    } else {
        Write-Fail "用户列表格式不正确"
        Add-Result "GET /api/options/users" "验证格式" "value/label" "错误" $false
    }
} else {
    Write-Fail "获取用户列表失败或为空"
    Add-Result "GET /api/options/users" "获取用户列表" ">=1个用户" "失败" $false
}

# 2.5 获取字典分类列表
Write-Info "测试 GET /api/dictionary/categories"

$result = Invoke-Api -Method "GET" -Endpoint "/api/dictionary/categories"
if ($result.Success -and $result.Data.data.Count -gt 0) {
    Write-Pass "获取字典分类列表成功，共$($result.Data.data.Count)个分类"
    Add-Result "GET /api/dictionary/categories" "获取分类列表" "返回分类" "成功" $true
} else {
    Write-Fail "获取字典分类列表失败"
    Add-Result "GET /api/dictionary/categories" "获取分类列表" "返回分类" "失败" $false
}

# 2.6 新增字典选项
Write-Info "测试 POST /api/dictionary/{category}"

# 正常新增
$testValue = "test_" + (Get-Date -Format "HHmmss")
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = $testValue; label = "Test_Source" }
$newOptionId = $null
if ($result.Success -and $result.Data.data.id) {
    $newOptionId = $result.Data.data.id
    Write-Pass "新增字典选项成功，ID=$newOptionId"
    Add-Result "POST /api/dictionary/source" "正常新增" "返回新选项" "成功" $true
} else {
    Write-Fail "新增字典选项失败"
    Add-Result "POST /api/dictionary/source" "正常新增" "返回新选项" "失败" $false
}

# value为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = ""; label = "Test" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "value为空 - 正确返回400"
    Add-Result "POST /api/dictionary/source" "value为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "value为空 - 预期400"
    Add-Result "POST /api/dictionary/source" "value为空" "400" "$($result.StatusCode)" $false
}

# label为空
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = "test123"; label = "" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "label为空 - 正确返回400"
    Add-Result "POST /api/dictionary/source" "label为空" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "label为空 - 预期400"
    Add-Result "POST /api/dictionary/source" "label为空" "400" "$($result.StatusCode)" $false
}

# 重复value
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = $testValue; label = "Duplicate" }
if (-not $result.Success -and $result.StatusCode -eq 400) {
    Write-Pass "重复value - 正确返回400"
    Add-Result "POST /api/dictionary/source" "重复value" "400" "$($result.StatusCode)" $true
} else {
    Write-Fail "重复value - 预期400"
    Add-Result "POST /api/dictionary/source" "重复value" "400" "$($result.StatusCode)" $false
}

# 带颜色新增
$testValueColor = "test_color_" + (Get-Date -Format "HHmmss")
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = $testValueColor; label = "Color_Test"; color = "#ff0000" }
$colorOptionId = $null
if ($result.Success -and $result.Data.data.color -eq "#ff0000") {
    $colorOptionId = $result.Data.data.id
    Write-Pass "带颜色新增成功"
    Add-Result "POST /api/dictionary/source" "带颜色新增" "保存颜色" "成功" $true
} else {
    Write-Fail "带颜色新增失败或颜色未保存"
    Add-Result "POST /api/dictionary/source" "带颜色新增" "保存颜色" "失败" $false
}

# 带排序新增
$testValueSort = "test_sort_" + (Get-Date -Format "HHmmss")
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = $testValueSort; label = "Sort_Test"; sortOrder = 99 }
$sortOptionId = $null
if ($result.Success -and $result.Data.data.sortOrder -eq 99) {
    $sortOptionId = $result.Data.data.id
    Write-Pass "带排序新增成功"
    Add-Result "POST /api/dictionary/source" "带排序新增" "保存排序" "成功" $true
} else {
    Write-Fail "带排序新增失败或排序未保存"
    Add-Result "POST /api/dictionary/source" "带排序新增" "保存排序" "失败" $false
}

# 无Token新增
$result = Invoke-Api -Method "POST" -Endpoint "/api/dictionary/source" -Body @{ value = "notoken"; label = "NoToken" } -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token新增 - 正确拒绝"
    Add-Result "POST /api/dictionary/source" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token新增 - 应该被拒绝"
    Add-Result "POST /api/dictionary/source" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 2.7 更新字典选项
Write-Info "测试 PUT /api/dictionary/{category}/{id}"

if ($newOptionId) {
    # 正常更新label
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/$newOptionId" -Body @{ label = "Updated_Label" }
    if ($result.Success -and $result.Data.data.label -eq "Updated_Label") {
        Write-Pass "更新label成功"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "更新label" "返回更新后选项" "成功" $true
    } else {
        Write-Fail "更新label失败"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "更新label" "返回更新后选项" "失败" $false
    }
    
    # 更新颜色
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/$newOptionId" -Body @{ color = "#00ff00" }
    if ($result.Success) {
        Write-Pass "更新颜色成功"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "更新颜色" "成功" "成功" $true
    } else {
        Write-Fail "更新颜色失败"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "更新颜色" "成功" "失败" $false
    }
    
    # 禁用选项
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/$newOptionId" -Body @{ isEnabled = 0 }
    if ($result.Success -and $result.Data.data.isEnabled -eq 0) {
        Write-Pass "禁用选项成功"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "禁用选项" "isEnabled=0" "成功" $true
    } else {
        Write-Fail "禁用选项失败"
        Add-Result "PUT /api/dictionary/source/$newOptionId" "禁用选项" "isEnabled=0" "失败" $false
    }
}

# ID不存在
$result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/99999" -Body @{ label = "Test" }
if (-not $result.Success -and $result.StatusCode -eq 404) {
    Write-Pass "ID不存在 - 正确返回404"
    Add-Result "PUT /api/dictionary/source/99999" "ID不存在" "404" "$($result.StatusCode)" $true
} else {
    Write-Fail "ID不存在 - 预期404"
    Add-Result "PUT /api/dictionary/source/99999" "ID不存在" "404" "$($result.StatusCode)" $false
}

# category不匹配
if ($newOptionId) {
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/stage/$newOptionId" -Body @{ label = "Test" }
    if (-not $result.Success -and $result.StatusCode -eq 404) {
        Write-Pass "category不匹配 - 正确返回404"
        Add-Result "PUT /api/dictionary/stage/$newOptionId" "category不匹配" "404" "$($result.StatusCode)" $true
    } else {
        Write-Fail "category不匹配 - 预期404"
        Add-Result "PUT /api/dictionary/stage/$newOptionId" "category不匹配" "404" "$($result.StatusCode)" $false
    }
}

# 负数ID
$result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/-1" -Body @{ label = "Test" }
if (-not $result.Success -and $result.StatusCode -eq 404) {
    Write-Pass "负数ID - 正确返回404"
    Add-Result "PUT /api/dictionary/source/-1" "负数ID" "404" "$($result.StatusCode)" $true
} else {
    Write-Fail "负数ID - 预期404"
    Add-Result "PUT /api/dictionary/source/-1" "负数ID" "404" "$($result.StatusCode)" $false
}

# 无Token更新
$result = Invoke-Api -Method "PUT" -Endpoint "/api/dictionary/source/1" -Body @{ label = "Test" } -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token更新 - 正确拒绝"
    Add-Result "PUT /api/dictionary/source/1" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token更新 - 应该被拒绝"
    Add-Result "PUT /api/dictionary/source/1" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 2.8 删除字典选项
Write-Info "测试 DELETE /api/dictionary/{category}/{id}"

# ID不存在
$result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/99999"
if (-not $result.Success -and $result.StatusCode -eq 404) {
    Write-Pass "删除不存在ID - 正确返回404"
    Add-Result "DELETE /api/dictionary/source/99999" "ID不存在" "404" "$($result.StatusCode)" $true
} else {
    Write-Fail "删除不存在ID - 预期404"
    Add-Result "DELETE /api/dictionary/source/99999" "ID不存在" "404" "$($result.StatusCode)" $false
}

# 负数ID
$result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/-1"
if (-not $result.Success -and $result.StatusCode -eq 404) {
    Write-Pass "删除负数ID - 正确返回404"
    Add-Result "DELETE /api/dictionary/source/-1" "负数ID" "404" "$($result.StatusCode)" $true
} else {
    Write-Fail "删除负数ID - 预期404"
    Add-Result "DELETE /api/dictionary/source/-1" "负数ID" "404" "$($result.StatusCode)" $false
}

# 无Token删除
$result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/1" -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "无Token删除 - 正确拒绝"
    Add-Result "DELETE /api/dictionary/source/1" "无Token" "401/403" "$($result.StatusCode)" $true
} else {
    Write-Fail "无Token删除 - 应该被拒绝"
    Add-Result "DELETE /api/dictionary/source/1" "无Token" "401/403" "$($result.StatusCode)" $false
}

# 清理测试数据 - 删除创建的测试选项
Write-Info "清理测试数据..."

if ($newOptionId) {
    $result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/$newOptionId"
    if ($result.Success) {
        Write-Pass "删除测试选项成功 (ID=$newOptionId)"
        Add-Result "DELETE /api/dictionary/source/$newOptionId" "正常删除" "200" "成功" $true
    } else {
        Write-Fail "删除测试选项失败 (ID=$newOptionId)"
        Add-Result "DELETE /api/dictionary/source/$newOptionId" "正常删除" "200" "失败" $false
    }
}

if ($colorOptionId) {
    $result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/$colorOptionId"
    if ($result.Success) {
        Write-Pass "删除颜色测试选项成功 (ID=$colorOptionId)"
        Add-Result "DELETE /api/dictionary/source/$colorOptionId" "清理颜色选项" "200" "成功" $true
    } else {
        Write-Fail "删除颜色测试选项失败"
        Add-Result "DELETE /api/dictionary/source/$colorOptionId" "清理颜色选项" "200" "失败" $false
    }
}

if ($sortOptionId) {
    $result = Invoke-Api -Method "DELETE" -Endpoint "/api/dictionary/source/$sortOptionId"
    if ($result.Success) {
        Write-Pass "删除排序测试选项成功 (ID=$sortOptionId)"
        Add-Result "DELETE /api/dictionary/source/$sortOptionId" "清理排序选项" "200" "成功" $true
    } else {
        Write-Fail "删除排序测试选项失败"
        Add-Result "DELETE /api/dictionary/source/$sortOptionId" "清理排序选项" "200" "失败" $false
    }
}

# ============================================================
# 测试汇总
# ============================================================

Write-Host "`n" -NoNewline
Write-Host "============================================================" -ForegroundColor Magenta
Write-Host "        模块2: 基础数据/数据字典 - 测试汇总报告             " -ForegroundColor Magenta
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
