// src/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

//-----------------------------------------------------------------------------------------//
// Middleware //
app.use(helmet());
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form posts (if needed)
//-----------------------------------------------------------------------------------------//


//-----------------------------------------------------------------------------------------//
// Serve ONLY login page publicly //
app.use(express.static(path.join(__dirname, '..', '..', 'public')));
//-----------------------------------------------------------------------------------------//


//-----------------------------------------------------------------------------------------//
// Connect to DB //
const dbPath = path.join(__dirname, '..',  '..', 'db', 'jagwell.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Connected to JagWell SQLite database');
  }
});
app.set('db', db);
//-----------------------------------------------------------------------------------------//


//-----------------------------------------------------------------------------------------//
// Import middleware //
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
//-----------------------------------------------------------------------------------------//


//-----------------------------------------------------------------------------------------//
// Page Routes — modularized by role //
require('./API-Routes/api-page-routes')(app, authenticateToken, authorizeRoles, path)
require('./Student-Routes/student-page-routes')(app, authenticateToken, authorizeRoles, path);
require('./Doctor-Routes/doctor-page.routes')(app, authenticateToken, authorizeRoles, path);
require('./Admin-Routes/admin-page-routes')(app, authenticateToken, authorizeRoles, path);

//-----------------------------------------------------------------------------------------//
// API Routes — admin-specific //
app.use('/api/admin', authenticateToken, require('../routes/admin'));
//-----------------------------------------------------------------------------------------//


//-----------------------------------------------------------------------------------------//
// Redirect root to login //
app.get('/', (req, res) => {
  res.redirect('login.html');
});

// Catch-all: redirect to login //
app.use((req, res) => {
  res.redirect('login.html');
});
//-----------------------------------------------------------------------------------------//


const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // ← Accept connections from any IP
app.listen(PORT, HOST, () => {
  console.log(`🚀 JagWell running on http://localhost:${PORT}`);
});

module.exports = app