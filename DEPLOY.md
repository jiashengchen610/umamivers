# Deployment Guide for Render.com

This guide walks you through deploying Umamivers to Render.com's free tier.

## Prerequisites

- GitHub account with your code pushed to a repository
- Render.com account (sign up at https://render.com)

## Deployment Steps

### 1. Push Your Code to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create New Web Services on Render

#### Option A: Using Blueprint (Recommended - Deploys Everything at Once)

1. Go to https://dashboard.render.com/blueprints
2. Click "New Blueprint Instance"
3. Connect your GitHub repository: `jiashengchen610/umamivers`
4. Render will automatically detect `render.yaml` and create:
   - PostgreSQL database (`umamivers-db`)
   - Backend web service (`umamivers-backend`)
   - Frontend web service (`umamivers-frontend`)
5. Click "Apply" and wait for deployment (~10 minutes)

#### Option B: Manual Setup (If Blueprint Doesn't Work)

**Step 1: Create PostgreSQL Database**
1. From dashboard, click "New +" → "PostgreSQL"
2. Name: `umamivers-db`
3. Database: `umami_db`
4. User: `umami_user`
5. Region: Choose closest to you
6. Plan: Free
7. Click "Create Database"
8. **Copy the Internal Database URL** (you'll need this)

**Step 2: Create Backend Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repo
3. Configure:
   - **Name**: `umamivers-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Python 3
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && gunicorn umami_project.wsgi:application`
   - **Plan**: Free

4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1
   - `SECRET_KEY`: Click "Generate" (Render will create a secure key)
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: Leave empty for now (will add after getting URL)

5. Click "Create Web Service"
6. Wait for first build (~5-8 minutes)
7. Once deployed, copy your backend URL (e.g., `https://umamivers-backend.onrender.com`)
8. Go back to Environment Variables and add:
   - `ALLOWED_HOSTS`: Your backend domain (e.g., `umamivers-backend.onrender.com`)
   - `FRONTEND_URL`: `https://umamivers-frontend.onrender.com` (you'll get this in next step)

**Step 3: Create Frontend Service**
1. Click "New +" → "Web Service"
2. Connect your GitHub repo (same repo)
3. Configure:
   - **Name**: `umamivers-frontend`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: Node
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Start Command**: `cd frontend && npm start`
   - **Plan**: Free

4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL from Step 2 (e.g., `https://umamivers-backend.onrender.com`)

5. Click "Create Web Service"
6. Wait for build (~3-5 minutes)
7. Copy your frontend URL

8. Go back to backend service → Environment Variables:
   - Update `FRONTEND_URL` with your actual frontend URL
   - Click "Save Changes" (this will trigger a redeploy)

### 3. Verify Deployment

1. Visit your frontend URL (e.g., `https://umamivers-frontend.onrender.com`)
2. Test search functionality
3. Try creating a composition

## Important Notes

### Free Tier Limitations
- **Services sleep after 15 minutes of inactivity**
  - First request after sleep takes ~30 seconds to wake up
  - Subsequent requests are fast
- **Database**: 90 days retention (auto-deletes if unused)
- **750 hours/month** of runtime per service
- No custom domains on free tier

### Troubleshooting

**Backend won't start:**
- Check logs: Dashboard → umamivers-backend → Logs
- Common issues:
  - Database connection: Verify `DATABASE_URL` is correct
  - Build errors: Check `build.sh` permissions and requirements.txt

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS settings in backend
- Try backend URL directly: `https://your-backend.onrender.com/api/ingredients/`

**Database extensions error:**
- PostgreSQL extensions should be created automatically
- If not, go to database shell and run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS pg_trgm;
  CREATE EXTENSION IF NOT EXISTS unaccent;
  ```

**Build fails with "fixtures not found":**
- Ensure `backend/fixtures_ingredients.json` is committed to git
- Check file size: `ls -lh backend/fixtures_ingredients.json`

### Monitoring

- **Logs**: Dashboard → Service → Logs tab
- **Metrics**: Dashboard → Service → Metrics tab
- **Health Check**: Backend has health check at `/api/ingredients/`

## Updating Your Deployment

Render automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
```

Both services will automatically rebuild and redeploy (~5-10 minutes).

## Cost Optimization

The free tier is sufficient for personal/demo use. If you need:
- **Faster response** (no sleep): Upgrade to Starter ($7/month per service)
- **Custom domain**: Available on Starter tier
- **More database storage**: Starter tier has 1GB included

## Support

- Render Documentation: https://render.com/docs
- Check service logs for errors
- Verify environment variables are set correctly
