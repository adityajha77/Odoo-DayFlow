# DayFlow - Modern HRMS Architecture

**DayFlow** is an enterprise Human Resource Management System (HRMS) built with a modular, 3-tier architecture: **Frontend**, **Backend**, and **Database**.

Repository: [`https://github.com/adityajha77/Oddo-DayFlow`](https://github.com/adityajha77/Oddo-DayFlow)

---

## 📁 Repository Structure

```
Oddo-DayFlow/
├── frontend/             # React 18 + Vite + TypeScript + Tailwind CSS UI
│   ├── src/              # Components, hooks, styles, main app entry
│   ├── package.json
│   └── vite.config.ts
├── backend/              # Express.js + TypeScript + Prisma ORM REST API
│   ├── src/              # Controllers, routes, Prisma config, server entry
│   ├── prisma/           # Prisma PostgreSQL schema & migrations
│   ├── package.json
│   └── .env.example
├── database/             # Database architecture documentation & Prisma schemas
│   ├── prisma/           # Schema definition for PostgreSQL models
│   └── README.md         # Database migration guide
├── .gitignore            # Root git ignore rule definitions
└── README.md             # Project overview & developer quickstart
```

---

## ⚡ Developer Quickstart

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend UI will launch at `http://localhost:5173`.

---

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your DATABASE_URL in .env for PostgreSQL
npm run dev
```
The Express backend REST API will run at `http://localhost:5000`.

---

### 3. Database Migration (PostgreSQL + Prisma)
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
