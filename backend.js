import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory session storage
const sessions = {};

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';
const JWT_SECRET = process.env.JWT_SECRET || 'quiz-secret-key';

// Generate JWT token (simple implementation)
const generateToken = (userId, email) => {
  const payload = { userId, email, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

// GROQ API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = process.env.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Generate quiz questions using GROQ AI
 */
app.post('/api/generate-quiz', async (req, res) => {
  const { topic, difficulty, count = 5 } = req.body;

  if (!topic || !difficulty) {
    return res.status(400).json({ error: 'Topic and difficulty are required' });
  }

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'GROQ API key not configured' });
  }

  const difficultyPrompts = {
    easy: 'simple, basic knowledge level questions with common knowledge',
    medium: 'intermediate level questions, moderately challenging',
    hard: 'advanced, expert level, highly challenging questions'
  };

  const prompt = `Generate ${count} quiz questions about "${topic}" at ${difficultyPrompts[difficulty]} difficulty. 
Format the response as a valid JSON array with this exact structure:
[
  {
    "question": "The question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option A"
  }
]
Only return the JSON array, no additional text or explanation.`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful quiz question generator. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from GROQ API');
    }

    // Parse the JSON response
    const questions = JSON.parse(content);
    res.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to generate quiz questions',
      details: error.message 
    });
  }
});

// Authentication middleware
const authenticate = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
  if (!token) return next();
  
  const decoded = verifyToken(token);
  if (decoded) {
    req.user = decoded;
  }
  next();
};

app.use(authenticate);

// Google OAuth routes
app.get('/api/auth/google', (req, res) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: 'Google OAuth not configured' });
  }
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=openid%20email%20profile`;
  
  res.redirect(authUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'Authorization code required' });
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_REDIRECT_URI
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    const { access_token } = tokenResponse.data;
    
    // Get user info
    const userResponse = await axios.get(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    
    const user = userResponse.data;
    
    // Generate our own token
    const ourToken = generateToken(user.id, user.email);
    
    // Set cookie and redirect
    res.cookie('token', ourToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Use FRONTEND_URL env variable or derive from GOOGLE_REDIRECT_URI
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' 
      ? GOOGLE_REDIRECT_URI.replace('/auth/google/callback', '')
      : 'http://localhost:5173');
    
    res.redirect(frontendUrl);
  } catch (error) {
    console.error('OAuth callback error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.get('/api/auth/me', (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;