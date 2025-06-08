"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SeriesPage({ params }: { params: { type: string; series: string } }) {
  const [type, setType] = useState<string | null>(null);
  const [series, setSeries] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeasons = async () => {
        const resolvedParams = await Promise.resolve(params);
        setType(resolvedParams.type);
        setSeries(resolvedParams.series);

        if (resolvedParams.type) {
            const fetchSeriesList = async () => {
              try {
                const response = await fetch(`/api/videos/${resolvedParams.type}/${resolvedParams.series}`);
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                setSeasons(data);
              } catch (error) {
                console.error("Error fetching series list:", error);
              }
            };
    
            fetchSeriesList();
        }
    };

    fetchSeasons();
  }, [params]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!seasons.length) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{series} - Seasons</h1>
      <ul>
        {seasons.map((season, index) => (
          <li key={index}>
            <Link href={`/Dashboard/${type}/${series}/${season}`}>{season}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
