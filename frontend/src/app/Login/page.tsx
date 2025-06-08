"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "@/app/Components/utils/cookieUtils"; // Utility function for setting cookies
import { OwnApiConnection } from "@/app/Components/utils/OwnApiConnection";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [passwordKey, setPasswordKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async ({ username, passwordKey }) => {
    setIsLoading(true);
    setError("");
  
    try {
      const response = await fetch("/api/loginCheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password: passwordKey }),
      });
  
      if (!response.ok) {
        throw new Error(await response.text());
      }
  
      const data = await response.json();
      console.log(data.message);
  
      setCookie("authToken", username, { maxAge: 86400, path: "/" });
      router.push("/Dashboard");
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];

    if (file && file.type === "application/json") {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          const loginData = {
            username: json.username,
            passwordKey: json.password,
          };
          await handleLogin(loginData);
        } catch (error) {
          setError("Failed to parse JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      setError("Please drop a valid JSON file.");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-4 border-dashed border-gray-400 p-6 w-80 text-center mb-4"
      >
        Drag and drop a JSON file here
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleLogin({ username, passwordKey });
      }} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password Key"
          value={passwordKey}
          onChange={(e) => setPasswordKey(e.target.value)}
          className="p-2 border rounded"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="p-4 bg-BTBlue text-white rounded-lg shadow-lg hover:bg-BTBlue-dark"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <button
        onClick={() => router.push('/Register')}
        className="p-4 bg-gray-500 text-white rounded-lg shadow-lg hover:bg-gray-700"
      >
        Register
      </button>
    </div>
  );
}
