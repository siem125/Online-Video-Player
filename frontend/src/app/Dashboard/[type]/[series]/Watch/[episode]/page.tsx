"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type EpisodeDetails = {
  title: string;
  description: string;
  videoPath: string;
};

export default function EpisodePage() {
  const params = useParams();
  const router = useRouter();
  const { type, series, season, episode } = params as {
    type: string;
    series: string;
    season: string;
    episode: string;
  };

  const [currentSeason, setCurrentSeason] = useState(season || "1");
  const [currentEpisode, setCurrentEpisode] = useState(episode || "1");
  const [details, setDetails] = useState<EpisodeDetails | null>(null);
  const [seasonList, setSeasonList] = useState<string[]>([]);
  const [episodeList, setEpisodeList] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  const extractEpisodeNumber = (episodeName: string): number => {
    const match = episodeName.match(/episode\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  };

  // Fetch episode details
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const fetchEpisodeDetails = async () => {
      try {
        const response = await fetch(
          `/api/videos/${type}/${series}/${currentSeason}/${currentEpisode}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDetails(data);

        if (videoRef.current) {
          videoRef.current.load();
          videoRef.current.play();
        }
      } catch (error) {
        console.error("Error fetching episode details:", error);
      }
    };

    fetchEpisodeDetails();
  }, [type, series, currentSeason, currentEpisode, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchSeasons = async () => {
      try {
        const response = await fetch(`/api/videos/${type}/${series}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSeasonList(data.sort((a: string, b: string) => +a - +b));
      } catch (error) {
        console.error("Error fetching seasons:", error);
      }
    };

    fetchSeasons();
  }, [type, series, isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const fetchEpisodes = async () => {
      try {
        const response = await fetch(`/api/videos/${type}/${series}/${currentSeason}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        const sortedData = data.sort((a: string, b: string) => {
            const episodeNumberA = extractEpisodeNumber(a);
            const episodeNumberB = extractEpisodeNumber(b);
            return episodeNumberA - episodeNumberB;
        });

        setEpisodeList(sortedData);
      } catch (error) {
        console.error("Error fetching episodes:", error);
      }
    };

    fetchEpisodes();
  }, [type, series, currentSeason, isMounted]);

  const goToNextEpisode = () => {
    const currentEpisodeIndex = episodeList.findIndex(
      (e) => e === currentEpisode
    );
    if (currentEpisodeIndex >= 0 && currentEpisodeIndex < episodeList.length - 1) {
      const nextEpisode = episodeList[currentEpisodeIndex + 1];
      setCurrentEpisode(nextEpisode);
      router.push(`/Dashboard/${type}/${series}/${currentSeason}/${nextEpisode}`);
    }
  };

  const goToPreviousEpisode = () => {
    const currentEpisodeIndex = episodeList.findIndex(
      (e) => e === currentEpisode
    );
    if (currentEpisodeIndex > 0) {
      const previousEpisode = episodeList[currentEpisodeIndex - 1];
      setCurrentEpisode(previousEpisode);
      router.push(`/Dashboard/${type}/${series}/${currentSeason}/${previousEpisode}`);
    }
  };

  if (!details) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ display: "flex" }}>
      <div style={{ flex: 3 }}>
        <h1>{details.title}</h1>
        <p>{details.description}</p>
        <video ref={videoRef} controls autoPlay width="100%">
          <source src={details.videoPath} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div>
          <button onClick={goToPreviousEpisode}>Previous Episode</button>
          <button onClick={goToNextEpisode}>Next Episode</button>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          marginLeft: "20px",
          padding: "10px",
          border: "1px solid #ccc",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        <h2>Seasons</h2>
        <ul>
          {seasonList.map((seasonName) => (
            <li
              key={seasonName}
              style={{
                fontWeight: currentSeason === seasonName ? "bold" : "normal",
              }}
            >
              <button
                onClick={() => {
                  setCurrentSeason(seasonName);
                  setCurrentEpisode("1");
                  router.push(`/Dashboard/${type}/${series}/${seasonName}/1`);
                }}
              >
                {seasonName}
              </button>
            </li>
          ))}
        </ul>
        <h3>Episodes</h3>
        <ul>
          {episodeList.map((episodeName) => (
            <li key={episodeName}>
              <Link
                href={`/Dashboard/${type}/${series}/${currentSeason}/${episodeName}`}
                style={{
                  fontWeight: currentEpisode === episodeName ? "bold" : "normal",
                }}
              >
                {episodeName}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
