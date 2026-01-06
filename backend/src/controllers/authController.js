import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '../utils/email.js';
import { validatePassword } from '../utils/validation.js';

const prisma = new PrismaClient();

// Register
export async function register(req, res, next) {
  try {
    // Multer parseia FormData automaticamente, campos de texto vêm em req.body
    const { name, email, password, cpf } = req.body;
    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    // Log para debug (remover em produção)
    console.log('Register request:', { name, email, hasPassword: !!password, hasCPF: !!cpf, hasPhoto: !!req.file });

    // Validações
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Verificar CPF se fornecido
    if (cpf) {
      const existingCPF = await prisma.user.findUnique({
        where: { cpf }
      });

      if (existingCPF) {
        return res.status(400).json({ message: 'CPF já cadastrado' });
      }
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf: cpf || null,
        photo
      }
    });

    // Gerar token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Retornar usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'Conta criada com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

// Login
export async function login(req, res, next) {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Verificar senha
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Gerar token
    const expiresIn = rememberMe ? '30d' : (process.env.JWT_EXPIRES_IN || '7d');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    // Retornar usuário (sem senha)
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login realizado com sucesso',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
}

// Get current user
export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const { password: _, ...userWithoutPassword } = user;

    res.json({ user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
}

// Forgot Password
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Por segurança, sempre retornar sucesso mesmo se email não existir
    if (!user) {
      return res.json({ 
        message: 'Se o email estiver cadastrado, você receberá um link de recuperação' 
      });
    }

    // Gerar token único
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Expira em 1 hora

    // Salvar token no banco
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt
      }
    });

    // Enviar email
    try {
      await sendPasswordResetEmail(email, token);
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Não falhar a requisição se o email falhar
    }

    res.json({ 
      message: 'Se o email estiver cadastrado, você receberá um link de recuperação' 
    });
  } catch (error) {
    next(error);
  }
}

// Validate Reset Token
export async function validateResetToken(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Token é obrigatório' });
    }

    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!passwordReset) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    if (passwordReset.used) {
      return res.status(400).json({ message: 'Token já foi utilizado' });
    }

    if (new Date() > passwordReset.expiresAt) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    res.json({ message: 'Token válido' });
  } catch (error) {
    next(error);
  }
}

// Reset Password
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: 'Token e senha são obrigatórios' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Senha deve ter no mínimo 8 caracteres' });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    // Buscar token
    const passwordReset = await prisma.passwordReset.findUnique({
      where: { token }
    });

    if (!passwordReset) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }

    if (passwordReset.used) {
      return res.status(400).json({ message: 'Token já foi utilizado' });
    }

    if (new Date() > passwordReset.expiresAt) {
      return res.status(400).json({ message: 'Token expirado' });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Atualizar senha do usuário
    await prisma.user.update({
      where: { email: passwordReset.email },
      data: { password: hashedPassword }
    });

    // Marcar token como usado
    await prisma.passwordReset.update({
      where: { token },
      data: { used: true }
    });

    res.json({ message: 'Senha redefinida com sucesso' });
  } catch (error) {
    next(error);
  }
}

