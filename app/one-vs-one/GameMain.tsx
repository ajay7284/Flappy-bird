import GameCanvas from '@/components/GameCanvas';
import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi';

interface GameMainProps {
  gameState: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  setLobbyStatus: React.Dispatch<React.SetStateAction<string>>;
}

const GameMain: React.FC<GameMainProps> = ({ gameState, setGameState , setLobbyStatus }) => {
  const {address} = useAccount();
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (gameState === "countdown" && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (gameState === "countdown" && countdown === 0) {
      setGameState("playing");
    }
  }, [gameState, countdown]);
 

  // const startGame = () => {
  //   setGameState("countdown");
  //   setCountdown(4);
  //   setScore(0);
  // };

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const endGame = async (finalScore: number) => {
    setGameState("join-lobby");
    setScore(finalScore);
    try {
      const urlParams = new URLSearchParams(window.location.search);

// Retrieve the 'gameId' from the query parameters
      const gameId = urlParams.get('gameId');
      console.log(gameId)
      const response = await fetch('/api/submitScore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          gameId: gameId, 
          playerAddress: address,
          score: finalScore 
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit score');
      }
  
      console.log('Score submitted successfully');
    } catch (error) {
      console.error('Error submitting score:', error);
    }
    setLobbyStatus("end");

  
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  }

  return (
    <>
   {
    gameState ==='countdown' ?(
      <div className="countdown-container">
      <h2 className="countdown">{countdown > 1 ? countdown - 1 : "Go!"}</h2>
    </div>
    ) : (
      <>
      {
        gameState === 'playing'  && (
          <>
          <GameCanvas onGameOver={endGame} onScoreUpdate={updateScore} />
          <div className="score-display">Score: {score}</div>
          </>
        )
      }
      </>
    )
   }

    </>
    
  )
}

export default GameMain
