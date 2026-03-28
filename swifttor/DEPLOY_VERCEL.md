# Deploy Frontend to Vercel - Complete Guide

## Overview
Deploy your SwiftTor frontend (Next.js) to Vercel with optimal performance and SEO.

---

## Prerequisites

1. **Vercel Account** - Sign up at https://vercel.com
2. **Backend Deployed** - API URL from Render deployment
3. **Google Maps API Key** - For map functionality

---

## Step 1: Prepare Your Next.js App

### Check Configuration Files

Your [`next.config.mjs`](c:\Users\PC\OneDrive\Desktop\towing\SWIFTTOW\swifttor\apps\web\next.config.mjs) should be production-ready:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
  },
  // Ensure API URL is set correctly
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
```

### Verify Environment Variables

Create `.env.production` locally for testing:

```
NEXT_PUBLIC_API_URL=https://swifttor-api.onrender.com
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
AUTH_SECRET=your-secret-key
AUTH_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your-google-maps-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
SENTRY_DSN=https://...@sentry.io/...
NODE_ENV=production
```

---

## Step 2: Connect Repository to Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select your GitHub repository: `MANU222232/turbo-parakeet`
4. Configure project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `swifttor/apps/web`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to web app
cd swifttor/apps/web

# Deploy
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name: **swifttor-web**
- Directory: **Yes** (defaults to current)
- Override settings? **No**

---

## Step 3: Configure Environment Variables in Vercel

In Vercel dashboard → Your Project → "Settings" → "Environment Variables"

Add these variables:

### API Configuration
```
NEXT_PUBLIC_API_URL=https://swifttor-api.onrender.com
```

### Authentication
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://swifttor-web.vercel.app
AUTH_SECRET=your-auth-secret
AUTH_URL=https://swifttor-web.vercel.app
```

Generate secrets:
```bash
# OpenSSL
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Google Maps
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
```

Get your key: https://console.cloud.google.com/apis/credentials

### Payments
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```

### Monitoring
```
SENTRY_DSN=https://...@sentry.io/...
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

### Build Configuration
```
NODE_ENV=production
```

---

## Step 4: Custom Domain (Optional)

### Add Domain in Vercel

1. Go to Vercel dashboard → Project → "Settings"
2. Click "Domains"
3. Add your domain: `swifttor.com` or `www.swifttor.com`
4. Follow DNS configuration instructions

### DNS Configuration

#### For Root Domain (@)
```
Type: A
Name: @
Value: 76.76.21.21
```

#### For WWW Subdomain
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Update Environment Variables

After adding custom domain, update:
```
NEXTAUTH_URL=https://swifttor.com
AUTH_URL=https://swifttor.com
```

---

## Step 5: Deploy

### Automatic Deployment (GitHub Integration)

Once connected, Vercel automatically deploys on every push to `main` branch.

### Manual Deployment

```bash
cd swifttor/apps/web

# Preview deployment
vercel --preview

# Production deployment
vercel --prod
```

### Build Locally First

Always test build locally before deploying:

```bash
cd swifttor/apps/web

# Install dependencies
npm install

# Build
npm run build

# Test production build
npm start
```

Visit: http://localhost:3000

---

## Step 6: Post-Deployment Verification

### Check Deployment Status

1. Go to Vercel dashboard → "Deployments"
2. Click on latest deployment
3. Check build logs for errors

### Test Live Site

Visit your deployed URL:
- Vercel subdomain: `https://swifttor-web.vercel.app`
- Custom domain: `https://swifttor.com`

### Test Critical Flows

1. **Landing Page** - Loads correctly
2. **WhatsApp Button** - Opens chat with +12089695688
3. **Call Button** - Dials +12089695688
4. **Emergency Report** - Form submission works
5. **Map Integration** - Google Maps loads
6. **Authentication** - Login/signup flows
7. **API Calls** - All endpoints respond

### Check API Connectivity

Open browser console and verify:
```javascript
// Should show your Render API URL
console.log(process.env.NEXT_PUBLIC_API_URL)
// Output: https://swifttor-api.onrender.com
```

