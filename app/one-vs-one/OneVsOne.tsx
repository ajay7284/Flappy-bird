"use client";
import React, { useEffect, useRef, useState } from "react";
import "./OneVsOne.css";
import { motion } from "framer-motion";
import GameLobby from "./GameLobby";
import GameMain from "./GameMain";

export default function OneVsOne() {
  const [gameState, setGameState] = useState("menu");
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [lobbyStatus, setLobbyStatus] = useState("start");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const sixDigitNumber = "123456"; // Replace this with your actual number
  const handleNavigateToHome = () => {
    window.location.href = "/";
  };
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);
  const handleInputChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
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
                onClick={() => setGameState("create-game")}
              >
                Create Game
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
              onClick={() => setGameState("join-lobby")}
            >
              Join lobby
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
              {digits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="digit"
                  maxLength={1}
                />
              ))}
            </div>
            <p className="message">Enter the room ID</p>
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
              onClick={() => setGameState("join-lobby")}
            >
              Join lobby
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
