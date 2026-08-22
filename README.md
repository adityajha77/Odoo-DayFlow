# DayFlow – Modern Human Resource Management System (HRMS)

**DayFlow** is a modern enterprise Human Resource Management System designed to digitize and streamline core HR operations, attendance tracking, leave requests, payroll processing, and employee management.

Repository: [`https://github.com/adityajha77/Oddo-DayFlow`](https://github.com/adityajha77/Oddo-DayFlow)

---

## 🏗 Modular 3-Tier Architecture

DayFlow is structured into three distinct, decoupled directories for maximum scalability, maintainability, and clean separation of concerns:

```
Oddo-DayFlow/
├── frontend/             # React 18 + Vite + TypeScript + Tailwind CSS UI
│   ├── src/              # Dashboard, components, hooks, styles
│   ├── package.json
│   └── vite.config.ts
├── backend/              # Express.js + TypeScript + Prisma ORM REST API
│   ├── src/              # Controllers, routes, Prisma config, server entry
│   ├── prisma/           # Prisma PostgreSQL schema & definitions
│   ├── package.json
│   └── .env.example
├── database/             # Database architecture documentation & Prisma schemas
│   ├── prisma/           # Schema definition for PostgreSQL models
│   └── README.md         # Database migration & schema documentation
├── .gitignore            # Global Git ignore definitions
└── README.md             # Project overview & developer guide
```

---

## ✨ Key Features

- **Employee Portal & Directory**: Staff onboarding, roles (Employee / HR Officer), profile management.
- **Attendance Management**: Daily check-in/check-out tracking, total hours calculation, attendance log.
- **Leave Operations**: Multi-type leave requests (Annual, Sick, Casual), approval/rejection workflows.
- **Payroll Visibility**: Detailed payslip views, salary breakdown (basic, allowances, deductions).
- **Prisma & PostgreSQL Database**: Type-safe relational database queries and automated migrations.

---

## ⚡ Quickstart Guide

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Access the application UI at `http://localhost:5173`.

---

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Set your DATABASE_URL in .env
npm run dev
```
Access the Express REST API at `http://localhost:5000`.

---

### 3. Database Migration (Prisma + PostgreSQL)
```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Radix UI.
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM.
- **Database**: PostgreSQL.
