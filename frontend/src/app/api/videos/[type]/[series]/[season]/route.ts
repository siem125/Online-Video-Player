import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { naturalSort } from "@/app/Components/utils/sort";

// GET episodes for a given season using only the number
export async function GET(req: Request, { params }: { params: { type: string, series: string, season: string } }) {
    try {
        const { type, series, season } = params;

        const apiBaseUrl = process.env.CSHARP_API_URL;
        const csharpApiUrl = `${apiBaseUrl}/api/VideoProject/season/${type}/${series}/${season}`;

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
        console.error("Error passing request to backend for season:", error);
        return NextResponse.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        { status: 500 }
        );
    }
}
