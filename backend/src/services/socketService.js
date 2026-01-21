// Serviço para gerenciar eventos WebSocket
// Este serviço será usado pelo QueueService para emitir eventos em tempo real

let ioInstance = null;

// Inicializar o Socket.io instance
export function initSocketIO(io) {
  ioInstance = io;
}

// Emitir evento quando a fila é atualizada
export function emitQueueUpdate(establishmentId, data) {
  if (!ioInstance) {
    console.warn('⚠️ Socket.io não inicializado');
    return;
  }

  ioInstance.to(`queue:${establishmentId}`).emit('queue:update', {
    establishmentId,
    ...data,
  });
}

// Emitir evento quando um cliente é chamado
export function emitQueueCalled(establishmentId, entry) {
  if (!ioInstance) {
    console.warn('⚠️ Socket.io não inicializado');
    return;
  }

  const room = `queue:${establishmentId}`;
  const eventData = {
    establishmentId,
    entry,
  };

  console.log(`📢 Emitindo queue:called para sala ${room}:`, eventData);
  
  ioInstance.to(room).emit('queue:called', eventData);
  
  // Log para debug
  const socketsInRoom = ioInstance.sockets.adapter.rooms.get(room);
  console.log(`👥 Clientes na sala ${room}:`, socketsInRoom ? socketsInRoom.size : 0);
}

// Emitir evento quando um atendimento é finalizado
export function emitQueueServed(establishmentId, entry) {
  if (!ioInstance) {
    console.warn('⚠️ Socket.io não inicializado');
    return;
  }

  ioInstance.to(`queue:${establishmentId}`).emit('queue:served', {
    establishmentId,
    entry,
  });
}
