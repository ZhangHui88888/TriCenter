# ============================================================
# TriCenter API Test Script - Module 3: Enterprise Management
# Usage: Run .\test-module3-enterprise.ps1 in backend directory
# ============================================================

$BaseUrl = "http://localhost:8080"
$Token = ""
$TestResults = @()
$PassCount = 0
$FailCount = 0
$CreatedEnterpriseId = $null

# ============================================================
# Common Functions
# ============================================================

function Write-Test { param($msg) Write-Host "`n[TEST] $msg" -ForegroundColor Cyan }
function Write-Pass { param($msg) Write-Host "[PASS] $msg" -ForegroundColor Green; $script:PassCount++ }
function Write-Fail { param($msg) Write-Host "[FAIL] $msg" -ForegroundColor Red; $script:FailCount++ }
function Write-Info { param($msg) Write-Host "[INFO] $msg" -ForegroundColor Yellow }

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null,
        [bool]$UseToken = $true
    )
    
    $headers = @{ "Content-Type" = "application/json" }
    if ($UseToken -and $script:Token) {
        $headers["Authorization"] = "Bearer $script:Token"
    }
    
    $uri = "$BaseUrl$Endpoint"
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            ContentType = "application/json"
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
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
# Pre-condition: Login to get Token
# ============================================================

Write-Test "Pre-condition: Login to get Token"
$result = Invoke-Api -Method "POST" -Endpoint "/api/auth/login" -Body @{ username = "admin"; password = "admin123" } -UseToken $false
if ($result.Success -and $result.Data.data.token) {
    $script:Token = $result.Data.data.token
    Write-Pass "Login successful, Token obtained"
} else {
    Write-Fail "Login failed, cannot continue testing"
    exit 1
}

# ============================================================
# Test 3.1: Enterprise List (GET /api/enterprises)
# ============================================================

Write-Test "3.1 Enterprise List - Empty list"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises"
if ($result.Success -and $result.Data.code -eq 200) {
    Write-Pass "Get enterprise list successful, total: $($result.Data.data.total)"
} else {
    Write-Fail "Get enterprise list failed: $($result.Message)"
}

Write-Test "3.1 Enterprise List - With pagination"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises?page=1&pageSize=5"
if ($result.Success -and $result.Data.code -eq 200) {
    Write-Pass "Pagination query successful"
} else {
    Write-Fail "Pagination query failed"
}

Write-Test "3.1 Enterprise List - Without Token"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises" -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "Correctly rejected request without Token (Status: $($result.StatusCode))"
} else {
    Write-Fail "Should reject request without Token, got: $($result.StatusCode)"
}

# ============================================================
# Test 3.3: Create Enterprise (POST /api/enterprises)
# ============================================================

Write-Test "3.3 Create Enterprise - Empty body (blank enterprise)"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{}
if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.id) {
    $blankEnterpriseId = $result.Data.data.id
    $blankEnterpriseName = $result.Data.data.name
    Write-Pass "Create blank enterprise successful, ID: $blankEnterpriseId, Name: $blankEnterpriseName"
    # Verify name starts with default prefix
    if ($blankEnterpriseName -like "新建企业_*") {
        Write-Pass "Blank enterprise name has correct prefix"
    } else {
        Write-Info "Blank enterprise name: $blankEnterpriseName"
    }
    # Clean up blank enterprise
    Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$blankEnterpriseId" | Out-Null
} else {
    Write-Fail "Create blank enterprise failed: $($result.Data.message)"
}

Write-Test "3.3 Create Enterprise - Only name"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{ name = "Test_Only_Name_Enterprise" }
if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.id) {
    $onlyNameId = $result.Data.data.id
    Write-Pass "Create enterprise with only name successful, ID: $onlyNameId"
    # Clean up
    Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$onlyNameId" | Out-Null
} else {
    Write-Fail "Create enterprise with only name failed: $($result.Data.message)"
}

Write-Test "3.3 Create Enterprise - Full data"
$createData = @{
    name = "Test_Enterprise_001"
    district = "Xinbei"
    enterpriseType = "Production"
    contactName = "Zhang_San"
    contactPhone = "13800138001"
    contactPosition = "Manager"
}
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body $createData
if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.id) {
    $script:CreatedEnterpriseId = $result.Data.data.id
    Write-Pass "Create enterprise with full data successful, ID: $($script:CreatedEnterpriseId)"
} else {
    Write-Fail "Create enterprise with full data failed: $($result.Data.message)"
}

Write-Test "3.3 Create Enterprise - With contact info"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{
    name = "Test_With_Contact"
    contactName = "Li_Si"
    contactPhone = "13800138099"
}
if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.id) {
    $withContactId = $result.Data.data.id
    Write-Pass "Create enterprise with contact successful, ID: $withContactId"
    # Verify contact was created
    $detailResult = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/$withContactId"
    if ($detailResult.Success -and $detailResult.Data.data.contacts -and $detailResult.Data.data.contacts.Count -gt 0) {
        Write-Pass "Contact was created with enterprise"
    } else {
        Write-Info "Contact may not have been created"
    }
    # Clean up
    Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$withContactId" | Out-Null
} else {
    Write-Fail "Create enterprise with contact failed: $($result.Data.message)"
}

