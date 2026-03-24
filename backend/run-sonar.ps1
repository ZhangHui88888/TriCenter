#Requires -Version 5.1
<#
.SYNOPSIS
    Run full Sonar analysis via Maven (SonarQube / SonarCloud).
.DESCRIPTION
    Auth: env SONAR_TOKEN, OR one-line token in .sonar-token.local (gitignored) next to this script.
    Optional SONAR_HOST_URL (default http://localhost:9000). Do not commit tokens to Git.
#>
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$tokenFile = Join-Path $here '.sonar-token.local'
if (-not $env:SONAR_TOKEN -and (Test-Path -LiteralPath $tokenFile)) {
    $env:SONAR_TOKEN = (Get-Content -LiteralPath $tokenFile -Raw).Trim()
}
if (-not $env:SONAR_TOKEN) {
    Write-Error 'Set SONAR_TOKEN or create backend/.sonar-token.local (single line, gitignored).'
    exit 1
}
$hostUrl = if ($env:SONAR_HOST_URL) { $env:SONAR_HOST_URL } else { 'http://localhost:9000' }
Push-Location $here
try {
    $urlArg = '-Dsonar.host.url=' + $hostUrl
    $tokenArg = '-Dsonar.token=' + $env:SONAR_TOKEN
    & mvn clean verify sonar:sonar $urlArg $tokenArg @args
} finally {
    Pop-Location
}
