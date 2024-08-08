import { useEffect, useState } from 'react';
import "./index.css";

const API_URL = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words';
const WORD_LENGTH = 5;

export default function App() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(null));
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setGameOver] = useState(false);

  function Keyboard({ onKeyPress }) {
    const keys = 'abcdefghijklmnopqrstuvwxyz'.split('');
    return (
      <div className="keyboard">
        {keys.map(key => (
          <button key={key} onClick={() => onKeyPress(key)}>
            {key}
          </button>
        ))}
        <button onClick={() => onKeyPress('Backspace')}>⌫</button>
        <button onClick={() => onKeyPress('Enter')}>Enter</button>
        <button onClick={handleRestart}>Restart</button>
      </div>
    );
  }

  async function fetchWord() {
    const response = await fetch(API_URL);
    const responseString = await response.text();
    const allWords = responseString.split(/\r?\n/);
    const randomWord = allWords[Math.floor(Math.random() * allWords.length)];
    setSolution(randomWord.toLowerCase());
  }

  const handleRestart = () => {
    setGuesses(Array(6).fill(null));
    setCurrentGuess('');
    setGameOver(false);
    fetchWord();
  };

  useEffect(() => {
    const handleType = (event) => {
      if (isGameOver) return;
      if (event.key === 'Enter') {
        handleGuessSubmission();
      } else if (event.key === 'Backspace') {
        setCurrentGuess(currentGuess.slice(0, -1));
      } else if (event.key.length === 1 && /^[a-zA-Z]$/.test(event.key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess(oldGuess => oldGuess + event.key.toLowerCase());
        }
      }
    };

    window.addEventListener('keydown', handleType);
    return () => window.removeEventListener('keydown', handleType);
  }, [currentGuess, isGameOver, solution, guesses]);

  useEffect(() => {
    fetchWord();
  }, []);

  const handleKeyPress = (key) => {
    if (isGameOver) return;

    if (key === 'Enter') {
      handleGuessSubmission();
    } else if (key === 'Backspace') {
      setCurrentGuess(currentGuess.slice(0, -1));
    } else if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess(oldGuess => oldGuess + key.toLowerCase());
      }
    }
  };

  const handleGuessSubmission = () => {
    if (currentGuess.length !== WORD_LENGTH) return;

    const newGuesses = [...guesses];
    newGuesses[guesses.findIndex(val => val == null)] = currentGuess;
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (solution === currentGuess) {
      setGameOver(true);
    } else if (newGuesses.filter(guess => guess != null).length === guesses.length) {
      setGameOver(true);
    }
  };

  return (
    <div className="board">
      <h1 className="header">Slightly Harder Wordle :)</h1>
      {guesses.map((guess, i) => {
        const isCurrentGuess = i === guesses.findIndex(val => val == null);
        return (
          <Line
            key={i}
            guess={(isCurrentGuess ? currentGuess : guess) ?? ''}
            isFinal={!isCurrentGuess && guess != null}
            solution={solution}
          />
        );
      })}
      <div className="directions">
        Directions: Enter guesses via computer keyboard and see how you did by pressing enter/return.
      </div>
      <Keyboard onKeyPress={handleKeyPress} />
      {isGameOver && <div className="solution">The solution was: {solution}</div>}
    </div>
  );
}

function Line({ guess, isFinal, solution }) {
  const tiles = [];

  for (let i = 0; i < WORD_LENGTH; i++) {
    const char = guess[i];
    let className = 'tile';

    if (isFinal) {
      if (char === solution[i]) {
        className += ' correct';
      } else if (solution.includes(char)) {
        className += ' close';
      } else {
        className += ' incorrect';
      }
    }

    tiles.push(
      <div key={i} className={className}>
        {char}
      </div>
    );
  }

  return <div className="line">{tiles}</div>;
}
