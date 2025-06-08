import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const PUBLIC_PATH = path.join(process.cwd(), "public/videos");

interface EpisodeMeta {
  name: string;
  filename: string;
  size: string;
  duration: string;
}

interface SeasonMeta {
  name: string;
  episodes: EpisodeMeta[];
}

interface SeriesMeta {
  name: string;
  seasons: Record<string, SeasonMeta>;
}

async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create directory ${dirPath}:`, error);
  }
}

async function loadSeriesData(seriesPath: string): Promise<SeriesMeta | null> {
  const dataPath = path.join(seriesPath, "data.json");
  try {
    const data = await fs.readFile(dataPath, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function saveSeriesData(seriesPath: string, seriesData: SeriesMeta) {
  const dataPath = path.join(seriesPath, "data.json");
  await fs.writeFile(dataPath, JSON.stringify(seriesData, null, 2), "utf-8");
}

async function getNextEpisodeIndex(seasonFolderPath: string): Promise<number> {
  try {
    const entries = await fs.readdir(seasonFolderPath, { withFileTypes: true });
    const episodeFolders = entries
      .filter(entry => entry.isDirectory() && /^\d+ - /.test(entry.name))
      .map(entry => entry.name);

    let index = 0;
    while (episodeFolders.some(name => name.startsWith(`${index} - `))) {
      index++;
    }
    return index;
  } catch {
    return 0;
  }
}
  

async function getNextSeasonIndex(seriesPath: string, seasonName: string): Promise<number> {
  try {
    const entries = await fs.readdir(seriesPath, { withFileTypes: true });
    const seasonFolders = entries
      .filter(entry => entry.isDirectory() && /^\d+ - /.test(entry.name))
      .map(entry => entry.name);

    // Check if season already exists
    for (const folderName of seasonFolders) {
      const [, existingName] = folderName.split(" - ");
      if (existingName === seasonName) {
        return parseInt(folderName.split(" - ")[0], 10);
      }
    }

    // Find next available index
    let index = 1;
    while (seasonFolders.some(name => name.startsWith(`${index} - `))) {
      index++;
    }
    return index;
  } catch {
    return 1;
  }
}
  

export async function POST(req: Request) {
    const formData = await req.formData();
  
    const type = formData.get("type")?.toString();
    const seriesName = formData.get("seriesName")?.toString();
    const seasonName = formData.get("seasonName")?.toString();
    const file = formData.get("files") as File;
  
    if (!type || !seriesName || !seasonName || !file) {
      return NextResponse.json({ logs: ["Missing required fields."] }, { status: 400 });
    }
  
    try {
        const seriesPath = path.join(PUBLIC_PATH, type, seriesName);
        await ensureDirectoryExists(seriesPath);
    
        // Determine season index and folder name dynamically
        const seasonIndex = await getNextSeasonIndex(seriesPath, seasonName);
        const seasonFolderNumber = seasonIndex.toString(); //.padStart(3, "0"); //start with 000 or 001 instead of 0 and 1. aka not using
        const seasonFolderName = `${seasonFolderNumber} - ${seasonName}`;
        const seasonFolderPath = path.join(seriesPath, seasonFolderName);
    
        await ensureDirectoryExists(seasonFolderPath);
    
        // Episode folder logic remains similar:
        const ext = path.extname(file.name);
        const originalNameWithoutExt = file.name.replace(ext, "");
    
        // Extract number from filename or fallback(without auto numbering)
        //const numberMatch = file.name.match(/^(\d+)/);
        //const episodeNumber = numberMatch ? numberMatch[1] : "000";

        const episodeIndex = await getNextEpisodeIndex(seasonFolderPath);
        const episodeNumber = episodeIndex.toString(); //.padStart(3, "0"); //start with 000 or 001 instead of 0, 1

    
        const episodeFolderName = `${episodeNumber} - ${originalNameWithoutExt}`;
        const episodeFolderPath = path.join(seasonFolderPath, episodeFolderName);
        await ensureDirectoryExists(episodeFolderPath);
    
        const videoFileName = `Video${ext}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const filePath = path.join(episodeFolderPath, videoFileName);
        await fs.writeFile(filePath, buffer);
    
        // Write data.json for episode
        const stats = await fs.stat(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2) + " MB";
        const duration = "Unknown";
    
        const episodeMeta = {
          name: originalNameWithoutExt, //The actual name
          videoFileName: videoFileName, //video naming(with extension)
          description: 'This is a description for ' + originalNameWithoutExt,
          skippoints: [],
        };
        const episodeDataPath = path.join(episodeFolderPath, "data.json");
        await fs.writeFile(episodeDataPath, JSON.stringify(episodeMeta, null, 2), "utf-8");
    
        return NextResponse.json({
          logs: [
            `Saved episode ${videoFileName} inside ${episodeFolderName}`,
            `Season folder created: ${seasonFolderName}`,
          ],
        });
      } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ logs: ["Internal server error."] }, { status: 500 });
      }
    }