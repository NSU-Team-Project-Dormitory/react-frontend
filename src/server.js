const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

const rooms = [
    { id: 'm103', name: 'Room m103', capacity: 1, available: true },
    { id: 'b103', name: 'Room b103', capacity: 3, available: false },
    { id: 'b107', name: 'Room b107', capacity: 3, available: true },
];

app.get('/rooms', (req, res) => {
  res.json(rooms);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}/`);
});
