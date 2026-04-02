# 🚀 Deployment Guide - FinTrack Pro

This guide explains how to prepare and deploy the FinTrack Pro application to production.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [x] Fixed hardcoded API URLs in Login.jsx
- [ ] Set strong production JWT_SECRET
- [ ] Configured MongoDB Atlas or production database
- [ ] Set up Google Gemini API key
- [ ] Configured SMTP for email notifications (optional)
- [ ] Built frontend production bundle
- [ ] Set environment variables on deployment platform

## 🔧 Backend Deployment (Node.js + Express)

### 1. Environment Variables
Copy `.env.example` to production and fill with actual values:

```bash
PORT=3001
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/finance
JWT_SECRET=<generate_strong_256_bit_secret>
FRONTEND_URL=https://your-frontend-domain.com
GEMINI_API_KEY=<your_google_api_key>
NODE_ENV=production
```

### 2. Deployment Options

#### Option A: Render.com (Recommended for free tier)
1. Push code to GitHub
2. Create new Web Service on Render.com
3. Connect GitHub repository
4. Set environment variables in Render dashboard
5. Deploy

#### Option B: Vercel/Railway/Heroku
Similar process - connect GitHub and set environment variables.

### 3. Database Setup
- Use MongoDB Atlas (free tier available)
- Create a cluster and get connection string
- Whitelist your deployment IP in MongoDB dashboard

## 🎨 Frontend Deployment (React + Vite)

### 1. Build for Production
```bash
cd frontend/vite-project
npm run build
```
This creates an optimized `dist/` folder.

### 2. Environment Variables
Set `VITE_API_BASE_URL` to your backend API URL:

#### On Vercel:
- Go to Project Settings → Environment Variables
- Add: `VITE_API_BASE_URL=https://your-backend-api.com/api`

#### On Netlify:
- Go to Site Settings → Build & Deploy → Environment
- Add the same variable

### 3. Deployment Options

#### Option A: Vercel (Recommended)
```bash
npm install -g vercel
cd frontend/vite-project
vercel --prod
```

#### Option B: Netlify
1. Push to GitHub
2. Connect repository on Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong (256+ bits) - use: `openssl rand -base64 32`
- [ ] CORS whitelist updated with production domain
- [ ] MONGO_URI uses password-protected database
- [ ] Sensitive keys never committed to GitHub
- [ ] HTTPS enabled on all domains
- [ ] API rate limiting configured (optional)

## 🧪 Testing Before Deployment

1. **Local Production Test**
   ```bash
   # Backend
   npm run start  # (not npm run dev)
   
   # Frontend
   npm run build
   npm run preview
   ```

2. **Test Key Features**
   - Login/Register
   - Add transactions
   - View dashboard
   - AI Coach functionality
   - Admin features

## 📝 Additional Notes

- The app already has CORS configured for production domains
- Frontend `.env` file should have `VITE_API_BASE_URL` set
- Backend `.env` is configured on your deployment platform (not committed)
- Seed data can be populated using `backend/seed.js`

## ⚠️ Current Issues Fixed

✅ Hardcoded API URLs in Login.jsx → Now uses environment variable
✅ Missing .env.example files → Created for both frontend & backend

## 🆘 Troubleshooting

**CORS errors:** Check that FRONTEND_URL in backend matches your deployed frontend domain
**API not responding:** Verify VITE_API_BASE_URL points to correct backend URL
**MongoDB connection failed:** Check MONGO_URI format and whitelist deployment IP

---

For questions, refer to individual README files in `/backend` and `/frontend/vite-project/`
