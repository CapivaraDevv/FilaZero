import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

// Criar instância do Socket.io
let socket = null;

// Conectar ao servidor WebSocket
export function connectSocket() {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Conectado ao WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('❌ Desconectado do WebSocket');
  });

  socket.on('connect_error', (error) => {
    console.error('❌ Erro ao conectar WebSocket:', error);
  });

  return socket;
}

// Desconectar do servidor
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Entrar em uma sala de fila específica
export function joinQueue(establishmentId) {
  const currentSocket = getSocket();
  if (currentSocket.connected) {
    currentSocket.emit('join-queue', establishmentId);
  } else {
    // Aguardar conexão antes de entrar na sala
    currentSocket.once('connect', () => {
      currentSocket.emit('join-queue', establishmentId);
    });
  }
}

// Sair de uma sala de fila
export function leaveQueue(establishmentId) {
  const currentSocket = getSocket();
  if (currentSocket && currentSocket.connected) {
    currentSocket.emit('leave-queue', establishmentId);
  }
}

// Obter instância do socket
export function getSocket() {
  if (!socket || !socket.connected) {
    return connectSocket();
  }
  return socket;
}
