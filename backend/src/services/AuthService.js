import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  // Registrar novo usuário
  async register(name, email, password, role = 'client', establishmentId = null) {
    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    // Validar role
    if (!['admin', 'client'].includes(role)) {
      throw new Error('Role inválida');
    }

    // Admin deve ter establishmentId
    if (role === 'admin' && !establishmentId) {
      throw new Error('Admin deve ter um establishmentId');
    }

    // Criar novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role,
      establishmentId: role === 'admin' ? establishmentId : null
    });

    // Gerar token
    const token = this.generateToken(user);

    return {
      token,
      user: user.toJSON()
    };
  }

  // Login
  async login(email, password) {
    // Verificar se usuário existe
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Email ou senha inválidos');
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      throw new Error('Usuário inativo');
    }

    // Verificar senha
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Email ou senha inválidos');
    }

    // Gerar token
    const token = this.generateToken(user);

    return {
      token,
      user: user.toJSON()
    };
  }

  // Gerar JWT
  generateToken(user) {
    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        establishmentId: user.establishmentId
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  // Verificar token
  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }

  // Obter usuário por ID
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    return user.toJSON();
  }
}

export default new AuthService();
