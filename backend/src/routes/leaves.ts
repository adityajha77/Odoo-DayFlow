import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

/** Format a Date (or ISO string) to "YYYY-MM-DD" */
function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().split('T')[0];
}

/** Compute number of days between two dates (inclusive) */
function daysBetween(start: Date | string, end: Date | string): number {
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  return Math.max(1, Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1);
}

/** Normalize a Prisma LeaveRequest row to the shape the frontend expects */
function normalizeLeave(req: any) {
  const empName = req.employee
    ? `${req.employee.firstName} ${req.employee.lastName}`.trim()
    : req.employeeName || 'Employee';

  return {
    id: req.id,
    employeeId: req.employeeId,
    employeeName: empName,
    type: req.leaveType,            // frontend reads "type"
    leaveType: req.leaveType,       // keep both for safety
    startDate: fmtDate(req.startDate),
    endDate: fmtDate(req.endDate),
    days: daysBetween(req.startDate, req.endDate),
    reason: req.reason || 'N/A',
    status: req.status,
    createdAt: req.createdAt,
  };
}

// ─── GET /leaves ──────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query as { employeeId?: string };
    const where = employeeId ? { employeeId } : {};
    const requests = await prisma.leaveRequest.findMany({
      where,
      include: { employee: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: requests.map(normalizeLeave) });
  } catch (err: any) {
    console.error('GET /leaves error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch leave requests.', error: err.message });
  }
});

// ─── POST /leaves — submit a new leave request ────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { employeeId, type, leaveType, startDate, endDate, reason } = req.body;
    const resolvedLeaveType = leaveType || type || 'Casual Leave';

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required.' });
    }

    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType: resolvedLeaveType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || 'Not specified',
        status: 'PENDING',
      },
      include: { employee: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: normalizeLeave(newLeave),
    });
  } catch (err: any) {
    console.error('POST /leaves error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to submit leave request.', error: err.message });
  }
});

// ─── PATCH /leaves/:id/status — approve or reject ────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['APPROVED', 'REJECTED', 'PENDING'];
    const resolvedStatus = validStatuses.includes(status) ? status : 'APPROVED';

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: resolvedStatus as any },
      include: { employee: true },
    });

    return res.json({
      success: true,
      message: `Leave request ${resolvedStatus.toLowerCase()}`,
      data: normalizeLeave(updated),
    });
  } catch (err: any) {
    console.error('PATCH /leaves/:id/status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to update leave status.', error: err.message });
  }
});

export default router;
