# Deployment Guide

This guide covers deploying the SEC Filings Filter application to production.

## Architecture

- **Frontend**: React/Vite app
- **Backend**: Node.js/Express API server

## Option 1: Deploy Both to Vercel (Simple, but has limitations)

### Prerequisites
1. [Vercel account](https://vercel.com/signup)
2. [Vercel CLI](https://vercel.com/cli) installed: `npm i -g vercel`
3. Git repository (recommended)

### Steps

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from project root**
   ```bash
   cd /Users/noys/Documents/noy-ari-prog/filter-1
   vercel
   ```

4. **Configure Environment Variables in Vercel Dashboard**
   - Go to your project settings on Vercel
   - Add Environment Variable: `FMP_API_KEY` = `your_api_key`

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### ⚠️ Limitations with Vercel
- Serverless functions have 10-60 second timeout (depending on plan)
- Long-running exports may fail
- Rate limiting with queues may not persist

---

## Option 2: Split Deployment (Recommended)

Deploy **frontend to Vercel** and **backend to Railway/Render** (better for long-running operations).

### A. Deploy Frontend to Vercel

1. **Update Vite config to use backend URL**

   Edit `client/vite.config.js`:
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     server: {
       port: 3000,
       proxy: {
         '/api': {
           target: process.env.VITE_API_URL || 'http://localhost:3001',
           changeOrigin: true,
         },
       },
     },
   })
   ```

2. **Create production build config**

   Create `client/.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

3. **Deploy frontend to Vercel**
   ```bash
   cd client
   vercel
   ```

   Configure:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`

### B. Deploy Backend to Railway

1. **Install Railway CLI**
   ```bash
   npm i -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Initialize Railway project**
   ```bash
   cd server
   railway init
   ```

4. **Add Environment Variables**
   ```bash
   railway variables set FMP_API_KEY=your_api_key_here
   railway variables set PORT=3001
   ```

5. **Deploy**
   ```bash
   railway up
   ```

6. **Get your backend URL**
   ```bash
   railway domain
   ```

7. **Update frontend with backend URL**
   - Go to Vercel dashboard
   - Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-railway-url.up.railway.app`
   - Redeploy frontend

---

## Option 3: Deploy Backend to Render

### Steps

1. **Create `render.yaml`** (in server directory)
   ```yaml
   services:
     - type: web
       name: sec-filings-api
       env: node
       buildCommand: npm install
       startCommand: npm start
       envVars:
         - key: FMP_API_KEY
           sync: false
         - key: PORT
           value: 3001
   ```

2. **Push to GitHub**

3. **Connect to Render**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect your GitHub repo
   - Select `server` directory
   - Add environment variable: `FMP_API_KEY`

4. **Update frontend** with Render backend URL

---

## Quick Deploy with GitHub (Easiest)

### 1. Push code to GitHub

```bash
cd /Users/noys/Documents/noy-ari-prog/filter-1
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/sec-filings-filter.git
git push -u origin main
```

### 2. Deploy Frontend to Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Root Directory: `client`
- Framework Preset: **Vite**
- Add Environment Variable: `VITE_API_URL` (your backend URL)
- Deploy!

### 3. Deploy Backend to Railway

- Go to [railway.app](https://railway.app)
- New Project → Deploy from GitHub
- Select your repository
- Root Directory: `server`
- Add Environment Variables: `FMP_API_KEY`, `PORT=3001`
- Deploy!

---

## Environment Variables Needed

### Backend (.env)
```
PORT=3001
FMP_API_KEY=your_financial_modeling_prep_api_key
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.com
```

---

## Post-Deployment

1. **Test the deployment**
   - Visit your frontend URL
   - Try a search
   - Test CSV export

2. **Monitor logs**
   - Vercel: Dashboard → Deployments → View Function Logs
   - Railway: Dashboard → View Logs
   - Render: Dashboard → Logs

3. **Set up custom domain** (optional)
   - Vercel: Settings → Domains
   - Railway: Settings → Domains

---

## Troubleshooting

### CORS Errors
Add to `server/src/server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### API Timeouts
- Use Railway or Render for backend (better for long operations)
- Vercel serverless functions timeout quickly

### Build Failures
- Check Node.js version compatibility
- Ensure all dependencies are in package.json
- Check build logs for specific errors

---

## Recommended Setup

**For Production:**
- ✅ Frontend: Vercel (fast CDN, automatic HTTPS)
- ✅ Backend: Railway or Render (better for long-running operations)
- ✅ Database: Add later if needed

This setup gives you:
- Fast frontend delivery
- Reliable backend for long exports
- Easy scaling
- Automatic HTTPS on both

