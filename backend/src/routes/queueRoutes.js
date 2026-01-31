import express from 'express';
import {
  addToQueue,
  getQueue,
  getAllEntries,
  callNext,
  serveEntry,
} from '../controllers/queueController.js';
import {
  validateQueueEntry,
  validateEstablishmentId,
  validateEntryParams,
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// POST /api/queue - Adicionar à fila
router.post('/', validateQueueEntry, addToQueue);

// GET /api/queue/:establishmentId/all - Obter todas as entradas (admin) [DEVE VIR ANTES de /:establishmentId]
router.get('/:establishmentId/all', validateEstablishmentId, getAllEntries);

// POST /api/queue/:establishmentId/call - Chamar próximo
router.post('/:establishmentId/call', validateEstablishmentId, callNext);

// POST /api/queue/:establishmentId/serve/:entryId - Finalizar atendimento
router.post('/:establishmentId/serve/:entryId', validateEntryParams, serveEntry);

// GET /api/queue/:establishmentId - Obter fila (apenas esperando) [DEVE VIR POR ÚLTIMO]
router.get('/:establishmentId', validateEstablishmentId, getQueue);

export default router;
