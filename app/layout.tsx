"use client"; // Client-side component

import { useEffect, useRef, useState } from "react";
import Head from "next/head";
import { Press_Start_2P } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "../app/providers";
import "../components/styles/LandingPage.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "./globals.css";
import Achievement from "@/components/Achievement";

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
});

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  const [showSoundPopup, setShowSoundPopup] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isOpen , setIsOpen] = useState(false)
  // const [gameState, setGameState] = useState<"menu" | "game">("menu");

  const menuAudioRef = useRef<HTMLAudioElement | null>(null);
  const gameAudioRef = useRef<HTMLAudioElement | null>(null);

  // Load audio files
  useEffect(() => {
    menuAudioRef.current = new Audio("/audio/home.m4a");
    gameAudioRef.current = new Audio("/audio/game.m4a");

    if (menuAudioRef.current) menuAudioRef.current.loop = true;
    if (gameAudioRef.current) gameAudioRef.current.loop = true;
  }, []);

  // Handle audio based on game state and sound setting
  useEffect(() => {
    if (!soundEnabled) {
      if (menuAudioRef.current) {
        menuAudioRef.current.pause();
        menuAudioRef.current.currentTime = 0;
      }
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
        gameAudioRef.current.currentTime = 0;
      }
      return;
    }

    if (menuAudioRef.current) {
      menuAudioRef.current
        .play()
        .catch((error) => console.error("Menu audio playback failed:", error));
      if (gameAudioRef.current) {
        gameAudioRef.current.pause();
      }
    }

    return () => {
      if (menuAudioRef.current) menuAudioRef.current.pause();
      if (gameAudioRef.current) gameAudioRef.current.pause();
    };
  }, [soundEnabled]);

  // Enable sound after user interaction
  const handleSoundChoice = (choice: boolean) => {
    setSoundEnabled(choice);
    setShowSoundPopup(false);

    if (choice && menuAudioRef.current) {
      menuAudioRef.current
        .play()
        .catch((error) => console.error("Error playing menu audio:", error));
    }
  };

  const handleNavigateToHome = () => {
    window.location.href = "/";
  };

  return (
    <html lang="en">
      <body className={pressStart2P.className} style={{ overflow: "hidden" }}>
        <Providers>
          <div className="layout">
            <Head>
              <title>Bit Bird</title>
              <meta
                name="description"
                content="Bit Bird - A Flappy Bird inspired game"
              />
              <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="leaderboard-icon-container">
              <ConnectButton />
              <div
                className="image"
                onClick={handleNavigateToHome}
                style={{ cursor: "pointer" }}
              >
                <img src="/icons/home.png" alt="" />
              </div>
              <div
                className="image"
                onClick={() => setIsOpen(true)}
                style={{ cursor: "pointer" }}
              >
                <img src="/icons/leaderboard.png" alt="" />
              </div>
            </div>
            {isOpen && <Achievement setIsOpen={setIsOpen} />}
            {/* Sound Choice Popup */}
            {showSoundPopup && (
              <div className="sound-options-overlay">
                <div className="sound-options-modal">
                  <h2 className="sound-options-title">Sound Options</h2>
                  <p className="sound-options-text">
                    Do you want to play the game with sound?
                  </p>
                  <div className="sound-options-buttons">
                    <button
                      className="sound-options-button sound-options-button-no"
                      onClick={() => handleSoundChoice(false)}
                    >
                      No
                    </button>
                    <button
                      className="sound-options-button sound-options-button-yes"
                      onClick={() => handleSoundChoice(true)}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sound Toggle Button */}
            <div
              className="sound-container"
              style={{
                position: "fixed",
                bottom: "30px",
                right: "30px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "48px",
                height: "48px",
                borderRadius: "50%",
              }}
              onClick={() => setSoundEnabled(!soundEnabled)}
            >
              {soundEnabled ? (
                <img
                  src="/icons/unmute.png"
                  alt="Unmute"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              ) : (
                <img
                  src="/icons/mute.png"
                  alt="Mute"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>

            {/* Main Content */}
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
