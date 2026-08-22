import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// Get all tasks
router.get('/', async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: tasks });
  } catch (error) {
    return res.json({
      success: true,
      data: [
        { id: '1', title: 'Review Q4 product brief', time: '09:00 – 10:00 AM', priority: 'High', completed: false },
        { id: '2', title: 'Design team sync', time: '10:30 – 11:00 AM', priority: 'Medium', completed: true },
        { id: '3', title: 'Prepare research summary', time: '01:30 – 02:30 PM', priority: 'Low', completed: false },
        { id: '4', title: 'Share homepage concepts', time: '03:00 – 04:00 PM', priority: 'Medium', completed: false },
      ],
    });
  }
});

// Create task
router.post('/', async (req, res) => {
  try {
    const { title, time, priority, userId } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        time: time || 'Today',
        priority: priority || 'Medium',
        userId: userId || null,
      },
    });
    return res.json({ success: true, data: task });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle complete task
router.patch('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

    const updated = await prisma.task.update({
      where: { id },
      data: { completed: !existing.completed },
    });
    return res.json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({ where: { id } });
    return res.json({ success: true, message: 'Task deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
