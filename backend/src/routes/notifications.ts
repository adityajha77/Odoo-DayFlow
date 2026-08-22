import { Router } from 'express';

const router = Router();

const mockNotifications = [
  { id: '1', title: 'Leave request approved', time: '10 minutes ago', category: 'Leave', unread: true },
  { id: '2', title: 'New payslip available for August 2026', time: '2 hours ago', category: 'Payroll', unread: true },
  { id: '3', title: 'Team sync meeting scheduled at 11:30 AM', time: 'Yesterday', category: 'Schedule', unread: true },
  { id: '4', title: 'Attendance recorded: Check-in at 09:12 AM', time: 'Today', category: 'Attendance', unread: false },
  { id: '5', title: 'Workspace system maintenance scheduled for weekend', time: '2 days ago', category: 'System', unread: false },
];

router.get('/', (_req, res) => {
  res.json({ success: true, data: mockNotifications });
});

router.post('/mark-read', (_req, res) => {
  mockNotifications.forEach(n => { n.unread = false; });
  res.json({ success: true, message: 'All notifications marked as read', data: mockNotifications });
});

export default router;
