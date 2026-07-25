# Deployment TODO (Updated)

## ✅ Step 1: Commit & Push changes to GitHub
- [x] Done

## ✅ Step 2: Deploy Frontend to Vercel
- [x] Live at **https://safenet-app-one.vercel.app**

## ✅ Step 3: Fix Backend for Render Deployment (FIXES APPLIED)
- [x] Fix 1: Removed heavy ML dependencies from requirements.txt (PyTorch, YOLO, OpenCV, etc.)
- [x] Fix 2: Made ai_vision_service.py graceful with mock fallback when deps missing
- [x] Fix 3: Made ai_nlp_service.py graceful with rule-based fallback when deps missing
- [x] Fix 4: Fixed ai_orchestrator.py category field mapping bug (`nlp_result["department"]` → `detected_category`)
- [x] Fix 5: Fixed notifications.py and tracking.py to use `get_redis_client()` instead of direct `redis_client` import
- [x] Fix 6: Added REDIS_URL env var to render.yaml for graceful Redis handling
- [ ] Commit and push all fixes
- [ ] Deploy backend to Render

## ☐ Step 4: Connect Frontend ↔ Backend
- [ ] Get Render backend URL
- [ ] Set `VITE_API_URL` in Vercel environment variables
- [ ] Redeploy frontend on Vercel

## ☐ Step 5: Final Verification
- [ ] Login flow works end-to-end

