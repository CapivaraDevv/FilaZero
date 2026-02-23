import { jest } from '@jest/globals';
import { addToQueue } from '../queueController.js';
import queueService from '../../services/QueueService.js';
import { emitQueueUpdate } from '../../services/socketService.js';

// mock the socket service only; the queue service will be stubbed manually
jest.mock('../../services/socketService.js', () => ({
  emitQueueUpdate: jest.fn(),
}));

// ensure the addToQueue method can be replaced in tests
queueService.addToQueue = jest.fn();

describe('queueController', () => {
  describe('addToQueue', () => {
    it('deve retornar o objeto da entrada incluindo establishmentId', async () => {
      const establishmentId = 'test-est';
      const mockEntry = {
        _id: 'abc123',
        establishmentId,
        name: 'Teste',
        phone: '999999999',
        position: 1,
        status: 'waiting',
        qrCode: 'data:',
        createdAt: new Date(),
      };

      // preparar a requisição/fake
      const req = {
        body: { establishmentId, name: 'Teste', phone: '999999999' },
      };
      const jsonSpy = jest.fn();
      const res = {
        status: jest.fn().mockReturnValue({ json: jsonSpy }),
      };

      queueService.addToQueue.mockResolvedValue(mockEntry);

      await addToQueue(req, res);

      expect(queueService.addToQueue).toHaveBeenCalledWith(establishmentId, 'Teste', '999999999');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          establishmentId,
        }),
      }));
    });
  });
});
