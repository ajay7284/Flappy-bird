"use client";
import { useRouter } from "next/navigation"
import React, { useEffect, useRef, useState } from "react";
import "./OneVsOne.css";
import { motion } from "framer-motion";
import GameLobby from "./GameLobby";
import GameMain from "./GameMain";
import { createGame, joinGame } from "@/components/ContractInstance";
import {useAccount} from "wagmi";



export default function OneVsOne() {
  const router = useRouter();
  const [gameState, setGameState] = useState("menu");
  const [digits, setDigits] = useState("");
  const [lobbyStatus, setLobbyStatus] = useState("start");
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [sixDigitNumber, setSixDigitNumber] = useState("");
  const handleNavigateToHome = () => {
    window.location.href = "/";
  };
  const inputRef = useRef<HTMLInputElement>(null); // Use a single input reference
  const {address} = useAccount();
  
  const handleInputChange = (value: string) => {
    // Ensure only digits are accepted and limit input length to 6
    if (!/^\d*$/.test(value) || value.length > 6) return;

    setDigits(value);
  };

  useEffect(() => {
    // Focus the input field on initial render
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCreateGame = async () => {
    setIsCreatingGame(true);
    setError("");
    try {
      const gameId = await createGame("1"); // Stake amount in ETH
      if(gameId){
      const player1Address = address;
      console.log("GameId and Player1Address",gameId,player1Address)
      const response = await fetch('/api/createGame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, player1Address }),
      });
      if (!response.ok) {
        throw new Error('Failed to store game information');
      }
    }
  
     
      console.log("GameID in 1vs1", gameId)
      setSixDigitNumber(gameId)
      setGameState("create-game");
    } catch (error) {
      console.error("Error creating game:", error);
      setError("Failed to create game. Please try again.");
    } finally {
      setIsCreatingGame(false);
    }
  };


  const handleJoinGame = async () => {
    if (digits.length !== 6) {
      setError("Please enter a valid 6-digit game ID.");
      return;
    }

    setIsJoiningGame(true);
    setError("");
    try {
      const joined = await joinGame(digits, "1"); // Stake amount in ETH
      if (joined) {

        const response = await fetch('/api/joinGame', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameId: digits, player2Address: address }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to store player 2 information');
        }
        setGameState("countdown");
      } else {
        setError("Failed to join the game. Please check the game ID and try again.");
      }
    } catch (error) {
      console.error("Error joining game:", error);
      setError("Failed to join game. Please try again.");
    } finally {
      setIsJoiningGame(false);
    }
  };
  return (
    <>
      {gameState === "menu" && (
        <div
          className="one-vs-one"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <h1 className="game-title">Bit Bird Multiplayer</h1>
          <div
            className="button-container"
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
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
                onClick={handleCreateGame}
                disabled={isCreatingGame}
              >
                {isCreatingGame ? "Creating..." : "Create Game"}
              </motion.button>
            </motion.div>

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
                onClick={() => setGameState("join-game")}
              >
                Join Game
              </motion.button>
            </motion.div>
          </div>
        </div>
      )}

      {gameState === "create-game" && (
        <div className="game-over-container">
          <div className="game-over-icons">
            <div className="image" onClick={() => setGameState("menu")}>
              <img src="/icons/back.png" alt="" />
            </div>
            <div className="image" onClick={() => handleNavigateToHome()}>
              <img src="/icons/home.png" alt="" />
            </div>
          </div>
          <h1 className="game-over-title">Room ID</h1>

          <div className="room-id">
            <div className="number-display">
              {sixDigitNumber.split("").map((digit, index) => (
                <span key={index} className="digit">
                  {digit}
                </span>
              ))}
            </div>
            <p className="message">Share this ID with your friend</p>
          </div>

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
              style={{ marginTop: "20px" }}
              onClick={() => {
                setGameState("countdown");
                router.push(`/one-vs-one?gameId=${sixDigitNumber}`);
              }}
            >
              Start Game
            </motion.button>
          </motion.div>
        </div>
      )}
      {gameState === "join-game" && (
        <div className="game-over-container">
          <div className="game-over-icons">
            <div className="image" onClick={() => setGameState("menu")}>
              <img src="/icons/back.png" alt="" />
            </div>
            <div className="image" onClick={() => handleNavigateToHome()}>
              <img src="/icons/home.png" alt="" />
            </div>
          </div>
          <h1 className="game-over-title">Room ID</h1>

          <div className="room-id">
            <div className="number-display">
      


                <input
                 
                ref={inputRef} // Attach the single ref here
                type="text"
                inputMode="numeric"
                value={digits}
                onChange={(e) => handleInputChange(e.target.value)}
                 className="digits"
                maxLength={6} // Limit to 6 digits if needed
              />
            </div>
            <p className="message">Enter the room ID</p>
          </div>
          {error && <p className="error-message">{error}</p>}
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
              className="game-button start-button"
              style={{ marginTop: "20px" }}
              onClick={handleJoinGame}
              disabled={isJoiningGame}
            >
              {isJoiningGame ? "Joining..." : "Join lobby"}
            </motion.button>
          </motion.div>
        </div>
      )}
      {gameState === "join-lobby" && (
        <GameLobby
          gameState={gameState}
          setGameState={setGameState}
          lobbyStatus={lobbyStatus}
        />
      )}
      <GameMain
        gameState={gameState}
        setGameState={setGameState}
        setLobbyStatus={setLobbyStatus}
      />
    </>
  );
}
