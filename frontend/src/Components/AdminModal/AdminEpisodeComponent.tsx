import { useState } from "react";

interface AdminEpisodeComponentProps {
  episodeNumber: number;
  episodeName: string;
  onDragStart: (episode: { Number: number; Name: string }) => void;
  seasonNumber: number;
}

export default function AdminEpisodeComponent({
  episodeNumber,
  episodeName,
  onDragStart,
  seasonNumber,
}: AdminEpisodeComponentProps) {


  return (
    <div
      className="border p-2 rounded bg-gray-50 mt-1 flex justify-between items-center cursor-move"
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData("drag-type", "episode");
        e.dataTransfer.setData("season-number", seasonNumber.toString());
        e.dataTransfer.setData("episode-number", episodeNumber.toString());

        onDragStart({ Number: episodeNumber, Name: episodeName });
      }}
    >
      <span className="text-sm text-gray-500">{episodeNumber}</span>
      <span className="text-gray-700">{episodeName}</span>
    </div>
  );
}
