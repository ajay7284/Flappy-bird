import React from "react";
import './Home.css'

export default function Leaderboard() {
  return (
    <div className="game-over-container">
      <div className="game-over-icons">
        <div className="image">
          <img src="/icons/back.png" alt="" />
        </div>
        <div className="image" >
        
        </div>
      </div>
      <h1 className="game-over-title">Leaderboard</h1>
      <div className="score-list">
        
      </div>

      <div className="play-again" >
        <img src="/icons/play.png" alt="" />
      </div>
    </div>
  );
}
