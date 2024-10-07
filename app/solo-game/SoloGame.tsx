"use client";
import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import {message} from 'antd'
import { useAccount } from "wagmi";

export default function SoloGame() {
  const {address} = useAccount();

  const [gameState, setGameState] = useState("menu");
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [walletMessage, setWalletMessage] = useState<string | null>(); // Wallet message state




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
  console.log(address)
  const startGame = () => {
    if(address === undefined) {
      setWalletMessage("Connect wallet is required for playing the game"); // Show message
      return
    }
    setGameState("countdown");
    setCountdown(4);
    setScore(0);
  };

  const updateScore = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);
  const endGame = (finalScore: number) => {
    setGameState("gameOver");
    setScore(finalScore);
  
    if (finalScore > highScore) {
      setHighScore(finalScore);
    }
  
    // Ensure address is defined before submitting the score
    if (address) {
      submitScore(address, finalScore);
    } else {
      console.error("Cannot submit score: Wallet address is undefined");
    }
  };

  const submitScore = async (address: string, score: number) => {
    try {
      const response = await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address, score }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log("Score submitted successfully:", data);
      } else {
        console.error("Error submitting score:", data.message);
      }
    } catch (error) {
      console.error("Error submitting score:", error);
    }
  }

  const fetchHighestScore = async () => {
    if (!address) return; // Return early if no address

    try {
        const response = await fetch('/api/getHighestScore', {
            method: 'POST', // Use POST method
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ address }), // Submit address in body
        });


        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error Data:', errorData); // Log error data
            throw new Error(errorData.message || 'Failed to fetch highest score');
        }

        const data = await response.json();
        setHighScore(data.highestScore);
    } catch (error) {
        console.error('Error fetching highest score:', error);
    }
};
useEffect(() => {
  fetchHighestScore();
}, [address]);
const handleNavigateToHome = () => {
  window.location.href = "/";
}

  return (
    <div className="solo-game">
      {walletMessage && (
        message.error(walletMessage)
      )}

      {gameState === "countdown" ? (
        <div className="countdown-container">
          <h2 className="countdown">{countdown > 1 ? countdown - 1 : "Go!"}</h2>
        </div>
      ) : (
        <>
          <h1 className="game-title">Bit Bird Multiplayer</h1>

          {gameState === "menu" && (
            <>
              <div
                className="button-container"
                style={{ justifyContent: "center", alignItems: "center" }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 10,
                  }}
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="game-button start-button"
                    onClick={startGame}
                  >
                    Start Game
                  </motion.button>
                </motion.div>
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
                    <div className="image" onClick={handleNavigateToHome}>
                      <img src="/icons/home.png" alt="" />
                    </div>
                    
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
        </>
      )}
    </div>
  );
}
