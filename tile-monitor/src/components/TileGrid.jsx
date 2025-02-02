import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const TileGrid = () => {
  const [tileHistory, setTileHistory] = useState([]);
  const [activeTile, setActiveTile] = useState(null);
  const [activePeriods, setActivePeriods] = useState([]);

  const fetchTileHistory = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/tile-history');
      const data = await response.json();

      if (data.length > 0) {
        setTileHistory(data);
        setActiveTile(data[data.length - 1].tile);
        processActivePeriods(data);
      } else {
        setTileHistory([]);
        setActiveTile(null);
      }
    } catch (error) {
      console.error('Error fetching tile history:', error);
    }
  };

  useEffect(() => {
    fetchTileHistory();
    const interval = setInterval(fetchTileHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  const processActivePeriods = (data) => {
    if (data.length === 0) {
      setActivePeriods([]);
      return;
    }

    let periods = [];
    let previousTimestamp = new Date(data[0].timestamp);
    let previousTile = data[0].tile;

    for (let i = 1; i < data.length; i++) {
      const currentTimestamp = new Date(data[i].timestamp);
      const currentTile = data[i].tile;

      periods.push({
        tile: previousTile,
        start: previousTimestamp,
        end: currentTimestamp,
      });

      previousTile = currentTile;
      previousTimestamp = currentTimestamp;
    }

    periods.push({
      tile: previousTile,
      start: previousTimestamp,
      end: new Date(),
    });

    setActivePeriods(periods);
  };

  const handleTileClick = async (tileNumber) => {
    try {
      setActiveTile(tileNumber);

      const response = await fetch('http://localhost:3001/api/log-tile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tile: tileNumber }),
      });

      if (!response.ok) {
        throw new Error('Failed to log tile click');
      }

      console.log(`Tile ${tileNumber} clicked and logged.`);
      fetchTileHistory();
    } catch (error) {
      console.error('Error clicking tile:', error);
    }
  };

  const chartData = {
    labels: activePeriods.map(entry => `${entry.start.toLocaleTimeString()} - ${entry.end.toLocaleTimeString()}`),
    datasets: [
      {
        label: `Tile Activation Durations`,
        data: activePeriods.map(entry => entry.tile),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.2)',
        stepped: true,
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Tile Activity Monitor</h1>

      <div className="grid grid-cols-10 gap-2">
        {Array.from({ length: 100 }, (_, i) => i + 1).map(number => (
          <button
            key={number}
            className={`aspect-square flex items-center justify-center text-sm font-medium border rounded transition-colors duration-300
              ${activeTile === number ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-100"}
            `}
            onClick={() => handleTileClick(number)}
          >
            {number}
          </button>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Tile Activation Timeline (Past 12 Hours)</h2>
        {activePeriods.length > 0 ? (
          <Line data={chartData} options={{ scales: { y: { beginAtZero: true, title: { display: true, text: "Tile Number" } } } }} />
        ) : (
          <p className="text-gray-500">No activations in the past 12 hours.</p>
        )}
      </div>
    </div>
  );
};

export default TileGrid;
