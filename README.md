# ⚔️ Multiplayer Tic-Tac-Toe (Blitz Edition)

**Live Application**: [https://tic-tac-toe-web-one.vercel.app](https://tic-tac-toe-web-one.vercel.app)
**Nakama Server Endpoint**: `https://tic-tac-toe-production-8b42.up.railway.app`

A production-ready, server-authoritative multiplayer Tic-Tac-Toe game built with **Nakama (Go)** and **React (TypeScript)**. 

## 🚀 Key Features

- **Server-Authoritative Logic**: Game state and move validation are handled entirely on the server to prevent cheating.
- **Dual Game Modes**:
  - **Classic**: Pure strategy, infinite patience.
  - **Blitz**: High-frequency combat with 30-second turn limits and auto-forfeit logic.
- **Global Rankings**: Persistent leaderboards for Wins, Losses, and Win Streaks.
- **Real-Time Matchmaking**: Automated player pairing based on selected game modes.
- **High-Fidelity UI**: Modern, glassmorphism-inspired design with Shadcn UI and Tailwind CSS.

---

## 🏗️ Architecture & Design Decisions

### 1. Monorepo Structure (Turborepo)
The project is organized as a monorepo to maintain strong type-safety and shared configurations across the stack:
- `apps/backend`: Go-based Nakama plugin implementing the authoritative match handler.
- `apps/web`: React-based single-page application (SPA).

### 2. Server-Authoritative Pattern
Unlike client-side games, all logic resides in the Go backend. The client merely sends "Intent" (a move) and the server broadcasts the validated "State". This ensures that no client can manipulate the board or bypass turn timers.

### 3. State Management
- **Backend**: Uses Go structs for in-memory match state, synced periodically to clients via WebSockets.
- **Frontend**: Utilizes `Zustand` for authentication state and `React Query` for data-heavy elements like leaderboards.
- **Match State**: Managed via a dedicated `MatchProvider` React context to maintain WebSocket connectivity across navigation.

---

## 🛠️ Setup & Installation

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js (v18+)](https://nodejs.org/)
- [pnpm](https://pnpm.io/)

### Local Development
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tictactoe
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Launch the Backend (Nakama + PostgreSQL)**:
   ```bash
   docker compose up --build
   ```

4. **Launch the Frontend**:
   ```bash
   cd apps/web
   pnpm dev
   ```
   The app will be available at `http://localhost:5173`.

---

## 📡 API & Server Configuration

### Nakama Configuration
- **Console URL**: `http://localhost:7350` (Default credentials: `admin:password`)
- **API URL**: `http://localhost:7350`
- **WebSocket URL**: `ws://localhost:7350`

### Environment Variables (`apps/web/.env`)
```env
VITE_NAKAMA_HOST=127.0.0.1
VITE_NAKAMA_PORT=7350
VITE_NAKAMA_USE_SSL=false
VITE_NAKAMA_SERVER_KEY=defaultkey
```

---

## 🧪 How to Test Multiplayer

Since this is a real-time multiplayer game, you need at least two players to start a match:

1. **Open two browser windows** (or one normal and one Incognito/Private) at `http://localhost:5173`.
2. **Login/Join** in both windows (they will automatically receive unique device IDs).
3. **In Window A**: Click "Engage" on Classic or Blitz mode.
4. **In Window B**: Click the same mode.
5. **The Match Begins**: The server will automatically pair you and start the match!

---

## 🚢 Deployment Process

The project is designed to be deployed using Docker:

1. **Backend**: The `Dockerfile` in the root (or referenced in `docker-compose.yml`) builds the Go plugin and bundles it with the Nakama server image.
2. **Frontend**: Build the static assets using `pnpm build` in `apps/web` and serve them via Nginx or a CDN (Vercel/Netlify).

For cloud deployment (AWS/GCP):
- Deploy the Docker container to a managed service like **AWS ECS** or **Google Cloud Run**.
- Ensure the PostgreSQL database is accessible to the Nakama container.
- Map ports `7349` (gRPC), `7350` (API/WS), and `7351` (Console).

---

## 📝 License
MIT License. Built with ❤️ for competitive Tic-Tac-Toe fans.
