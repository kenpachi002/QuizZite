# Authentication Setup (Google OAuth & WorkOS SSO)

## Option 1: Google OAuth

### Packages to install:
```bash
npm install passport passport-google-oauth20 express-session
```

### Environment Variables needed:
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
SESSION_SECRET=your_session_secret
```

### Implementation approach:
1. Add Google OAuth routes to backend.js
2. Create AuthContext in frontend.jsx
3. Add login/logout buttons to the UI
4. Protect quiz generation behind authentication

---

## Option 2: WorkOS SSO

### Packages to install:
```bash
npm install @workos/node
```

### Environment Variables needed:
```
WORKOS_API_KEY=your_workos_api_key
WORKOS_CLIENT_ID=your_workos_client_id
WORKOS_REDIRECT_URI=https://yourapp.com/callback
```

---

## Current Session Management
For Render, use cookie-session or JWT for stateless sessions.