import {useEffect, useState} from 'react'
import "./index.css"

const API_URL = 'https://raw.githubusercontent.com/tabatkins/wordle-list/main/words'
const WORD_LENGTH = 5

export default function App() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(null))
  const [currentGuess, setCurrentGuess] = useState('');
  const [isGameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handleType = (event) => {
      if (isGameOver) {
        return;
      }

      if (event.key === 'Enter') {
        if (currentGuess.length !== 5) {
          return;
        }

        //once you've guessed all five letters in your row then go to the last guess
        //in the array that is null as that is the current one and replae with your guess
        //then final will be marked as true for that row and colors will reveal
        //then set back to ''
        const newGuesses = [...guesses];
        newGuesses[guesses.findIndex(val => val == null)] = currentGuess;
        setGuesses(newGuesses);
        setCurrentGuess('');
        
        const isCorrect = solution === currentGuess;
        if(isCorrect) {
          setGameOver(true);
        }
      }
      
      if(event.key === 'Backspace') {
        setCurrentGuess(currentGuess.slice(0,-1));
        return;
      }

      if(currentGuess.length >=5 ) {
        return;
      }

      setCurrentGuess(oldGuess => oldGuess + event.key);
    }

    window.addEventListener('keydown', handleType)
    //on unmount remove the event listener
    return () => window.removeEventListener('keydown', handleType);
    //add to dependency array so we don't have an old version of curr guess
  }, [currentGuess, isGameOver, solution, guesses])

  //useEffect so it happens once at start up of app
  //dependency array notifies to only retrigger when something in dependency 
  //array changes
  useEffect(() => {
    //this defines the fetchword async func
    async function fetchWord() {
      const response = await fetch(API_URL);
      const responseString = await response.text();
      const allWords = responseString.split(/\r?\n/);
      const randomWord = allWords[Math.floor(Math.random()*allWords.length)]
      setSolution(randomWord.toLowerCase());
      console.log(randomWord);
    }
    fetchWord();
  }, []);
  return (
    <div className="board">
      {
        //loop through all guesses and have each guess as input to a new line component
        guesses.map((guess,i) => {
          //if the current index is the curr guess (null) then isCurrentGuess=true
          const isCurrentGuess = (i === guesses.findIndex(val => val == null));
          return (
            //in case the guess is null we pass the empty string
            <Line 
              guess = {(isCurrentGuess ? currentGuess : guess) ?? ''}
              isFinal={!isCurrentGuess && guess != null}
              solution={solution}
            />
          );
        })
      }
    </div>
  );
}

//add a tile for each guess
//destructure as passed in as object so you can go straight to the field
function Line ({ guess, isFinal, solution }) {
  const tiles = []
  //for loop instead of map in case it is null
  for(let i=0;i<WORD_LENGTH;i++) {
    const char = guess[i];
    let className = 'tile';

    //apply an additional class to tile depending on if letter is correct
    if (isFinal) {
      if (char === solution[i]) {
        className += ' correct';
      } else if (solution.includes(char)) {
        className += ' close';
      } else {
        className += ' incorrect';
      }
    }
    //add key as identifier for array
    tiles.push(
      <div key={i} className={className}>
        {char}
      </div>
    );
  }
  return <div className="line">{tiles}</div>
}

