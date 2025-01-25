const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

let painLogs = {
  "painLogs": []
};

app.get('/api/painLogs/:userId', (req, res) => {
  const userId = req.params.userId;
  const userLogs = painLogs.painLogs.filter(log => log.userId === userId);
  res.json(userLogs);
});

app.post('/api/painLogs', (req, res) => {
  const newLog = { ...req.body, _id: Date.now().toString() };
  painLogs.painLogs.push(newLog);
  res.json(newLog);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});