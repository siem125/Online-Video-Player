import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: { type: string, series: string, season: string, episode: string } }) {
  try {
    const { type, series, season, episode } = await params;

    // Encode series voor URL (bijv. spaties)
    const encodedSeries = encodeURIComponent(series);

    // Backend API endpoint
    const backendUrl = process.env.CSHARP_API_URL;
    const apiUrl = `${backendUrl}/api/VideoProject/episode/${type}/${encodedSeries}/${season}/${episode}/video`;
    //console.log("API URL: ", apiUrl);

    // Forward de request naar C# backend
    const res = await fetch(apiUrl, {
      method: 'GET',
      headers: req.headers, // optioneel: forward client headers
    });

    // Als video niet gevonden
    if (res.status === 404) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Stream de video terug naar de client
    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      headers: {
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('Error proxying video:', error);
    return NextResponse.json({ error: 'Failed to fetch video' }, { status: 500 });
  }
}
