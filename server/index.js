const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const ini = require('ini');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, '..', 'mappingfile.ini');
// Serve static files from the React app build
const CLIENT_DIST = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(CLIENT_DIST));

app.get('/api/mapping', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read file' });
    }
    res.type('text/plain').send(data);
  });
});

app.post('/api/mapping', (req, res) => {
  const text = req.body.text;
  if (typeof text !== 'string') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  fs.writeFile(DATA_FILE, text, 'utf8', err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to write file' });
    }
    res.json({ status: 'ok' });
  });
});

// All other routes serve the React app
app.use((req, res) => {
  res.sendFile(path.join(CLIENT_DIST, 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
