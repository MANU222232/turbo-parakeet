# One-Click Deployment Guide

## Quick Answer: YES! ✅

With the `vercel.json` configuration file, you can now deploy to Vercel with just a few clicks!

---

## Architecture Overview

```
Frontend (Vercel)          Backend (Render)
┌─────────────────┐        ┌──────────────────┐
│  Next.js App    │◄──────►│  FastAPI Server  │
│  /apps/web      │  REST  │  /apps/api       │
│                 │  WS    │                  │
└─────────────────┘        └──────────────────┘
```

---

## Deploy Frontend to Vercel (3 Clicks!)

### Step 1: Push to GitHub

Make sure your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your repo: `MANU222232/turbo-parakeet`

### Step 3: Configure Project

Vercel will auto-detect the `vercel.json` file and pre-fill all settings!

**Auto-Detected Settings:**
- ✅ **Framework:** Next.js
- ✅ **Root Directory:** `swifttor/apps/web`
- ✅ **Build Command:** `npm install && npm run build`
- ✅ **Output Directory:** `.next`
- ✅ **Install Command:** `npm install`

You only need to add environment variables!

### Step 4: Add Environment Variables

Click **"Environment Variables"** → Add these:

```
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-project.vercel.app
AUTH_SECRET=your-secret-key-here
AUTH_URL=https://your-project.vercel.app
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
SENTRY_DSN=your-sentry-dsn
NODE_ENV=production
```

💡 **Generate secrets with:**
```bash
openssl rand -base64 32
```

### Step 5: Deploy!

Click **"Deploy"** 🚀

Vercel will:
1. Install dependencies
2. Build your Next.js app
3. Deploy to global CDN
4. Give you a live URL!

**Your site will be live at:** `https://turbo-parakeet.vercel.app`

---

## Deploy Backend to Render

### Option A: Using Render Dashboard

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect repository: `MANU222232/turbo-parakeet`
4. Configure:
   - **Name:** `swifttor-api`
   - **Branch:** `main`
   - **Root Directory:** `swifttor/apps/api`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `bash start.sh`
   - **Instance Type:** `Starter` (free tier)

5. Add environment variables (see below)
6. Click **"Create Web Service"**

### Option B: Using render.yaml (Blueprint)

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Blueprint"**
3. Connect repository
4. Select `render.yaml` file
5. Render automatically configures everything!
6. Just add environment variables and deploy

---

## Environment Variables for Render

Add these in Render dashboard:

```ini
# Database
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/swifttor
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Authentication
JWT_SECRET_KEY=xxx
JWT_REFRESH_SECRET_KEY=xxx
NEXTAUTH_SECRET=xxx

# AI & Payments
GEMINI_API_KEY=xxx
STRIPE_SECRET_KEY=sk_test_xxx

# Storage
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=swifttor-emergency-uploads

# Communications
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_VERIFY_SERVICE_SID=VAxxx
TWILIO_PHONE_NUMBER=+1234567890

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# CORS (IMPORTANT!)
CORS_ORIGINS=https://turbo-parakeet.vercel.app
```

---

## Post-Deployment Setup

### 1. Update CORS on Backend

After deploying frontend to Vercel, update backend CORS:

In Render dashboard → swifttor-api → Environment:
```
CORS_ORIGINS=https://turbo-parakeet.vercel.app
```

Click **"Save Changes"** → Service will restart

### 2. Update API URL on Frontend

After deploying backend to Render, update frontend:

In Vercel dashboard → Project → Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL=https://swifttor-api.onrender.com
```

Click **"Save"** → Redeploy

### 3. Run Database Migrations

Access Render Shell:
1. Go to Render dashboard
2. Click on `swifttor-api`
3. Click **"Shell"** tab
4. Run:

```bash
cd swifttor/apps/api
alembic upgrade head
python seed_whatsapp.py
python seed_profiles.py --test
```

---

## Verify Deployment

### Backend Health Check

Visit: `https://swifttor-api.onrender.com/health`

