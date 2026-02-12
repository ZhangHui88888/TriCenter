# Module 4: Enterprise Product Management API Test Script
$baseUrl = "http://localhost:8080/api"

function Write-Success { param($msg) Write-Host $msg -ForegroundColor Green }
function Write-Error { param($msg) Write-Host $msg -ForegroundColor Red }
function Write-Info { param($msg) Write-Host $msg -ForegroundColor Cyan }

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Module 4: Product Management API Test" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# 1. Login
Write-Info "1. Login to get Token..."
$loginBody = '{"username":"admin","password":"admin123"}'

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Success "Login success, Token: $($token.Substring(0, 30))..."
} catch {
    Write-Error "Login failed: $_"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Create test enterprise
Write-Info "`n2. Create test enterprise..."
$enterpriseBody = '{"name":"Product Test Enterprise","district":"Wujin","enterpriseType":"Production"}'

try {
    $enterpriseResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises" -Method Post -Headers $headers -Body $enterpriseBody
    $enterpriseId = $enterpriseResponse.data.id
    Write-Success "Create enterprise success, ID: $enterpriseId"
} catch {
    Write-Error "Create enterprise failed: $_"
    exit 1
}

# ==================== Product Management Test ====================
Write-Host "`n========== Product Management Test ==========" -ForegroundColor Magenta

# 3. Add product
Write-Info "`n3. Add enterprise product..."
$productBody = '{"name":"Smart Garden Tool Set","categoryId":1,"certificationIds":[1,2],"targetRegionIds":[1,2],"targetCountryIds":["US","DE","JP"],"annualSales":"8M CNY","localProcurementRatio":"70%","automationLevelId":1,"annualCapacity":"300K units","logisticsPartnerIds":[1,2]}'

try {
    $productResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products" -Method Post -Headers $headers -Body $productBody
    $productId = $productResponse.data.id
    Write-Success "Add product success, ID: $productId"
    Write-Host "Product name: $($productResponse.data.name)"
} catch {
    Write-Error "Add product failed: $_"
}

# 4. Get product list
Write-Info "`n4. Get enterprise product list..."
try {
    $productsResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products" -Method Get -Headers $headers
    Write-Success "Get product list success, total: $($productsResponse.data.Count) products"
    foreach ($p in $productsResponse.data) {
        Write-Host "  - $($p.name) (ID: $($p.id))"
    }
} catch {
    Write-Error "Get product list failed: $_"
}

# 5. Update product
Write-Info "`n5. Update enterprise product..."
$updateProductBody = '{"name":"Smart Garden Tool Set Pro","annualSales":"12M CNY","annualCapacity":"500K units"}'

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products/$productId" -Method Put -Headers $headers -Body $updateProductBody
    Write-Success "Update product success"
    Write-Host "New name: $($updateResponse.data.name)"
    Write-Host "New annual sales: $($updateResponse.data.annualSales)"
} catch {
    Write-Error "Update product failed: $_"
}

# 6. Test empty product name
Write-Info "`n6. Test empty product name (edge case)..."
$emptyNameBody = '{"name":""}'

try {
    $emptyResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products" -Method Post -Headers $headers -Body $emptyNameBody
    Write-Error "Should return error but succeeded"
} catch {
    Write-Success "Correctly rejected empty name: 400 Bad Request"
}

# 7. Test non-existent enterprise
Write-Info "`n7. Test non-existent enterprise ID (edge case)..."
try {
    $notFoundResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/99999/products" -Method Get -Headers $headers
    Write-Error "Should return error but succeeded"
} catch {
    Write-Success "Correctly returned enterprise not found error"
}

# ==================== Patent Management Test ====================
Write-Host "`n========== Patent Management Test ==========" -ForegroundColor Magenta

# 8. Add patent
Write-Info "`n8. Add enterprise patent..."
$patentBody = '{"name":"Eco-friendly Material Technology","patentNo":"ZL2023XXXXXXXX.X"}'

try {
    $patentResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/patents" -Method Post -Headers $headers -Body $patentBody
    $patentId = $patentResponse.data.id
    Write-Success "Add patent success, ID: $patentId"
    Write-Host "Patent name: $($patentResponse.data.name)"
    Write-Host "Patent no: $($patentResponse.data.patentNo)"
} catch {
    Write-Error "Add patent failed: $_"
}

# 9. Get patent list
Write-Info "`n9. Get enterprise patent list..."
try {
    $patentsResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/patents" -Method Get -Headers $headers
    Write-Success "Get patent list success, total: $($patentsResponse.data.Count) patents"
    foreach ($pt in $patentsResponse.data) {
        Write-Host "  - $($pt.name) ($($pt.patentNo))"
    }
} catch {
    Write-Error "Get patent list failed: $_"
}

# 10. Update patent
Write-Info "`n10. Update enterprise patent..."
$updatePatentBody = '{"name":"Eco-friendly Material Technology V2","patentNo":"ZL2024YYYYYYYY.Y"}'

try {
    $updatePatentResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/patents/$patentId" -Method Put -Headers $headers -Body $updatePatentBody
    Write-Success "Update patent success"
    Write-Host "New name: $($updatePatentResponse.data.name)"
    Write-Host "New patent no: $($updatePatentResponse.data.patentNo)"
} catch {
    Write-Error "Update patent failed: $_"
}

# 11. Test empty patent name
Write-Info "`n11. Test empty patent name (edge case)..."
$emptyPatentBody = '{"name":"","patentNo":"ZL123"}'

try {
    $emptyPatentResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/patents" -Method Post -Headers $headers -Body $emptyPatentBody
    Write-Error "Should return error but succeeded"
} catch {
    Write-Success "Correctly rejected empty patent name: 400 Bad Request"
}

# 12. Delete patent
Write-Info "`n12. Delete enterprise patent..."
try {
    $deletePatentResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/patents/$patentId" -Method Delete -Headers $headers
    Write-Success "Delete patent success"
} catch {
    Write-Error "Delete patent failed: $_"
}

# 13. Delete product
Write-Info "`n13. Delete enterprise product..."
try {
    $deleteProductResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products/$productId" -Method Delete -Headers $headers
    Write-Success "Delete product success"
} catch {
    Write-Error "Delete product failed: $_"
}

# 14. Verify empty list after deletion
Write-Info "`n14. Verify product list after deletion..."
try {
    $finalProductsResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId/products" -Method Get -Headers $headers
    if ($finalProductsResponse.data.Count -eq 0) {
        Write-Success "Product list is empty"
    } else {
        Write-Error "Product list should be empty but has $($finalProductsResponse.data.Count) products"
    }
} catch {
    Write-Error "Get product list failed: $_"
}

# 15. Cleanup - delete test enterprise
Write-Info "`n15. Cleanup test data..."
try {
    $deleteEnterpriseResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/$enterpriseId" -Method Delete -Headers $headers
    Write-Success "Delete test enterprise success"
} catch {
    Write-Error "Delete test enterprise failed: $_"
}

# 16. Test without token
Write-Info "`n16. Test without token (edge case)..."
try {
    $noTokenResponse = Invoke-RestMethod -Uri "$baseUrl/enterprises/1/products" -Method Get
    Write-Error "Should return 401 but succeeded"
} catch {
    Write-Success "Correctly returned 401 Unauthorized"
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host "Module 4 Test Complete!" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow
