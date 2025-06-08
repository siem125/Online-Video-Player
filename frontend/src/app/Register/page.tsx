// pages/Register/page.tsx
'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { OwnApiConnection } from "../Components/utils/OwnApiConnection";

export default function Register() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setDownloadMessage("");
  
    try {
      const response = await fetch("/api/createAccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      const data = await response.json();
  
      // Create a downloadable JSON file
      const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}.json`;
      a.click();
  
      setDownloadMessage("Profile downloaded successfully! Use the file to log in.");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1 className="text-2xl mb-4">Register</h1>
      <form onSubmit={handleRegister} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          style={{color: "black"}}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded"
          required
        />

        {error && <p className="text-red-500">{error}</p>}
        {downloadMessage && <p className="text-green-500">{downloadMessage}</p>}

        <button
          type="submit"
          className="p-4 bg-BTBlue text-white rounded-lg shadow-lg hover:bg-BTBlue-dark"
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <button
        onClick={() => router.push('/')}
        className="mt-4 p-4 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-700"
      >
        Back to Login
      </button>
    </div>
  );
}
