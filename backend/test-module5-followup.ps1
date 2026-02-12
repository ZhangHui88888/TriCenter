# Module 5: Follow-up Records API Test Script
# Usage: .\test-module5-followup.ps1

$baseUrl = "http://localhost:8080/api"
$token = ""

# Color output functions
function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }

# Login to get Token
function Login {
    Write-Info "`n=== Login to get Token ==="
    $body = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $body -ContentType "application/json"
        $script:token = $response.data.token
        Write-Success "Login successful, Token: $($token.Substring(0, 20))..."
        return $true
    } catch {
        Write-Error "Login failed: $_"
        return $false
    }
}

# Generic API request function
function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [string]$Description
    )
    
    Write-Info "`n=== $Description ==="
    Write-Host "Request: $Method $Endpoint"
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    try {
        $params = @{
            Uri = "$baseUrl$Endpoint"
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            Write-Host "Body: $jsonBody"
            $params.Body = $jsonBody
        }
        
        $response = Invoke-RestMethod @params
        Write-Success "Response: $(ConvertTo-Json $response -Depth 5)"
        return $response
    } catch {
        Write-Error "Request failed: $_"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Error "Error details: $errorBody"
        }
        return $null
    }
}

# Main test flow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "   Module 5: Follow-up Records API Test" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# 1. Login
if (-not (Login)) {
    Write-Error "Login failed, terminating test"
    exit 1
}

# 2. Get follow-up stats
Invoke-Api -Method "GET" -Endpoint "/follow-ups/stats" -Description "5.5 Get follow-up stats"

# 3. Get follow-up list (empty)
Invoke-Api -Method "GET" -Endpoint "/follow-ups?page=1`&pageSize=10" -Description "5.1 Get follow-up list"

# 4. Create a test enterprise first
Write-Info "`n=== Create test enterprise ==="
$enterpriseBody = @{
    name = "FollowUp_Test_Enterprise_$(Get-Date -Format 'yyyyMMddHHmmss')"
    district = "Wujin"
    enterpriseType = "Production"
}
$enterprise = Invoke-Api -Method "POST" -Endpoint "/enterprises" -Body $enterpriseBody -Description "Create test enterprise"
$enterpriseId = $enterprise.data.id
Write-Success "Enterprise created, ID: $enterpriseId"

# 5. Create follow-up record
$followUpBody = @{
    enterpriseId = $enterpriseId
    followType = "Phone"
    followDate = (Get-Date -Format "yyyy-MM-dd")
    content = "First phone call to understand basic situation and cross-border e-commerce needs"
    status = "Initial Contact"
    nextPlan = "Schedule on-site visit next week"
}
$followUp = Invoke-Api -Method "POST" -Endpoint "/follow-ups" -Body $followUpBody -Description "5.2 Create follow-up record"
$followUpId = $followUp.data.id
Write-Success "Follow-up record created, ID: $followUpId"

# 6. Create follow-up record with stage change
$followUpBody2 = @{
    enterpriseId = $enterpriseId
    followType = "Visit"
    followDate = (Get-Date -Format "yyyy-MM-dd")
    content = "On-site visit to understand products and export situation, enterprise has clear cross-border needs"
    status = "Has Cooperation Intent"
    nextPlan = "Prepare cooperation plan"
    stageAfter = "HAS_DEMAND"
}
$followUp2 = Invoke-Api -Method "POST" -Endpoint "/follow-ups" -Body $followUpBody2 -Description "5.2 Create follow-up with stage change"

# 7. Get enterprise follow-ups
Invoke-Api -Method "GET" -Endpoint "/enterprises/$enterpriseId/follow-ups" -Description "Get enterprise follow-ups"

# 8. Get follow-up list with filter
Invoke-Api -Method "GET" -Endpoint "/follow-ups?enterpriseId=$enterpriseId`&page=1`&pageSize=10" -Description "5.1 Get follow-up list (by enterprise)"

# 9. Get follow-up list by type
Invoke-Api -Method "GET" -Endpoint "/follow-ups?type=Phone`&page=1`&pageSize=10" -Description "5.1 Get follow-up list (by type)"

# 10. Update follow-up record
$updateBody = @{
    content = "First phone call - understood basic situation. Main products: power tools, annual export about 5M USD."
    status = "Initial Contact - Basic Info Collected"
}
Invoke-Api -Method "PUT" -Endpoint "/follow-ups/$followUpId" -Body $updateBody -Description "5.3 Update follow-up record"

# 11. Get follow-up stats (after update)
Invoke-Api -Method "GET" -Endpoint "/follow-ups/stats" -Description "5.5 Get follow-up stats (after update)"

# 12. Delete follow-up record
Invoke-Api -Method "DELETE" -Endpoint "/follow-ups/$followUpId" -Description "5.4 Delete follow-up record"

# 13. Verify deletion
Invoke-Api -Method "GET" -Endpoint "/enterprises/$enterpriseId/follow-ups" -Description "Verify follow-ups after deletion"

# 14. Boundary test - non-existent follow-up
Invoke-Api -Method "PUT" -Endpoint "/follow-ups/99999" -Body @{content="test"} -Description "Boundary test - non-existent follow-up"

# 15. Boundary test - non-existent enterprise
$invalidBody = @{
    enterpriseId = 99999
    followType = "Phone"
    followDate = (Get-Date -Format "yyyy-MM-dd")
    content = "Test content"
}
Invoke-Api -Method "POST" -Endpoint "/follow-ups" -Body $invalidBody -Description "Boundary test - non-existent enterprise"

# 16. Boundary test - missing required fields
$missingFieldBody = @{
    enterpriseId = $enterpriseId
    followType = "Phone"
}
Invoke-Api -Method "POST" -Endpoint "/follow-ups" -Body $missingFieldBody -Description "Boundary test - missing required fields"

# 17. Cleanup - delete test enterprise
Invoke-Api -Method "DELETE" -Endpoint "/enterprises/$enterpriseId" -Description "Cleanup - delete test enterprise"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "   Test Complete" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
