import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dayflow_jwt_secret_key_2026';

// Register User with password hashing and Role selection
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName, gender, role, roleTitle, department } = req.body;

    if (!email || !password || !firstName) {
      return res.status(400).json({ success: false, message: 'Email, password, and first name are required.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'ADMIN' ? 'ADMIN' : role === 'HR_OFFICER' ? 'HR_OFFICER' : 'EMPLOYEE';

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: assignedRole as any,
        employee: {
          create: {
            firstName,
            lastName: lastName || '',
            gender: gender || 'Prefer not to say',
            email,
            roleTitle: roleTitle || (assignedRole === 'ADMIN' ? 'HR Director & Admin' : 'Employee Specialist'),
            department: department || (assignedRole === 'ADMIN' ? 'Administration' : 'Operations'),
            avatarTone: assignedRole === 'ADMIN' ? 'ink' : 'coral',
          },
        },
      },
      include: { employee: true },
    });

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.employee?.firstName || firstName,
      lastName: newUser.employee?.lastName || lastName || '',
      gender: newUser.employee?.gender || 'Prefer not to say',
      roleTitle: newUser.employee?.roleTitle || 'Employee',
      department: newUser.employee?.department || 'Operations',
      role: newUser.role,
      avatarTone: newUser.employee?.avatarTone || 'coral',
      profileCompleted: true,
    };

    return res.json({
      success: true,
      token,
      user: userProfile,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user account.', error: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.employee?.firstName || 'User',
      lastName: user.employee?.lastName || '',
      gender: user.employee?.gender || 'Prefer not to say',
      roleTitle: user.employee?.roleTitle || 'Employee Specialist',
      department: user.employee?.department || 'Operations',
      role: user.role,
      avatarTone: user.employee?.avatarTone || 'coral',
      profileCompleted: true,
    };

    return res.json({
      success: true,
      token,
      user: userProfile,
      message: 'Logged in successfully',
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login server error.', error: error.message });
  }
});

// Get current user profile (Me)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No authorization token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { employee: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User profile not found.' });
    }

    const userProfile = {
      id: user.id,
      email: user.email,
      firstName: user.employee?.firstName || 'User',
      lastName: user.employee?.lastName || '',
      gender: user.employee?.gender || 'Prefer not to say',
      roleTitle: user.employee?.roleTitle || 'Employee Specialist',
      department: user.employee?.department || 'Operations',
      role: user.role,
      avatarTone: user.employee?.avatarTone || 'coral',
      profileCompleted: true,
    };

    return res.json({ success: true, user: userProfile });
  } catch (error: any) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
});

export default router;
