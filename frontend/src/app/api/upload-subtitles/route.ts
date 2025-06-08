import fs from 'fs';
import { NextResponse } from 'next/server';
import * as path from 'path';  // Import path module for file operations

interface Subtitle {
  start: number;  // Start time in seconds
  end: number;    // End time in seconds
  text: string;   // Subtitle text
}

interface SubtitlesRequest {
  episodePath: string;  // Path where the subtitle file should be saved (relative to public)
  subtitles: {   // Subtitle data
    language: string;
    subtitles: Subtitle[];
  };
}

// Helper function to generate WebVTT content from subtitle data
const generateWebVTT = (subtitles: Subtitle[]) => {
  let vttContent = 'WEBVTT\n\n';

  subtitles.forEach((subtitle, index) => {
    // Convert time from seconds to WebVTT format (HH:MM:SS.MS)
    const startDate = new Date(subtitle.start * 1000);
    const endDate = new Date(subtitle.end * 1000);

    // Get hours, minutes, seconds, and milliseconds
    const startHours = String(startDate.getUTCHours()).padStart(2, '0');
    const startMinutes = String(startDate.getUTCMinutes()).padStart(2, '0');
    const startSeconds = String(startDate.getUTCSeconds()).padStart(2, '0');
    const startMilliseconds = String(startDate.getMilliseconds()).padStart(3, '0');

    const endHours = String(endDate.getUTCHours()).padStart(2, '0');
    const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0');
    const endSeconds = String(endDate.getUTCSeconds()).padStart(2, '0');
    const endMilliseconds = String(endDate.getMilliseconds()).padStart(3, '0');

    // Format the time as HH:MM:SS.MS
    const startTime = `${startHours}:${startMinutes}:${startSeconds}.${startMilliseconds}`;
    const endTime = `${endHours}:${endMinutes}:${endSeconds}.${endMilliseconds}`;

    vttContent += `${index + 1}\n`;
    vttContent += `${startTime} --> ${endTime}\n`;
    vttContent += `${subtitle.text}\n\n`;
  });

  return vttContent;
};

// API endpoint to upload subtitles
export async function POST(req: Request) {
  const { episodePath, subtitles }: SubtitlesRequest = await req.json();

  // Get the path relative to the public directory
  const publicDir = path.join(process.cwd(), 'public'); // Absolute path to the public directory
  const subtitlesPath = path.join(publicDir, episodePath);   // Combine public directory with the relative path

  // Construct the full path for the .vtt file
  const fullPath = path.join(subtitlesPath, 'subtitles_' + subtitles.language + '.vtt');

  // Generate WebVTT file content
  const vttContent = generateWebVTT(subtitles.subtitles);

  try {
    // Create directories if they don't exist
    fs.mkdirSync(subtitlesPath, { recursive: true });

    // Write the WebVTT file to the specified path
    fs.writeFileSync(fullPath, vttContent);

    return NextResponse.json({ message: 'Subtitles uploaded successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload subtitles', details: error.message }, { status: 500 });
  }
}
