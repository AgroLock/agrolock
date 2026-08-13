param (
    [string]$Token = $env:GITHUB_TOKEN
)

if (-not $Token) {
    Write-Error "GitHub Token is required. Pass -Token or set `$env:GITHUB_TOKEN."
    exit 1
}

$issuesDir = Join-Path $PSScriptRoot "..\.github\issues"
$files = Get-ChildItem -Path "$issuesDir\14*.md" | Sort-Object Name

Write-Host "Posting $($files.Count) issues to AgroLock/agrolock..." -ForegroundColor Cyan

foreach ($file in $files) {
    $rawContent = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $lines = $rawContent -split "\r?\n"
    $title = ($lines[0] -replace '^#\s+', '').Trim()
    
    $labels = @()
    if ($rawContent -match '\*\*Labels:\*\*\s*(.*)') {
        $labels = ($matches[1] -split ',').ForEach({ $_.Replace('`', '').Trim() }) | Where-Object { $_ -ne "" }
    }

    $payload = [ordered]@{
        title  = $title
        body   = $rawContent
        labels = $labels
    } | ConvertTo-Json -Compress

    $tmpJson = Join-Path $env:TEMP "issue_payload.json"
    $utf8NoBom = New-Object System.Text.UTF8Encoding $false
    [System.IO.File]::WriteAllText($tmpJson, $payload, $utf8NoBom)

    Write-Host "Posting: '$title'..." -NoNewline
    $output = curl.exe -s -L -X POST -H "Authorization: Bearer $Token" -H "Accept: application/vnd.github.v3+json" -H "User-Agent: AgroLock" -H "Content-Type: application/json" --data-binary "@$tmpJson" "https://api.github.com/repositories/1288047775/issues"
    
    try {
        $jsonRes = $output | ConvertFrom-Json
        if ($jsonRes.html_url) {
            Write-Host " SUCCESS! Issue #$($jsonRes.number) -> $($jsonRes.html_url)" -ForegroundColor Green
        } else {
            Write-Host " ERROR!" -ForegroundColor Red
            Write-Host $output -ForegroundColor Yellow
        }
    } catch {
        Write-Host " ERROR parsing response!" -ForegroundColor Red
        Write-Host $output -ForegroundColor Yellow
    }
}
