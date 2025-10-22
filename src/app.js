// src/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form posts (if needed)

// Serve ONLY login page publicly
app.use(express.static(path.join(__dirname, '..', 'public')));

// Connect to DB
const dbPath = path.join(__dirname, '..', 'db', 'jagwell.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to JagWell SQLite database');
  }
});
app.set('db', db);

// Import middleware
const { authenticateToken, authorizeRoles } = require('./middleware/auth');

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wellness', authenticateToken, require('./routes/wellness'));

// 🔐 PROTECTED DASHBOARD ROUTES
app.get('/admin-dashboard', authenticateToken, authorizeRoles('Admin'), (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin-dashboard.html'));
});

app.get('/doctor-dashboard', authenticateToken, authorizeRoles('Doctor'), (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'doctor-dashboard.html'));
});

app.get('/student-dashboard', authenticateToken, authorizeRoles('Student'), (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'student-dashboard.html'));
});

// Redirect root to login
app.get('/', (req, res) => {
  res.redirect('login.html');
});

// Catch-all: redirect to login
app.use((req, res) => {
  res.redirect('login.html');
});


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ← Accept connections from any IP
app.listen(PORT, HOST, () => {
  console.log(`🚀 JagWell running on http://localhost:${PORT}`);
});