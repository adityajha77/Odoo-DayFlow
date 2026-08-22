import { Router } from 'express';

const router = Router();

const mockPayrolls = [
  { id: '1', month: 'August', year: 2026, basicSalary: 8500, allowances: 1200, deductions: 450, netPay: 9250, status: 'PAID' },
  { id: '2', month: 'July', year: 2026, basicSalary: 8500, allowances: 1200, deductions: 450, netPay: 9250, status: 'PAID' },
];

router.get('/', (_req, res) => {
  res.json({ success: true, data: mockPayrolls });
});

export default router;