Test endpoint:
```javascript
fetch('https://swifttor-api.onrender.com/health')
  .then(r => r.json())
  .then(console.log)
```

---

## Step 7: Performance Optimization

### Enable Edge Config (Optional)

For faster environment variable access:

1. Go to Vercel dashboard → "Storage"
2. Click "Create" → "Edge Config"
3. Link to your project
4. Add frequently-used config values

### Image Optimization

Your Next.js config already includes image optimization. Verify:

```javascript
images: {
  domains: ['images.unsplash.com', 'lh3.googleusercontent.com'],
  formats: ['image/avif', 'image/webp'],
}
```

### Enable Compression

Already configured in your backend. Frontend automatically benefits.

---

## Troubleshooting

### Issue: Build fails on Vercel
**Solution:**
```bash
# Check Node version
node --version

# Vercel supports Node 18+, update if needed
# Check package.json engines field
"engines": {
  "node": ">=18.0.0"
}
```

### Issue: API calls fail (CORS)
**Solution:**
Update backend CORS settings on Render:
```
CORS_ORIGINS=https://swifttor-web.vercel.app,https://yourdomain.com
```

### Issue: Environment variables not working
**Solution:**
1. Redeploy after adding new variables
2. Use `NEXT_PUBLIC_` prefix for client-side vars
3. Restart dev server locally

### Issue: 404 on refresh
**Solution:**
Add `vercel.json` for proper routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Issue: WebSocket not connecting
**Solution:**
Render free tier has WebSocket limitations. Consider:
1. Upgrade Render to paid plan
2. Use dedicated WebSocket service (Pusher, Ably)
3. Implement reconnection logic in frontend

---

## Step 8: Continuous Deployment Setup

### Automatic Deployments on Push

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

Vercel will:
1. Detect push
2. Start build
3. Deploy to preview URL
4. Promote to production

### Preview Deployments

Every pull request gets a unique preview URL:
```
https://turbo-parakeet-git-main-yourname.vercel.app
```

Use this for testing before merging to main.

---

## Cost Optimization

### Vercel Free Tier Includes:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ 6,000 build minutes/month
- ✅ Automatic SSL
- ✅ Global CDN

### When to Upgrade:
- Need more build minutes
- Require custom domains
- Want analytics
- Need team collaboration

### Pro Tips:
1. Use Vercel's free tier (generous for most apps)
2. Optimize build time (cache dependencies)
3. Use Edge Functions for lightweight API routes
4. Compress images before upload

---

## Integration with Backend

### Connect to Render API

Ensure all API calls use the environment variable:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function fetchShops() {
  const res = await fetch(`${API_URL}/api/v1/shops`);
  return res.json();
}
```

### WebSocket Configuration

Update Socket.IO connection:

```typescript
// core/sockets.ts
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: 5,
});
```

---

## Next Steps

✅ Frontend deployed to Vercel  
✅ Backend connected from Render  
✅ Environment variables configured  
✅ Custom domain set up (optional)  
✅ CI/CD pipeline active  

➡️ **Test full integration**  
➡️ **Monitor performance**  
➡️ **Set up error tracking (Sentry)**

---

## Quick Reference

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | https://swifttor-web.vercel.app | Next.js app |
| **Backend** | https://swifttor-api.onrender.com | FastAPI service |
| **Docs** | https://swifttor-api.onrender.com/docs | API documentation |

---

## Full Stack Architecture

```
┌─────────────┐         ┌──────────────┐
│   Vercel    │         │    Render    │
│  (Frontend) │◄───────►│   (Backend)  │
│  Next.js    │   REST  │   FastAPI    │
│             │  WS     │   + SQL/NoSQL│
└─────────────┘         └──────────────┘
       │                        │
       │                        ├─► Neon (PostgreSQL)
       │                        ├─► MongoDB Atlas
       │                        ├─► Upstash Redis
       │                        ├─► Stripe
       │                        └─► Twilio
       ▼
┌─────────────┐
│   Users     │
│  (Browser)  │
│  (Mobile)   │
└─────────────┘
```

---

**Need Help?** Check Vercel docs: https://vercel.com/docs
