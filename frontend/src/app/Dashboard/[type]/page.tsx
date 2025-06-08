"use client";

import { useState, useEffect } from "react";
import SeriesCard from "@/app/Components/SeriesCard/SeriesCard";
import "@/styles/cards.css";
import { useModal } from "@/app/Components/Modal/ModalContext";
import { SerieModalContent } from "@/app/Components/ModalExamples/SerieModalContent";

export default function TypePage({ params }: { params: { type: string } }) {
  const [type, setType] = useState<string | null>(null);
  const [seriesList, setSeriesList] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null);
  const { openModal } = useModal();

  useEffect(() => {
    const fetchType = async () => {
      const resolvedParams = await Promise.resolve(params);
      setType(resolvedParams.type);

      if (resolvedParams.type) {
        try {
          const response = await fetch(`/api/videos/${resolvedParams.type}`);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const data = await response.json();
          setSeriesList(data);
        } catch (error) {
          console.error("Error fetching series list:", error);
        }
      }
    };
    fetchType();
  }, [params]);

  const handleOpenModal = (series: string) => {
    setSelectedSeries(series);
    openModal(() => <SerieModalContent selectedSeries={series} type={type!} />, { width: '80%', height: '80%'});
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">{type}</h1>
      <div className="flex flex-wrap gap-4">
        {seriesList.map((series, index) => (
          <SeriesCard
            key={index}
            type={type!}
            series={series}
            onCardClick={() => handleOpenModal(series)}  // Open modal for selected series
          />
        ))}
      </div>
    </div>
  );
}
