# Deployment TODO ✅

## ✅ Step 1: Commit & Push changes to GitHub
- [x] All changes pushed to `main` branch

## ✅ Step 2: Deploy Frontend to Vercel
- [x] **Live at:** https://safenet-app-one.vercel.app (HTTP 200)

## ✅ Step 3: Fixed render.yaml location
- [x] Created `render.yaml` at **root** of repo (Render requires this)
- [x] Uses `workingDirectory: backend` to run from `backend/` folder
- [x] Removed old `backend/render.yaml` to avoid confusion
- [x] Pushed to GitHub — ready for Render Blueprint import

## ☐ Step 4: Deploy Backend via Render Dashboard
- [ ] Go to https://dashboard.render.com
- [ ] Click **"New +" → "Blueprint"**
- [ ] Select repo `kamalil2025aids-svg/DATATHON-26-SAFENET`
- [ ] Blueprint path: `render.yaml` (default, now at root!)
- [ ] Click **"Apply"** — creates Web Service + PostgreSQL

## ☐ Step 5: Post-Deployment
- [ ] Update `VITE_API_URL` in Vercel with actual Render URL
- [ ] Test login flow

