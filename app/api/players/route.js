import { connectDB } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const client = await connectDB();
        const db = client.db('bitbird');

        // Fetch all players' data from the 'scores' collection
        const players = await db.collection('scores').find({}).toArray();

        // Transform the data to match the desired response structure
        const playersList = players.map(player => {
            const highestScore = Math.max(...player.scores.map(score => score.score)); // Calculate the highest score
            return {
                id: player._id.toString(), // Convert MongoDB ObjectId to string
                walletAddress: player.address,
                highestScore,
            };
        });

        return NextResponse.json(playersList);
    } catch (error) {
        console.error('Error fetching players list:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message },
            { status: 500 }
        );
    }
}
