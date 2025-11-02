import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

// Base path for public videos
//const PUBLIC_PATH = path.join(process.cwd(), "public/videos");

// GET a specific episode using numeric values
export async function GET(req: Request, { params }: { params: { type: string, series: string, season: string, episode: string } }) {
    try {
    const { type, series, season, episode } = await params;

    const apiBaseUrl = process.env.CSHARP_API_URL;
    const csharpApiUrl = `${apiBaseUrl}/api/VideoProject/episode/${type}/${series}/${season}/${episode}`;

    const csharpResponse = await fetch(csharpApiUrl, {
      method: "GET",
    });

    const data = await csharpResponse.json();

    if (!csharpResponse.ok) {
      return NextResponse.json(
        { error: data?.error || "Unknown error" },
        { status: csharpResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error passing request to backend for episode:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
