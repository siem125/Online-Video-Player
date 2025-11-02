import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) return NextResponse.json({ error: 'No userId provided' }, { status: 400 });

  const backendUrl = process.env.CSHARP_API_URL;
  const res = await fetch(`${backendUrl}/api/VideoProject/UserData/getUser`, {
    method: 'GET',
    headers: { 'userId': userId }, // hier naar de backend sturen
  });

  const data = await res.json();
  
  // alleen ContinueList doorgeven
  const continueList = data?.continueList || [];

  return NextResponse.json({ ContinueList: continueList }, { status: res.status });
}



export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  const body = await req.json();

  if (!userId) return NextResponse.json({ error: 'No userId provided' }, { status: 400 });

  const backendUrl = process.env.CSHARP_API_URL;
  const res = await fetch(`${backendUrl}/api/VideoProject/UserData/getUser/continue`, {
    method: 'PATCH',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'userId': userId, // hier naar de backend sturen
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

