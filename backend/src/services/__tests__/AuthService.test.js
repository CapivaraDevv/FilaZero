import authService from '../AuthService.js';

describe('AuthService', () => {
  describe('generateToken', () => {
    it('deve gerar um token JWT válido', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'admin',
        establishmentId: 'banco-central'
      };

      const token = authService.generateToken(user);

      // Token deve ser uma string
      expect(typeof token).toBe('string');
      
      // Token deve ter 3 partes (header.payload.signature)
      expect(token.split('.').length).toBe(3);
    });

    it('deve incluir dados do usuário no token', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'joao@example.com',
        role: 'client',
        establishmentId: null
      };

      const token = authService.generateToken(user);
      
      // Decodificar payload (parte do meio do JWT)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString()
      );

      expect(payload.email).toBe('joao@example.com');
      expect(payload.role).toBe('client');
      expect(payload.id).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('verifyToken', () => {
    it('deve verificar um token válido', () => {
      const user = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        role: 'admin',
        establishmentId: 'banco-central'
      };

      const token = authService.generateToken(user);
      const decoded = authService.verifyToken(token);

      expect(decoded.email).toBe('test@example.com');
      expect(decoded.role).toBe('admin');
    });

    it('deve lançar erro para token inválido', () => {
      const tokenInvalido = 'token.invalido.aqui';
      
      expect(() => {
        authService.verifyToken(tokenInvalido);
      }).toThrow('Token inválido ou expirado');
    });

    it('deve lançar erro para token vazio', () => {
      expect(() => {
        authService.verifyToken('');
      }).toThrow('Token inválido ou expirado');
    });
  });
});
