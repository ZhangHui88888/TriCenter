function Assert-TriCenterTestTarget {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ServerUrl,
        [switch]$AllowRemote,
        [switch]$RequireWritePermission,
        [switch]$AllowWriteTests
    )

    $uri = [Uri]$ServerUrl
    if ($uri.Scheme -notin @('http', 'https')) {
        throw "测试地址必须使用 http 或 https"
    }

    $isLoopback = $uri.Host -in @('localhost', '127.0.0.1', '::1')
    if (-not $isLoopback -and -not $AllowRemote) {
        throw "默认拒绝对非回环地址运行验收脚本；如确认目标为隔离环境，请显式传入 -AllowRemote"
    }
    if ($RequireWritePermission -and -not $AllowWriteTests) {
        throw "该脚本包含写操作；请确认使用隔离测试环境后显式传入 -AllowWriteTests"
    }

    $origin = "{0}://{1}{2}" -f $uri.Scheme, $uri.Host, $(if ($uri.IsDefaultPort) { '' } else { ":$($uri.Port)" })
    try {
        $identity = Invoke-RestMethod -Uri "$origin/api/system/identity" -Method Get -TimeoutSec 5
    } catch {
        throw "无法验证目标应用身份：$($_.Exception.Message)"
    }
    if ($identity.data.application -ne 'tricenter-backend') {
        throw "目标不是 TriCenter 后端，已拒绝执行"
    }
}

function Assert-TriCenterTestCredentials {
    param(
        [string]$Username,
        [string]$Password
    )

    if ([string]::IsNullOrWhiteSpace($Username) -or [string]::IsNullOrWhiteSpace($Password)) {
        throw "请通过 -TestUsername/-TestPassword 或 TRICENTER_TEST_USERNAME/TRICENTER_TEST_PASSWORD 提供隔离环境测试凭据"
    }
}

function Get-TriCenterCsrfHeaders {
    param(
        [Parameter(Mandatory = $true)]
        [Microsoft.PowerShell.Commands.WebRequestSession]$Session,
        [Parameter(Mandatory = $true)]
        [string]$ServerUrl
    )

    $cookie = $Session.Cookies.GetCookies([Uri]$ServerUrl)['XSRF-TOKEN']
    if ($null -eq $cookie) {
        throw "认证会话没有返回 XSRF-TOKEN Cookie，无法安全执行写请求"
    }
    return @{ 'X-XSRF-TOKEN' = [Uri]::UnescapeDataString($cookie.Value) }
}
