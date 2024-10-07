import React from 'react'
import { motion } from 'framer-motion'
import "./gameLobby.css"

interface GameLobbyProps {
  gameState: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  lobbyStatus: string;
}

const GameLobby: React.FC<GameLobbyProps> = ({ gameState, setGameState, lobbyStatus }) => {
  return (
    <div className="game-lobby-wrapper">
      <div className="game-lobby-container">
        <h1 className="game-lobby-title">Game Lobby</h1>
        <div className="game-lobby">
          <div className="vs-container">
            <motion.div 
              className="player-circle player1"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h2>Player 1</h2>
            </motion.div>
            <div className="vs">VS</div>
            <motion.div 
              className="player-circle player2"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <h2>Player 2</h2>
            </motion.div>
          </div>
        </div>
        {lobbyStatus === "start" && (
          <motion.button
            className="start-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setGameState("countdown")}
          >
            Start Game
          </motion.button>
        )}
      </div>
    </div>
  )
}

export default GameLobby