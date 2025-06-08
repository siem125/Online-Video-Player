import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { type: string; series: string } }) {
  try {
    const { type, series } = await params;
    const body = await req.json();
    
    const apiBaseUrl = process.env.CSHARP_API_URL;
    const csharpApiUrl = `${apiBaseUrl}/api/VideoProject/Series/${type}/${series}/update-episode-order`;

    const csharpResponse = await fetch(csharpApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await csharpResponse.json();

    if (!csharpResponse.ok) {
      return NextResponse.json({ success: false, error: data?.error || "Unknown error" }, { status: csharpResponse.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error passing update episode order to backend:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
