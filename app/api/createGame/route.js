import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; 
export async function POST(request) {
    try {
      const { gameId, player1Address } = await request.json();
      const client = await connectDB();
      const db = client.db("bitbird");
      
      const result = await db.collection("games").insertOne({
        gameId,
        player1Address,
        player1Score: null,
        player2Address: null,
        player2Score: null,
        winner: null,
        settled: false,
        createdAt: new Date()
      });
  console.log("Result", result)
      return NextResponse.json({ message: "Game created successfully", gameId }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: "Error creating game", error: error.message }, { status: 500 });
    }
  }