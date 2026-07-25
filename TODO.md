# Deployment TODO

## ✅ Step 1: Commit & Push changes to GitHub
- [x] Stage all changes
- [x] Commit with message "Deployment preparation - updated components"
- [x] Push to GitHub

## ✅ Step 2: Deploy Frontend to Vercel
- [x] Connected GitHub repo to Vercel
- [x] Frontend live at **https://safenet-app-one.vercel.app**

## Step 3: Deploy Backend to Render (IN PROGRESS)
- [x] Created `render.yaml` at repo root with correct config
- [x] Added `sourceDir: backend` to point to backend/ subdirectory
- [x] Added `plan: free` and `healthCheckPath: /`
- [ ] User needs to try Blueprint deployment again in Render Dashboard

## Step 4: Configure Environment Variables
- [ ] Verify CORS_ORIGINS includes frontend URL
- [ ] Verify VITE_API_URL in Vercel points to Render backend

## Step 5: Verify Deployment
- [ ] Frontend accessible at Vercel URL
- [ ] Backend health check at Render URL

