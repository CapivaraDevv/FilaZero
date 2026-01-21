import queueService from '../services/QueueService.js';

// Adicionar pessoa na fila
export const addToQueue = (req, res) => {
  try {
    const { establishmentId, name, phone } = req.body;

    // Validação básica
    if (!establishmentId || !name || !phone) {
      return res.status(400).json({
        error: 'Campos obrigatórios: establishmentId, name, phone',
      });
    }

    if (name.trim() === '' || phone.trim() === '') {
      return res.status(400).json({
        error: 'Nome e telefone não podem estar vazios',
      });
    }

    const entry = queueService.addToQueue(establishmentId, name, phone);
    res.status(201).json({
      success: true,
      data: entry,
      message: 'Você foi adicionado à fila!',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Erro ao adicionar à fila',
      message: error.message,
    });
  }
};

// Obter fila de um estabelecimento
export const getQueue = (req, res) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        error: 'establishmentId é obrigatório',
      });
    }

    const queue = queueService.getQueue(establishmentId);
    const stats = queueService.getStats(establishmentId);

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
export const getAllEntries = (req, res) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        error: 'establishmentId é obrigatório',
      });
    }

    const entries = queueService.getAllEntries(establishmentId);
    const stats = queueService.getStats(establishmentId);

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
export const callNext = (req, res) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        error: 'establishmentId é obrigatório',
      });
    }

    const entry = queueService.callNext(establishmentId);

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
export const serveEntry = (req, res) => {
  try {
    const { establishmentId, entryId } = req.params;

    if (!establishmentId || !entryId) {
      return res.status(400).json({
        error: 'establishmentId e entryId são obrigatórios',
      });
    }

    const entry = queueService.serveEntry(establishmentId, entryId);

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
