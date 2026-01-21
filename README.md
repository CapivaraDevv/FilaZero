# FilaZero

Sistema de gerenciamento de filas em tempo real.

## Estrutura do Projeto

- `backend/` - API REST em Node.js/Express
- `frontend/` - Interface React com TypeScript
- `database/` - Migrações e seeds (futuro)

## Como Executar

### Backend

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará rodando em `http://localhost:5173` (ou porta configurada pelo Vite)

## Variáveis de Ambiente

### Backend
Crie um arquivo `.env` na pasta `backend/`:
```
PORT=3001
```

### Frontend
Crie um arquivo `.env` na pasta `frontend/`:
```
VITE_API_URL=http://localhost:3001/api
```

## Funcionalidades Implementadas

✅ Cliente pode entrar na fila
✅ Admin pode visualizar a fila
✅ Admin pode chamar próximo da fila
✅ Admin pode finalizar atendimento
✅ Estatísticas básicas (pessoas na fila, atendidos hoje, tempo médio)
✅ Atualização automática da fila (polling a cada 5 segundos)

## Próximos Passos

- [ ] Migrar dados para banco de dados (PostgreSQL/MySQL)
- [ ] Implementar WebSocket para atualização em tempo real
- [ ] Autenticação e autorização
- [ ] Notificações push
- [ ] QR Code para clientes
- [ ] Histórico de atendimentos
