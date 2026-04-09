# ☁️ Cloud Deployment Guide (GCP + Vercel)

This guide walks you through deploying your Multiplayer Tic-Tac-Toe game to the cloud for free, specifically optimized for showcase/interview sessions.

---

## 🏗️ 1. Backend: Google Cloud Platform (GCP)
We will use the **GCP Free Tier** to host your Nakama server and database.

### Step 1: Create a VM Instance
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **Compute Engine > VM Instances**.
3. Click **Create Instance**:
   - **Name**: `nakama-server`
   - **Region**: `us-west1`, `us-central1`, or `us-east1` (Required for Free Tier).
   - **Machine Type**: `e2-micro` (2 vCPU, 1 GB RAM - Always Free).
   - **Boot Disk**: Ubuntu 22.04 LTS (Standard Persistent Disk, 10-30 GB).
   - **Firewall**: Check **Allow HTTP traffic** and **Allow HTTPS traffic**.

### Step 2: Open Nakama Ports (Firewall)
1. Go to **VPC Network > Firewall**.
2. Click **Create Firewall Rule**:
   - **Name**: `nakama-ports`
   - **Targets**: All instances in the network.
   - **Source IP ranges**: `0.0.0.0/0`
   - **Protocols and ports**: TCP: `7349, 7350, 7351`.

### Step 3: Install Docker & Deploy
SSH into your instance and run:
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 2. Clone your repo
git clone <your-repo-url>
cd Tic-tac-toe

# 3. Start the server
sudo docker compose up -d --build
```
Your backend is now live at `http://<YOUR_GCP_EXTERNAL_IP>:7350`.

---

## 🎨 2. Frontend: Vercel
Vercel is the best way to host your React application.

### Step 1: Connect GitHub
1. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
2. Connect your GitHub account and select the `Tic-tac-toe` repository.

### Step 2: Configure Project
- **Framework Preset**: Vite
- **Root Directory**: `apps/web`
- **Environment Variables**: Add these in the "Environment Variables" section:
  - `VITE_NAKAMA_HOST`: `<YOUR_GCP_EXTERNAL_IP>`
  - `VITE_NAKAMA_PORT`: `7350`
  - `VITE_NAKAMA_USE_SSL`: `false`
  - `VITE_NAKAMA_SERVER_KEY`: `defaultkey`

### Step 3: Deploy
Click **Deploy**. Vercel will give you a public URL like `tictactoe-abc.vercel.app`.

---

## 🧪 3. Final Verification
1. Open your Vercel URL.
2. The Lobby should load and show "0 Wins" (or your actual wins once you play).
3. Open a second window and play a match to verify the cloud connection.

---

## 💡 Troubleshooting
- **Low Memory on GCP**: Since `e2-micro` has only 1GB RAM, if Docker crashes, create a **Swap File**:
  ```bash
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fcltab
  ```
- **Connection Refused**: Double-check the GCP Firewall rules for port `7350`.
