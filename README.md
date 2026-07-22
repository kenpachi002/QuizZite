# QuizZite

An interactive quiz platform using GROQ AI to generate dynamic quiz questions.

## Project Structure

```
QuizZite/
├── package.json          # Dependencies & scripts
├── backend.js            # Express API server with GROQ integration
├── vite.config.js        # Vite configuration
├── .env                  # Environment variables
├── index.html            # HTML entry point
└── src/
    ├── index.jsx         # React entry point
    ├── index.css         # Global styles
    ├── frontend.jsx      # Main QuizZite component
    ├── frontend.css      # Component styles
    └── components/
        └── QuizCard.jsx  # Reusable quiz card component
```

## Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```bash
copy .env.example .env
```
Then edit `.env` and add your GROQ API key:
```
GROQ_API_KEY=your_actual_groq_api_key_here
```

3. **Run development server:**
```bash
npm run dev
```
This will start both frontend (localhost:5173) and backend (localhost:5000).

4. **Build for production:**
```bash
npm run build
```

5. **Start production server:**
```bash
npm start
```

## Features

- 🎯 Topic selection (Science, Math, History, Geography, Sports, Technology, etc.)
- 🌱⚡🔥 Difficulty selection (Easy, Medium, Hard)
- 🤖 AI-powered question generation via GROQ API
- 📊 Score tracking and results display
- 🎨 Clean, modern UI with color-coded difficulty levels
- 🔐 Google OAuth authentication (optional)

---

## Deployment Guide: Render + Google OAuth

### Step 1: Create a Render Account
- Go to https://render.com and sign up (free tier available)

### Step 2: Prepare Your Repository
- Push this project to a GitHub/GitLab repository
- Make sure `.env` is in `.gitignore` (already done)

### Step 3: Create a Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub/GitLab repository
3. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `quizzite` (or your choice) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Plan** | Free |

### Step 4: Set Environment Variables on Render

Go to your service dashboard → **Environment** tab → add:

| Variable | Value | Notes |
|----------|-------|-------|
| `NODE_ENV` | `production` | Required |
| `GROQ_API_KEY` | `gsk_your_key_here` | Your GROQ API key |
| `GOOGLE_CLIENT_ID` | `your_client_id` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `your_client_secret` | From Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | `https://your-app.onrender.com/auth/google/callback` | Your Render URL + path |
| `FRONTEND_URL` | `https://your-app.onrender.com` | Your Render URL |
| `JWT_SECRET` | `your-random-secret-string` | Generate a random string |

> **Note:** After deploying, your app will be at `https://your-app-name.onrender.com`. Replace `your-app.onrender.com` with your actual Render URL.

### Step 5: Set Up Google OAuth Credentials

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client IDs"**
5. Set **Application type** → **"Web application"**
6. Add **Authorized redirect URIs**:
   - `https://your-app.onrender.com/auth/google/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret**

### Step 6: Add these to Render Environment Variables (see Step 4)

### Step 7: Deploy

1. Click **"Create Web Service"** on Render
2. Wait for the build and deploy to finish (first deploy takes 2-5 minutes)
3. Your app will be live at `https://your-app.onrender.com`

### Step 8: Verify

- Visit `https://your-app.onrender.com` — the quiz should work
- Click "Login with Google" — OAuth should redirect, authenticate, and bring you back
- Generate a quiz — GROQ API should return questions

---

## Local Development with Google OAuth (Testing)

For local development, add these to your `.env`:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

And in Google Cloud Console, also add this redirect URI:
- `http://localhost:5173/auth/google/callback`

## Troubleshooting

### GROQ API not working
- Verify your API key is valid at https://console.groq.com
- Check that the model `llama3-70b-8192` is available on your plan
- Check Render logs for error messages

### Google OAuth not working
- Verify redirect URIs match exactly (trailing slashes matter!)
- Check that `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly on Render
- Ensure your Google Cloud project has the OAuth consent screen configured

### Blank page after deployment
- Check Render build logs for errors
- Verify the build command completed successfully
- Check browser console for errors