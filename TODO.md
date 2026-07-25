# Deployment TODO

## ✅ Step 1: Commit & Push changes to GitHub
- [x] Stage all changes
- [x] Commit with message "Deployment preparation - updated components"
- [x] Push to GitHub

## ✅ Step 2: Deploy Frontend to Vercel
- [x] Via Vercel CLI
- [x] **Live at:** https://safenet-gjvpxvjkx-kamalilaxman2007-4753s-projects.vercel.app

## ☐ Step 3: Deploy Backend to Render
- [ ] Use render.yaml blueprint for automated deployment on Render Dashboard
- [ ] Connect GitHub repo → Render will auto-detect render.yaml
- [ ] This creates both Web Service + PostgreSQL database

## ☐ Step 4: Configure Environment Variables
- [ ] Frontend: VITE_API_URL is already set to https://safenet-backend.onrender.com
- [ ] Backend: Update CORS_ORIGINS in Render dashboard to include frontend Vercel URL

## ☐ Step 5: Verify Deployment
- [ ] Frontend accessible at Vercel URL
- [ ] Backend health check at Render URL
- [ ] Login flow works end-to-end

