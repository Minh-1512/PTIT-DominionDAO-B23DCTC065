$ErrorActionPreference = 'Stop'
$projectFolder = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectFolder
if (Get-NetTCPConnection -State Listen -LocalPort 8545 -ErrorAction SilentlyContinue) {
    & node.exe scripts/session.cjs save
    if ($LASTEXITCODE -ne 0) { throw 'Save failed. Services were NOT stopped.' }
}
foreach ($servicePort in @(3000,8545)) {
    $connections = Get-NetTCPConnection -State Listen -LocalPort $servicePort -ErrorAction SilentlyContinue
    foreach ($connection in $connections) {
        $serviceProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($connection.OwningProcess)"
        if ($serviceProcess.Name -eq 'node.exe' -and ($serviceProcess.CommandLine -match 'vite|hardhat')) {
            Stop-Process -Id $connection.OwningProcess
        } else { throw "Unexpected process on port $servicePort; it was not stopped." }
    }
}
Write-Host 'Saved and stopped. You can close the web tab and lock MetaMask.'
