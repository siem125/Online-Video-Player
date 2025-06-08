import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { type: string } }) {
  const { type } = await params;

  // 👇 Replace with your actual API base URL (or use env var)
  const apiBaseUrl = process.env.CSHARP_API_URL;

  try {
    const res = await fetch(`${apiBaseUrl}/api/VideoProject/type/${type}`);

    if (!res.ok) {
      const errorBody = await res.json();
      return NextResponse.json({ error: errorBody.error || "API error" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Failed to reach backend." }, { status: 500 });
  }
}
