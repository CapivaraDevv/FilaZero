// Serviço para gerenciar a fila usando MongoDB

import { emitQueueUpdate, emitQueueCalled, emitQueueServed } from './socketService.js';
import QueueEntry from '../models/QueueEntry.js';

class QueueService {
  constructor() {
  
    
  }

  // Adicionar pessoa na fila
  async addToQueue(establishmentId, name, phone) {
    // Contar quantos estão esperando para calcular a posição
    const waitingCount = await QueueEntry.countDocuments({
      establishmentId,
      status: 'waiting'
    });
    
    const position = waitingCount + 1;

    // Criar nova entrada no banco
    const entry = await QueueEntry.create({
      name: name.trim(),
      phone: phone.trim(),
      establishmentId,
      position,
      status: 'waiting'
      // createdAt e _id são criados automaticamente
    });
    
    // Converter para objeto simples (com id em vez de _id)
    const entryData = {
      id: entry._id.toString(),
      name: entry.name,
      phone: entry.phone,
      establishmentId: entry.establishmentId,
      position: entry.position,
      status: entry.status,
      createdAt: entry.createdAt,
      calledAt: entry.calledAt,
      servedAt: entry.servedAt
    };
    
    // Emitir evento WebSocket de atualização da fila
    const queue = await this.getQueue(establishmentId);
    const stats = await this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
      newEntry: entryData,
    });
    
    return entryData;
  }

  // Obter fila de um estabelecimento (apenas esperando)
  async getQueue(establishmentId) {
    // Buscar todas as entradas esperando, ordenadas por data de criação
    const entries = await QueueEntry.find({
      establishmentId,
      status: 'waiting'
    }).sort({ createdAt: 1 }); // 1 = crescente (mais antigo primeiro)
    
    // Atualizar posições e converter para objeto simples
    return entries.map((entry, index) => ({
      id: entry._id.toString(), // MongoDB usa _id, converter para string
      name: entry.name,
      phone: entry.phone,
      establishmentId: entry.establishmentId,
      position: index + 1,
      status: entry.status,
      createdAt: entry.createdAt,
      calledAt: entry.calledAt,
      servedAt: entry.servedAt
    }));
  }

  // Obter todas as entradas (incluindo chamadas e atendidas)
  async getAllEntries(establishmentId) {
    // Buscar todas as entradas do estabelecimento
    const allEntries = await QueueEntry.find({ establishmentId })
      .sort({ createdAt: 1 });
    
    // Separar por status
    const waitingEntries = allEntries.filter(e => e.status === 'waiting');
    
    // Converter para objeto simples e calcular posições
    return allEntries.map((entry) => {
      const baseEntry = {
        id: entry._id.toString(),
        name: entry.name,
        phone: entry.phone,
        establishmentId: entry.establishmentId,
        status: entry.status,
        createdAt: entry.createdAt,
        calledAt: entry.calledAt,
        servedAt: entry.servedAt
      };
      
      // Se está esperando, calcular posição baseada na ordem
      if (entry.status === 'waiting') {
        const position = waitingEntries.findIndex(e => e._id.toString() === entry._id.toString()) + 1;
        return { ...baseEntry, position };
      }
      
      // Se já foi chamado ou atendido, usar a posição salva
      return { ...baseEntry, position: entry.position };
    });
  }

  // Chamar próximo da fila
  async callNext(establishmentId) {
    // Buscar a primeira entrada esperando (mais antiga)
    const nextEntry = await QueueEntry.findOne({
      establishmentId,
      status: 'waiting'
    }).sort({ createdAt: 1 }); // Mais antigo primeiro

    if (!nextEntry) {
      return null;
    }

    // Atualizar status para 'called' e salvar data
    nextEntry.status = 'called';
    nextEntry.calledAt = new Date();
    await nextEntry.save();

    // Atualizar posições dos que ainda estão esperando
    await this.updatePositions(establishmentId);

    // Converter para objeto simples
    const entryData = {
      id: nextEntry._id.toString(),
      name: nextEntry.name,
      phone: nextEntry.phone,
      establishmentId: nextEntry.establishmentId,
      position: nextEntry.position,
      status: nextEntry.status,
      createdAt: nextEntry.createdAt,
      calledAt: nextEntry.calledAt,
      servedAt: nextEntry.servedAt
    };

    // Emitir evento WebSocket de cliente chamado
    console.log('📢 Emitindo evento queue:called para:', entryData);
    emitQueueCalled(establishmentId, entryData);
    
    // Emitir atualização geral da fila
    const queue = await this.getQueue(establishmentId);
    const stats = await this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
    });

    return entryData;
  }

  // Finalizar atendimento
  async serveEntry(establishmentId, entryId) {
    // Buscar a entrada no banco
    const entry = await QueueEntry.findOne({
      _id: entryId,
      establishmentId
    });

    if (!entry) {
      return null;
    }

    // Atualizar status e data de atendimento
    entry.status = 'served';
    entry.servedAt = new Date();
    await entry.save();

    // Atualizar posições dos que ainda estão esperando
    await this.updatePositions(establishmentId);
    
    // Converter para objeto simples
    const entryData = {
      id: entry._id.toString(),
      name: entry.name,
      phone: entry.phone,
      establishmentId: entry.establishmentId,
      position: entry.position,
      status: entry.status,
      createdAt: entry.createdAt,
      calledAt: entry.calledAt,
      servedAt: entry.servedAt
    };
    
    // Emitir evento WebSocket de atendimento finalizado
    emitQueueServed(establishmentId, entryData);
    
    // Emitir atualização geral da fila
    const queue = await this.getQueue(establishmentId);
    const stats = await this.getStats(establishmentId);
    emitQueueUpdate(establishmentId, {
      queue,
      stats,
    });
    
    return entryData;
  }

  // Atualizar posições dos que estão esperando
  async updatePositions(establishmentId) {
    // Buscar todas as entradas esperando, ordenadas por data
    const waitingEntries = await QueueEntry.find({
      establishmentId,
      status: 'waiting'
    }).sort({ createdAt: 1 });

    // Atualizar posição de cada uma
    for (let index = 0; index < waitingEntries.length; index++) {
      waitingEntries[index].position = index + 1;
      await waitingEntries[index].save();
    }
  }

  // Obter estatísticas
  async getStats(establishmentId) {
    // Contar quantos estão esperando
    const totalWaiting = await QueueEntry.countDocuments({
      establishmentId,
      status: 'waiting'
    });

    // Contar quantos foram atendidos hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalServed = await QueueEntry.countDocuments({
      establishmentId,
      status: 'served',
      servedAt: { $gte: today } // $gte = maior ou igual (hoje ou depois)
    });

    // Calcular tempo médio de atendimento (em minutos)
    const servedEntries = await QueueEntry.find({
      establishmentId,
      status: 'served',
      calledAt: { $exists: true },
      servedAt: { $exists: true }
    });

    let averageTime = 0;
    if (servedEntries.length > 0) {
      const totalTime = servedEntries.reduce((acc, entry) => {
        const time = new Date(entry.servedAt) - new Date(entry.calledAt);
        return acc + time;
      }, 0);
      averageTime = Math.round(totalTime / servedEntries.length / 1000 / 60); // converter para minutos
    }

    return {
      totalWaiting,
      totalServed,
      averageTime
    };
  }
}

// Singleton - uma única instância do serviço
export default new QueueService();
