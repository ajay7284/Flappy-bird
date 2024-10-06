import React from 'react'
import { motion } from 'framer-motion'
import "./OneVsOne.css"

interface GameLobbyProps {
    gameState: string;
    setGameState: React.Dispatch<React.SetStateAction<string>>;
  }
const GameLobby: React.FC<GameLobbyProps> = ({ gameState, setGameState }) => {

  return (
    <div className='game-lobby-container'>
      <h1>Game Lobby</h1>
      <div className="game-lobby">
      <div className="vs-container">
        <div className="player-circle player1">
          <h2>Player 1</h2>
        </div>
        <div className="vs">VS</div>
        <div className="player-circle player2">
          <h2>Player 2</h2>
        </div>
      </div>
    </div>
       <motion.div
       whileHover={{ scale: 1.1 }}
       whileTap={{ scale: 0.9 }}
       className="button-container"
       style={{
        margin:"0 auto",
        marginTop: "20px",
       }}
       onClick={() => setGameState("countdown")}
       >
        <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="game-button start-button"        
        >Start Game</motion.button>
      </motion.div>
    </div>
  )
}

export default GameLobby