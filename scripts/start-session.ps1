$ErrorActionPreference = 'Stop'
$projectFolder = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectFolder
New-Item -ItemType Directory -Path (Join-Path $projectFolder 'local-session') -Force | Out-Null
$nodeExecutable = (Get-Command node.exe).Source
$chain = Get-NetTCPConnection -State Listen -LocalPort 8545 -ErrorAction SilentlyContinue
if (-not $chain) {
    $chainProcess = Start-Process -FilePath $nodeExecutable -ArgumentList 'node_modules/hardhat/internal/cli/cli.js node' -WorkingDirectory $projectFolder -WindowStyle Hidden -RedirectStandardOutput "$projectFolder/local-session/chain.log" -RedirectStandardError "$projectFolder/local-session/chain-error.log" -PassThru
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 500
        if (Get-NetTCPConnection -State Listen -LocalPort 8545 -ErrorAction SilentlyContinue) { $ready = $true; break }
    }
    if (-not $ready) { throw 'Local chain could not start. See local-session/chain-error.log.' }
    & $nodeExecutable scripts/session.cjs restore
    if ($LASTEXITCODE -ne 0) { Stop-Process -Id $chainProcess.Id -ErrorAction SilentlyContinue; throw 'Restore failed. Snapshot was preserved.' }
}
if (-not (Get-NetTCPConnection -State Listen -LocalPort 3000 -ErrorAction SilentlyContinue)) {
    Start-Process -FilePath $nodeExecutable -ArgumentList 'node_modules/vite/bin/vite.js web --host 127.0.0.1 --port 3000' -WorkingDirectory $projectFolder -WindowStyle Hidden -RedirectStandardOutput "$projectFolder/local-session/web.log" -RedirectStandardError "$projectFolder/local-session/web-error.log"
}
Start-Process 'http://localhost:3000'
Write-Host 'Project reopened. Unlock MetaMask and choose Localhost 8545.'

