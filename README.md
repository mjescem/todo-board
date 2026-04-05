# Todo Board 📋

A full-stack Kanban-style task management application built with React, Express, and PostgreSQL. Features board management, drag-and-drop ticket ordering, due date notifications, and JWT-based authentication.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Redux Toolkit, RTK Query |
| Styling | Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | JWT (JSON Web Tokens) |
| Containerization | Docker, Docker Compose |

---

## Installation

### Prerequisites

Make sure you have the following installed:

- [Docker](https://docs.docker.com/get-docker/)
- [Node.js v24+](https://nodejs.org/)

### Clone the Repository

```bash
git clone git@github.com:mjescem/todo-board.git
cd todo-board
```

---

## Setup Guide

### Option A: Docker (Recommended)

This is the easiest way to get the entire stack running — database, migrations, and server — with a single command.

**1. Create your environment file**

Create a `.env` file in the project root:

```env
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_password
POSTGRES_DB=todoboard
JWT_SECRET=your_secret_jwt_key
```

**2. Build and start the containers**

```bash
docker compose up --build -d
```

This will:
- Pull the `postgres:14.8` image and start the database
- Build the React frontend (`npm run build`)
- Build the Express backend (`tsc`)
- Run database migrations automatically on startup
- Start the server at `http://localhost:4000`

**3. Open the app**

```
http://localhost:4000
```

---

### Option B: Local Development

Use this when you want hot-reloading while writing code.

**1. Set up the database**

You can run just the database in Docker:

```bash
docker compose up db -d
```

Or use your own local PostgreSQL instance.

**2. Configure server environment**

Create `server/.env`:

```env
DATABASE_URL=postgres://admin:your_password@localhost:5432/todoboard
JWT_SECRET=your_secret_jwt_key
PORT=3001
```

**3. Install dependencies**

```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server && npm install
```

**4. Run database migrations**

```bash
cd server
npm run db:migrate
```

**5. Start both servers**

In one terminal (backend):
```bash
cd server
npm run dev
```

In another terminal (frontend):
```bash
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:3001`.

---

## Usage Instructions

### Authentication Flow

- When you visit the app, you’ll be redirected to the Login page.
- If you don’t have an account, click “Sign up” to create one.
- Provide your name, email, and password to register.
- After successful registration, you’ll be automatically logged in and redirected to your boards.
- If you already have an account, simply log in with your credentials.

### Session Management

- Authentication is handled using JWT (JSON Web Tokens).
- Your session will automatically expire when the token becomes invalid, and you’ll be logged out.

### Managing Boards

- Click **"Create first board"** to create a workspace.
- Switch between boards using the sidebar/header board selector.
- Boards can be renamed or deleted.

### Managing Lists (Categories)

- Inside a board, click **"Add List"** to create a new column.
- Lists can be renamed by clicking on the list title.
- **Drag and drop** lists horizontally to reorder them.

### Managing Tickets

- Click **"Add a card"** inside any list to create a new ticket.
- Click a ticket to open its detail view where you can:
  - Edit the **title** and **description**
  - Set a **due date** with the date picker
  - Assign a **color label**
  - View the **activity log**
- **Drag and drop** tickets vertically within a list/category or across lists.

### Notifications

- The **bell icon** in the header shows upcoming and overdue tickets.
- Tickets due within **48 hours** trigger a notification badge.
- Overdue tickets are highlighted in red.

---

## Available Scripts

### Frontend
```bash
npm run dev      # Start Vite dev server
npm run build    # Build for production
```

### Backend
```bash
cd server
npm run dev             # Start server with hot reload (tsx)
npm run build           # Compile TypeScript to JS
npm start               # Start compiled production server
npm run db:migrate      # Run migrations (local dev)
npm run db:migrate:prod # Run migrations (compiled JS, used in Docker)
npm run db:generate     # Generate new migration from schema changes
```

### Docker
```bash
docker compose up --build -d   # Build and start all containers
docker compose up -d           # Start without rebuilding
docker compose down            # Stop all containers
docker compose down -v         # Stop and remove database volume
docker compose logs -f         # Tail all logs
docker compose logs -f app     # Tail app logs only
docker compose ps              # Check container status
```
