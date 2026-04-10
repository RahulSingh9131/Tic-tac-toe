# ☁️ Cloud Deployment Guide (Railway + Vercel)

This guide documents the verified production setup for **Multiplayer Tic-Tac-Toe**.

---

## 🚂 1. Backend: Railway

### Step 1: Services Setup
1. Create a Railway Project and add **PostgreSQL**.
2. Add your GitHub repository as a new service.

### Step 2: Service Settings (Critical)
1. **Root Directory**: Set to `apps/backend`.
2. **Builder**: Ensure it is set to **Docker**.
3. **DockerfilePath**: Should be `Dockerfile` (relative to the root directory above).

### Step 3: Environment Variables
Add these to the `Tic-tac-toe` service:
- `NAKAMA_DATABASE_ADDRESS`: `${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}?sslmode=disable`
- `NAKAMA_SOCKET_SERVER_KEY`: `tictactoe-production-key` (or your chosen key)
- `NAKAMA_NAME`: `tictactoe`
- `PORT`: `7350`

### Step 4: Start Command
Update the **Start Command** in Settings to bypass shell expansion issues:
```bash
sh -c "/nakama/nakama migrate up --database.address $NAKAMA_DATABASE_ADDRESS && /nakama/nakama --database.address $NAKAMA_DATABASE_ADDRESS --socket.server_key $NAKAMA_SOCKET_SERVER_KEY --name $NAKAMA_NAME --console.cors_allowed_origins '*'"
```

---

## 🎨 2. Frontend: Vercel

### Step 1: Project Import
1. Import the repository and set the **Root Directory** to `apps/web`.
2. Set the **Framework Preset** to `Vite`.

### Step 2: Environment Variables
Add these to the Vercel project:
- `VITE_NAKAMA_HOST`: `your-railway-domain.up.railway.app` (Hostname only, no `https://`)
- `VITE_NAKAMA_PORT`: `443`
- `VITE_NAKAMA_USE_SSL`: `true`
- `VITE_NAKAMA_SERVER_KEY`: `tictactoe-production-key` (Must match Railway)

### Step 3: Monorepo Settings
In Vercel **Project Settings > General**:
- **Build Command**: `pnpm build`
- **Include Source Files from Outside the Root Directory**: `ON`

---

## 🧪 3. Verification
1. Open the Vercel URL.
2. Click **Engage Protocol**.
3. If you reach the Lobby with a win count displayed, the connection is solid.
