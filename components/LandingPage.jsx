"use client";
import Link from "next/link";
import "../components/Home.css";

export default function LandingPage() {
  

  return (
    <>
      <div className="landing-page">
      <div className="content-wrapper">
        <h1 className="game-title">Bit Bird Multiplayer</h1>
        <div className="button-containerr">
          <Link href="/solo-game" className="game-button solo-button">
            Solo Game
          </Link>
          <Link href="/one-vs-one" className="game-button vs-button">
            One vs. One
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
