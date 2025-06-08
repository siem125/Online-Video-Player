"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import VideoPlayer from "@/app/Components/VideoPlayer";
import { getCookie } from "@/app/Components/utils/cookieUtils";
import EpisodeListItem from "@/app/Components/EpisodeListItem/EpisodeListItem";

type EpisodeDetails = {
  skippoints: { startTime: number; endTime: number }[];
  videoFileName: string;
  name: string;
  description: string;
};

type SplitDetails = [number, string];

export default function EpisodePage() {
  const params = useParams();

  //from url path
  const { type, series } = params as {
    type: string;
    series: string;
  };

  const [details, setDetails] = useState<EpisodeDetails | null>(null);
  const [seasonList, setSeasonList] = useState<SplitDetails[]>([]);
  const [episodeList, setEpisodeList] = useState<SplitDetails[]>([]);
  const [currentSeason, setCurrentSeason] = useState<SplitDetails | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<SplitDetails | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const username = getCookie("authToken");

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`/users/${username}.json`);
      const profileData = await response.json();
      const currentEpisode = profileData.toWatch?.find((ep: any) => ep.serie === series);
      if (currentEpisode) {
        setCurrentSeason([currentEpisode.season, ""]);
        setCurrentEpisode([currentEpisode.episode, ""]);
        setCurrentTime(currentEpisode.time);
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
    }
  };

  const updateProfileData = async () => {
    const profileUpdate = {
      serie: series,
      season: currentSeason?.[0] || 1,
      episode: currentEpisode?.[0] || 1,
      time: currentTime
    };
    try {
      await fetch(`/api/updateProfile`, {
        method: "POST",
        body: JSON.stringify({ username, update: profileUpdate }),
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  //Get the season and episode (if setted)
  useEffect(() => {
    const manualSeason = sessionStorage.getItem("manualSeason");
    const manualEpisode = sessionStorage.getItem("manualEpisode");

    if (manualSeason && manualEpisode) {
      setCurrentSeason([parseInt(manualSeason), ""]);
      setCurrentEpisode([parseInt(manualEpisode), ""]);
      sessionStorage.removeItem("manualSeason");
      sessionStorage.removeItem("manualEpisode");
    } else {
      fetchProfileData();
    }
  }, []);

  //updates the progress in the show for this user
  useEffect(() => {
    updateProfileData();
  }, [currentSeason, currentEpisode, currentTime]);

  //get all the seasons for this series
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await fetch(`/api/videos/${type}/${series}`);
        const data = await response.json();

        const formattedData = data.seasons.map((season: any) => [
          season.number,
          season.name
        ]);

        setSeasonList(formattedData);
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };
    fetchSeasons();
  }, [type, series]);

  //get the episodes for the current season
  useEffect(() => {
    if (currentSeason) {
      const fetchEpisodes = async () => {
        try {
          const response = await fetch(`/api/videos/${type}/${series}/${currentSeason[0]}`);
          const data = await response.json();
          const formattedData = data.map(([num, name]: [string, string]) => [parseInt(num), name]);
          setEpisodeList(formattedData);
        } catch (error) {
          console.error("Error fetching episodes:", error);
        }
      };
      fetchEpisodes();
    }
  }, [type, series, currentSeason]);

  //get the current episode data
  useEffect(() => {
    if (currentSeason && currentEpisode) {
      const fetchEpisodeDetails = async () => {
        try {
          const response = await fetch(
            `/api/videos/${type}/${series}/${currentSeason[0]}/${currentEpisode[0]}`
          );
          const data: EpisodeDetails = await response.json();
          setDetails(data);
        } catch (error) {
          console.error("Error fetching episode details:", error);
        }
      };
      fetchEpisodeDetails();
    }
  }, [type, series, currentSeason, currentEpisode]);

  const handleVideoProgress = (time: number) => {
    setCurrentTime(time);
  };

  const handleNextEpisode = () => {
    const currentIndex = episodeList.findIndex(([num]) => num === currentEpisode?.[0]);
    if (currentIndex !== -1 && currentIndex < episodeList.length - 1) {
      setCurrentEpisode(episodeList[currentIndex + 1]);
      setCurrentTime(0);
    } else {
      const nextSeasonIndex = seasonList.findIndex(([num]) => num === currentSeason?.[0]);
      if (nextSeasonIndex !== -1 && nextSeasonIndex < seasonList.length - 1) {
        const nextSeason = seasonList[nextSeasonIndex + 1];
        setCurrentSeason(nextSeason);
        setCurrentEpisode(episodeList[0]); // Starts from the first episode of the next season
        setCurrentTime(0);
      }
    }

    updateProfileData();
  };

  if (!details) {
    return <p>Loading video...</p>;
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 3 }}>
        <h1 className="text-3xl font-bold mb-4">{details.name}</h1>
        <VideoPlayer
          dataPath={`/api/videos/${type}/${series}/${currentSeason?.[0]}/${currentEpisode?.[0]}`}
          onVideoEnd={handleNextEpisode}
          onProgress={handleVideoProgress}
          initialTime={currentTime}
        />
        <h2 className="text-xl font-semibold text-gray-500 mb-6">{details.description}</h2>
      </div>

      <div style={{ flex: 1, marginLeft: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h2>Seasons</h2>
        <select
          value={currentSeason?.[0] || 0}
          style={{
            backgroundColor: 'var(--site-bg-color)',
            color: 'var(--site-text-color)',
            border: '1px solid var(--site-outline-color)',
            borderRadius: '8px',
            padding: '10px 20px',
            // fontSize: '1rem',
            outlineColor: 'var(--site-outline-color)',
          }}
          onChange={(e) => {
            const selectedNumber = parseInt(e.target.value);
            const selectedSeason = seasonList.find(([number]) => number === selectedNumber);
            if (selectedSeason) setCurrentSeason(selectedSeason);
          }}
        >
          <option value="" disabled>Select a season</option>
          {seasonList.map(([number, name]) => (
            <option key={number} value={number}>
              {`${number} - ${name}`}
            </option>
          ))}
        </select>

        <h3>Episodes</h3>
        <div className="rounded-lg max-h-[60vh] h-[60vh] overflow-y-auto flex flex-col gap-y-2">
          {episodeList.map(([number, name]) => (
            <EpisodeListItem
              key={number}
              type={type}
              name={name}
              series={series}
              season={currentSeason?.[0] ?? 0}
              episode={number}
              isActive={currentEpisode?.[0] === number}
              onClick={() => setCurrentEpisode([number, name])}
          />
          ))}
        </div>
      </div>
    </div>
  );
}
