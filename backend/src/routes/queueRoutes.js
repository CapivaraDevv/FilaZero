import express from 'express';
import {
  addToQueue,
  getQueue,
  getAllEntries,
  callNext,
  serveEntry,
} from '../controllers/queueController.js';

const router = express.Router();

// POST /api/queue - Adicionar à fila
router.post('/', addToQueue);

// GET /api/queue/:establishmentId - Obter fila (apenas esperando)
router.get('/:establishmentId', getQueue);

// GET /api/queue/:establishmentId/all - Obter todas as entradas (admin)
router.get('/:establishmentId/all', getAllEntries);

// POST /api/queue/:establishmentId/call - Chamar próximo
router.post('/:establishmentId/call', callNext);

// POST /api/queue/:establishmentId/serve/:entryId - Finalizar atendimento
router.post('/:establishmentId/serve/:entryId', serveEntry);

export default router;
