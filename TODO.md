# Deployment TODO

## ✅ Step 1: Commit & Push changes to GitHub
- [x] Stage all changes
- [x] Commit with message "Deployment preparation - updated components"
- [x] Push to GitHub

## ✅ Step 2: Deploy Frontend to Vercel
- [x] Fixed vercel.json (removed services, standard Vite config)
- [x] Deployed successfully via Vercel CLI
- [x] **Live at:** https://safenet-app-one.vercel.app ✅ (HTTP 200)

## ☐ Step 3: Deploy Backend to Render
- [ ] Go to https://dashboard.render.com
- [ ] Click **"New +" → "Blueprint"**
- [ ] Connect GitHub repo `kamalil2025aids-svg/DATATHON-26-SAFENET`
- [ ] Render auto-detects `backend/render.yaml` → creates Web Service + PostgreSQL
- [ ] After deploy, update `VITE_API_URL` in Vercel env with actual Render URL

## ☐ Step 4: Post-Deployment
- [ ] Update CORS_ORIGINS in Render env to include `https://safenet-app-one.vercel.app`
- [ ] Test login flow end-to-end

