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

  // Check authentication status on load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
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
        credentials: 'include'
      });
      setUser(null);
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
        headers: { 'Content-Type': 'application/json' },
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

  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'easy': return '#4ade80';
      case 'medium': return '#fbbf24';
      case 'hard': return '#f87171';
      default: return '#fbbf24';
    }
  };

  if (showResults) {
    return (
      <div className="app-container">
        <div className="results-card">
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
          <h1>QuizZite 🎯</h1>
          <p className="subtitle">Test your knowledge with AI-powered quizzes</p>
          
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
      <div className="quiz-header">
        <h2>QuizZite</h2>
        <div className="progress-indicator">
          Question {currentQuestion + 1} of {questions.length}
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
  );
};

export default QuizZite;