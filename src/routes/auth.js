// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();

const dbPath = path.join(__dirname, '..', '..', 'db', 'jagwell.db');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = new sqlite3.Database(dbPath);
  // ✅ Fetch the hashed password from the DB
  db.get(`SELECT U_ID, U_Username, U_Role, Password FROM USER WHERE U_Username = ?`, [username], (err, user) => {
    db.close(); // Always close the DB connection

    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Compare plaintext password with stored hash
    bcrypt.compare(password, user.Password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // ✅ Generate JWT token
      const token = jwt.sign(
        { id: user.U_ID, username: user.U_Username, role: user.U_Role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      res.json({ token, role: user.U_Role });
    });
  });
});

module.exports = router;