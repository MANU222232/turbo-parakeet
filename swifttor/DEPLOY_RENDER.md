# Deploy Backend to Render - Complete Guide

## Overview
This guide walks you through deploying your SwiftTor backend (FastAPI + Socket.io) to Render.

---

## Prerequisites

1. **Render Account** - Sign up at https://render.com
2. **Database Ready** - PostgreSQL connection string (Neon, Supabase, etc.)
3. **MongoDB Ready** - MongoDB Atlas connection string
4. **Redis Ready** - Upstash Redis credentials

---

## Step 1: Prepare Environment Variables

### Database Setup

#### Option A: Neon PostgreSQL (Recommended)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string (Pooler mode)
4. Format: `postgresql://user:password@host/dbname?sslmode=require`

#### Option B: Render PostgreSQL
1. In Render dashboard, click "New" → "PostgreSQL"
2. Choose region and plan
3. Copy internal database URL

### MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Create cluster (free tier available)
3. Create database user
4. Whitelist IP: `0.0.0.0/0` (allow all for Render)
5. Get connection string

### Upstash Redis
1. Go to https://upstash.com
2. Create new Redis database
3. Copy REST URL and REST Token

---

## Step 2: Connect Repository to Render

### Method 1: Using render.yaml (Recommended)

```bash
# Make sure you're in the root directory
cd c:\Users\PC\OneDrive\Desktop\towing\SWIFTTOW

# Your render.yaml is already configured
# It will deploy both backend and frontend together
```

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect your GitHub repository: `MANU222232/turbo-parakeet`
4. Select "render.yaml" when prompted
5. Click "Apply"

### Method 2: Manual Setup

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect repository: `MANU222232/turbo-parakeet`
4. Configure:
   - **Name:** `swifttor-api`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `swifttor/apps/api`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `bash start.sh`
   - **Instance Type:** Free or Standard

---

## Step 3: Configure Environment Variables

In Render dashboard, go to your service → "Environment" tab

Add these variables:

### Database
```
DATABASE_URL=postgresql://...         # From Neon/Render
MONGODB_URI=mongodb+srv://...         # From MongoDB Atlas
UPSTASH_REDIS_REST_URL=https://...    # From Upstash
UPSTASH_REDIS_REST_TOKEN=...          # From Upstash
```

### Authentication
```
JWT_SECRET_KEY=your-secret-key-here
JWT_REFRESH_SECRET_KEY=your-refresh-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-here
```

Generate secrets with:
```bash
# Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### AI & Payments
```
GEMINI_API_KEY=your-gemini-key
STRIPE_SECRET_KEY=sk_test_...
```

### Storage (S3)
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=swifttor-emergency-uploads
```

### Communications (Twilio)
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_VERIFY_SERVICE_SID=VA...
TWILIO_PHONE_NUMBER=+1234567890
```

### Monitoring
```
SENTRY_DSN=https://...@sentry.io/...
```

### CORS
```
CORS_ORIGINS=https://swifttor-web.onrender.com,https://yourdomain.com
```

---

## Step 4: Database Migrations

After deployment, run migrations:

### Option A: Automatic (in start.sh)
Your [`start.sh`](c:\Users\PC\OneDrive\Desktop\towing\SWIFTTOW\swifttor\apps\api\start.sh) should include:

```bash
#!/bin/bash
set -e

# Run migrations
alembic upgrade head

# Start server
exec uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Option B: Manual via SSH
1. In Render dashboard, click "Shell" tab
2. Navigate to API directory
3. Run: `alembic upgrade head`

---

## Step 5: Seed Initial Data

After migrations, seed the database:

```bash
# In Render Shell
cd swifttor/apps/api
python seed.py
python seed_whatsapp.py
python seed_profiles.py --test
```

Or create a one-time deploy hook in render.yaml:

```yaml
- type: web
  name: swifttor-api
  # ... existing config ...
  envVars:
    - key: RUN_SEED_ON_START
      value: "true"
```

Then modify `start.sh`:
```bash
if [ "$RUN_SEED_ON_START" = "true" ]; then
  python seed.py
  python seed_whatsapp.py
fi
```

---

## Step 6: Verify Deployment

### Health Check
Visit: `https://swifttor-api.onrender.com/health`

Expected response:
```json
{
  "status": "healthy",
  "service": "SwiftTor API",
  "timestamp": "2026-03-28T..."
}
```

### Test API Endpoints

#### 1. WhatsApp Config
```bash
curl https://swifttor-api.onrender.com/api/v1/whatsapp/config/active
```

#### 2. Users
```bash
curl https://swifttor-api.onrender.com/api/v1/users/me
```

#### 3. Shops
```bash
curl https://swifttor-api.onrender.com/api/v1/shops/
```

### Interactive Docs
Visit: `https://swifttor-api.onrender.com/docs`

---

## Step 7: Update Frontend API URL

Once backend is deployed, update frontend environment:

### In Vercel Dashboard
```
NEXT_PUBLIC_API_URL=https://swifttor-api.onrender.com
```

### Or in .env.local (development)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Troubleshooting

### Issue: Build fails
**Solution:** Check build logs in Render dashboard. Common issues:
- Missing dependencies in requirements.txt
- Python version mismatch
- File path issues (case-sensitive on Linux)

### Issue: Database connection error
**Solution:**
1. Verify connection string includes `?sslmode=require`
2. Check MongoDB IP whitelist (0.0.0.0/0)
3. Ensure database is not blocking Render IPs

### Issue: CORS errors
**Solution:**
Update `CORS_ORIGINS` environment variable:
```
CORS_ORIGINS=https://swifttor-web.onrender.com,https://yourdomain.com
```

### Issue: WebSocket disconnections
**Solution:**
Render free tier spins down after 15 minutes of inactivity. Upgrade to paid plan or use a different provider for WebSocket-heavy apps.

---

## Cost Optimization

### Free Tier Limits
- **Web Services:** 750 hours/month (enough for 1 service always-on)
- **PostgreSQL:** 1 GB storage, 25 MB connections
- **Limitations:** Spins down after 15 min inactivity

### Paid Plans
- **Standard Web Service:** $7/month (no spin-down)
- **Pro PostgreSQL:** Starting at $7/month

### Tips
1. Use Neon (free PostgreSQL) instead of Render PostgreSQL
2. Use MongoDB Atlas free tier (512 MB)
3. Use Upstash Redis free tier (10K commands/day)
4. Keep only essential services on Render paid tier

---

## Next Steps

✅ Backend deployed and healthy  
✅ Database migrated  
✅ Initial data seeded  
✅ API endpoints tested  
✅ Frontend configured with API URL  

➡️ **Now deploy frontend to Vercel** (see `DEPLOY_VERCEL.md`)

---

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **API** | https://swifttor-api.onrender.com | FastAPI backend |
| **Docs** | https://swifttor-api.onrender.com/docs | Swagger UI |
| **Health** | https://swifttor-api.onrender.com/health | Health check |
| **WebSocket** | wss://swifttor-api.onrender.com | Real-time updates |

---

**Need Help?** Check Render docs: https://render.com/docs
