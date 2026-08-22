import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

const router = Router();

const AVATAR_TONES = ['coral', 'blue', 'green', 'yellow', 'ink'];

function randomTone() {
  return AVATAR_TONES[Math.floor(Math.random() * AVATAR_TONES.length)];
}

function normalizeEmployee(emp: any) {
  return {
    id: emp.id,
    userId: emp.userId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email,
    roleTitle: emp.roleTitle || 'Employee',
    department: emp.department || 'Operations',
    gender: emp.gender || 'Prefer not to say',
    avatarTone: emp.avatarTone || 'coral',
    tone: emp.avatarTone || 'coral',             // alias for frontend
    salary: emp.salary || 0,
    dateJoined: emp.dateJoined ? new Date(emp.dateJoined).toISOString().split('T')[0] : '—',
    status: 'ACTIVE',                             // all active unless deleted
    role: emp.user?.role || 'EMPLOYEE',
  };
}

// ─── GET /employees ────────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      include: { user: true },
      orderBy: { dateJoined: 'desc' },
    });
    return res.json({ success: true, data: employees.map(normalizeEmployee) });
  } catch (err: any) {
    console.error('GET /employees error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch employees.', error: err.message });
  }
});

// ─── GET /employees/:id ────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const emp = await prisma.employee.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    return res.json({ success: true, data: normalizeEmployee(emp) });
  } catch (err: any) {
    console.error('GET /employees/:id error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch employee.', error: err.message });
  }
});

// ─── POST /employees — create new user + employee record in DB ────────────────
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, roleTitle, department, gender, salary, role } = req.body;

    if (!firstName || !email) {
      return res.status(400).json({ success: false, message: 'firstName and email are required.' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Generate a secure temporary password
    const tempPassword = `DayFlow@${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const assignedRole = role === 'ADMIN' ? 'ADMIN' : role === 'HR_OFFICER' ? 'HR_OFFICER' : 'EMPLOYEE';
    const tone = randomTone();

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
            roleTitle: roleTitle || 'Employee Specialist',
            department: department || 'Operations',
            avatarTone: tone,
            salary: Number(salary) || 0,
          },
        },
      },
      include: { employee: true },
    });

    return res.status(201).json({
      success: true,
      message: `Employee ${firstName} ${lastName || ''} created. Temp password: ${tempPassword}`,
      data: normalizeEmployee({ ...newUser.employee!, user: newUser }),
    });
  } catch (err: any) {
    console.error('POST /employees error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create employee.', error: err.message });
  }
});

// ─── DELETE /employees/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const emp = await prisma.employee.findUnique({ where: { id: req.params.id } });
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    // Delete the User — cascade will handle Employee (set in schema)
    await prisma.user.delete({ where: { id: emp.userId } });
    return res.json({ success: true, message: 'Employee removed successfully.' });
  } catch (err: any) {
    console.error('DELETE /employees/:id error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to delete employee.', error: err.message });
  }
});

export default router;
