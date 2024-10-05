"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import "../app/globals.css";
import "./Home.css";
import { motion } from "framer-motion";
import Leaderboard from "./Leaderboard";
import GameCanvas from "./GameCanvas";

export default function FlappyBirdGame() {
    const [gameState, setGameState] = useState("menu");
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [countdown, setCountdown] = useState(3);
  
    const [showSoundPopup, setShowSoundPopup] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(false);
  
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
      if (!soundEnabled) {
        if (menuAudioRef.current) {
          menuAudioRef.current.pause();
          menuAudioRef.current.currentTime = 0; // Reset to start
        }
        if (gameAudioRef.current) {
          gameAudioRef.current.pause();
          gameAudioRef.current.currentTime = 0; // Reset to start
        }
        if (gameOverRef.current) {
          gameOverRef.current.pause();
          gameOverRef.current.currentTime = 0; // Reset to start
        }
        return;
      }
  
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
    }, [gameState, soundEnabled]);
  
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
  
    const handleSoundChoice = (choice: boolean) => {
      setSoundEnabled(choice);
      setShowSoundPopup(false);
      if (choice && menuAudioRef.current) {
        menuAudioRef.current
          .play()
          .catch((error) => console.error("Error playing menu audio:", error));
      }
    };
  
    return (
      <div className="home">
        <div className="main">
          {showSoundPopup && (
            <div className="overlay">
              <div className="dialog">
                <p>Do you want to play the game with sound?</p>
                <div className="dialog-buttons">
                  <button
                    className="dialog-button dialog-button-secondary"
                    onClick={() => handleSoundChoice(false)}
                  >
                    No
                  </button>
                  <button
                    className="dialog-button dialog-button-primary"
                    onClick={() => handleSoundChoice(true)}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          )}
          {gameState === "countdown" ? (
            <div className="countdown-container">
              <h2 className="countdown">
                {countdown > 1 ? countdown - 1 : "Go!"}
              </h2>
            </div>
          ) : (
            <>
              <h1 className="game-title">Bit Bird Multiplayer</h1>
  
              {gameState === "menu" && (
                <>
                  <div className="text-center">
                    <div className="button-container">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
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
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                        }}
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
                  <div
                    className="sound-container"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                  >
                    {soundEnabled ? (
                      <img src="/icons/unmute.png" alt="" />
                    ) : (
                      <img src="/icons/mute.png" alt="" />
                    )}
                  </div>
                  <div className="leaderboard-icon" onClick={() => setGameState("leaderboard")}>
                    <img src="/icons/leaderboard.png" alt="" />
                  </div>
                </>
              )}
  
              {gameState === "playing" && (
                <>
                  <GameCanvas onGameOver={endGame} onScoreUpdate={updateScore} />
                  <div className="score-display">Score: {score}</div>
                </>
              )}
  
              {gameState === "gameOver" && (
                <div className="game-over-container">
                  <div className="game-over-icons">
                    <div className="image" onClick={() => setGameState("menu")}>
                      <img src="/icons/back.png" alt="" />
                    </div>
                    <div className="image" onClick={() => setSoundEnabled(!soundEnabled)}>
                    {
                      soundEnabled ? (
                        <img src='/icons/music.png' alt=''/>
                      ):(
                        <img src='/icons/nomusic.png' alt=''/>
                      )
                     }                  </div>
                  </div>
                  <h1 className="game-over-title">Game Over</h1>
                  <div className="score-list">
                    <div className="score">
                      <h1>Score:</h1>
                      <p>{score}</p>
                    </div>
                    <div className="score">
                      <h1>High Score:</h1>
                      <p>{highScore}</p>
                    </div>
                  </div>
  
                  <div className="play-again" onClick={startGame}>
                    <img src="/icons/play.png" alt="" />
                  </div>
                </div>
              )}
              {
                gameState === "leaderboard" && <Leaderboard />
              }
            </>
          )}
        </div>
      </div>
    );
  }