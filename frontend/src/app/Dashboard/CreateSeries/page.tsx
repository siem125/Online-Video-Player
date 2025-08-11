"use client";

import { naturalSort } from "@/Components/utils/sort";
import path from "path";
import React, { useState } from "react";

type Episode = {
  originalFile: File;
  originalName: string;
  name: string;
  size: string;
  duration: string;
  status?: "waiting" | "pending" | "done" | "failed";
  checked?: boolean;         // current selection state
  originalChecked?: boolean; // used to revert to initial state when unchecking season
};

type Season = {
  name: string;
  episodes: Episode[];
  checked?: boolean; //current selection state
};

type Series = {
  name: string;
  seasons: { [key: string]: Season };
};

export default function CreateSeries() {
  const [type, setType] = useState<string>("");
  const [seriesData, setSeriesData] = useState<Record<string, Series>>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFolderSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
  
    //setFolderStructure(files);
    const tempMap = new Map<string, { file: File; parts: string[] }[]>();
  
    // Step 1: Group all files by "seriesName/seasonName"
    for (const file of Array.from(files)) {
      const parts = file.webkitRelativePath.split("/");
      const seriesName = parts[0];
      const folderName = parts[parts.length - 2];
      const key = `${seriesName}||${folderName}`;
  
      if (!tempMap.has(key)) tempMap.set(key, []);
      tempMap.get(key)!.push({ file, parts });
    }
  
    // Step 2: Build newSeriesData
    const newSeriesData: Record<string, Series> = {};
  
    for (const [key, entries] of tempMap.entries()) {
      const [seriesName, folderName] = key.split("||");
  
      if (!newSeriesData[seriesName]) {
        newSeriesData[seriesName] = { name: seriesName, seasons: {} };
      }
  
      // Natural sort based on file name
      entries.sort((a, b) => naturalSort(a.file.name, b.file.name));
  
      const seasonEpisodes: Episode[] = [];
  
      for (const { file } of entries) {
        const size = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        const duration = await getVideoDuration(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  
        seasonEpisodes.push({
          originalFile: file,
          originalName: file.name,
          name: nameWithoutExt,
          size,
          duration,
          status: "waiting",
          checked: true,
          originalChecked: true,
        });
      }
  
      // Season number becomes its order (sorted by key, which matches Windows)
      const seasonIndex = Object.keys(newSeriesData[seriesName].seasons).length;
      newSeriesData[seriesName].seasons[seasonIndex] = {
        name: folderName,
        episodes: seasonEpisodes,
        checked: true,
      };
    }
  
    setSeriesData(newSeriesData);
  };
  
  const getVideoDuration = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);
      video.onloadedmetadata = () => {
        const totalSeconds = Math.floor(video.duration);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = String(totalSeconds % 60).padStart(2, "0");
        resolve(`${minutes}:${seconds}`);
      };
    });
  };

  const handleRename = (seriesKey: string, seasonKey: number, episodeIndex?: number) => {
    const key = [seriesKey, seasonKey, episodeIndex].filter(v => v !== undefined).join("-");
    setEditingKey(key);
  };

  const handleRenameSubmit = (
    e: React.KeyboardEvent<HTMLInputElement>,
    seriesKey: string,
    seasonKey: number,
    episodeIndex?: number
  ) => {
    if (e.key === "Escape") {
      setEditingKey(null); // cancel edit
      return;
    }

    if (e.key !== "Enter") return;

    const value = (e.target as HTMLInputElement).value.trim();
    if (!value) return;

    setSeriesData(prev => {
      const updated = { ...prev };
      if (episodeIndex !== undefined) {
        updated[seriesKey].seasons[seasonKey].episodes[episodeIndex].name = value;
      } else if (seasonKey !== -1) {
        updated[seriesKey].seasons[seasonKey].name = value;
      } else {
        updated[seriesKey].name = value;
      }
      return updated;
    });

    setEditingKey(null);
  };

  const toggleEpisode = (
    seriesKey: string,
    seasonKey: number,
    episodeIndex: number,
    checked: boolean
  ) => {
    setSeriesData(prev => {
      const updated = { ...prev };
      updated[seriesKey].seasons[seasonKey].episodes[episodeIndex].checked = checked;
      return updated;
    });
  };
  
  const toggleSeason = (
    seriesKey: string,
    seasonKey: number,
    checked: boolean
  ) => {
    setSeriesData(prev => {
      const updated = { ...prev };
      const episodes = updated[seriesKey].seasons[seasonKey].episodes;
  
      if (!checked) {
        // Disable all
        episodes.forEach(ep => (ep.checked = false));
      } else {
        // Revert to original states
        episodes.forEach(ep => (ep.checked = ep.originalChecked ?? true));
      }
  
      updated[seriesKey].seasons[seasonKey].checked = checked;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) return alert("Please select a type first!");
  
    setIsUploading(true);
    const allEpisodes: {
      file: File;
      seriesKey: string;
      seasonKey: string;
      episodeIndex: number;
      series: string;
      season: string;
      episode: string;
    }[] = [];
  
    // Stap 1: Verzamel alle episodes en zet alles op "pending"
    const updatedSeriesData = { ...seriesData };
    for (const [seriesKey, series] of Object.entries(updatedSeriesData)) {
      for (const [seasonKey, season] of Object.entries(series.seasons)) {
        season.episodes.forEach((episode, index) => {
          if(episode.checked){
            episode.status = "pending";
            allEpisodes.push({
              file: episode.originalFile,
              seriesKey,
              seasonKey,
              episodeIndex: index,
              series: series.name,
              season: season.name,
              episode: episode.name,
            });
          }
        });
      }
    }
    setSeriesData(updatedSeriesData);
  
    const total = allEpisodes.length;
  
    // Stap 2: Upload per episode en update status
    for (let i = 0; i < total; i++) {
      const { file, seriesKey, seasonKey, episodeIndex, series, season, episode } = allEpisodes[i];
  
      const formData = new FormData();
      formData.append("type", type);
      formData.append("seriesName", series);
      formData.append("seasonName", season);
      const relativeFileName = `${season}/${episode}${path.extname(file.name)}`; //This is so backend can split the season and episode from 1  //`${episode}${path.extname(file.name)}`
      formData.append("files", new File([file], relativeFileName));
  
      try {
        const res = await fetch("/api/upload-folder", { method: "POST", body: formData });
        const data = await res.json();

        console.log("logs from backend:", data.logs); // should work
  
        updatedSeriesData[seriesKey].seasons[seasonKey].episodes[episodeIndex].status = "done";
      } catch (err) {
        //setStatusLog(prev => [...prev, `Error uploading ${episode}`]);
        updatedSeriesData[seriesKey].seasons[seasonKey].episodes[episodeIndex].status = "failed";
      }
  
      setSeriesData({ ...updatedSeriesData }); // force rerender
  
      //setProgress(Math.round(((i + 1) / total) * 100));
    }
  
    setIsUploading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "done": return "var(--cs-done-color)";      // greenish
      case "processing": return "var(--cs-processing-color)"; // yellowish
      case "error": return "var(--cs-error-color)";     // reddish
      default: return "var(--cs-pending-color)";          // gray (pending or unknown)
    }
  };
  
  return (
    <div style={{ display: "flex", padding: "20px" }}>
      <div style={{ flex: 3 }}>
        <h1>Upload and Process Folder</h1>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="folder-upload"
            style={{
              display: 'inline-block',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'var(--site-bg-color)',
              color: 'var(--site-text-color)',
              border: '1px solid var(--site-outline-color)',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'background-color 0.2s ease, color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--nav-hover-color)';
              e.currentTarget.style.color = 'var(--nav-hoverText-color)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--site-bg-color)';
              e.currentTarget.style.color = 'var(--site-text-color)';
            }}
          >
            📁 Select Folder
          </label>
          <input
            type="file"
            id="folder-upload"
            webkitdirectory="true"
            onChange={handleFolderSelect}
            style={{ display: 'none' }}
          />

          <select value={type} onChange={(e) => setType(e.target.value)} style={{
            backgroundColor: 'var(--site-bg-color)',
            color: 'var(--site-text-color)',
            border: '1px solid var(--site-outline-color)',
            borderRadius: '8px',
            padding: '10px 20px',
            // fontSize: '1rem',
            outlineColor: 'var(--site-outline-color)',
          }}>
            <option value="" disabled>-- Select a Type --</option>
            <option value="movies">Movies</option>
            <option value="series">Series</option>
            <option value="anime">Anime</option>
          </select>

          <button
            type="submit"
            disabled={isUploading}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid var(--site-outline-color)',
              backgroundColor: isUploading ? 'gray' : 'var(--site-bg-color)',
              color: isUploading ? '#aaa' : 'var(--site-text-color)',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              // fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = 'var(--nav-hover-color)';
                e.currentTarget.style.color = 'var(--nav-hoverText-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                e.currentTarget.style.backgroundColor = 'var(--site-bg-color)';
                e.currentTarget.style.color = 'var(--site-text-color)';
              }
            }}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        <h3>Preview</h3>
        {Object.entries(seriesData).map(([seriesKey, series]) => (
          <div key={seriesKey} style={{ marginTop: "20px" }}>
            <div onDoubleClick={() => handleRename(seriesKey, -1)}>
              {editingKey === seriesKey ? (
                <input
                  defaultValue={series.name}
                  onKeyDown={(e) => handleRenameSubmit(e, seriesKey, -1)}
                  style={{ color: 'var(--site-text-color)', backgroundColor: 'var(--site-bg-color)', border: '1px solid var(--site-outline-color)' }}
                  autoFocus
                />
              ) : (
                <h2>{series.name}</h2>
              )}
            </div>

            {Object.entries(series.seasons).map(([seasonKey, season]) => (
              <div key={seasonKey} style={{ 
                  border: "2px solid #ccc",
                  borderRadius: "10px",
                  padding: "10px",
                  marginBottom: "20px",
                  backgroundColor: "var(--nav-hover-color)",
                 }}
                >
                  <div >
                    {editingKey === `${seriesKey}-${seasonKey}` ? (
                      <input
                        defaultValue={season.name}
                        onKeyDown={(e) => handleRenameSubmit(e, seriesKey, Number(seasonKey))}
                        style={{ color: 'var(--site-text-color)', backgroundColor: 'var(--site-bg-color)', border: '1px solid var(--site-outline-color)' }}
                        autoFocus
                      />
                    ) : (
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: '40px 1fr 100px 100px 0.01fr',
                        alignItems: "center",
                        gap: '10px',
                      }}>
                        <input
                          type="checkbox"
                          checked={season.checked}
                          onChange={(e) =>
                            toggleSeason(seriesKey, parseInt(seasonKey), e.target.checked)
                          }
                        />
                        <span onDoubleClick={() => handleRename(seriesKey, Number(seasonKey))}>{season.name}</span>
                      </div>
                    )}
                  </div>

                <ul>
                  {season.episodes.map((episode, epIdx) => (
                    <li
                      key={epIdx}
                      style={{
                        border: "1px solid #ddd",
                        padding: "5px",
                        margin: "5px 0",
                        borderRadius: "6px",
                        backgroundColor: "var(--site-bg-color)",
                        display: "grid",
                        gridTemplateColumns: '40px 1fr 100px 100px 0.01fr',
                        alignItems: "center",
                        gap: '10px',
                        opacity: episode.checked ? 1 : 0.5
                      }}
                  >
                    <input
                      type="checkbox"
                      checked={episode.checked}
                      onChange={(e) =>
                        toggleEpisode(seriesKey, parseInt(seasonKey), epIdx, e.target.checked)
                      }
                    />

                    {editingKey === `${seriesKey}-${seasonKey}-${epIdx}` ? (
                      <input
                        defaultValue={episode.name}
                        onKeyDown={(e) => handleRenameSubmit(e, seriesKey, Number(seasonKey), epIdx)}
                        style={{ color: 'var(--site-text-color)', backgroundColor: 'var(--site-bg-color)', border: '1px solid var(--site-outline-color)' }}
                        autoFocus
                      />
                    ) : (
                      <span onDoubleClick={() => handleRename(seriesKey, Number(seasonKey), epIdx)}>{episode.name}</span>
                    )}

                    <span>{episode.size}</span>

                    <span>{episode.duration}</span>

                    <span style={{
                      fontSize: "12px",
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor: getStatusColor(episode.status ?? "waiting"),
                      color: "var(--site-text-color)",
                      marginLeft: "10px"
                    }}>
                      {episode.status}
                    </span>
                  </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
