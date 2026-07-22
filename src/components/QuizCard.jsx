import React from 'react';

const QuizCard = ({ question, options, selectedOption, onSelect, questionNumber, totalQuestions }) => {
  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="quiz-card">
      <div className="question-header">
        <span className="question-number">Question {questionNumber}/{totalQuestions}</span>
      </div>
      <h2 className="question-text">{question}</h2>
      <div className="options-container">
        {options.map((option, index) => (
          <button
            key={index}
            className={`option-btn ${selectedOption === option ? 'selected' : ''}`}
            onClick={() => onSelect(option)}
          >
            <span className="option-label">{optionLabels[index]}</span>
            <span className="option-text">{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizCard;