"use client";
import React, { useState } from 'react';

const VideoPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const handleUploadSubtitles = async () => {
    setIsLoading(true);
    setResponseMessage('');

    const subtitleData = {
      episodePath: '/videos/movies/Ace Attorney/1 - Season 1/1 - Episode 1/',
      subtitles: {
        language: 'en',
        subtitles: [
          { start: 0, end: 5, text: 'This is the subtitle text for the first scene' },
          { start: 5, end: 10, text: 'Here\'s some more dialogue in the next scene' },
        ]
      }
    };

    try {
      const response = await fetch('/api/upload-subtitles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subtitleData),
      });

      const data = await response.json();

      if (response.ok) {
        setResponseMessage('Subtitles uploaded successfully!');
      } else {
        setResponseMessage(`Error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setResponseMessage(`Request failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 'auto', textAlign: 'center' }}>
      {/* Video */}
      <div style={{ width: '60%', margin: '0 auto' }}>
        <video
          controls
          autoPlay
          width="100%"
          src="/videos/movies/Ace Attorney/1 - Season 1/1 - Episode 1/video.mp4"
          style={{
            display: 'block',
            width: '100%',
            zIndex: 1, // Video behind the title
            position: 'relative', // Required for z-index to work
          }}
        >
            <track label="English" kind="subtitles" src="/videos/movies/Ace Attorney/1 - Season 1/1 - Episode 1/subtitles_en.vtt" srcLang="en" />
        </video>
      </div>

      {/* Upload Subtitles Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={handleUploadSubtitles}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '1rem',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Uploading...' : 'Upload Subtitles'}
        </button>
        {responseMessage && (
          <p style={{ color: isLoading ? 'black' : 'green', marginTop: '10px' }}>{responseMessage}</p>
        )}
      </div>
    </div>
  );
};

export default VideoPage;
