// src/app/loading-test/page.tsx
"use client";
import { useState } from "react";
import Loading from "@/app/loading"; // Import your custom loading screen

const LoadingTest = () => {
    const [loading, setLoading] = useState(false);

    const handleButtonClick = async () => {
        setLoading(true); // Activate the loading screen
        // Simulate a delay (e.g., data fetch or API call)
        await new Promise((resolve) => setTimeout(resolve, 4000));
        //setLoading(false); // Stop the loading screen after delay
        //alert("Action Completed!"); // Replace this with your action logic
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {loading ? (
                <Loading />
            ) : (
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Click to Activate Loading</h1>
                    <button
                        onClick={handleButtonClick}
                        className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-700 transition"
                    >
                        Start Loading
                    </button>
                </div>
            )}
        </div>
    );
};

export default LoadingTest;
