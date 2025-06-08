"use client";
import React, { useRef, useState, useEffect } from "react";

type VideoPlayerProps = {
  dataPath: string;
  onVideoEnd?: () => void;
  onProgress?: (currentTime: number) => void;
};

type Skippoint = {
  starttime: number;
  endtime: number;
};

type DataJson = {
  series: string;
  season: string;
  episode: string;
  skippoints: Skippoint[];
  videoFileName: string;
  path: string;
  videoPath: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ dataPath, onVideoEnd, onProgress }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [data, setData] = useState<DataJson | null>(null);
  const [skipSkippoints, setSkipSkippoints] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  //retrieve video data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error("Failed to fetch data.json");
        const jsonData: DataJson = await response.json();
        setData(jsonData);
      } catch (error) {
        console.error("Error loading video data:", error);
      }
    };
    fetchData();
  }, [dataPath]);

  //current video time events(update time for user + skippoint handlings)
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!data || !videoRef.current) return;

      const currentTime = videoRef.current.currentTime;
      const tolerance = 0.1; // Tolerance for floating point accuracy issues

      if (onProgress) {
        onProgress(currentTime); // Send current time back to the parent component
      }

      if (skipSkippoints) {
        //console.log("Skippoints: " + skipSkippoints)
        for (const skippoint of data.skippoints) {
          if (
            currentTime >= skippoint.starttime &&
            currentTime <= skippoint.endtime - tolerance
          ) {
            videoRef.current.currentTime = skippoint.endtime;
          }
        }
      }
    };

    if (videoRef.current) {
      videoRef.current.addEventListener("timeupdate", handleTimeUpdate);
      return () => {
        videoRef.current?.removeEventListener("timeupdate", handleTimeUpdate);
      };
    }
  }, [data, skipSkippoints]);

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        videoRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  if (!data) return <p>Loading...</p>;

  const videoSrc = dataPath + "/video";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "auto",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Video */}
      <video
        ref={videoRef}
        controls
        autoPlay
        width="100%"
        src={videoSrc}
        onEnded={onVideoEnd}
        style={{
          display: "block",
          width: "100%",
          zIndex: 1,
          position: "relative",
        }}
      >
        {/* Subtitle Track (WebVTT) */}
        <track
          kind="subtitles"
          src={`/subtitles/subtitles_en.vtt`} // Adjust path based on your setup
          srcLang="en"
          label="English"
          default
        />
      </video>

      <label>
        <input
          type="checkbox"
          checked={skipSkippoints}
          onChange={() => setSkipSkippoints(!skipSkippoints)}
        />
        Enable Skippoints
      </label>
    </div>
  );
};

export default VideoPlayer;
