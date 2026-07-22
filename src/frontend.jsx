import React, { useState, useEffect } from 'react';
import QuizCard from './components/QuizCard.jsx';
import './frontend.css';

const QuizZite = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Get auth headers for API calls
  const getAuthHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Check authentication status on load
  useEffect(() => {
    // First check if token is in URL (after OAuth redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    
    if (urlToken) {
      // Store token in localStorage and clean URL
      localStorage.setItem('token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const login = () => {
    window.location.href = '/api/auth/google';
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeaders()
      });
      localStorage.removeItem('token');
      setUser(null);
      setQuizStarted(false);
      setQuestions([]);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const topics = [
    'Science', 'Mathematics', 'History', 'Geography', 
    'Sports', 'Technology', 'Entertainment', 'Literature',
    'General Knowledge', 'Programming'
  ];

  const generateQuiz = async () => {
    if (!selectedTopic) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ topic: selectedTopic, difficulty, count: 5 })
      });
      
      const data = await response.json();
      if (data.questions) {
        setQuestions(data.questions);
        setCurrentQuestion(0);
        setSelectedOptions({});
        setScore(0);
        setShowResults(false);
        setQuizStarted(true);
      } else {
        alert('Failed to generate quiz: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Error generating quiz: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOptions({ ...selectedOptions, [currentQuestion]: option });
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, index) => {
      if (selectedOptions[index] === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedOptions({});
    setScore(0);
    setShowResults(false);
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!user) {
    return (
      <div className="app-container">
        <div className="login-card">
          <div className="login-logo">🎯</div>
          <h1 className="login-title">QuizZite</h1>
          <p className="login-subtitle">Test your knowledge with interactive quizzes</p>
          <div className="auth-buttons">
            <button onClick={login} className="google-login-btn signup-btn">
              Sign Up with Google
            </button>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <button onClick={login} className="google-login-btn login-option-btn">
              Login with Google
            </button>
          </div>
          <p className="login-note">Sign in with your Google account to start quizzing!</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="app-container">
        <div className="results-card">
          <div className="logout-bar">
            <span className="user-email">👤 {user.email}</span>
            <button onClick={logout} className="auth-btn logout-btn">Logout</button>
          </div>
          <h2>Quiz Completed! 🎉</h2>
          <div className="score-display">
            <span className="score-text">Your Score: {score}/{questions.length || 0}</span>
            <div className="score-bar">
              <div 
                className="score-fill" 
                style={{ width: `${questions.length ? (score / questions.length) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          <button onClick={resetQuiz} className="restart-btn">Start New Quiz</button>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="app-container">
        <div className="setup-card">
          <div className="logout-bar">
            <span className="user-email">👤 {user.email}</span>
            <button onClick={logout} className="auth-btn logout-btn">Logout</button>
          </div>
          <h1>QuizZite 🎯</h1>
          <p className="subtitle">Test your knowledge with interactive quizzes</p>
          
          <div className="topic-section">
            <h3>Select Topic</h3>
            <div className="topics-grid">
              {topics.map(topic => (
                <button
                  key={topic}
                  className={`topic-btn ${selectedTopic === topic ? 'active' : ''}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          <div className="difficulty-section">
            <h3>Select Difficulty</h3>
            <div className="difficulty-bar">
              <button 
                className={`difficulty-btn easy ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => setDifficulty('easy')}
              >
                Easy 🌱
              </button>
              <button 
                className={`difficulty-btn medium ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => setDifficulty('medium')}
              >
                Medium ⚡
              </button>
              <button 
                className={`difficulty-btn hard ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => setDifficulty('hard')}
              >
                Hard 🔥
              </button>
            </div>
          </div>

          <button 
            onClick={generateQuiz} 
            disabled={!selectedTopic || loading}
            className="start-btn"
          >
            {loading ? 'Generating...' : 'Start Quiz'}
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="app-container">
      <div className="quiz-card-wrapper">
        <div className="quiz-header">
          <h2>QuizZite</h2>
          <div className="header-right">
            <span className="user-email">👤 {user.email}</span>
            <button onClick={logout} className="auth-btn logout-btn">Logout</button>
            <span className="progress-indicator">Question {currentQuestion + 1} of {questions.length}</span>
          </div>
        </div>

        <QuizCard
          question={currentQ.question}
          options={currentQ.options}
          selectedOption={selectedOptions[currentQuestion] || ''}
          onSelect={handleOptionSelect}
          questionNumber={currentQuestion + 1}
          totalQuestions={questions.length}
        />

        <div className="navigation-buttons">
          <button 
            onClick={prevQuestion} 
            disabled={currentQuestion === 0}
            className="nav-btn prev"
          >
            Previous
          </button>
          
          {currentQuestion === questions.length - 1 ? (
            <button onClick={calculateScore} className="nav-btn submit">
              Submit Quiz
            </button>
          ) : (
            <button onClick={nextQuestion} className="nav-btn next">
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizZite;