# AppGen — Config-Driven App Builder

A system that converts JSON configuration into fully working web applications.

## Tech Stack
- **Frontend**: Next.js 16, React, TypeScript, Tailwind
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT (email/password)

## Features
- ✅ Config-driven UI (forms, tables, headings)
- ✅ Dynamic API generation
- ✅ PostgreSQL with CRUD
- ✅ JWT Authentication
- ✅ CSV Import System
- ✅ Multi-language (English, Hindi, Marathi)
- ✅ Extensible Component Registry
- ✅ Error handling & edge cases
- ✅ Mobile responsive

## Setup

### Backend
```bash
cd backend
npm install
# Create .env with DATABASE_URL and JWT_SECRET
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture
- JSON config defines pages, components, fields
- Frontend reads config and renders UI dynamically
- Backend generates CRUD APIs per collection
- All data is user-scoped via JWT