import { useState } from "react";
import AdminEpisodeComponent from "./AdminEpisodeComponent";

interface Episode {
  Number: number;
  Name: string;
}

interface AdminSeasonComponentProps {
  selectedSeries: string;
  type: string;
  seasonNumber: number;
  seasonName: string;
  episodes: Episode[];
}

export default function AdminSeasonComponent({
  selectedSeries,
  type,
  seasonNumber,
  seasonName,
  episodes,
}: AdminSeasonComponentProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleEpisodeDragStart = (episode: Episode) => {
    // Optional logging
  };

  const handleEpisodeDragOver = (e: React.DragEvent, index: number) => {
    if (e.dataTransfer.getData("drag-type") !== "episode") return;
    e.preventDefault();
    setHoverIndex(index);
  };

  const handleEpisodeDrop = async (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const dragType = e.dataTransfer.getData("drag-type");
    if (dragType !== "episode") return;

    const fromSeason = parseInt(e.dataTransfer.getData("season-number"));
    const fromEpisode = parseInt(e.dataTransfer.getData("episode-number"));

    console.log("Drop episode:", { fromSeason, fromEpisode, toSeason: seasonNumber, toIndex: index });

    try {
      const response = await fetch(`/api/videos/${type}/${selectedSeries}/update-episode-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldSeasonNumber: fromSeason,
          oldEpisodeNumber: fromEpisode,
          newSeasonNumber: seasonNumber,
          newEpisodeIndex: index,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Episode move failed.");
      } else {
        console.log("Episode moved successfully.");
        // You may want to trigger parent refresh here
      }
    } catch (error) {
      console.error("Error updating episode:", error);
    }

    setHoverIndex(null);
  };

  const handleDragLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div className="p-2 rounded shadow h-[100%]">
      <div className="flex justify-between items-center cursor-pointer p-2 bg-gray-100 rounded">
        <span className="text-sm text-gray-800">{seasonNumber}</span>
        <span className="font-bold text-gray-800">{seasonName}</span>
        <span className="text-sm text-gray-500">{episodes.length} Episodes</span>
      </div>

      <div className="mt-2 h-[100%]">
        {episodes.map((episode, index) => (
          <div
            key={episode.Number}
            onDragOver={(e) => handleEpisodeDragOver(e, index)}
            onDrop={(e) => handleEpisodeDrop(e, index)}
            onDragLeave={handleDragLeave}
            className="relative"
          >
            {hoverIndex === index && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 opacity-50 z-10" />
            )}
            <AdminEpisodeComponent
              episodeNumber={episode.Number}
              episodeName={episode.Name}
              onDragStart={handleEpisodeDragStart}
              seasonNumber={seasonNumber}
            />
          </div>
        ))}

        {/* Allow dropping at the end of the list */}
        <div
          onDragOver={(e) => handleEpisodeDragOver(e, episodes.length)}
          onDrop={(e) => handleEpisodeDrop(e, episodes.length)}
          onDragLeave={handleDragLeave}
          className="relative h-6"
        >
          {hoverIndex === episodes.length && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 opacity-50 z-10" />
          )}
        </div>
      </div>
    </div>
  );
}
