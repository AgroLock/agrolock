param (
    [string]$Token = $env:GITHUB_TOKEN
)

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

if (-not $Token) {
    Write-Error "GitHub Token is required. Pass -Token or set `$env:GITHUB_TOKEN."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $Token"
    "Accept"        = "application/vnd.github.v3+json"
    "User-Agent"    = "AgroLock-Issue-Creator"
}

$issuesDir = Join-Path $PSScriptRoot "..\.github\issues"
$files = Get-ChildItem -Path "$issuesDir\0*.md" | Sort-Object Name

Write-Host "Found $($files.Count) issue files in $issuesDir..." -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $lines = $content -split "\r?\n"
    $title = $lines[0] -replace '^#\s+', ''
    
    $labels = @()
    if ($content -match '\*\*Labels:\*\*\s*(.*)') {
        $labels = ($matches[1] -split ',').ForEach({ $_.Replace('`', '').Trim() }) | Where-Object { $_ -ne "" }
    }

    $bodyObj = @{
        title  = $title
        body   = $content
        labels = $labels
    } | ConvertTo-Json -Depth 5

    Write-Host "Creating issue: '$title'..." -NoNewline
    try {
        $res = Invoke-RestMethod -Uri "https://api.github.com/repos/Vicsygold/agrolock/issues" -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($bodyObj)) -ContentType "application/json; charset=utf-8"
        Write-Host " SUCCESS! Issue #$($res.number) -> $($res.html_url)" -ForegroundColor Green
    } catch {
        Write-Host " FAILED! $_" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            Write-Host "Details: $($reader.ReadToEnd())" -ForegroundColor Yellow
        }
    }
}
