// test-server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Always serve login.html for any route (like Live Server)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📱 On mobile: http://<YOUR_IP>:${PORT}`);
});