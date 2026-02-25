// Serviço para gerenciar a fila usando MongoDB

import { emitQueueUpdate, emitQueueCalled, emitQueueServed } from './socketService.js';
import QueueEntry from '../models/QueueEntry.js';
import QRCode from 'qrcode'

class QueueService {
  constructor() {
  
    
  }

  // gera uma imagem em base64 apontando para a página de tracking da ENTRADA
  async generateQRCode(entryId) {
    try {
      const trackingUrl = `${process.env.FRONTEND_URL}/fila/${entryId}`; // usar id da entrada

      const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.95,
        margin: 1,
        width: 300
      });

      return qrCodeDataUrl;
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
      return null;
    }
  }

  // Adicionar pessoa na fila
  async addToQueue(establishmentId, name, phone) {
    try {
      // Buscar última posição
      const lastEntry = await QueueEntry.findOne({ establishmentId, status: 'waiting' })
        .sort({ position: -1 });
      
      const position = (lastEntry?.position || 0) + 1;

      // Criar entrada
      const entry = new QueueEntry({
        establishmentId,
        name,
        phone,
        position,
        status: 'waiting'
      });

      await entry.save();

      // ✅ NOVO: Gerar QR Code para a entrada
      // gerar QR a partir do próprio _id da entrada
      const qrCode = await this.generateQRCode(entry._id.toString());
      entry.qrCode = qrCode;
      await entry.save();

      return entry;
    } catch (error) {
      throw new Error(`Erro ao adicionar à fila: ${error.message}`);
    }
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

    // Contar quantas entradas já foram atendidas (sem filtro de data)
    const totalServed = await QueueEntry.countDocuments({
      establishmentId,
      status: 'served',
    });

    // Calcular tempo médio de atendimento (em minutos)
    const servedEntries = await QueueEntry.find({
      establishmentId,
      status: 'served',
      calledAt: { $ne: null },
      servedAt: { $ne: null }
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
