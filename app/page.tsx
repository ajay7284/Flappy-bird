"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./globals.css";
import "../components/Home.css";
import { motion } from "framer-motion";

// Game Canvas Component
const GameCanvas: React.FC<{
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const scoreRef = useRef(0);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const collisionSoundRef = useRef<HTMLAudioElement | null>(null);

  const updateScore = useCallback(
    (newScore: number) => {
      scoreRef.current = newScore;
      onScoreUpdate(newScore);
    },
    [onScoreUpdate]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    scoreSoundRef.current = new Audio("/audio/score.mp3");
    collisionSoundRef.current = new Audio("/audio/collision.mp3");

    scoreSoundRef.current.load();
    collisionSoundRef.current.load();

    const bird = {
      x: 50,
      y: canvas.height / 2,
      radius: 20,
      velocity: 0,
    };

    let pipes: { x: number; topHeight: number }[] = [];
    let animationFrameId: number;

    const gravity = 0.5;
    const jump = -5;
    const pipeWidth = 50;
    const pipeGap = 150;
    const pipeSpeed = 2;

    const drawBird = () => {
      ctx.fillStyle = "yellow";
      ctx.beginPath();
      ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawPipes = () => {
      ctx.fillStyle = "#790238";
      ctx.shadowColor = "#ffcc00";
      ctx.shadowBlur = 20;

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
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);
    };

    const updateGame = () => {
      if (!isGameActive) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      bird.velocity += gravity;
      bird.y += bird.velocity;

      pipes.forEach((pipe) => {
        pipe.x -= pipeSpeed;
      });

      pipes = pipes.filter((pipe) => pipe.x > -pipeWidth);

      if (
        pipes.length === 0 ||
        pipes[pipes.length - 1].x < canvas.width - 300
      ) {
        pipes.push({
          x: canvas.width,
          topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
        });
      }

      const birdBox = {
        left: bird.x - bird.radius,
        right: bird.x + bird.radius,
        top: bird.y - bird.radius,
        bottom: bird.y + bird.radius,
      };

      for (const pipe of pipes) {
        const topPipeBox = {
          left: pipe.x,
          right: pipe.x + pipeWidth,
          top: 0,
          bottom: pipe.topHeight,
        };

        const bottomPipeBox = {
          left: pipe.x,
          right: pipe.x + pipeWidth,
          top: pipe.topHeight + pipeGap,
          bottom: canvas.height,
        };

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
          setIsGameActive(false);
          if (collisionSoundRef.current) {
            collisionSoundRef.current.play();
          }
          setTimeout(() => {
            onGameOver(scoreRef.current);
          }, 1500); // 1 second delay (adjust as necessary)
          return;
        }
      }

      if (
        pipes[0] &&
        bird.x > pipes[0].x + pipeWidth &&
        pipes[0].x > bird.x - pipeSpeed
      ) {
        updateScore(scoreRef.current + 1);
        if (scoreSoundRef.current) {
          scoreSoundRef.current.currentTime = 0;
          scoreSoundRef.current
            .play()
            .catch((error) =>
              console.error("Error playing score sound:", error)
            );
        }
      }

      drawBird();
      drawPipes();
      drawScore();

      animationFrameId = requestAnimationFrame(updateGame);
    };

    const handleJump = () => {
      if (isGameActive) {
        bird.velocity = jump;
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && isGameActive) {
        handleJump();
      }
    };

    const handleTouchStart = () => {
      if (isGameActive) {
        handleJump();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("touchstart", handleTouchStart);

    updateGame();

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("touchstart", handleTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onGameOver, updateScore, isGameActive]);

  return (
    <canvas ref={canvasRef} width={800} height={400} className="game-canvas" />
  );
};

// Main Game Component
export default function FlappyBirdGame() {
  const [gameState, setGameState] = useState("menu");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(3);

  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameOverRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    menuAudioRef.current = new Audio("/audio/home.m4a");
    gameAudioRef.current = new Audio("/audio/game.m4a");
    gameOverRef.current = new Audio("/audio/game.m4a");
    if (menuAudioRef.current) menuAudioRef.current.loop = true;
    if (gameAudioRef.current) gameAudioRef.current.loop = true;
    if (gameOverRef.current) gameOverRef.current.loop = true;
  }, []);

  useEffect(() => {
    if (gameState === "menu") {
      if (menuAudioRef.current) {
        menuAudioRef.current
          .play()
          .catch((error) => console.error("Error playing menu audio:", error));
      }
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
      }
    } else if (gameState === "playing") {
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
      }
      if (gameAudioRef.current) {
        gameAudioRef.current
          .play()
          .catch((error) => console.error("Error playing game audio:", error));
      }
    } else if (gameState === "gameOver") {
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
      }
      if (gameOverRef.current) {
        gameOverRef.current
          .play()
          .catch((error) => console.error("Error playing game audio:", error));
      }
    } else {
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
      }
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
      }
    }

    return () => {
      if (menuAudioRef.current) menuAudioRef.current.pause();
      if (gameAudioRef.current) gameAudioRef.current.pause();
    };
  }, [gameState]);

  const startGame = () => {
    setGameState("countdown");
    setCountdown(4);
    setScore(0);
  };

  const endGame = (finalScore: number) => {
    setGameState("gameOver");
    setScore(finalScore);

    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  };

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

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

  return (
    <div className="home">
      <div className="main">
        {gameState === "countdown" ? (
          <div className="countdown-container">
            <h2 className="countdown">
              {countdown > 1 ? countdown - 1 : "Go!"}
            </h2>
          </div>
        ) : (
          <>
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
                      onClick={startGame}
                    >
                      1vs1
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
          </>
        )}
      </div>
    </div>
  );
}