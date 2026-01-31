#!/bin/bash

# Script para testar os endpoints da API FilaZero
# Use: chmod +x test-api.sh && ./test-api.sh

API="http://localhost:3001/api"
ESTABLISHMENT="banco-central"

echo "🧪 Testando API FilaZero"
echo "========================\n"

# 1. Adicionar à fila
echo "1️⃣ Adicionar à fila..."
RESPONSE=$(curl -s -X POST $API/queue \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "'$ESTABLISHMENT'",
    "name": "João Silva",
    "phone": "(11) 98765-4321"
  }')

echo $RESPONSE | jq '.'
ENTRY_ID=$(echo $RESPONSE | jq -r '.data.id')
echo "Entry ID: $ENTRY_ID\n"

# 2. Obter fila (apenas esperando)
echo "2️⃣ Obter fila (apenas esperando)..."
curl -s -X GET $API/queue/$ESTABLISHMENT | jq '.'
echo ""

# 3. Obter todas as entradas (admin)
echo "3️⃣ Obter todas as entradas (admin)..."
curl -s -X GET $API/queue/$ESTABLISHMENT/all | jq '.'
echo ""

# 4. Chamar próximo
echo "4️⃣ Chamar próximo..."
curl -s -X POST $API/queue/$ESTABLISHMENT/call | jq '.'
echo ""

# 5. Finalizar atendimento
echo "5️⃣ Finalizar atendimento..."
curl -s -X POST $API/queue/$ESTABLISHMENT/serve/$ENTRY_ID | jq '.'
echo ""

echo "✅ Teste concluído!"
