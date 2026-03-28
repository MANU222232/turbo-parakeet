# Deployment Checklist - SwiftTor

## Quick Answer: YES! ✅

You can (and should!) deploy:
- **Backend** → Render
- **Frontend** → Vercel

This is the recommended production architecture.

---

## Pre-Deployment Checklist

### Backend (Render)

- [ ] PostgreSQL database ready (Neon/Supabase/Render)
- [ ] MongoDB Atlas cluster created
- [ ] Upstash Redis database created
- [ ] All environment variables collected
- [ ] `requirements.txt` up to date
- [ ] Database migrations tested locally
- [ ] WhatsApp number updated to +12089695688
- [ ] CORS origins configured

### Frontend (Vercel)

- [ ] Node.js 18+ installed
- [ ] Build tested locally (`npm run build`)
- [ ] API URL points to Render backend
- [ ] Google Maps API key obtained
- [ ] Stripe keys configured
- [ ] Auth secrets generated
- [ ] Environment variables documented

---

## Deployment Steps

### Phase 1: Deploy Backend to Render

```bash
# 1. Navigate to root
cd c:\Users\PC\OneDrive\Desktop\towing\SWIFTTOW

# 2. Ensure render.yaml exists
# File already created with both services configured

# 3. Push latest changes
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### Render Dashboard Steps:

1. Go to https://dashboard.render.com
2. Click "New +" → "Blueprint"
3. Connect GitHub repo: `MANU222232/turbo-parakeet`
4. Select `render.yaml`
5. Click "Apply"

#### Add Environment Variables:

In Render dashboard → swifttor-api → Environment:

```
DATABASE_URL=postgresql://...
MONGODB_URI=mongodb+srv://...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
JWT_SECRET_KEY=...
JWT_REFRESH_SECRET_KEY=...
GEMINI_API_KEY=...
STRIPE_SECRET_KEY=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
CORS_ORIGINS=https://swifttor-web.vercel.app
SENTRY_DSN=...
```

#### Run Migrations:

```bash
# In Render Shell (after deployment)
cd swifttor/apps/api
alembic upgrade head
python seed_whatsapp.py
```

---

### Phase 2: Deploy Frontend to Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Navigate to web app
cd swifttor/apps/web

# 4. Deploy
vercel
```

#### Vercel Dashboard Steps:

1. Go to https://vercel.com/new
2. Import project: `MANU222232/turbo-parakeet`
3. Configure:
   - **Root Directory:** `swifttor/apps/web`
   - **Framework:** Next.js (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### Add Environment Variables:

In Vercel dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://swifttor-api.onrender.com
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
AUTH_SECRET=...
AUTH_URL=https://your-domain.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
SENTRY_DSN=...
NODE_ENV=production
```

---

## Post-Deployment Verification

### Backend Health Check

```bash
curl https://swifttor-api.onrender.com/health
```

Expected:
```json
{
  "status": "healthy",
  "service": "SwiftTor API"
}
```

### Frontend Check

Visit: `https://swifttor-web.vercel.app`

Test:
- [ ] Landing page loads
- [ ] WhatsApp button works (+12089695688)
- [ ] Call button works (+12089695688)
- [ ] Map integration works
- [ ] Emergency form submits
- [ ] Authentication works

### API Integration Test

```bash
# Test WhatsApp endpoint
curl https://swifttor-api.onrender.com/api/v1/whatsapp/config/active

# Test shops endpoint
curl https://swifttor-api.onrender.com/api/v1/shops/
```

---

## Common Issues & Solutions

### Issue 1: Backend spins down on Render
**Solution:** Upgrade to paid plan ($7/month) or use health check pings

### Issue 2: CORS errors
**Solution:** Update `CORS_ORIGINS` on Render to include Vercel URL

```
CORS_ORIGINS=https://swifttor-web.vercel.app,https://yourdomain.com
```

### Issue 3: WebSocket disconnects
**Solution:** Implement reconnection logic or upgrade Render plan

### Issue 4: Database connection fails
**Solution:** 
- Add `?sslmode=require` to PostgreSQL URL
- Whitelist `0.0.0.0/0` in MongoDB Atlas

### Issue 5: Environment variables not working
**Solution:** Redeploy after adding new variables

---

## Cost Breakdown

### Free Tier (Good for Testing)

| Service | Cost | Limits |
|---------|------|--------|
| Render Web Service | $0 | 750 hrs/month, spins down |
| Neon PostgreSQL | $0 | 0.5 GB storage |
| MongoDB Atlas | $0 | 512 MB storage |
| Upstash Redis | $0 | 10K commands/day |
| Vercel | $0 | 100 GB bandwidth |
| **Total** | **$0** | Perfect for MVP |

### Production Tier (Recommended)

| Service | Cost | Purpose |
|---------|------|---------|
| Render Standard | $7/mo | No spin-down |
| Neon Pro | $19/mo | More storage |
| MongoDB Atlas | $9/mo | Better performance |
| Upstash Pro | $19/mo | Higher limits |
| Vercel Pro | $20/mo | Custom domains |
| **Total** | **~$74/mo** | Production-ready |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│              User's Browser                 │
│            https://yourdomain.com           │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
        ┌────────────────────┐
        │      Vercel CDN    │
        │   (Static Assets)  │
        │   (Edge Functions) │
        └─────────┬──────────┘
                  │
                  │ REST API
                  │ WebSocket
                  ▼
        ┌────────────────────┐
        │  Render (FastAPI)  │
        │   Backend Service  │
        └─────────┬──────────┘
                  │
         ┌────────┼────────┬──────────┐
         ▼        ▼        ▼          ▼
   ┌────────┐ ┌──────┐ ┌─────┐ ┌────────┐
   │ Neon   │ │Mongo │ │Redis│ │ Stripe │
   │Postgres│ │Atlas │ │Upst│ │Twilio  │
   └────────┘ └──────┘ └─────┘ └────────┘
```

---

## Continuous Deployment Flow

```
Developer pushes code
       ↓
   GitHub (main)
       ↓
   ┌───────┴───────┐
   ▼               ▼
Render          Vercel
(Build)        (Build)
   ↓               ↓
Deploy          Deploy
   ↓               ↓
https://swifttor-api   https://swifttor-web
.onrender.com          .vercel.app
```

---

## Quick Commands

### Backend (Render)
```bash
# View logs
render logs -f swifttor-api

# Open shell
render shell swifttor-api

# Restart service
render restart swifttor-api
```

### Frontend (Vercel)
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs
```

---

## Monitoring & Maintenance

### Daily Checks
- [ ] Backend health endpoint responds
- [ ] Frontend loads without errors
- [ ] WebSocket connections stable
- [ ] Database connections healthy

### Weekly Tasks
- [ ] Review error logs (Sentry)
- [ ] Check database size
- [ ] Monitor API response times
- [ ] Review Vercel analytics

### Monthly Maintenance
- [ ] Update dependencies
- [ ] Review costs
- [ ] Check SSL certificates
- [ ] Backup databases

---

## Support Resources

### Documentation
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com)

### Community
- [Render Discord](https://discord.gg/render)
- [Vercel Community](https://github.com/vercel/next.js/discussions)

---

## Next Steps After Deployment

1. ✅ Set up custom domain
2. ✅ Enable HTTPS (automatic on both platforms)
3. ✅ Configure error tracking (Sentry)
4. ✅ Set up monitoring (Uptime Robot)
5. ✅ Create backup strategy
6. ✅ Document runbooks
7. ✅ Plan scaling strategy

---

**Ready to deploy?** Follow `DEPLOY_RENDER.md` and `DEPLOY_VERCEL.md` for detailed instructions!