Write-Test "3.3 Create Enterprise - Contact name only (no phone)"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{
    name = "Test_Contact_No_Phone"
    contactName = "Wang_Wu"
}
if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.id) {
    $noPhoneId = $result.Data.data.id
    Write-Pass "Create enterprise with contact name only successful (no contact created)"
    # Verify no contact was created
    $detailResult = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/$noPhoneId"
    if ($detailResult.Success -and (-not $detailResult.Data.data.contacts -or $detailResult.Data.data.contacts.Count -eq 0)) {
        Write-Pass "No contact created when phone is missing"
    } else {
        Write-Info "Contact count: $($detailResult.Data.data.contacts.Count)"
    }
    # Clean up
    Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$noPhoneId" | Out-Null
} else {
    Write-Fail "Create enterprise with contact name only failed: $($result.Data.message)"
}

Write-Test "3.3 Create Enterprise - Duplicate name"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body $createData
if (-not $result.Success -or $result.Data.code -eq 400) {
    Write-Pass "Correctly rejected duplicate enterprise name"
} else {
    Write-Fail "Should reject duplicate enterprise name"
}

Write-Test "3.3 Create Enterprise - Name too long (over 200 chars)"
$longName = "A" * 250
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{ name = $longName }
if (-not $result.Success -or $result.Data.code -eq 400) {
    Write-Pass "Correctly rejected name over 200 characters"
} else {
    Write-Fail "Should reject name over 200 characters"
    # Clean up if created
    if ($result.Data.data.id) {
        Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$($result.Data.data.id)" | Out-Null
    }
}

Write-Test "3.3 Create Enterprise - Special characters in name"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{
    name = "<script>alert('xss')</script>"
}
if ($result.Success -and $result.Data.code -eq 200) {
    Write-Info "Special characters accepted (XSS should be handled by frontend)"
    # Clean up
    if ($result.Data.data.id) {
        Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$($result.Data.data.id)" | Out-Null
    }
} else {
    Write-Pass "Special characters rejected"
}

Write-Test "3.3 Create Enterprise - Without Token"
$result = Invoke-Api -Method "POST" -Endpoint "/api/enterprises" -Body @{} -UseToken $false
if (-not $result.Success -and ($result.StatusCode -eq 401 -or $result.StatusCode -eq 403)) {
    Write-Pass "Correctly rejected request without Token (Status: $($result.StatusCode))"
} else {
    Write-Fail "Should reject request without Token, got: $($result.StatusCode)"
}

# ============================================================
# Test 3.2: Enterprise Detail (GET /api/enterprises/:id)
# ============================================================

Write-Test "3.2 Enterprise Detail - Normal case"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)"
    if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.name -eq "Test_Enterprise_001") {
        Write-Pass "Get enterprise detail successful"
    } else {
        Write-Fail "Get enterprise detail failed"
    }
} else {
    Write-Fail "No enterprise ID available for testing"
}

Write-Test "3.2 Enterprise Detail - Non-existent ID"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/99999"
if (-not $result.Success -or $result.Data.code -eq 404) {
    Write-Pass "Correctly returned 404 for non-existent enterprise"
} else {
    Write-Fail "Should return 404 for non-existent enterprise"
}

Write-Test "3.2 Enterprise Detail - Invalid ID format"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/abc"
if (-not $result.Success) {
    Write-Pass "Correctly rejected invalid ID format"
} else {
    Write-Fail "Should reject invalid ID format"
}

# ============================================================
# Test 3.4: Update Enterprise (PUT /api/enterprises/:id)
# ============================================================

Write-Test "3.4 Update Enterprise - Normal case"
if ($script:CreatedEnterpriseId) {
    $updateData = @{
        name = "Test_Enterprise_Updated"
        website = "https://example.com"
        hasCrossBorder = 1
    }
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)" -Body $updateData
    if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.name -eq "Test_Enterprise_Updated") {
        Write-Pass "Update enterprise successful"
    } else {
        Write-Fail "Update enterprise failed: code=$($result.Data.code), name=$($result.Data.data.name)"
    }
}

Write-Test "3.4 Update Enterprise - Non-existent ID"
$result = Invoke-Api -Method "PUT" -Endpoint "/api/enterprises/99999" -Body @{ name = "Test" }
if (-not $result.Success -or $result.Data.code -eq 404) {
    Write-Pass "Correctly returned 404 for non-existent enterprise"
} else {
    Write-Fail "Should return 404 for non-existent enterprise"
}

