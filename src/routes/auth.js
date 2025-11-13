// src/routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const router = express.Router();

const dbPath = path.join(__dirname, '..', '..', 'db', 'jagwell.db');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const db = new sqlite3.Database(dbPath);
  db.get(`SELECT U_ID, U_Username, U_Role, Password FROM USER WHERE U_Username = ?`, [username], (err, user) => {
    db.close();
    if (err || !user) {
      console.log(err)
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    bcrypt.compare(password, user.Password, (compareErr, isMatch) => {
      if (compareErr || !isMatch) {
        console.log("invalid password hash: " + compareErr)
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.U_ID, username: user.U_Username, role: user.U_Role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // ✅ Send token in httpOnly cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in prod (HTTPS)
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      });

      // Send role so client can redirect
      res.json({ role: user.U_Role });
    });
  });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  // Clear cookie with SAME options as when it was set
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/' // important!
  });
  res.redirect('/login.html');
});

// GET /api/auth/me - Get current user's information
router.get('/me', require('../middleware/auth').authenticateToken, (req, res) => {
  // Return user information from the token
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role
  });
});

module.exports = router;