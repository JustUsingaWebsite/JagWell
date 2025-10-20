// scripts/create-user.js
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'jagwell.db');
const db = new sqlite3.Database(dbPath);

const username = 'borland';
const plainPassword = 'password123'; // ← what the user will type
const role = 'admin';

bcrypt.hash(plainPassword, 10, (err, hash) => {
  if (err) throw err;
  db.run(
    `INSERT INTO USER (U_Username, Password, U_Role) VALUES (?, ?, ?)`,
    [username, hash, role],
    function(err) {
      if (err) {
        console.error('Insert error:', err.message);
      } else {
        console.log('User created with ID:', this.lastID);
      }
      db.close();
    }
  );
});