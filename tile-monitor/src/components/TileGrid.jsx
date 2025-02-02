import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const TileGrid = () => {
  const [tileHistory, setTileHistory] = useState([]);
  const [activeTile, setActiveTile] = useState(null);
  const [activePeriods, setActivePeriods] = useState([]);
  const [currentSum, setCurrentSum] = useState(0);
  const [alertTimes, setAlertTimes] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);

  const fetchAlertHistory = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/alert-history");
      const data = await response.json();
      setAlertHistory(data.alertHistory);
    } catch (error) {
      console.error("Error fetching alert history:", error);
    }
  };

  useEffect(() => {
    fetchAlertHistory();
    const interval = setInterval(fetchAlertHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch alert tiles
  const fetchAlertTiles = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/alert-tiles");
      const data = await response.json();
      setAlertTimes(data.alertTimes.map(alert => parseInt(alert.tile))); // Store tile numbers as integers
    } catch (error) {
      console.error("Error fetching alert tiles:", error);
    }
  };

  useEffect(() => {
    fetchAlertTiles();
    const interval = setInterval(fetchAlertTiles, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch current sum
  const fetchCurrentSum = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/current-sum");
      const data = await response.json();
      if (data.currentSum !== undefined) {
        setCurrentSum(data.currentSum);
      } else {
        console.error("Invalid response structure:", data);
      }
    } catch (error) {
      console.error("Error fetching current sum:", error);
    }
  };

  useEffect(() => {
    fetchCurrentSum();
    const interval = setInterval(fetchCurrentSum, 1000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Fetch tile history
  const fetchTileHistory = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tile-history");
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
      console.error("Error fetching tile history:", error);
    }
  };

  useEffect(() => {
    fetchTileHistory();
    const interval = setInterval(fetchTileHistory, 3000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Process active periods
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

  // ✅ Handle tile clicks
  const handleTileClick = async (tileNumber) => {
    try {
      setActiveTile(tileNumber);
      const response = await fetch("http://localhost:3001/api/log-tile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tile: tileNumber }),
      });

      if (!response.ok) {
        throw new Error("Failed to log tile click");
      }

      console.log(`Tile ${tileNumber} clicked and logged.`);
      fetchTileHistory();
    } catch (error) {
      console.error("Error clicking tile:", error);
    }
  };

  // ✅ Chart Data
  const chartData = {
    labels: activePeriods.map(
      (entry) =>
        `${entry.start.toLocaleTimeString()} - ${entry.end.toLocaleTimeString()}`
    ),
    datasets: [
      {
        label: `Tile Activation Durations`,
        data: activePeriods.map((entry) => entry.tile),
        borderColor: "blue",
        backgroundColor: "rgba(0, 0, 255, 0.2)",
        stepped: true,
      },
    ],
  };

  // ✅ 3x3 Hexagon Layout
  const hexagonLayout = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-8">
      {/* ✅ Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">TileMate Display</h1>

      {/* ✅ Hexagonal Grid */}
      <div className="grid-container mb-12">
        {hexagonLayout.map((row, rowIndex) => (
          <div key={rowIndex} className="hex-row flex justify-center">
            {row.map((number) => (
              <button
                key={number}
                onClick={() => handleTileClick(number)}
                className={`hex-button ${
                  alertTimes.includes(number)
                    ? "hex-button-alert"
                    : activeTile === number
                    ? "hex-button-active"
                    : ""
                }`}
              >
                {number}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* ✅ Timeline Chart */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2 text-center">
          Tile Activation Timeline (Past 12 Hours)
        </h2>
        {activePeriods.length > 0 ? (
          <Line
            data={chartData}
            options={{
              scales: {
                y: { beginAtZero: true, title: { display: true, text: "Tile Number" } },
              },
            }}
          />
        ) : (
          <p className="text-gray-500 text-center">
            No activations in the past 12 hours.
          </p>
        )}
      </div>

      {/* ✅ Energy Bar */}
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg mt-6">
        <h2 className="text-lg font-semibold mb-2 text-center">
          Total Energy Generated (Past 12 Hours)
        </h2>
        <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${Math.min(currentSum / 10, 100)}%` }}
          />
        </div>

        <div className="text-center text-lg font-semibold text-gray-700">
          {currentSum.toFixed(2)}mV stored
        </div>
      </div>
            {/* ✅ Alert Table */}
            <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-2 text-center">
          Alert Activation History
        </h2>
        {alertHistory.length > 0 ? (
          <table className="w-full text-left border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-300 px-4 py-2">Time</th>
                <th className="border border-gray-300 px-4 py-2">Tile</th>
              </tr>
            </thead>
            <tbody>
              {alertHistory.map((alert, index) => (
                <tr key={index} className="border border-gray-300">
                  <td className="px-4 py-2">{alert.time}</td>
                  <td className="px-4 py-2">{alert.tile}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No alerts recorded.</p>
        )}
      </div>
    </div>
  );
};

export default TileGrid;
