# PowerShell Launcher for Guns Biolink
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   GUNS.LOL TARZI BIOLINK VE ADMIN PANELI" -ForegroundColor Magenta
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

$agyNode = "$env:APPDATA\Antigravity\bin\agy-node.cmd"

if (Get-Command node -ErrorAction SilentlyContinue) {
    node server.js
} elseif (Test-Path $agyNode) {
    & $agyNode server.js
} else {
    Write-Host "[HATA] Node.js veya agy-node bulunamadi!" -ForegroundColor Red
    Pause
}
