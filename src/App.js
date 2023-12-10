import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const POINTS_OPTIONS = {
  easy: [100, 200, 300],
  medium: [300, 500, 700],
  hard: [500, 800, 1000],
};

function App() {
  const [question, setQuestion] = useState(null);
  const [selectedPoints, setSelectedPoints] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('easy'); // Default category
  const [answerOptions, setAnswerOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const fetchRandomQuestion = async () => {
    try {
      const response = await axios.get('https://jservice.io/api/random');
      const questionData = response.data[0];
      setQuestion(questionData);
      // Reset selected points for the next question
      setSelectedPoints(null);
      // Reset answer options
      const options = await generateRandomAnswers(questionData.answer);
      setAnswerOptions(options);
      // Set correct answer for later comparison
      setCorrectAnswer(questionData.answer);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const generateRandomAnswers = async (correctAnswer) => {
    // Generate three random wrong answers
    const wrongAnswersPromises = Array.from({ length: 3 }, generateRandomWrongAnswer);
    // Wait for all promises to resolve
    const wrongAnswers = await Promise.all(wrongAnswersPromises);
    // Include the correct answer randomly among wrong answers
    const options = [...wrongAnswers, correctAnswer];
    // Shuffle the options to randomize their order
    options.sort(() => Math.random() - 0.5);
    return options;
  };

  const generateRandomWrongAnswer = async () => {
    try {
      const response = await axios.get('https://random-word-api.herokuapp.com/word');
      const randomWord = response.data[0];
      return randomWord;
    } catch (error) {
      console.error('Error fetching random word:', error);
      // Return a placeholder string if there is an error
      return 'Placeholder';
    }
  };

  const handlePointSelect = (points) => {
    setSelectedPoints(points);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleAnswerSelect = (selectedAnswer) => {
    // Check if the selected answer is correct
    const isCorrect = selectedAnswer === correctAnswer;
    // Update the score if the answer is correct
    if (isCorrect) {
      setScore((prevScore) => prevScore + selectedPoints);
    }
    // Move to the next question
    fetchRandomQuestion();
  };

  useEffect(() => {
    fetchRandomQuestion();
  }, []); // Run once on component mount

  return (
    <div className="App">
      <h1>Jeopardy Game</h1>
      <p>Score: {score}</p>
      {question && (
        <div>
          {/* Point selection buttons */}
          <div>
            {POINTS_OPTIONS[selectedCategory].map((points) => (
              <button
                key={points}
                onClick={() => handlePointSelect(points)}
                disabled={selectedPoints !== null}
              >
                {points}
              </button>
            ))}
          </div>
          {/* Display answer options after points are selected */}
          {selectedPoints !== null && (
          <div>
          <h2>Category: {question.category.title}</h2>
          <p>Question: {question.question}</p>
          <p>Value: {selectedPoints}</p>
          {/* Answer options */}
          {answerOptions.map((option, index) => (
              <button key={index} onClick={() => handleAnswerSelect(option)}>
          {option}
          </button>
          ))}
    </div>
  )}

          {/* Category selection */}
          <div>
            <label>Category:</label>
            <select onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
