import GameCanvas from '@/components/GameCanvas';
import React, { useCallback, useEffect, useState } from 'react'
import { useAccount } from 'wagmi';
interface GameMainProps {
  gameState: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
}

const GameMain: React.FC<GameMainProps> = ({ gameState, setGameState }) => {
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
 

  const startGame = () => {
    setGameState("countdown");
    setCountdown(4);
    setScore(0);
  };

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const endGame = (finalScore: number) => {
    setGameState("join-lobby");
    setScore(finalScore);
  
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
