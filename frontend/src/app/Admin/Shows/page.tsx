"use client";

import { ModalTypes, useModal } from "@/features/Providers/Modal/ModalContext";
import AdminSerieModal from "@/Components/ModalExamples/AdminSerieModal";
import { useState, useEffect } from "react";

interface Show {
  id: number;
  name: string;
}

export default function ShowsPage() {
  const [type, setType] = useState<string>("");
  const [shows, setShows] = useState<Show[]>([]);
  const { openModal } = useModal();

  // Fetch shows from API when type changes
  useEffect(() => {
    if (!type) return;
    const fetchShows = async () => {
      try {
        const response = await fetch(`/api/videos/${type}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data: string[] = await response.json();

        // Ensure the API returns an array of show names
        if (Array.isArray(data)) {
          setShows(data.map((name, index) => ({ id: index + 1, name })));
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Error fetching shows:", error);
      }
    };
    fetchShows();
  }, [type]);

  // Open edit modal
  const handleEdit = (series: string) => {
    openModal(
      () => <AdminSerieModal selectedSeries={series} type={type} closeModal={() => console.log("Closed")} />,
      { width: "95%", height: "95%", showCloseButton: true, rounded: false }
    );
  };

  // Delete show (local update only)
  const handleDelete = (name: string) => {
    if (confirm("Are you sure you want to delete this show?")) {
      setShows((prev) => prev.filter((show) => show.name !== name));
    }
  };

  return (
    <div className="p-6">
      <label htmlFor="typeSelect" className="block font-bold mb-2">
        Select Type:
      </label>
      <select
        id="typeSelect"
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="colorSchemer border p-2 rounded-md w-64"
      >
        <option value="" disabled>-- Select a Type --</option>
        <option value="movies">Movies</option>
        <option value="series">Series</option>
        <option value="anime">Anime</option>
      </select>

      {type && (
        <div className="mt-6 border rounded-lg overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="colorSchemer-mainContainer text-left">
                <th className="p-3 border">Number</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.id} className="border">
                  <td className="p-3 border">{show.id}</td>
                  <td className="p-3 border">{show.name}</td>
                  <td className="p-3 border flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(show.name)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(show.name)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
