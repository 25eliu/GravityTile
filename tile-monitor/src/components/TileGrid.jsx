// src/components/TileGrid.jsx
import React, { useState, useEffect } from 'react';

const TileGrid = () => {
  const [latestTile, setLatestTile] = useState(null);

  const fetchLatestTile = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/latest-tile');
      const data = await response.json();
      setLatestTile(data.tile); // Store only the most recent tile
    } catch (error) {
      console.error('Error fetching latest tile:', error);
    }
  };

  useEffect(() => {
    fetchLatestTile();
    const interval = setInterval(fetchLatestTile, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Tile Activity Monitor</h1>
      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(number => (
          <div
            key={number}
            className={`aspect-square flex items-center justify-center text-sm font-medium border rounded transition-colors duration-300
              ${latestTile === number 
                ? 'bg-blue-500 text-white' 
                : 'bg-white hover:bg-gray-100'}
            `}
          >
            {number}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TileGrid;
