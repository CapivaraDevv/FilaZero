import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import QueueService from '../QueueService.js';
import QueueEntry from '../../models/QueueEntry.js';

let mongoServer;

// beforeAll: Executa UMA VEZ antes de todos os testes
beforeAll(async () => {
  // Inicia um MongoDB fake em memória
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Conecta o Mongoose a esse MongoDB fake
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB em memória iniciado para testes');
});

// afterAll: Executa UMA VEZ depois de todos os testes
afterAll(async () => {
  // Desconecta e para o MongoDB fake
  await mongoose.disconnect();
  await mongoServer.stop();
  console.log('✅ MongoDB em memória encerrado');
});

// beforeEach: Executa ANTES de CADA teste
beforeEach(async () => {
  // Limpa a coleção QueueEntry antes de cada teste
  await QueueEntry.deleteMany({});
  console.log('  → Fila limpa antes do teste');
});

describe('QueueService', () => {
  describe('addToQueue - Teste básico', () => {
    it('deve adicionar uma pessoa à fila e retornar os dados corretos', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';
      const name = 'João Silva';
      const phone = '11999999999';

      // Chamar addToQueue
      const result = await QueueService.addToQueue(establishmentId, name, phone);

      // Asserções: verificar se o resultado está correto
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe(name);
      expect(result.phone).toBe(phone);
      expect(result.position).toBe(1); // Primeira pessoa na fila
      expect(result.status).toBe('waiting');
      expect(result.establishmentId).toBe(establishmentId);

      console.log('  ✅ Resultado do addToQueue:', result);
    });

    it('deve calcular a posição corretamente quando há pessoas na fila', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Adicionar primeira pessoa
      const result1 = await QueueService.addToQueue(establishmentId, 'João', '11999999999');
      expect(result1.position).toBe(1);

      // Adicionar segunda pessoa
      const result2 = await QueueService.addToQueue(establishmentId, 'Maria', '11988888888');
      expect(result2.position).toBe(2);

      // Adicionar terceira pessoa
      const result3 = await QueueService.addToQueue(establishmentId, 'Pedro', '11977777777');
      expect(result3.position).toBe(3);

      console.log('  ✅ Posições calculadas corretamente:', result1.position, result2.position, result3.position);
    });
  });

  describe('getQueue', () => {
    it('deve retornar um array', async () => {
      expect(Array.isArray(await QueueService.getQueue('some-id'))).toBe(true);
    });
  });

  describe('callNext', () => {
    it('deve chamar o próximo da fila e mudar status para "called"', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Passo 1: Adicionar pessoas na fila
      await QueueService.addToQueue(establishmentId, 'João', '11999999999');
      await QueueService.addToQueue(establishmentId, 'Maria', '11988888888');

      // Passo 2: Chamar o próximo (João, que é o primeiro)
      const result = await QueueService.callNext(establishmentId);

      // Passo 3: Verificar se o resultado está correto
      expect(result).toBeDefined(); // Resultado não é null
      expect(result.name).toBe('João'); // O primeiro da fila é João
      expect(result.status).toBe('called'); // Status mudou para 'called'
      expect(result.calledAt).toBeDefined(); // Tem a data de quando foi chamado
      expect(result.establishmentId).toBe(establishmentId);

      console.log('  ✅ Resultado do callNext:', result);
    });

    it('deve retornar null quando a fila está vazia', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Chamar callNext em uma fila vazia
      const result = await QueueService.callNext(establishmentId);

      // Deve retornar null (ou undefined)
      expect(result).toBeNull();

      console.log('  ✅ callNext em fila vazia retorna:', result);
    });
  });

  describe('serveEntry', () => {
    it('deve finalizar o atendimento e mudar status para "served"', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Passo 1: Adicionar pessoas na fila
      await QueueService.addToQueue(establishmentId, 'João', '11999999999');
      await QueueService.addToQueue(establishmentId, 'Maria', '11988888888');

      // Passo 2: Chamar o próximo (João será chamado)
      const calledEntry = await QueueService.callNext(establishmentId);
      expect(calledEntry).toBeDefined();
      expect(calledEntry.status).toBe('called');

      // Passo 3: Finalizar o atendimento
      const result = await QueueService.serveEntry(establishmentId, calledEntry.id);

      // Passo 4: Verificar se foi servido
      expect(result).toBeDefined(); // Resultado não é null
      expect(result.status).toBe('served'); // Status mudou para 'served'
      expect(result.servedAt).toBeDefined(); // Tem a data de quando foi servido
      expect(result.establishmentId).toBe(establishmentId);
      expect(result.name).toBe('João'); // Continua o mesmo

      console.log('  ✅ Resultado do serveEntry:', result);
    });

    it('deve retornar null quando tentamos servir um ID inexistente', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';
      const fakeId = '999999999999999999999999';

      // Tentar servir um ID que não existe
      const result = await QueueService.serveEntry(establishmentId, fakeId);

      // Deve retornar null
      expect(result).toBeNull();

      console.log('  ✅ serveEntry com ID inexistente retorna:', result);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas da fila corretamente', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Passo 1: Adicionar 2 pessoas na fila
      await QueueService.addToQueue(establishmentId, 'Pedro', '19993094500');
      await QueueService.addToQueue(establishmentId, 'Isa', '19997168571');

      // Passo 2: Chamar o próximo (Pedro)
      const calledEntry = await QueueService.callNext(establishmentId);

      // Passo 3: Esperar um pouco para gerar tempo de atendimento
      await new Promise(resolve => setTimeout(resolve, 100)); // 100ms

      // Passo 4: Servir Pedro
      await QueueService.serveEntry(establishmentId, calledEntry.id);

      // Passo 5: Obter estatísticas
      const result = await QueueService.getStats(establishmentId);

      // Passo 6: Verificar os valores
      expect(result).toBeDefined();
      expect(result.totalWaiting).toBe(1); // Isa ainda está esperando
      expect(result.totalServed).toBe(1); // Pedro foi servido
      expect(result.averageTime).toBeGreaterThanOrEqual(0); // Tempo médio >= 0

      console.log('  ✅ Resultado do getStats:', result);
    });

    it('deve retornar zeros quando não há dados', async () => {
      const establishmentId = '507f1f77bcf86cd799439011';

      // Obter estatísticas de uma fila vazia
      const result = await QueueService.getStats(establishmentId);

      expect(result).toBeDefined();
      expect(result.totalWaiting).toBe(0);
      expect(result.totalServed).toBe(0);
      expect(result.averageTime).toBe(0);

      console.log('  ✅ Resultado do getStats (vazio):', result);
    });
  });
});