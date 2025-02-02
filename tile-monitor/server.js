const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse');
const cors = require('cors');
const { exec } = require('child_process'); // To trigger Python script
const app = express();

app.use(cors());
app.use(express.json());

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

// Function to normalize timestamps
const normalizeTimestamp = (timestampStr) => {
  let timestamp = new Date(timestampStr);

  if (isNaN(timestamp.getTime())) {
    timestampStr = timestampStr.replace(" ", "T");
    timestamp = new Date(timestampStr + "Z");
  }

  return isNaN(timestamp.getTime()) ? null : timestamp;
};

// ✅ **Fix: Ensure Tile Clicks Are Logged in `tile_log.csv`**
app.post('/api/log-tile', (req, res) => {
  const { tile } = req.body;
  if (!tile || isNaN(tile)) {
    return res.status(400).json({ error: 'Invalid tile number' });
  }

  const timestamp = new Date().toISOString(); // Always use ISO format
  const logEntry = `${timestamp},${tile}\n`;

  console.log(`Logging tile ${tile} at ${timestamp}`);

  // ✅ Append the activation time and tile number to `tile_log.csv`
  fs.appendFile('tile_log.csv', logEntry, (err) => {
    if (err) {
      console.error('Error logging tile:', err);
      return res.status(500).json({ error: 'Failed to log tile' });
    }

    // ✅ Call the Python script to send SMS (optional)
    exec(`python text.py ${tile}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing Python script: ${error.message}`);
        return res.status(500).json({ error: 'Failed to trigger SMS function' });
      }
      console.log(`Python script output: ${stdout}`);
      res.json({ message: 'Tile logged and SMS sent', tile, timestamp });
    });
  });
});

// ✅ **Fix: Ensure the History is Read Correctly**
app.get('/api/tile-history', (req, res) => {
  const now = new Date();
  let tileHistory = [];

  fs.createReadStream('tile_log.csv')
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

// ✅ New Endpoint to Read First Line of stats.csv
app.get('/api/current-sum', (req, res) => {
  const filePath = 'stats.csv';

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading stats.csv:', err);
      return res.status(500).json({ error: 'Failed to read stats.csv' });
    }

    const firstLine = data.split('\n')[0].trim();
    const currentSum = parseInt(firstLine, 10) || 0;

    res.json({ currentSum });
  });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
