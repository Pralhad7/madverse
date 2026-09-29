# 🚀 MadVerse — Deployment Guide
### Brand: *MadVerse — Create Beyond Ordinary*

MadVerse is architected as a unified, high-performance web service. The React + Vite frontend and the Express + SQLite (sql.js WASM) backend are compiled and served together seamlessly under a single production port (`PORT`, default `3001` or `8080`), with complete API routing, static asset caching, health checking, and zero external database dependencies.

---

## ⚡ Quick Start: 3-Second Automated Pipeline

We provide a self-contained production deployment script that audits dependencies, compiles the Vite frontend, checks assets, and prepares the app for launch:

```bash
./deploy.sh
```

Or run standard npm commands from the root directory:
```bash
# 1. Install all dependencies across root, backend, and frontend
npm install

# 2. Build the production bundle
npm run build

# 3. Start the production server
npm start
```

---

## 🌐 Deployment Options

### Option 1: Render (Recommended for Free / 1-Click Cloud Hosting)
Render offers a free tier for Node.js web services and native support for persistent disks.

1. Push your repository to **GitHub** or **GitLab**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/madverse.git
   git branch -M main
   git push -u origin main
   ```
2. Log in to [render.com](https://render.com) and click **New +** -> **Blueprint**.
3. Select your repository. Render will automatically detect [`render.yaml`](./render.yaml) and configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/health`
   - **Persistent Disk**: Mounts `./backend/db` to keep the SQLite database intact.
4. Click **Apply**. Your app will be live with free automatic SSL (HTTPS)!

---

### Option 2: Railway
Railway automatically detects [`railway.json`](./railway.json) and [`Procfile`](./Procfile).

1. Push your repository to GitHub.
2. Go to [railway.app](https://railway.app) and click **New Project** -> **Deploy from GitHub repo**.
3. Select your repository.
4. Add environment variables in Railway's dashboard (or leave defaults):
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(generate a random key or let it use default)*
   - `GEMINI_API_KEY`: *(optional, for live Gemini AI generation)*
5. Railway deploys immediately and provides a live public URL.

---

### Option 3: Google Cloud Run (Serverless Container)
Cloud Run runs containers serverlessly with automatic HTTPS and scaling.

1. Ensure the Google Cloud SDK (`gcloud`) is logged in:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_GCP_PROJECT_ID
   ```
2. Deploy the source directly (Cloud Run builds the container using our [`Dockerfile`](./Dockerfile)):
   ```bash
   gcloud run deploy madverse \
     --source . \
     --region us-central1 \
     --allow-unauthenticated \
     --port 8080
   ```
3. Cloud Run will output your live HTTPS URL (e.g., `https://madverse-xyz-uc.a.run.app`).

---

### Option 4: Docker & Docker Compose (Any VPS / Local Machine)
MadVerse includes an enterprise-grade multi-stage [`Dockerfile`](./Dockerfile) and [`docker-compose.yml`](./docker-compose.yml) with a persistent named volume for the SQLite database.

```bash
# Build and run in background
docker compose up --build -d

# View real-time logs
docker compose logs -f

# Check health status
curl http://localhost:3001/health
```

To stop the container:
```bash
docker compose down
```

---

### Option 5: Self-Hosted Linux VPS (Ubuntu, Debian, EC2, DigitalOcean Droplet)

#### 1. Setup Node.js 20 & Git
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git
```

#### 2. Clone & Build
```bash
git clone https://github.com/YOUR_USERNAME/madverse.git
cd madverse
npm install
npm run build
```

#### 3. Run with PM2 (Process Manager for 24/7 Uptime)
```bash
sudo npm install -g pm2
pm2 start backend/server.js --name "madverse" --env NODE_ENV=production,PORT=3001
pm2 save
pm2 startup
```

#### 4. Configure Nginx Reverse Proxy with SSL (Optional)
```nginx
server {
    server_name reviews.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
Install free SSL with Certbot:
```bash
sudo certbot --nginx -d reviews.yourdomain.com
```

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `production` | Enables production mode and static React serving |
| `PORT` | No | `3001` (Docker: `8080`) | The listening port for HTTP traffic |
| `JWT_SECRET` | Recommended | Built-in fallback | Secret key for signing admin authentication tokens |
| `GEMINI_API_KEY` | Optional | `""` | Gemini API key for dynamic AI generation (falls back to 63 handcrafted reviews) |
| `BASE_URL` | Optional | Auto-detected | Public domain for generating physical QR code print URLs |

---

## 🛡️ Anti-Gating & Compliance Guarantee
MadVerse strictly adheres to Google's Business Review Policies:
- 100% of customers are provided with direct Google Review links regardless of rating (1–5 stars).
- Low ratings feature constructive, non-defamatory phrasing and an immediate private manager escalation channel.
- No incentives, rewards, or gating barriers exist anywhere in the user journey.
