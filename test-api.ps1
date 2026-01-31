# Script para testar os endpoints da API FilaZero (Windows PowerShell)
# Use: .\test-api.ps1

$API = "http://localhost:3001/api"
$ESTABLISHMENT = "banco-central"

Write-Host "🧪 Testando API FilaZero" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

# 1. Adicionar à fila
Write-Host "1️⃣ Adicionar à fila..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API/queue" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body (@{
    establishmentId = $ESTABLISHMENT
    name = "João Silva"
    phone = "(11) 98765-4321"
  } | ConvertTo-Json)

$response | ConvertTo-Json -Depth 5
$ENTRY_ID = $response.data.id
Write-Host "Entry ID: $ENTRY_ID`n" -ForegroundColor Green

# 2. Obter fila (apenas esperando)
Write-Host "2️⃣ Obter fila (apenas esperando)..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API/queue/$ESTABLISHMENT" -Method GET
$response | ConvertTo-Json -Depth 5
Write-Host ""

# 3. Obter todas as entradas (admin)
Write-Host "3️⃣ Obter todas as entradas (admin)..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API/queue/$ESTABLISHMENT/all" -Method GET
$response | ConvertTo-Json -Depth 5
Write-Host ""

# 4. Chamar próximo
Write-Host "4️⃣ Chamar próximo..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API/queue/$ESTABLISHMENT/call" -Method POST
$response | ConvertTo-Json -Depth 5
Write-Host ""

# 5. Finalizar atendimento
Write-Host "5️⃣ Finalizar atendimento..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$API/queue/$ESTABLISHMENT/serve/$ENTRY_ID" -Method POST
$response | ConvertTo-Json -Depth 5
Write-Host ""

Write-Host "✅ Teste concluído!" -ForegroundColor Green
