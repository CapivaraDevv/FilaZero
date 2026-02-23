# FilaZero

Sistema de gerenciamento de filas em tempo real com suporte a múltiplos estabelecimentos.

## 📁 Estrutura do Projeto

```
FilaZero/
├── backend/              # API REST (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── controllers/  # Controladores de requisições
│   │   ├── models/       # Modelos MongoDB
│   │   ├── routes/       # Rotas da API
│   │   ├── services/     # Lógica de negócio
│   │   ├── middlewares/  # Validações
│   │   ├── config/       # Configurações
│   │   └── server.js     # Entrada principal
│   └── package.json
├── frontend/             # Interface (React + Tailwind)
│   ├── src/
│   │   ├── pages/        # Páginas
│   │   ├── components/   # Componentes
│   │   ├── services/     # Chamadas API
│   │   └── App.jsx
│   └── package.json
└── database/             # Migrations e seeds (futuro)
```

## 🚀 Setup Local

### Pré-requisitos
- Node.js v22+
- MongoDB Atlas (ou local)

### Instalação

1. **Clone o repositório**
```bash
git clone <seu-repo>
cd FilaZero
```

2. **Configure backend/.env**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/filazero
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

3. **Configure frontend/.env** (opcional)
```env
VITE_API_URL=http://localhost:3001/api
VITE_SOCKET_URL=http://localhost:3001
```

4. **Instale e rode**
```bash
# Terminal 1 - Backend
cd backend && npm install && npm run dev

# Terminal 2 - Frontend
cd frontend && npm install && npm run dev
```

- Backend: http://localhost:3001
- Frontend: http://localhost:5173

---

## 📡 API Endpoints

### Base: `http://localhost:3001/api`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| **POST** | `/queue` | Adicionar à fila |
| **GET** | `/queue/:establishmentId` | Obter fila (waiting) |
| **GET** | `/queue/:establishmentId/all` | Obter todas as entradas (admin) |
| **POST** | `/queue/:establishmentId/call` | Chamar próximo |
| **POST** | `/queue/:establishmentId/serve/:entryId` | Finalizar atendimento |
| **GET** | `/queue/qrcode/:establishmentId` | Obter QR Code (base64) |

### Exemplo: Adicionar à Fila

**Request:**
```bash
curl -X POST http://localhost:3001/api/queue \
  -H "Content-Type: application/json" \
  -d '{
    "establishmentId": "banco-central",
    "name": "João Silva",
    "phone": "(11) 98765-4321"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67a5c1d8...",
    "name": "João Silva",
    "position": 1,
    "status": "waiting",
    "establishmentId": "banco-central"
  },
  "message": "Você foi adicionado à fila!"
}
```

---

## ✨ Funcionalidades

### Cliente
✅ Entrar na fila remotamente  
✅ Ver posição em tempo real  
✅ Acompanhar quando será chamado  
✅ QR Code para confirmação

### Admin
✅ Visualizar fila em tempo real  
✅ Chamar próximo cliente  
✅ Finalizar atendimento  
✅ Ver estatísticas (tempo médio, total atendido)

---

## 🛠️ Tech Stack

**Backend:**
- Node.js v22
- Express.js
- MongoDB + Mongoose
- Socket.IO

**Frontend:**
- React 19
- React Router
- Tailwind CSS
- Socket.IO Client
- Motion (animações)

---

## 📋 Status do Projeto

- [x] Rodar backend e frontend localmente
- [x] Validação de entrada com middlewares
- [x] API CRUD de filas
- [x] Sincronização MongoDB
- [ ] Autenticação JWT
- [ ] Testes automatizados
- [ ] CI/CD (GitHub Actions)
- [ ] Docker + Deploy

---

## 🤝 Contribuindo

Siga o padrão de commits:
- `feat:` nova funcionalidade
- `fix:` correção
- `docs:` documentação
- `test:` testes

---

## 📝 Licença

MIT


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
