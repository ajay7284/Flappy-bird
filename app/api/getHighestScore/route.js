import { connectDB } from '@/lib/mongodb'; 
import { NextResponse } from 'next/server'; 

export async function POST(req) {
    let body;
    try {
        body = await req.json();
    } catch (error) {
        return NextResponse.json(
            { message: 'Invalid JSON in request body.' },
            { status: 400 }
        );
    }

    const { address } = body;

    try {
        const client = await connectDB();
        const db = client.db('bitbird');

        // Find the user by address
        const user = await db.collection('scores').findOne({ address });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        // Extract the highest score from the user's scores
        const highestScore = Math.max(...user.scores.map(score => score.score));

        return NextResponse.json({ highestScore });
    } catch (error) {
        console.error('Error fetching highest score:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: error.message }, // Include error message
            { status: 500 }
        );
    }
}
