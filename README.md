# TaskFlow – Full-Stack Task Management System

A production-ready, interview-level task management system built with **Node.js + TypeScript** backend and **Next.js (App Router)** frontend.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (Access + Refresh Tokens) + bcrypt |
| Validation | Zod |
| Frontend | Next.js 14 (App Router) + TypeScript |
| HTTP Client | Axios (with refresh token interceptor) |
| Forms | React Hook Form + Zod resolver |
| Styling | Vanilla CSS (dark glassmorphism design system) |
| Notifications | react-hot-toast |
| Icons | Lucide React |
| Security | Helmet, CORS, express-rate-limit |
| Docker | Docker Compose (Postgres + backend + frontend) |
| CI/CD | GitHub Actions |

## 📁 Folder Structure

```
TaskManagement/
├── backend/
│   ├── prisma/schema.prisma        # DB schema
│   ├── src/
│   │   ├── config/                 # Env + Prisma client
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic
│   │   ├── routes/                 # Express routes
│   │   ├── middleware/             # Auth, validation, error handler
│   │   ├── dtos/                   # Zod schemas
│   │   ├── types/                  # TypeScript types
│   │   ├── utils/                  # JWT helpers, response helpers
│   │   ├── app.ts                  # Express app
│   │   └── server.ts               # Server entry
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (app)/              # Protected group layout
│   │   │   │   ├── dashboard/      # Dashboard page
│   │   │   │   └── tasks/          # Tasks CRUD page
│   │   │   ├── login/              # Login page
│   │   │   ├── register/           # Register page
│   │   │   ├── globals.css         # Design system
│   │   │   └── layout.tsx          # Root layout
│   │   ├── components/
│   │   │   ├── layout/Sidebar.tsx
│   │   │   └── tasks/              # TaskCard, TaskModal, FilterBar
│   │   ├── context/AuthContext.tsx # Auth state
│   │   ├── hooks/useTasks.ts       # Task fetching hook
│   │   ├── services/               # API service layer
│   │   ├── lib/apiClient.ts        # Axios + interceptors
│   │   └── types/index.ts          # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 20+
- PostgreSQL running locally (or use Docker)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit DATABASE_URL and JWT secrets in .env
npm install
npx prisma migrate dev --name init
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
# NEXT_PUBLIC_API_URL already set to http://localhost:5000/api
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Docker (Full Stack)
```bash
docker compose up --build
```
Services: Postgres on `5432`, Backend on `5000`, Frontend on `3000`

## 🔐 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout (revoke refresh token) |
| GET | `/api/auth/me` | Get current user profile |

### Tasks (all require Bearer token)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/tasks` | List tasks (with pagination, filter, search) |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task by ID |
| PATCH | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/toggle` | Toggle task status |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/stats` | Get task statistics |

### Query Params for GET /api/tasks
```
page, limit, status, priority, search, sortBy, sortOrder
```

## ✨ Features

- ✅ JWT with access (15m) + refresh (7d) token rotation
- ✅ Role-based access control (USER/ADMIN)
- ✅ Full task CRUD with status toggle
- ✅ Pagination + filtering + search
- ✅ Zod validation on all inputs
- ✅ Global error handler (Zod, Prisma, and App errors)
- ✅ Rate limiting (100 req/15min)
- ✅ Dark glassmorphism UI with micro-animations
- ✅ Responsive design (mobile + desktop)
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Docker Compose setup
- ✅ GitHub Actions CI/CD pipeline
