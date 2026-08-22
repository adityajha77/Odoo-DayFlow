import { Router } from 'express';

const router = Router();

const mockLeaves = [
  { id: '1', type: 'Annual Leave', startDate: '2026-08-25', endDate: '2026-08-28', status: 'APPROVED', reason: 'Family vacation' },
  { id: '2', type: 'Sick Leave', startDate: '2026-09-02', endDate: '2026-09-03', status: 'PENDING', reason: 'Medical appointment' },
];

router.get('/', (_req, res) => {
  res.json({ success: true, data: mockLeaves });
});

router.post('/', (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const newLeave = {
    id: String(mockLeaves.length + 1),
    type: type || 'Casual Leave',
    startDate,
    endDate,
    status: 'PENDING',
    reason,
  };
  mockLeaves.push(newLeave);
  res.status(201).json({ success: true, message: 'Leave request submitted', data: newLeave });
});

export default router;