# ============================================================
# Test 3.6: Change Stage (PATCH /api/enterprises/:id/stage)
# ============================================================

Write-Test "3.6 Change Stage - Normal case"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "PATCH" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)/stage" -Body @{
        stage = "HAS_DEMAND"
        reason = "Test_stage_change"
    }
    if ($result.Success -and $result.Data.code -eq 200) {
        Write-Pass "Change stage successful"
    } else {
        Write-Fail "Change stage failed: $($result.Data.message)"
    }
}

Write-Test "3.6 Change Stage - Same stage"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "PATCH" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)/stage" -Body @{
        stage = "HAS_DEMAND"
    }
    if (-not $result.Success -or $result.Data.code -eq 400) {
        Write-Pass "Correctly rejected same stage change"
    } else {
        Write-Fail "Should reject same stage change"
    }
}

Write-Test "3.6 Change Stage - Empty stage"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "PATCH" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)/stage" -Body @{
        stage = ""
    }
    if (-not $result.Success -or $result.Data.code -ne 200) {
        Write-Pass "Correctly rejected empty stage"
    } else {
        Write-Fail "Should reject empty stage"
    }
}

# ============================================================
# Test 3.11: Update Contacts (PUT /api/enterprises/:id/contacts)
# ============================================================

Write-Test "3.11 Update Contacts - Normal case"
if ($script:CreatedEnterpriseId) {
    $contactsData = @{
        contacts = @(
            @{ name = "Contact_A"; phone = "13900139001"; isPrimary = $true; position = "CEO" }
            @{ name = "Contact_B"; phone = "13900139002"; isPrimary = $false; position = "CTO" }
        )
    }
    $result = Invoke-Api -Method "PUT" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)/contacts" -Body $contactsData
    if ($result.Success -and $result.Data.code -eq 200) {
        Write-Pass "Update contacts successful, count: $($result.Data.data.Count)"
    } else {
        Write-Fail "Update contacts failed: $($result.Data.message)"
    }
}

Write-Test "3.11 Get Contacts"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)/contacts"
    if ($result.Success -and $result.Data.code -eq 200 -and $result.Data.data.Count -eq 2) {
        Write-Pass "Get contacts successful"
    } else {
        Write-Fail "Get contacts failed"
    }
}

# ============================================================
# Test 3.1: Enterprise List with Filters
# ============================================================

Write-Test "3.1 Enterprise List - Filter by stage"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises?stage=HAS_DEMAND"
if ($result.Success -and $result.Data.code -eq 200) {
    Write-Pass "Filter by stage successful, found: $($result.Data.data.total)"
} else {
    Write-Fail "Filter by stage failed"
}

Write-Test "3.1 Enterprise List - Filter by keyword"
$result = Invoke-Api -Method "GET" -Endpoint "/api/enterprises?keyword=Updated"
if ($result.Success -and $result.Data.code -eq 200) {
    Write-Pass "Filter by keyword successful, found: $($result.Data.data.total)"
} else {
    Write-Fail "Filter by keyword failed"
}

# ============================================================
# Test 3.5: Delete Enterprise (DELETE /api/enterprises/:id)
# ============================================================

Write-Test "3.5 Delete Enterprise - Normal case"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)"
    if ($result.Success -and $result.Data.code -eq 200) {
        Write-Pass "Delete enterprise successful"
    } else {
        Write-Fail "Delete enterprise failed: $($result.Data.message)"
    }
}

Write-Test "3.5 Delete Enterprise - Already deleted"
if ($script:CreatedEnterpriseId) {
    $result = Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/$($script:CreatedEnterpriseId)"
    if (-not $result.Success -or $result.Data.code -eq 404 -or $result.Data.code -eq 400) {
        Write-Pass "Correctly handled already deleted enterprise"
    } else {
        Write-Fail "Should handle already deleted enterprise, got code: $($result.Data.code)"
    }
}

Write-Test "3.5 Delete Enterprise - Non-existent ID"
$result = Invoke-Api -Method "DELETE" -Endpoint "/api/enterprises/99999"
if (-not $result.Success -or $result.Data.code -eq 404) {
    Write-Pass "Correctly returned 404 for non-existent enterprise"
} else {
    Write-Fail "Should return 404 for non-existent enterprise"
}

# ============================================================
# Test Summary
# ============================================================

Write-Host "`n============================================================" -ForegroundColor White
Write-Host "Test Summary" -ForegroundColor White
Write-Host "============================================================" -ForegroundColor White
Write-Host "Total Tests: $($PassCount + $FailCount)" -ForegroundColor White
Write-Host "Passed: $PassCount" -ForegroundColor Green
Write-Host "Failed: $FailCount" -ForegroundColor Red
Write-Host "============================================================" -ForegroundColor White

if ($FailCount -gt 0) {
    Write-Host "`nSome tests failed. Please check the output above." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`nAll tests passed!" -ForegroundColor Green
    exit 0
}
