const express = require('express');
const fs = require('fs');
const { parse } = require('csv-parse');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/latest-tile', (req, res) => {
  let latestTile = null;

  console.log('Reading tile_log.csv...');

  fs.createReadStream('tile_log.csv')
    .pipe(parse({ columns: true }))
    .on('data', (row) => {
      latestTile = parseInt(row.Tile); // Keep updating to get the last tile
    })
    .on('end', () => {
      console.log('Most recent tile:', latestTile);
      res.json({ tile: latestTile });
    })
    .on('error', (error) => {
      console.error('Error reading CSV:', error);
      res.status(500).json({ error: error.message });
    });
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
