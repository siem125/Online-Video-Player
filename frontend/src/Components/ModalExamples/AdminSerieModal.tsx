import { useEffect, useState } from "react";
import AdminSeasonComponent from "@/Components/AdminModal/AdminSeasonComponent";

interface Season {
  Number: number;
  Name: string;
  Episodes: Episode[];
}

interface Episode {
  Number: number;
  Name: string;
}

interface AdminSerieModalProps {
  selectedSeries: string;
  type: string;
  closeModal: () => void;
}

export default function AdminSerieModal({ selectedSeries, type, closeModal }: AdminSerieModalProps) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSeasons = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/videos/${type}/${selectedSeries}`);
        if (!response.ok) throw new Error("Failed to fetch series data");
        const data = await response.json();

        setSeasons(data.Seasons || []); // Store structured seasons
      } catch (error) {
        console.error("Error fetching seasons:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [selectedSeries, type]);


  const [draggedSeasonIndex, setDraggedSeasonIndex] = useState<number | null>(null);

  const handleSeasonDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSeasonIndex(index);
    e.dataTransfer.setData("drag-type", "season");
  };
  
  const handleSeasonDragOver = (e: React.DragEvent, hoverIndex: number) => {
    if(e.dataTransfer.getData("drag-type") !== "season") return;
    e.preventDefault();
  };
  
  const handleSeasonDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if(e.dataTransfer.getData("drag-type") !== "season") return;

    console.log("Season drop index: " + dropIndex + ", dragged: " + draggedSeasonIndex);

    if (draggedSeasonIndex === null || draggedSeasonIndex === dropIndex) return;
  
    const updatedSeasons = [...seasons];
    const [movedSeason] = updatedSeasons.splice(draggedSeasonIndex, 1);
    updatedSeasons.splice(dropIndex, 0, movedSeason);
  
    setSeasons(updatedSeasons);
    setDraggedSeasonIndex(null);
  };
  

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="p-6 w-full max-w-[90%]">
        <h2 className="text-2xl font-bold">{selectedSeries}</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="mt-4 overflow-auto max-h-[75vh]">
            <div className="flex gap-4 min-w-max">
              {seasons.map((season, index) => (
                <div
                  key={season.Number}
                  className="min-w-[300px] bg-white rounded border border-black"
                  draggable
                  onDragStart={(e) => handleSeasonDragStart(e, index)}
                  onDragOver={(e) => handleSeasonDragOver(e, index)}
                  onDrop={(e) => handleSeasonDrop(e, index)}
                >
                  <AdminSeasonComponent
                    seasonNumber={season.Number}
                    seasonName={season.Name}
                    selectedSeries={selectedSeries}
                    type={type}
                    episodes={season.Episodes}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
