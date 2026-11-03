$root = Split-Path -Parent $PSScriptRoot
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root/backend'; npm run dev"
Start-Process powershell -ArgumentList '-NoExit','-Command',"Set-Location '$root/frontend'; npm run dev"
