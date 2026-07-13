# Real-Time Task Manager

Production-quality collaborative task manager built with the MERN stack.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React (Vite), Tailwind CSS, Redux Toolkit, React Query, React Router, Axios |
| Backend | Express, MongoDB, Mongoose, Zod, Socket.io (upcoming) |
| Auth | JWT (upcoming) |
| Files | Cloudinary (upcoming) |

## Prerequisites

- Node.js 20+
- Docker (for local MongoDB)

## Getting Started

### 1. Clone and install

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment variables

```bash
cp .env.example .env
cp client/.env.example client/.env
```

### 3. Start MongoDB

```bash
npm run db:up
```

### 4. Run development servers

```bash
npm run dev
```

- **Client**: http://localhost:5173
- **API**: http://localhost:5000
- **Health check**: http://localhost:5000/api/health

## Project Structure

```
├── client/src/
│   ├── app/          # Store, router, providers
│   ├── features/     # Feature modules (auth, tasks, etc.)
│   ├── layouts/      # Page layouts
│   ├── lib/          # Axios, socket clients
│   └── pages/        # Route pages
├── server/src/
│   ├── config/       # Env, database
│   ├── middleware/   # Auth, validation, errors
│   ├── modules/      # Feature routes/controllers/services
│   └── utils/        # Helpers
└── docker-compose.yml
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run dev:server` | Start API only |
| `npm run dev:client` | Start Vite dev server only |
| `npm run db:up` | Start MongoDB via Docker |
| `npm run db:down` | Stop MongoDB container |
