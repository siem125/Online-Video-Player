import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: "UserID is required for UserData api" }, { status: 400 });
        }

        const backendUrl = process.env.CSHARP_API_URL;
        const apiUrl = `${backendUrl}/api/VideoProject/UserData/getUser`;

        const res = await fetch(apiUrl, {
            method: 'GET',
            headers: { 'userId': userId }, // stuur userId als header
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error("Error fetching from C# API:", error);
        return NextResponse.json({ error: 'Error fetching user data' }, { status: 500 });
    }
}
