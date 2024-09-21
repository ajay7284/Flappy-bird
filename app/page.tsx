"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./globals.css";
import "../components/Home.css";
import { motion } from "framer-motion";



// Game Canvas Component
const GameCanvas: React.FC<{ onGameOver: (score: number) => void; onScoreUpdate: (score: number) => void }> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isGameActive, setIsGameActive] = useState(true)
  const scoreRef = useRef(0)

  const updateScore = useCallback((newScore: number) => {
    scoreRef.current = newScore;
    onScoreUpdate(newScore);
  }, [onScoreUpdate]);

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const bird = {
      x: 50,
      y: canvas.height / 2,
      radius: 20,
      velocity: 0,
    }

    let pipes: { x: number; topHeight: number }[] = []
    let animationFrameId: number

    const gravity = 0.5
    const jump = -5
    const pipeWidth = 50
    const pipeGap = 150
    const pipeSpeed = 2

    const drawBird = () => {
      ctx.fillStyle = 'yellow'
      ctx.beginPath()
      ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2)
      ctx.fill()
    }

    const drawPipes = () => {
      ctx.fillStyle = "#790238";
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      pipes.forEach((pipe) => {
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);
        ctx.fillRect(
          pipe.x,
          pipe.topHeight + pipeGap,
          pipeWidth,
          canvas.height - pipe.topHeight - pipeGap
        );
      });

      ctx.shadowColor = "transparent";
    };

    const drawScore = () => {
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);
    };

    const updateGame = () => {
      if (!isGameActive) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      bird.velocity += gravity
      bird.y += bird.velocity

      pipes.forEach((pipe) => {
        pipe.x -= pipeSpeed
      })

      pipes = pipes.filter((pipe) => pipe.x > -pipeWidth)

      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        pipes.push({
          x: canvas.width,
          topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
        })
      }

      const birdBox = {
        left: bird.x - bird.radius,
        right: bird.x + bird.radius,
        top: bird.y - bird.radius,
        bottom: bird.y + bird.radius,
      }

      for (const pipe of pipes) {
        const topPipeBox = {
          left: pipe.x,
          right: pipe.x + pipeWidth,
          top: 0,
          bottom: pipe.topHeight,
        }

        const bottomPipeBox = {
          left: pipe.x,
          right: pipe.x + pipeWidth,
          top: pipe.topHeight + pipeGap,
          bottom: canvas.height,
        }

        if (
          (birdBox.right > topPipeBox.left &&
            birdBox.left < topPipeBox.right &&
            birdBox.top < topPipeBox.bottom) ||
          (birdBox.right > bottomPipeBox.left &&
            birdBox.left < bottomPipeBox.right &&
            birdBox.bottom > bottomPipeBox.top) ||
          bird.y > canvas.height ||
          bird.y < 0
        ) {
          setIsGameActive(false)
          onGameOver(scoreRef.current)
          return
        }
      }

      if (pipes[0] && bird.x > pipes[0].x + pipeWidth && pipes[0].x > bird.x - pipeSpeed) {
        updateScore(scoreRef.current + 1);
      }

      drawBird()
      drawPipes()
      drawScore()

      animationFrameId = requestAnimationFrame(updateGame)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isGameActive) {
        bird.velocity = jump
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    updateGame()

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      cancelAnimationFrame(animationFrameId)
    }
  }, [onGameOver, updateScore, isGameActive])

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={400}
      className="game-canvas"
    />
  )
}

// ... (Leaderboard and TronWallet components remain unchanged)
// const Leaderboard: React.FC = () => {
//   const [scores, setScores] = useState([
//     { name: "Player 1", score: 100 },
//     { name: "Player 2", score: 80 },
//     { name: "Player 3", score: 60 },
//   ]);

//   return (
//     <div className="w-64 bg-white p-4 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-2">Leaderboard</h2>
//       <ul>
//         {scores.map((score, index) => (
//           <li key={index} className="mb-1">
//             {score.name}: {score.score}
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// TronWallet Component
// const TronWallet: React.FC = () => {
//   const [address, setAddress] = useState("");
//   const [balance, setBalance] = useState(0);

//   useEffect(() => {
//     const connectWallet = async () => {
//       if (
//         typeof window !== "undefined" &&
//         window.tronWeb &&
//         window.tronWeb.defaultAddress.base58
//       ) {
//         setAddress(window.tronWeb.defaultAddress.base58);
//         const balanceResult = await window.tronWeb.trx.getBalance(
//           window.tronWeb.defaultAddress.base58
//         );
//         // setBalance(window.tronWeb.fromSun(balanceResult));
//       }
//     };

//     connectWallet();
//   }, []);

//   return (
//     <div className="text-center bg-white p-4 rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-2">Tron Wallet</h2>
//       {address ? (
//         <>
//           <p className="mb-2">
//             Address: {address.slice(0, 6)}...{address.slice(-4)}
//           </p>
//           <p>Balance: {balance} TRX</p>
//         </>
//       ) : (
//         <button
//           onClick={() =>
//             window.tronWeb?.request({ method: "tron_requestAccounts" })
//           }
//           className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
//         >
//           Connect Wallet
//         </button>
//       )}
//     </div>
//   );
// };
// Main Game Component
export default function FlappyBirdGame() {
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
  };

  const endGame = (finalScore: number) => {
    setGameState("gameOver");
    setScore(finalScore);
    if (finalScore > highScore) {
      setHighScore(finalScore);
      // TODO: Update high score on Tron blockchain
    }
  };

  const updateScore = (newScore: number) => {
    setScore(newScore);
  };

  return (
    <>
      <div className="home">
        <div className="main">
          <h1 className="game-title">Flappy Bird Multiplayer</h1>
          {gameState === "menu" && (
            <div className="text-center">
              <div className="button-container">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.button
                    className="game-button start-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startGame}
                  >
                    Start Game
                  </motion.button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <motion.button
                    className="game-button start-button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    1 vs 1
                  </motion.button>
                </motion.div>
              </div>
            </div>
          )}
          {gameState === "playing" && (
            <>
              <GameCanvas onGameOver={endGame} onScoreUpdate={updateScore} />
              <div className="score-display">Score: {score}</div>
            </>
          )}
          {gameState === "gameOver" && (
            <div className="game-over-container">
              <h2 className="game-over-title">Game Over</h2>
              <p className="game-score">Score: {score}</p>
              <p className="game-high-score">High Score: {highScore}</p>
              <button onClick={startGame} className="game-over-button">
                Play Again
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}