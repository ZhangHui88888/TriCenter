# Module 6: Dashboard Statistics API Test Script
# Tests 5 APIs: Overview, Funnel, Districts, Industries, Pending Follow-ups

$baseUrl = "http://localhost:8080/api"
$token = ""

# Color output functions
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Fail { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }

# Login to get Token
function Login {
    Write-Info "`n========== Login to get Token =========="
    $body = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -Body $body -ContentType "application/json"
        if ($response.code -eq 200) {
            $script:token = $response.data.token
            Write-Success "Login success, Token: $($token.Substring(0, 30))..."
            return $true
        }
    } catch {
        Write-Fail "Login failed: $_"
        return $false
    }
}

# Generic API request function
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$NeedAuth = $true
    )
    
    $headers = @{}
    if ($NeedAuth -and $token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $params = @{
        Uri = "$baseUrl$Endpoint"
        Method = $Method
        Headers = $headers
        ContentType = "application/json"
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        try {
            $errorBody = $_.ErrorDetails.Message | ConvertFrom-Json
            return @{ code = $statusCode; message = $errorBody.message; error = $true }
        } catch {
            return @{ code = $statusCode; message = $_.Exception.Message; error = $true }
        }
    }
}

# Test 6.1 Dashboard Overview
function Test-Overview {
    Write-Info "`n========== 6.1 Dashboard Overview GET /api/dashboard/overview =========="
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/overview"
    
    if ($response.code -eq 200) {
        Write-Success "[PASS] Get dashboard overview success"
        $data = $response.data
        Write-Host "  Total Enterprises: $($data.totalEnterprises)"
        Write-Host "  Potential Count: $($data.potentialCount)"
        Write-Host "  Has Demand Count: $($data.hasDemandCount)"
        Write-Host "  Signed/Settled Count: $($data.signedSettledCount)"
        if ($data.monthlyChange) {
            Write-Host "  Monthly Change:"
            Write-Host "    - Total: $($data.monthlyChange.total)"
            Write-Host "    - Potential: $($data.monthlyChange.potential)"
            Write-Host "    - Has Demand: $($data.monthlyChange.hasDemand)"
            Write-Host "    - Signed/Settled: $($data.monthlyChange.signedSettled)"
        }
    } else {
        Write-Fail "[FAIL] Get dashboard overview failed: $($response.message)"
    }
}

# Test 6.2 Funnel Stage Distribution
function Test-FunnelStats {
    Write-Info "`n========== 6.2 Funnel Stage Distribution GET /api/dashboard/funnel =========="
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/funnel"
    
    if ($response.code -eq 200) {
        Write-Success "[PASS] Get funnel stats success"
        Write-Host "  Stage Distribution:"
        foreach ($stage in $response.data) {
            Write-Host "    - $($stage.name) ($($stage.stage)): $($stage.count) [color: $($stage.color)]"
        }
    } else {
        Write-Fail "[FAIL] Get funnel stats failed: $($response.message)"
    }
}

# Test 6.3 District Distribution
function Test-DistrictStats {
    Write-Info "`n========== 6.3 District Distribution GET /api/dashboard/districts =========="
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/districts"
    
    if ($response.code -eq 200) {
        Write-Success "[PASS] Get district stats success"
        Write-Host "  District Distribution:"
        foreach ($district in $response.data) {
            Write-Host "    - $($district.name): $($district.count)"
        }
    } else {
        Write-Fail "[FAIL] Get district stats failed: $($response.message)"
    }
}

# Test 6.4 Industry Distribution
function Test-IndustryStats {
    Write-Info "`n========== 6.4 Industry Distribution GET /api/dashboard/industries =========="
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/industries"
    
    if ($response.code -eq 200) {
        Write-Success "[PASS] Get industry stats success"
        Write-Host "  Industry Distribution:"
        foreach ($industry in $response.data) {
            $pct = $industry.percentage
            Write-Host "    - $($industry.name): $($industry.count) ($pct percent)"
        }
    } else {
        Write-Fail "[FAIL] Get industry stats failed: $($response.message)"
    }
}

# Test 6.5 Pending Follow-ups
function Test-PendingFollowUps {
    Write-Info "`n========== 6.5 Pending Follow-ups GET /api/dashboard/pending-follow-ups =========="
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/pending-follow-ups"
    
    if ($response.code -eq 200) {
        Write-Success "[PASS] Get pending follow-ups success"
        $data = $response.data
        Write-Host "  Overdue 30 Days: $($data.overdue30Days)"
        Write-Host "  Need Follow This Week: $($data.needFollowThisWeek)"
        
        if ($data.overdueList -and $data.overdueList.Count -gt 0) {
            Write-Host "  Overdue Enterprises:"
            foreach ($item in $data.overdueList) {
                $lastFollow = if ($item.lastFollowUp) { $item.lastFollowUp } else { "Never" }
                Write-Host "    - $($item.name): Last follow-up $lastFollow, $($item.days) days ago"
            }
        }
        
        if ($data.weeklyList -and $data.weeklyList.Count -gt 0) {
            Write-Host "  Weekly Follow-up Enterprises:"
            foreach ($item in $data.weeklyList) {
                Write-Host "    - $($item.name): Next follow-up $($item.nextFollowUp), Type: $($item.type)"
            }
        }
    } else {
        Write-Fail "[FAIL] Get pending follow-ups failed: $($response.message)"
    }
}

# Test No Token Access
function Test-NoToken {
    Write-Info "`n========== Edge Test: No Token Access =========="
    
    $savedToken = $script:token
    $script:token = ""
    
    $response = Invoke-Api -Method GET -Endpoint "/dashboard/overview" -NeedAuth $false
    
    if ($response.code -eq 401 -or $response.error) {
        Write-Success "[PASS] No token access correctly returns 401"
    } else {
        Write-Fail "[FAIL] No token access should return 401, actual: $($response.code)"
    }
    
    $script:token = $savedToken
}

# Main test flow
Write-Host "============================================" -ForegroundColor Yellow
Write-Host "       Module 6: Dashboard Statistics API Test" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Yellow

if (Login) {
    Test-Overview
    Test-FunnelStats
    Test-DistrictStats
    Test-IndustryStats
    Test-PendingFollowUps
    Test-NoToken
    
    Write-Host "`n============================================" -ForegroundColor Yellow
    Write-Host "       Test Complete" -ForegroundColor Yellow
    Write-Host "============================================" -ForegroundColor Yellow
}
