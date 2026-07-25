# Deployment TODO

## ✅ Step 1: Commit & Push changes to GitHub
- [ ] Stage all changes
- [ ] Commit with message "Deployment preparation - updated components"
- [ ] Push to GitHub

## ☐ Step 2: Deploy Frontend to Vercel
- [ ] Option A: Via Vercel CLI (if installed)
- [ ] Option B: Via Vercel Dashboard (connect GitHub repo)

## ☐ Step 3: Deploy Backend to Render
- [ ] Use render.yaml blueprint for automated deployment
- [ ] Or manually set up Web Service + PostgreSQL

## ☐ Step 4: Configure Environment Variables
- [ ] Frontend: Set VITE_API_URL to Render backend URL
- [ ] Backend: Ensure CORS_ORIGINS includes Vercel frontend URL

## ☐ Step 5: Verify Deployment
- [ ] Frontend accessible at Vercel URL
- [ ] Backend health check at Render URL
- [ ] Login flow works end-to-end

