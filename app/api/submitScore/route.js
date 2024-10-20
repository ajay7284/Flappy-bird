import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { ethers } from "ethers";
import { setWinner } from "@/components/ContractInstance";

// Make sure to set PRIVATE_KEY and RPC_URL in your environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
console.log("RPC", RPC_URL);
if (!PRIVATE_KEY || !RPC_URL) {
  throw new Error("PRIVATE_KEY or RPC_URL is not set in environment variables");
}

export async function POST(request) {
  try {
    const { gameId, playerAddress, score } = await request.json();
    const client = await connectDB();
    const db = client.db("bitbird");
    console.log("Server", gameId, playerAddress, score);
    const game = await db.collection("games").findOne({ gameId });

    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    let updateField =
      game.player1Address === playerAddress ? "player1Score" : "player2Score";

    const result = await db
      .collection("games")
      .updateOne(
        { gameId },
        { $set: { [updateField]: score, updatedAt: new Date() } }
      );
console.log(result)
    // Check if both scores are submitted and determine the winner
    const updatedGame = await db.collection("games").findOne({ gameId });
    if (
      updatedGame.player1Score !== null &&
      updatedGame.player2Score !== null
    ) {
      const winner =
        updatedGame.player1Score > updatedGame.player2Score
          ? updatedGame.player1Address
          : updatedGame.player2Address;
      await db
        .collection("games")
        .updateOne({ gameId }, { $set: { winner, updatedAt: new Date() } });

      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        console.log("Provider", provider);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        console.log("Wallet", wallet);
        console.log("Pass GameId & Winner", gameId, winner);
        await setWinner(gameId, winner, wallet);

        // Mark the game as settled in the database
        await db
          .collection("games")
          .updateOne(
            { gameId },
            { $set: { settled: true, settledAt: new Date() } }
          );

        return NextResponse.json({
          message: "Score submitted and game settled successfully",
        });
      } catch (error) {
        console.error("Error settling the game:", error);
        return NextResponse.json(
          {
            message: "Score submitted but failed to settle the game",
            error: error.message,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ message: "Score submitted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Error submitting score", error: error.message },
      { status: 500 }
    );
  }
}
