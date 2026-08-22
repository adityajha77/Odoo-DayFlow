import { Router } from 'express';
import healthRouter from './health';
import employeesRouter from './employees';
import attendanceRouter from './attendance';
import leavesRouter from './leaves';
import payrollRouter from './payroll';

const router = Router();

router.use('/health', healthRouter);
router.use('/employees', employeesRouter);
router.use('/attendance', attendanceRouter);
router.use('/leaves', leavesRouter);
router.use('/payroll', payrollRouter);

export default router;
