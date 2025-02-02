const express = require('express');
const fs = require('fs').promises;  // Use Promises API for safe file handling
const { createReadStream } = require('fs');
const { parse } = require('csv-parse');
const cors = require('cors');
const { exec } = require('child_process');
const app = express();

app.use(cors());
app.use(express.json());

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const TILE_LOG_FILE = 'tile_log.csv';

// Function to normalize timestamps
const normalizeTimestamp = (timestampStr) => {
  let timestamp = new Date(timestampStr);

  if (isNaN(timestamp.getTime())) {
    timestampStr = timestampStr.replace(" ", "T");
    timestamp = new Date(timestampStr + "Z");
  }

  return isNaN(timestamp.getTime()) ? null : timestamp;
};

// ✅ **Fix: Use `fs.promises.appendFile` to prevent race conditions**
app.post('/api/log-tile', async (req, res) => {
  const { tile } = req.body;
  if (!tile || isNaN(tile)) {
    return res.status(400).json({ error: 'Invalid tile number' });
  }

  const timestamp = new Date().toISOString();
  const logEntry = `${timestamp},${tile}\n`;

  console.log(`Logging tile ${tile} at ${timestamp}`);

  try {
    await fs.appendFile(TILE_LOG_FILE, logEntry, 'utf8');  // ✅ Ensures consistent file writing

    // ✅ Call Python script to send SMS/email notification
    exec(`python text.py ${tile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ error: 'Failed to trigger SMS function' });
      }
      console.log(`Python script output: ${stdout}`);
      res.json({ message: 'Tile logged and SMS sent', tile, timestamp });
    });
  } catch (err) {
    console.error('Error writing to CSV:', err);
    res.status(500).json({ error: 'Failed to log tile' });
  }
});

// ✅ **Fix: Use a Readable Stream to Read CSV History**
app.get('/api/tile-history', (req, res) => {
  const now = new Date();
  let tileHistory = [];

  createReadStream(TILE_LOG_FILE)
    .pipe(parse({ columns: false, trim: true }))
    .on('data', (row) => {
      if (row.length !== 2) return;

      const rawTimestamp = row[0].trim();
      const tileNumber = parseInt(row[1].trim());

      if (isNaN(tileNumber)) return;

      const timestamp = normalizeTimestamp(rawTimestamp);
      if (!timestamp) return;

      if (now - timestamp <= TWELVE_HOURS_MS) {
        tileHistory.push({ timestamp, tile: tileNumber });
      }
    })
    .on('end', () => {
      res.json(tileHistory);
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
      res.status(500).json({ error: error.message });
    });
});

// ✅ **Fix: Ensure `stats.csv` Reads Are Handled Properly**
app.get('/api/current-sum', async (req, res) => {
  const filePath = 'stats.csv';

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const firstLine = data.split('\n')[0].trim();

    // ✅ Ensure `currentSum` is always a number
    const currentSum = isNaN(parseInt(firstLine, 10)) ? 0 : parseInt(firstLine, 10);

    res.json({ currentSum });
  } catch (err) {
    console.error('Error reading stats.csv:', err);
    res.status(500).json({ error: 'Failed to read stats.csv' });
  }
});

const STATS_LONG_FILE = "statsLong.csv";

// ✅ **Fetch tiles that should turn red based on statsLong.csv**
let lastProcessedLine = 0; // ✅ Keeps track of the last read line to prevent reprocessing

const path = require("path");
let alertHistory = []; // ✅ Stores persistent alert history

// ✅ Load stored alert history from a file (if exists)
async function loadAlertHistory() {
  try {
    const data = await fs.readFile(ALERT_HISTORY_FILE, "utf8");
    alertHistory = JSON.parse(data);
    console.log("✅ Loaded alert history from file.");
  } catch (err) {
    console.log("ℹ No previous alert history found, starting fresh.");
    alertHistory = [];
  }
}

// ✅ Save alert history to a file for persistence
async function saveAlertHistory() {
  try {
    await fs.writeFile(ALERT_HISTORY_FILE, JSON.stringify(alertHistory, null, 2));
  } catch (err) {
    console.error("❌ Failed to save alert history:", err);
  }
}

app.get("/api/alert-history", async (req, res) => {
  try {
    const data = await fs.readFile(STATS_LONG_FILE, "utf8");
    const lines = data.trim().split("\n");

    console.log("🔄 Reading new lines from statsLong.csv...");

    let newLines = lines.slice(lastProcessedLine); // ✅ Only check new lines
    let newAlerts = [];

    newLines.forEach((line) => {
      const values = line.split(",");
      if (values.length >= 3) {
        let alertState = values[2].trim().replace(/^"|"$/g, ""); // ✅ Clean up alert state

        if (alertState === "1") {
          const timestamp = new Date().toISOString(); // ✅ Use a real timestamp

          // ✅ Prevent duplicate alerts
          if (!alertHistory.some((alert) => alert.time === timestamp)) {
            console.log(`🚨 New Alert detected at ${timestamp}`);
            newAlerts.push({ time: timestamp, tile: 1 });
          }
        }
      }
    });

    // ✅ Update last processed line count
    lastProcessedLine = lines.length;

    // ✅ Append new alerts and save history persistently
    if (newAlerts.length > 0) {
      alertHistory = [...alertHistory, ...newAlerts];
      await saveAlertHistory(); // ✅ Persist to file
    }

    res.json({ alertHistory });
  } catch (err) {
    console.error("❌ Error reading statsLong.csv:", err);
    res.status(500).json({ error: "Failed to read statsLong.csv" });
  }
});

// ✅ Load alert history at startup
loadAlertHistory();

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
