// Serviço para gerenciar a fila em memória
// TODO: Migrar para banco de dados depois

import { emitQueueUpdate, emitQueueCalled, emitQueueServed } from './socketService.js';

class QueueService {
  constructor() {
    // Estrutura: { establishmentId: [queueEntries...] }
    this.queues = {};
    // Estatísticas por estabelecimento
    this.stats = {};
  }

  // Adicionar pessoa na fila
  addToQueue(establishmentId, name, phone) {
    if (!this.queues[establishmentId]) {
      this.queues[establishmentId] = [];
      this.stats[establishmentId] = {
        totalServed: 0,
        averageTime: 0,
      };
    }

    const position = this.queues[establishmentId].length + 1;
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      phone: phone.trim(),
      establishmentId,
      position,
      status: 'waiting', // waiting, called, served
      createdAt: new Date().toISOString(),
      calledAt: null,
      servedAt: null,
    };

    this.queues[establishmentId].push(entry);
    
    // Emitir evento WebSocket de atualização da fila
    const queue = this.getQueue(establishmentId);
    const stats = this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
      newEntry: entry,
    });
    
    return entry;
  }

  // Obter fila de um estabelecimento
  getQueue(establishmentId) {
    if (!this.queues[establishmentId]) {
      return [];
    }
    return this.queues[establishmentId]
      .filter(entry => entry.status === 'waiting')
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
  }

  // Obter todas as entradas (incluindo chamadas e atendidas)
  getAllEntries(establishmentId) {
    if (!this.queues[establishmentId]) {
      return [];
    }
    return this.queues[establishmentId].map((entry, index) => {
      if (entry.status === 'waiting') {
        const waitingEntries = this.queues[establishmentId].filter(e => e.status === 'waiting');
        const position = waitingEntries.findIndex(e => e.id === entry.id) + 1;
        return { ...entry, position };
      }
      return { ...entry, position: entry.position };
    });
  }

  // Chamar próximo da fila
  callNext(establishmentId) {
    if (!this.queues[establishmentId]) {
      return null;
    }

    const waitingEntries = this.queues[establishmentId].filter(
      entry => entry.status === 'waiting'
    );

    if (waitingEntries.length === 0) {
      return null;
    }

    const nextEntry = waitingEntries[0];
    nextEntry.status = 'called';
    nextEntry.calledAt = new Date().toISOString();

    // Atualizar posições dos que ainda estão esperando
    this.updatePositions(establishmentId);

    // Emitir evento WebSocket de cliente chamado
    console.log('📢 Emitindo evento queue:called para:', nextEntry);
    emitQueueCalled(establishmentId, nextEntry);
    
    // Emitir atualização geral da fila
    const queue = this.getQueue(establishmentId);
    const stats = this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
    });

    return nextEntry;
  }

  // Finalizar atendimento
  serveEntry(establishmentId, entryId) {
    if (!this.queues[establishmentId]) {
      return null;
    }

    const entry = this.queues[establishmentId].find(e => e.id === entryId);
    if (!entry) {
      return null;
    }

    entry.status = 'served';
    entry.servedAt = new Date().toISOString();

    // Atualizar estatísticas
    if (!this.stats[establishmentId]) {
      this.stats[establishmentId] = { totalServed: 0, averageTime: 0 };
    }
    this.stats[establishmentId].totalServed += 1;

    // Calcular tempo médio (simplificado)
    const servedEntries = this.queues[establishmentId].filter(e => e.status === 'served');
    if (servedEntries.length > 0) {
      const totalTime = servedEntries.reduce((acc, e) => {
        if (e.calledAt && e.servedAt) {
          const time = new Date(e.servedAt) - new Date(e.calledAt);
          return acc + time;
        }
        return acc;
      }, 0);
      this.stats[establishmentId].averageTime = Math.round(totalTime / servedEntries.length / 1000 / 60); // em minutos
    }

    this.updatePositions(establishmentId);
    
    // Emitir evento WebSocket de atendimento finalizado
    emitQueueServed(establishmentId, entry);
    
    // Emitir atualização geral da fila
    const queue = this.getQueue(establishmentId);
    const stats = this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
    });
    
    return entry;
  }

  // Atualizar posições dos que estão esperando
  updatePositions(establishmentId) {
    if (!this.queues[establishmentId]) {
      return;
    }

    const waitingEntries = this.queues[establishmentId]
      .filter(entry => entry.status === 'waiting')
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    waitingEntries.forEach((entry, index) => {
      entry.position = index + 1;
    });
  }

  // Obter estatísticas
  getStats(establishmentId) {
    if (!this.stats[establishmentId]) {
      return {
        totalWaiting: 0,
        totalServed: 0,
        averageTime: 0,
      };
    }

    const waitingCount = this.getQueue(establishmentId).length;

    return {
      totalWaiting: waitingCount,
      totalServed: this.stats[establishmentId].totalServed || 0,
      averageTime: this.stats[establishmentId].averageTime || 0,
    };
  }
}

// Singleton - uma única instância do serviço
export default new QueueService();
