// pages/index.js
import { motion } from "framer-motion";
import "./Home.css"; // CSS for styling the page

export default function HomePage() {
  return (
    <div className="home">
      <div className="button-container">
        {/* Start Game Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <motion.button
              className="game-button start-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Game
            </motion.button>
        </motion.div>

        {/* 1 vs 1 Button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
        >
            <motion.button
              className="game-button one-vs-one-button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              1 vs 1
            </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
