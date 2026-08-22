import { Router } from 'express';

const router = Router();

let currentStatus = { checkedIn: true, checkInTime: '09:12 AM' };

router.get('/status', (_req, res) => {
  res.json({ success: true, data: currentStatus });
});

router.post('/check-in', (_req, res) => {
  currentStatus = { checkedIn: true, checkInTime: new Date().toLocaleTimeString() };
  res.json({ success: true, message: 'Checked in successfully', data: currentStatus });
});

router.post('/check-out', (_req, res) => {
  currentStatus = { checkedIn: false, checkInTime: '' };
  res.json({ success: true, message: 'Checked out successfully', data: currentStatus });
});

export default router;
