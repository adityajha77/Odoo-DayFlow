import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

/** Format a Date (or ISO string) to "YYYY-MM-DD" */
function fmtDate(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().split('T')[0];
}

/** Format a Date (or ISO string) to "09:12 AM" */
function fmtTime(d: Date | string | null | undefined): string {
  if (!d) return '—';
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/** Compute total hours between two dates as "X.X hrs" */
function calcHours(checkIn: Date | string | null, checkOut: Date | string | null): string {
  if (!checkIn || !checkOut) return '—';
  const inMs = new Date(checkIn).getTime();
  const outMs = new Date(checkOut).getTime();
  const hrs = (outMs - inMs) / (1000 * 60 * 60);
  return `${hrs.toFixed(1)} hrs`;
}

/** Normalize a Prisma Attendance row to the shape the frontend expects */
function normalizeRecord(record: any) {
  return {
    id: record.id,
    employeeId: record.employeeId,
    date: fmtDate(record.date),
    checkIn: fmtTime(record.checkIn),
    checkOut: fmtTime(record.checkOut),
    totalHours: record.totalHours != null
      ? `${Number(record.totalHours).toFixed(1)} hrs`
      : calcHours(record.checkIn, record.checkOut),
    status: record.status || 'PRESENT',
  };
}

// ─── GET /attendance — list logs for the employee (or all for admin) ─────────
router.get('/', async (req, res) => {
  try {
    const { employeeId } = req.query as { employeeId?: string };
    const where = employeeId ? { employeeId } : {};
    const records = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 30,
    });
    return res.json({ success: true, data: records.map(normalizeRecord) });
  } catch (err: any) {
    console.error('GET /attendance error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch attendance records.', error: err.message });
  }
});

// ─── GET /attendance/status — current check-in state for an employee ─────────
router.get('/status', async (req, res) => {
  try {
    const { employeeId } = req.query as { employeeId?: string };
    if (!employeeId) {
      return res.json({ success: true, data: { checkedIn: false, checkInTime: '' } });
    }
    // Find today's open attendance record
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: { gte: today },
        checkOut: null,
      },
      orderBy: { checkIn: 'desc' },
    });
    return res.json({
      success: true,
      data: {
        checkedIn: !!record,
        checkInTime: record ? fmtTime(record.checkIn) : '',
      },
    });
  } catch (err: any) {
    console.error('GET /attendance/status error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to get attendance status.' });
  }
});

// ─── POST /attendance/check-in — create new attendance record ─────────────────
router.post('/check-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }

    // Find the employee
    const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const now = new Date();
    // Check if already checked in today (no checkout)
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const existing = await prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today }, checkOut: null },
    });
    if (existing) {
      return res.json({
        success: true,
        message: 'Already checked in for today',
        data: { checkedIn: true, checkInTime: fmtTime(existing.checkIn) },
      });
    }

    // Determine status (late if after 09:30 AM)
    const hour = now.getHours();
    const minute = now.getMinutes();
    const isLate = hour > 9 || (hour === 9 && minute > 30);

    const record = await prisma.attendance.create({
      data: {
        employeeId,
        date: now,
        checkIn: now,
        status: isLate ? 'LATE' : 'PRESENT',
      },
    });

    return res.json({
      success: true,
      message: 'Checked in successfully',
      data: { checkedIn: true, checkInTime: fmtTime(record.checkIn), record: normalizeRecord(record) },
    });
  } catch (err: any) {
    console.error('POST /attendance/check-in error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to record check-in.', error: err.message });
  }
});

// ─── POST /attendance/check-out — update latest open record with checkout time ─
router.post('/check-out', async (req, res) => {
  try {
    const { employeeId } = req.body;
    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'employeeId is required.' });
    }

    // Find the open record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const openRecord = await prisma.attendance.findFirst({
      where: { employeeId, date: { gte: today }, checkOut: null },
      orderBy: { checkIn: 'desc' },
    });

    if (!openRecord) {
      return res.status(404).json({ success: false, message: 'No open check-in found for today.' });
    }

    const now = new Date();
    const inMs = new Date(openRecord.checkIn).getTime();
    const outMs = now.getTime();
    const totalHours = (outMs - inMs) / (1000 * 60 * 60);

    const updated = await prisma.attendance.update({
      where: { id: openRecord.id },
      data: { checkOut: now, totalHours },
    });

    return res.json({
      success: true,
      message: 'Checked out successfully',
      data: { checkedIn: false, checkInTime: '', record: normalizeRecord(updated) },
    });
  } catch (err: any) {
    console.error('POST /attendance/check-out error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to record check-out.', error: err.message });
  }
});

export default router;
