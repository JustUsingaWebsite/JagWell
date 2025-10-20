// src/routes/wellness.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const dbPath = path.join(__dirname, '..', '..', 'db', 'jagwell.db');

// Student logs wellness data
router.post('/', authenticateToken, (req, res) => {
  if (req.user.role !== 'Student') {
    return res.status(403).json({ error: 'Only students can log wellness data' });
  }

  const { Heart_Rate, Temperature, Sleep_Hours, Study_Hours, Exercise_Minutes, Mood, Complaint } = req.body;
  const P_ID = req.user.id; // Simplified: assume U_ID = P_ID

  const db = new sqlite3.Database(dbPath);
  const stmt = db.prepare(`
    INSERT INTO WELLNESS_RECORD (P_ID, Heart_Rate, Temperature, Sleep_Hours, Study_Hours, Exercise_Minutes, Mood, Complaint)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run([P_ID, Heart_Rate, Temperature, Sleep_Hours, Study_Hours, Exercise_Minutes, Mood, Complaint], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Wellness data logged', recordId: this.lastID });
    }
  });
  db.close();
});

module.exports = router;