import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import queueRoutes from './routes/queueRoutes.js';
import { initSocketIO } from './services/socketService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Criar servidor HTTP
const httpServer = createServer(app);

// Configurar Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Tornar io disponível globalmente (para usar nos controllers)
app.set('io', io);

// Inicializar serviço de Socket.io
initSocketIO(io);

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/queue', queueRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando' });
});

// Configurar conexões WebSocket
io.on('connection', (socket) => {
  console.log(`✅ Cliente conectado: ${socket.id}`);

  // Cliente entra em uma sala específica da fila
  socket.on('join-queue', (establishmentId) => {
    socket.join(`queue:${establishmentId}`);
    console.log(`📋 Cliente ${socket.id} entrou na fila: ${establishmentId}`);
  });

  // Cliente sai de uma sala
  socket.on('leave-queue', (establishmentId) => {
    socket.leave(`queue:${establishmentId}`);
    console.log(`👋 Cliente ${socket.id} saiu da fila: ${establishmentId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔌 WebSocket ativo`);
});
