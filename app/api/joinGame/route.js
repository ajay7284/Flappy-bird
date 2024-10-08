import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; 
export async function POST(request) {
    try {
      const { gameId, player2Address } = await request.json();
      const client = await connectDB();
      const db = client.db("bitbird");
    
    const result = await db.collection("games").updateOne(
      { gameId },
      { $set: { player2Address, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Joined game successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error joining game", error: error.message }, { status: 500 });
  }
}