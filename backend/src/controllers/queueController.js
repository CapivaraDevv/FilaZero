import queueService from '../services/QueueService.js';

// Adicionar pessoa na fila
export const addToQueue = async (req, res) => {
  try {
    const { establishmentId, name, phone } = req.body;

    // Validações
    if(!establishmentId || !name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Campos obrigatórios não preenchidos'
      });
    }
    
    const entry = await queueService.addToQueue(establishmentId, name, phone);
    res.status(201).json({
      success: true,
      data: {
        id: entry._id,
        name: entry.name,
        phone: entry.phone,
        position: entry.position,
        status: entry.status,
        qrCode: entry.qrCode, // ✅ Dados do QR Code em base64
        createdAt: entry.createdAt
      },
      message: 'Você foi adicionado à fila com sucesso!',
    });

    const socket = req.app.get('io');
    socket.io(establishmentId).emit('queue:update', { queue: entry});
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Obter fila de um estabelecimento
export const getQueue = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const queue = await queueService.getQueue(establishmentId);
    const stats = await queueService.getStats(establishmentId);

    res.json({
      success: true,
      data: {
        queue,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter fila',
      message: error.message,
    });
  }
};

// Obter todas as entradas (para admin)
export const getAllEntries = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const entries = await queueService.getAllEntries(establishmentId);
    const stats = await queueService.getStats(establishmentId);

    res.json({
      success: true,
      data: {
        entries,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao obter entradas',
      message: error.message,
    });
  }
};

// Chamar próximo da fila
export const callNext = async (req, res) => {
  try {
    const { establishmentId } = req.params;

    const entry = await queueService.callNext(establishmentId);

    if (!entry) {
      return res.status(404).json({
        error: 'Não há ninguém na fila',
      });
    }

    res.json({
      success: true,
      data: entry,
      message: `${entry.name} foi chamado!`,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao chamar próximo',
      message: error.message,
    });
  }
};

// Finalizar atendimento
export const serveEntry = async (req, res) => {
  try {
    const { establishmentId, entryId } = req.params;

    const entry = await queueService.serveEntry(establishmentId, entryId);

    if (!entry) {
      return res.status(404).json({
        error: 'Entrada não encontrada',
      });
    }

    res.json({
      success: true,
      data: entry,
      message: 'Atendimento finalizado',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao finalizar atendimento',
      message: error.message,
    });
  }
};

// Gerar qrCode
export const getEstablishmentQRCode = async (req, res) => {
  try{
    const { establishmentId } = req.params;

    const qrCode = await queueService.generateQRCode(establishmentId);

    res.json({
      success: true,
      data: qrCode
    });

  } catch (error) {
    res.stauts(500).json({
      success: false,
      message: error.message
    });
  }
};