Expected:
```json
{
  "status": "healthy",
  "service": "SwiftTor API"
}
```

### Frontend Check

Visit: `https://turbo-parakeet.vercel.app`

Test:
- ✅ Landing page loads
- ✅ WhatsApp button works
- ✅ Call button works
- ✅ Map integration works

### API Integration Test

Open browser console on Vercel site:
```javascript
fetch('https://swifttor-api.onrender.com/api/v1/shops')
  .then(r => r.json())
  .then(console.log)
```

Should return list of shops successfully!

---

## Continuous Deployment

Both Vercel and Render support **auto-deploy** on git push!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Both platforms automatically:
# 1. Detect the push
# 2. Start building
# 3. Deploy new version
# 4. You get live updates!
```

No manual deployment needed after initial setup! 🎉

---

## Troubleshooting

### Issue: Vercel doesn't recognize vercel.json

**Solution:** Make sure `vercel.json` is in repository **root**, not in `/apps/web`

Current structure:
```
turbo-parakeet/
├── vercel.json          ← Should be here ✅
├── render.yaml
├── swifttor/
│   ├── apps/
│   │   ├── web/         ← Frontend
│   │   └── api/         ← Backend
```

### Issue: Root directory not working

**Solution:** The `vercel.json` already has this configured:
```json
{
  "rootDirectory": "swifttor/apps/web"
}
```

Vercel will automatically use this directory.

### Issue: CORS errors from frontend

**Solution:** Update backend CORS origins on Render:
```
CORS_ORIGINS=https://your-site.vercel.app,https://yourdomain.com
```

### Issue: API calls fail silently

**Solution:** Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel

### Issue: WebSocket won't connect

**Solution:** 
1. Ensure backend is on paid plan (free tier has WebSocket limitations)
2. Use correct protocol: `wss://` for production, `ws://` for local

---

## Cost Summary

### Free Tier (Testing)

| Service | Cost | What You Get |
|---------|------|--------------|
| Vercel | $0 | Unlimited deployments, 100GB bandwidth |
| Render | $0 | 750 hours/month (1 service always-on) |
| Neon DB | $0 | 0.5 GB PostgreSQL |
| MongoDB | $0 | 512 MB storage |
| Upstash | $0 | 10K commands/day |
| **Total** | **$0** | Perfect for MVP! |

### Production Tier

| Service | Cost | Why Upgrade |
|---------|------|-------------|
| Vercel Pro | $20/mo | Custom domains, analytics |
| Render Standard | $7/mo | No spin-down, better performance |
| Databases | ~$30/mo | More storage, backups |
| **Total** | **~$57/mo** | Production-ready |

---

## Quick Commands

### Deploy to Vercel
```bash
cd swifttor/apps/web
vercel          # Preview deployment
vercel --prod   # Production deployment
```

### View Logs
```bash
# Vercel
vercel logs

# Render
render logs -f swifttor-api
```

### Open Shell
```bash
# Render Shell
render shell swifttor-api
```

---

## File Structure Reference

```
turbo-parakeet/
│
├── vercel.json                    ← Vercel config (NEW!)
├── render.yaml                    ← Render config
│
├── swifttor/
│   ├── apps/
│   │   ├── web/                   ← Deploy to Vercel
│   │   │   ├── package.json
│   │   │   ├── next.config.mjs
│   │   │   └── ...
│   │   │
│   │   └── api/                   ← Deploy to Render
│   │       ├── requirements.txt
│   │       ├── main.py
│   │       └── ...
│   │
│   └── packages/
│       ├── types/
│       └── utils/
│
└── README.md
```

---

## Next Steps

1. ✅ Push `vercel.json` to GitHub
2. ✅ Deploy frontend to Vercel (3 clicks)
3. ✅ Deploy backend to Render
4. ✅ Run database migrations
5. ✅ Test full integration
6. ✅ Set up custom domain (optional)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Render Docs:** https://render.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

**Ready to deploy?** Just connect your repo to Vercel and Render - the config files do the rest! 🚀
