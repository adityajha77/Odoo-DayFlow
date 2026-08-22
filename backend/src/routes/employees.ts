import { Router } from 'express';

const router = Router();

// Sample in-memory / Prisma fallback employee records
const mockEmployees = [
  { id: '1', name: 'Maya Chen', role: 'Product Designer', initials: 'MC', tone: 'coral', department: 'Design' },
  { id: '2', name: 'Jordan Lee', role: 'Engineering', initials: 'JL', tone: 'blue', department: 'Engineering' },
  { id: '3', name: 'Priya Shah', role: 'Operations', initials: 'PS', tone: 'yellow', department: 'Operations' },
  { id: '4', name: 'Noah Williams', role: 'Marketing', initials: 'NW', tone: 'green', department: 'Marketing' },
];

router.get('/', (_req, res) => {
  res.json({ success: true, data: mockEmployees });
});

router.get('/:id', (req, res) => {
  const emp = mockEmployees.find((e) => e.id === req.params.id);
  if (!emp) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }
  res.json({ success: true, data: emp });
});

export default router;
