import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb'; 

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

    const { address, score } = body;

    try {
        const client = await connectDB();
        const db = client.db('bitbird');

        // Check if the user already exists
        const existingUser = await db.collection('scores').findOne({ address });

        if (existingUser) {
            // User exists, update the scores array
            const updateResult = await db.collection('scores').updateOne(
                { address },
                {
                    $push: { scores: { score, date: new Date() } },
                }
            );

            return NextResponse.json({ message: 'Score updated successfully', updateResult });
        } else {
            // User does not exist, create a new user object
            const newUser = {
                address,
                scores: [{ score, date: new Date() }],
            };

            const insertResult = await db.collection('scores').insertOne(newUser);

            return NextResponse.json({ message: 'Score stored successfully', insertResult });
        }
    } catch (error) {
        console.error('Error storing score:', error);
        return NextResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
