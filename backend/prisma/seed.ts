import { Role, LeaveStatus, AttendanceStatus } from '@prisma/client';
import process from 'process';
import prisma from '../src/config/prisma';

async function main() {
  console.log('🌱 Starting Supabase database seeding...');

  // 1. Create Users & Employees
  const emp1User = await prisma.user.upsert({
    where: { email: 'maya.chen@dayflow.com' },
    update: {},
    create: {
      email: 'maya.chen@dayflow.com',
      password: 'hashed_password_123',
      role: Role.HR_OFFICER,
      employee: {
        create: {
          firstName: 'Maya',
          lastName: 'Chen',
          email: 'maya.chen@dayflow.com',
          roleTitle: 'Product Designer',
          department: 'Design',
          avatarTone: 'coral',
          salary: 95000,
        },
      },
    },
    include: { employee: true },
  });

  const emp2User = await prisma.user.upsert({
    where: { email: 'jordan.lee@dayflow.com' },
    update: {},
    create: {
      email: 'jordan.lee@dayflow.com',
      password: 'hashed_password_123',
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: 'Jordan',
          lastName: 'Lee',
          email: 'jordan.lee@dayflow.com',
          roleTitle: 'Lead Engineer',
          department: 'Engineering',
          avatarTone: 'blue',
          salary: 110000,
        },
      },
    },
    include: { employee: true },
  });

  const emp3User = await prisma.user.upsert({
    where: { email: 'priya.shah@dayflow.com' },
    update: {},
    create: {
      email: 'priya.shah@dayflow.com',
      password: 'hashed_password_123',
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: 'Priya',
          lastName: 'Shah',
          email: 'priya.shah@dayflow.com',
          roleTitle: 'Operations Manager',
          department: 'Operations',
          avatarTone: 'yellow',
          salary: 88000,
        },
      },
    },
    include: { employee: true },
  });

  const emp4User = await prisma.user.upsert({
    where: { email: 'noah.williams@dayflow.com' },
    update: {},
    create: {
      email: 'noah.williams@dayflow.com',
      password: 'hashed_password_123',
      role: Role.EMPLOYEE,
      employee: {
        create: {
          firstName: 'Noah',
          lastName: 'Williams',
          email: 'noah.williams@dayflow.com',
          roleTitle: 'Marketing Lead',
          department: 'Marketing',
          avatarTone: 'green',
          salary: 82000,
        },
      },
    },
    include: { employee: true },
  });

  console.log('✅ Users and Employees seeded.');

  if (emp1User.employee) {
    // 2. Attendance
    await prisma.attendance.createMany({
      data: [
        {
          employeeId: emp1User.employee.id,
          checkIn: new Date(Date.now() - 4 * 3600 * 1000),
          status: AttendanceStatus.PRESENT,
          totalHours: 8,
        },
      ],
    });

    // 3. Leave Requests
    await prisma.leaveRequest.createMany({
      data: [
        {
          employeeId: emp1User.employee.id,
          leaveType: 'Annual Leave',
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-05'),
          reason: 'Summer Family Vacation',
          status: LeaveStatus.APPROVED,
        },
      ],
    });

    // 4. Payroll
    await prisma.payroll.createMany({
      data: [
        {
          employeeId: emp1User.employee.id,
          month: 'August',
          year: 2026,
          basicSalary: 7916.67,
          allowances: 1000,
          deductions: 500,
          netPay: 8416.67,
          status: 'PAID',
        },
      ],
    });
  }

  console.log('🎉 Supabase database seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
