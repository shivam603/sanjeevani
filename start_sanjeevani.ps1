Write-Host '============================================================================' -ForegroundColor Cyan
Write-Host '  Starting Sanjeevani Platform (API + 3 Portals + Ingestion Telemetry)' -ForegroundColor Green
Write-Host '============================================================================' -ForegroundColor Cyan

$venvPy = Join-Path $PSScriptRoot 'venv\Scripts\python.exe'
$script = Join-Path $PSScriptRoot 'scripts\start_all.py'

if (Test-Path $venvPy) {
    & $venvPy $script $args
} else {
    & python $script $args
}
