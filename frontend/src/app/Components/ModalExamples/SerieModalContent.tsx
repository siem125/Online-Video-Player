// @/app/Components/ModalExamples/SerieModalContent.tsx
import React, { useState, useEffect } from "react";
import EpisodeListItem from "@/app/Components/EpisodeListItem/EpisodeListItem";

interface SerieModalContentProps {
  selectedSeries: string;
  type: string;
}

export function SerieModalContent({ selectedSeries, type }: SerieModalContentProps) {
  const [seasons, setSeasons] = useState<[number, string][]>([]);
  const [selectedSeason, setSelectedSeason] = useState<[number, string] | null>(null);
  const [episodes, setEpisodes] = useState<[number, string][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/videos/${type}/${selectedSeries}`);
        if (!response.ok) throw new Error("Failed to fetch seasons");
        const data = await response.json();
        const seasonList: [number, string][] = data.seasons.map(
          (season: { number: number; name: string }) => [season.number, season.name]
        );
        setSeasons(seasonList);

        // ✅ Auto-select season 0 if available
        setSelectedSeason(seasonList[0])

      } catch (error) {
        console.error("Error fetching seasons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [selectedSeries, type]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/videos/${type}/${selectedSeries}/${selectedSeason[0]}`);
        if (!response.ok) throw new Error("Failed to fetch episodes");
        const data = await response.json();
        setEpisodes(data);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, [selectedSeason, selectedSeries, type]);

  return (
    <div className="rounded-lg max-h-full w-full max-w-full">
      <h2 className="text-2xl font-bold mb-4">{selectedSeries}</h2>

      {loading && !seasons.length ? (
        <p>Loading seasons...</p>
      ) : (
        <>
          <label className="block text-lg font-semibold mb-2">Select a Season:</label>
          <select
            className="p-2 border rounded w-full"
            style={{ color: 'var(--nav-text-color)', backgroundColor: 'var(--nav-bg-color)' }}
            onChange={(e) => {
              const selectedIndex = parseInt(e.target.value);
              setSelectedSeason(seasons.find(([num]) => num === selectedIndex) || null);
            }}
            value={selectedSeason ? selectedSeason[0] : ""}
          >
            <option value="" disabled>
              Select a Season
            </option>
            {seasons.map(([num, name]) => (
              <option key={num} value={num}>
                {name}
              </option>
            ))}
          </select>
        </>
      )}

      {selectedSeason && (
        <div className="">
          <h3 className="text-xl font-semibold mt-4">{selectedSeason[1]} Episodes:</h3>
          {episodes.length > 0 ? (
            <div className="rounded-lg max-h-[50vh] h-[50vh] w-full max-w-full overflow-y-auto p-6 flex flex-col gap-y-2 border border-[var(--site-outline-color)]">
              {episodes.map(([num, name]) => (
                <EpisodeListItem
                  key={num}
                  type={type}
                  name={name}
                  series={selectedSeries}
                  season={selectedSeason[0]}
                  episode={num}
                  isActive={false}
                />
              ))}
            </div>
          ) : (
            <p>No episodes available.</p>
          )}
        </div>
      )}
    </div>
  );
}
