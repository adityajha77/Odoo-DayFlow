import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

/** Normalize a Prisma Payroll row to the shape the frontend expects */
function normalizePayroll(item: any) {
  const empName = item.employee
    ? `${item.employee.firstName} ${item.employee.lastName}`.trim()
    : item.employeeName || 'Employee';

  return {
    id: item.id,
    employeeId: item.employeeId,
    employeeName: empName,
    month: item.month,
    year: item.year,
    basicSalary: item.basicSalary,
    allowances: item.allowances,
    deductions: item.deductions,
    netPay: item.netPay,
    status: item.status || 'PAID',
    paidDate: item.createdAt ? new Date(item.createdAt).toISOString().split('T')[0] : '—',
  };
}

// ─── GET /payroll ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query as { employeeId?: string };
    const where = employeeId ? { employeeId } : {};
    const items = await prisma.payroll.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: items.map(normalizePayroll) });
  } catch (err: any) {
    console.error('GET /payroll error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch payroll records.', error: err.message });
  }
});

// ─── POST /payroll — process a new payroll record ─────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const basic = Number(basicSalary) || employee.salary || 8500;
    const allow = Number(allowances) || 1000;
    const deduct = Number(deductions) || 400;
    const net = basic + allow - deduct;

    const resolvedMonth = month || new Date().toLocaleString('en-US', { month: 'long' });
    const resolvedYear = Number(year) || new Date().getFullYear();

    const newPayroll = await prisma.payroll.create({
      data: {
        employeeId,
        month: resolvedMonth,
        year: resolvedYear,
        basicSalary: basic,
        allowances: allow,
        deductions: deduct,
        netPay: net,
        status: 'PAID',
      },
      include: { employee: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Payroll record generated successfully',
      data: normalizePayroll(newPayroll),
    });
  } catch (err: any) {
    console.error('POST /payroll error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to process payroll.', error: err.message });
  }
});

export default router;
