const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 8080; // Порт для backend

app.use(cors());
app.use(bodyParser.json());

app.post('/endpoint', (req, res) => {
  const roomId = req.body.roomId;
  // Возвращаем тестовые данные
  res.json({
    roomId: roomId,
    roomName: `Room ${roomId}`,
    capacity: Math.floor(Math.random() * 50) + 10,
    available: Math.random() > 0.5
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}/`);
});
