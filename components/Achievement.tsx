"use client";

import { useState, useEffect, useRef } from "react";
import "@/components/styles/Achievement.css";

type Player = {
  id: string; // Adjusted to string to match the MongoDB ObjectId
  walletAddress: string;
  highestScore: number;
};

function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function Achievement({
  setIsOpen,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsOpen]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players'); // Assuming the API route is `/api/players`
        const data = await response.json();

        // Sort players by highest score in descending order
        const sortedPlayers = data.sort((a: Player, b: Player) => b.highestScore - a.highestScore);
        setPlayers(sortedPlayers);
      } catch (error) {
        console.error('Error fetching player list:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="achievement-overlay">
      <div className="achievement-popup" ref={popupRef}>
        <div
          className="image"
          onClick={() => setIsOpen(false)}
          style={{ cursor: "pointer", height: "30px", width: "30px" }}
        >
          <img src="/icons/close.png" alt="Close" />
        </div>
        <h2 className="achievement-title">Game Achievements</h2>
        <div className="achievement-content">
          {loading ? (
            <div className="loader-container">
              <span className="loader" />
            </div>
          ) : (
            <>
              <div className="achievement-header">
                <span>Rank</span>
                <span>Player</span>
                <span>Highest Score</span>
              </div>
              <ul className="player-list">
                {players.map((player, index) => (
                  <li key={player.id} className="player-item">
                    <span className="player-rank">{index + 1}</span>
                    <div className="player-info">
                      <p className="player-address">
                        {truncateAddress(player.walletAddress)}
                      </p>
                    </div>
                    <div className="player-score">
                      <p className="score-value">
                        {player.highestScore.toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
