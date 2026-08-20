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
