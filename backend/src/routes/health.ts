import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'DayFlow HRMS Backend API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
