'use client';
import React, { useState, useEffect, useRef, useCallback } from "react";
import './Home.css';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ onGameOver, onScoreUpdate }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'gameOver'>('waiting');
  const scoreRef = useRef(0);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const collisionSoundRef = useRef<HTMLAudioElement | null>(null);
  const birdImageRef = useRef<HTMLImageElement | null>(null);  

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

    canvas.width = 800;
    canvas.height = 400;

    scoreSoundRef.current = new Audio("/audio/score.mp3");
    collisionSoundRef.current = new Audio("/audio/collision.mp3");

    scoreSoundRef.current.load();
    collisionSoundRef.current.load();

    const birdImage = new Image();
    birdImage.src = "/image/pngwing.com.png";
    birdImageRef.current = birdImage;

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
      if (birdImageRef.current) {
        ctx.drawImage(birdImageRef.current, bird.x - bird.radius, bird.y - bird.radius, bird.radius * 2, bird.radius * 2);
      }
    };

    const drawPipes = () => {
      ctx.shadowColor = "transparent"

      pipes.forEach((pipe) => {
        // Main pipe color
        ctx.fillStyle = "#790238"

        // Draw top pipe
        drawPixelatedRect(ctx, pipe.x, 0, pipeWidth, pipe.topHeight)

        // Draw bottom pipe
        drawPixelatedRect(ctx, pipe.x, pipe.topHeight + pipeGap, pipeWidth, canvas.height - pipe.topHeight - pipeGap)

        // Highlight color
        ctx.fillStyle = "#9C0849"

        // Draw highlights
        drawPixelatedRect(ctx, pipe.x, 0, 4, pipe.topHeight)
        drawPixelatedRect(ctx, pipe.x, pipe.topHeight + pipeGap, 4, canvas.height - pipe.topHeight - pipeGap)

        // Shadow color
        ctx.fillStyle = "#5C0129"

        // Draw shadows
        drawPixelatedRect(ctx, pipe.x + pipeWidth - 4, 0, 4, pipe.topHeight)
        drawPixelatedRect(ctx, pipe.x + pipeWidth - 4, pipe.topHeight + pipeGap, 4, canvas.height - pipe.topHeight - pipeGap)

        // Draw pipe caps
        drawPipeCap(ctx, pipe.x, pipe.topHeight - 20, pipeWidth)
        drawPipeCap(ctx, pipe.x, pipe.topHeight + pipeGap, pipeWidth)
      })
    }

    const drawPixelatedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
      const pixelSize = 4
      for (let i = 0; i < width; i += pixelSize) {
        for (let j = 0; j < height; j += pixelSize) {
          ctx.fillRect(x + i, y + j, pixelSize, pixelSize)
        }
      }
    }

    const drawPipeCap = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
      const capHeight = 20
      ctx.fillStyle = "#790238"
      drawPixelatedRect(ctx, x - 4, y, width + 8, capHeight)
      
      ctx.fillStyle = "#9C0849"
      drawPixelatedRect(ctx, x - 4, y, 4, capHeight)
      
      ctx.fillStyle = "#5C0129"
      drawPixelatedRect(ctx, x + width, y, 4, capHeight)
    }

    const drawScore = () => {
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);
    };

    const drawStartMessage = () => {
      ctx.fillStyle = "white";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Press SPACE or TAP to start", canvas.width / 2, canvas.height / 2);
      ctx.textAlign = "left"; // Reset text alignment
    };

    const updateGame = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (gameState === 'waiting') {
        drawBird();
        drawStartMessage();
      } else if (gameState === 'playing') {
        bird.velocity += gravity;
        bird.y += bird.velocity;

        // Update pipes
        pipes.forEach((pipe) => {
          pipe.x -= pipeSpeed;

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

        pipes = pipes.filter((pipe) => pipe.x > -pipeWidth);

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
            setGameState('gameOver');
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
      }

      animationFrameId = requestAnimationFrame(updateGame);
    };

    const handleJump = () => {
      if (gameState === 'waiting') {
        setGameState('playing');
      }
      if (gameState === 'playing') {
        bird.velocity = jump;
      }
    };

    const handleInteraction = (e: Event) => {
      e.preventDefault();
      handleJump();
    };

    document.addEventListener("keydown", (e) => {
      if (e.code === "Space") {
        handleInteraction(e);
      }
    });
    canvas.addEventListener("touchstart", handleInteraction);
    canvas.addEventListener("mousedown", handleInteraction);

    updateGame();

    return () => {
      document.removeEventListener("keydown", handleInteraction);
      canvas.removeEventListener("touchstart", handleInteraction);
      canvas.removeEventListener("mousedown", handleInteraction);
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState]); // Added gameState to the dependency array

  return (
    <canvas ref={canvasRef} width={800} height={600} className="game-canvas" />
  );
};

export default GameCanvas;