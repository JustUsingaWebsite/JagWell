// src/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Connect to existing SQLite database (no schema, no seeding)
const dbPath = path.join(__dirname, '..', 'db', 'jagwell.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
    process.exit(1); // Exit if DB is missing or unreadable
  } else {
    console.log('✅ Connected to existing JagWell SQLite database');
  }
});

// Make DB available to routes if needed (optional)
app.set('db', db);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wellness', require('./routes/wellness'));
// app.use('/api/reports', require('./routes/reports'));

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all: redirect unknown routes to login
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 JagWell running on http://localhost:${PORT}`);
});