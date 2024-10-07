"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@/components/styles/Achievement.css";

type Player = {
  id: string;
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
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
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
        const response = await fetch('/api/players');
        const data = await response.json();
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
    <AnimatePresence>
      <motion.div
        className="achievement-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="achievement-popup"
          ref={popupRef}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 300 }}
        >
          <button
            className="close-button"
            onClick={() => setIsOpen(false)}
            aria-label="Close achievements popup"
          >
            <img src="/icons/close.png" alt="Close" />
          </button>
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
                    <motion.li
                      key={player.id}
                      className="player-item"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
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
                    </motion.li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}