# DayFlow HRMS - Database Documentation

This directory contains the database setup and Prisma ORM configuration for **DayFlow HRMS**.

## PostgreSQL Setup with Prisma ORM

DayFlow uses **PostgreSQL** as its primary relational database along with **Prisma ORM** for type-safe database queries and automated schema migrations.

---

## Directory & Schema Location

- **Prisma Schema**: `backend/prisma/schema.prisma`
- **Database Engine**: PostgreSQL

---

## Prisma Models Summary

| Model | Description |
| :--- | :--- |
| `User` | User credentials, email, password hash, and system access role (`EMPLOYEE`, `HR_OFFICER`, `ADMIN`). |
| `Employee` | Staff profile details (department, job title, avatar tone, hire date, base salary). |
| `Attendance` | Daily check-in & check-out timestamps, working hours, and status (`PRESENT`, `ABSENT`, `LATE`, `ON_LEAVE`). |
| `LeaveRequest` | Employee leave applications (type, date range, status, reason). |
| `Payroll` | Monthly salary breakdown (basic salary, allowances, deductions, net pay). |

---

## Database Commands

Navigate to the `backend/` folder to manage database schema and migrations:

```bash
# 1. Set environment variable in backend/.env
DATABASE_URL="postgresql://username:password@localhost:5432/dayflow_db?schema=public"

# 2. Run Prisma schema migration
npm run prisma:migrate

# 3. Generate Prisma Client
npm run prisma:generate
```
