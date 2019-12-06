const express = require('express');
const path = require('path');
const request = require('request');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
*/

app.get('/vote_status', (req, res) => {
    request(
        { url: 'http://144.91.84.150:1250/vote_status' },
        (error, response, body) => {
          if (error || response.statusCode !== 200) {
            return res.status(500).json({ type: 'error', message: err.message });
          }
          res.json(JSON.parse(body));
        }
      )
});

app.get('/vote_status/:adr', (req, res) => {
  let adr = req.params.adr;
  request(
    { url: `http://144.91.84.150:1250/vote_status/${adr}` },
    (error, response, body) => {
      if (error || response.statusCode !== 200) {
        return res.status(500).json({ type: 'error', message: err.message });
      }
      res.json(JSON.parse(body));
    }
  )
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));