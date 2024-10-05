'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import './Home.css';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const scoreRef = useRef(0);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const collisionSoundRef = useRef<HTMLAudioElement | null>(null);

  const updateScore = useCallback(
    (newScore: number) => {
      console.log("Score updated:", newScore);
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

    let pipes: { x: number; topHeight: number; passed: boolean }[] = [];
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

      // Update pipes
      pipes.forEach((pipe) => {
        pipe.x -= pipeSpeed;

        // Check if the bird has passed the pipe
        if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
          pipe.passed = true;
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
      });

      // Remove pipes that have moved off-screen
      pipes = pipes.filter((pipe) => pipe.x > -pipeWidth);

      // Add new pipes
      if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 300) {
        pipes.push({
          x: canvas.width,
          topHeight: Math.random() * (canvas.height - pipeGap - 100) + 50,
          passed: false,
        });
      }

      // Collision detection
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
          }, 1500);
          return;
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
  }, []);

  return (
    <canvas ref={canvasRef} width={800} height={400} className="game-canvas" />
  );
};

export default GameCanvas;