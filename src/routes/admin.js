// src/routes/admin.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const dbPath = path.join(__dirname, '..', '..', 'db', 'jagwell.db');

// Middleware to ensure only admins can access these endpoints
function adminOnly(req, res, next) {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: admin role required' });
    }
    next();
}

// GET /api/admin/users - Get all users
router.get('/users', authenticateToken, adminOnly, (req, res) => {
    const db = new sqlite3.Database(dbPath);

    const query = `
        SELECT U_ID, U_Username, U_Role, U_FirstName, U_LastName, U_Email
        FROM USER
        ORDER BY U_Username
    `;

    db.all(query, [], (err, users) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        res.json({ users });

        db.close();
    });
});

// GET /api/admin/users/:id - Get a single user by ID
router.get('/users/:id', authenticateToken, adminOnly, (req, res) => {
    const userId = parseInt(req.params.id);

    // Validate user ID
    if (!userId || userId <= 0) {
        return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const db = new sqlite3.Database(dbPath);

    const query = `
        SELECT U_ID, U_Username, U_Role, U_FirstName, U_LastName, U_Email
        FROM USER
        WHERE U_ID = ?
    `;

    db.get(query, [userId], (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            db.close();
            return;
        }

        res.json({ user });

        db.close();
    });
});

// POST /api/admin/users - Create new user
router.post('/users', authenticateToken, adminOnly, async (req, res) => {
    const { username, password, role, firstName, lastName, email } = req.body;

    // Validation
    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Username, password, and role are required' });
    }

    if (!['Admin', 'Doctor', 'Student'].includes(role)) {
        return res.status(400).json({ error: 'Role must be Admin, Doctor, or Student' });
    }

    const db = new sqlite3.Database(dbPath);

    // Check if username already exists
    db.get('SELECT U_ID FROM USER WHERE U_Username = ?', [username], async (err, existingUser) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (existingUser) {
            res.status(409).json({ error: 'Username already exists' });
            db.close();
            return;
        }

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create user
            const query = `
                INSERT INTO USER (U_Username, Password, U_Role, U_FirstName, U_LastName, U_Email)
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.run(query, [username, hashedPassword, role, firstName || null, lastName || null, email || null], function(err) {
                if (err) {
                    console.error('Database error:', err.message);
                    res.status(500).json({ error: 'Database error' });
                    db.close();
                    return;
                }

                res.json({
                    message: 'User created successfully',
                    userId: this.lastID
                });

                db.close();
            });
        } catch (hashErr) {
            console.error('Password hashing error:', hashErr.message);
            res.status(500).json({ error: 'Password hashing error' });
            db.close();
        }
    });
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', authenticateToken, adminOnly, (req, res) => {
    const userId = parseInt(req.params.id);
    const { username, role, firstName, lastName, email } = req.body;

    // Validate user ID
    if (!userId || userId <= 0) {
        return res.status(400).json({ error: 'Valid user ID is required' });
    }

    // Validate role if provided
    if (role && !['Admin', 'Doctor', 'Student'].includes(role)) {
        return res.status(400).json({ error: 'Role must be Admin, Doctor, or Student' });
    }

    const db = new sqlite3.Database(dbPath);

    // Build update query dynamically based on provided fields
    let query = 'UPDATE USER SET ';
    const params = [];
    const updates = [];

    if (username) {
        updates.push('U_Username = ?');
        params.push(username);
    }
    if (role) {
        updates.push('U_Role = ?');
        params.push(role);
    }
    if (firstName !== undefined) {
        updates.push('U_FirstName = ?');
        params.push(firstName || null);
    }
    if (lastName !== undefined) {
        updates.push('U_LastName = ?');
        params.push(lastName || null);
    }
    if (email !== undefined) {
        updates.push('U_Email = ?');
        params.push(email || null);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: 'At least one field must be provided for update' });
        db.close();
        return;
    }

    query += updates.join(', ') + ' WHERE U_ID = ?';
    params.push(userId);

    db.run(query, params, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'User not found' });
            db.close();
            return;
        }

        res.json({ message: 'User updated successfully' });

        db.close();
    });
});

// DELETE /api/admin/users/:id - Delete user and reassign records to system user (ID 0)
router.delete('/users/:id', authenticateToken, adminOnly, (req, res) => {
    const userId = parseInt(req.params.id);

    // Validate user ID
    if (!userId || userId <= 0) {
        return res.status(400).json({ error: 'Valid user ID is required' });
    }

    // Don't allow deletion of the system user (ID 0) or the current admin
    if (userId === 0 || userId === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete system user or current user' });
    }

    const db = new sqlite3.Database(dbPath);

    // Check if user exists
    db.get('SELECT U_ID FROM USER WHERE U_ID = ?', [userId], (err, user) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            db.close();
            return;
        }

        // Begin transaction to ensure data consistency
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');

            // First, reassign all wellness records from this user to system user (ID 0)
            const updateRecordsQuery = 'UPDATE WELLNESS_RECORD SET U_ID = 0 WHERE U_ID = ?';
            
            db.run(updateRecordsQuery, [userId], function(err) {
                if (err) {
                    console.error('Error reassigning records:', err.message);
                    db.run('ROLLBACK');
                    res.status(500).json({ error: 'Database error while reassigning records' });
                    db.close();
                    return;
                }

                // Now delete the user
                const deleteUserQuery = 'DELETE FROM USER WHERE U_ID = ?';
                
                db.run(deleteUserQuery, [userId], function(err) {
                    if (err) {
                        console.error('Error deleting user:', err.message);
                        db.run('ROLLBACK');
                        res.status(500).json({ error: 'Database error while deleting user' });
                        db.close();
                        return;
                    }

                    if (this.changes === 0) {
                        db.run('ROLLBACK');
                        res.status(404).json({ error: 'User not found' });
                        db.close();
                        return;
                    }

                    // Commit transaction
                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('Error committing transaction:', err.message);
                            db.run('ROLLBACK');
                            res.status(500).json({ error: 'Database error during transaction commit' });
                            db.close();
                            return;
                        }

                        res.json({ message: 'User deleted successfully and records reassigned to system user' });
                        db.close();
                    });
                });
            });
        });
    });
});

// PUT /api/admin/patients/:id - Update patient information (excluding ID)
router.put('/patients/:id', authenticateToken, adminOnly, (req, res) => {
    const patientId = parseInt(req.params.id);
    const { studentId, name, age, dob, sex, ethnicity, phone, bloodType, status } = req.body;

    // Validate patient ID
    if (!patientId || patientId <= 0) {
        return res.status(400).json({ error: 'Valid patient ID is required' });
    }

    // Validate status if provided
    if (status && !['Student', 'Staff'].includes(status)) {
        return res.status(400).json({ error: 'Status must be Student or Staff' });
    }

    const db = new sqlite3.Database(dbPath);

    // Build update query dynamically based on provided fields
    let query = 'UPDATE PATIENT SET ';
    const params = [];
    const updates = [];

    if (studentId !== undefined) {
        updates.push('P_StudentId = ?');
        params.push(studentId || null);
    }
    if (name) {
        updates.push('P_Name = ?');
        params.push(name);
    }
    if (age !== undefined) {
        updates.push('P_Age = ?');
        params.push(age || null);
    }
    if (dob) {
        updates.push('P_DOB = ?');
        params.push(dob);
    }
    if (sex) {
        updates.push('P_Sex = ?');
        params.push(sex);
    }
    if (ethnicity) {
        updates.push('P_Ethnicity = ?');
        params.push(ethnicity);
    }
    if (phone) {
        updates.push('P_Phone = ?');
        params.push(phone);
    }
    if (bloodType) {
        updates.push('P_BloodType = ?');
        params.push(bloodType);
    }
    if (status) {
        updates.push('P_Status = ?');
        params.push(status);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: 'At least one field must be provided for update' });
        db.close();
        return;
    }

    query += updates.join(', ') + ' WHERE P_ID = ?';
    params.push(patientId);

    db.run(query, params, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Patient not found' });
            db.close();
            return;
        }

        res.json({ message: 'Patient updated successfully' });

        db.close();
    });
});

// PUT /api/admin/wellness/:id - Update wellness record (excluding key IDs)
router.put('/wellness/:id', authenticateToken, adminOnly, (req, res) => {
    const recordId = parseInt(req.params.id);
    const {
        date, sleepHours, studyHours, exerciseMinutes, mood, 
        heartRate, temperature, pulse, complaint, followUpDate, 
        referralTo, programCode, comments
    } = req.body;

    // Validate record ID
    if (!recordId || recordId <= 0) {
        return res.status(400).json({ error: 'Valid record ID is required' });
    }

    const db = new sqlite3.Database(dbPath);

    // Build update query dynamically based on provided fields
    let query = 'UPDATE WELLNESS_RECORD SET ';
    const params = [];
    const updates = [];

    if (date) {
        updates.push('Record_Date = ?');
        params.push(date);
    }
    if (sleepHours !== undefined) {
        updates.push('Sleep_Hours = ?');
        params.push(sleepHours || null);
    }
    if (studyHours !== undefined) {
        updates.push('Study_Hours = ?');
        params.push(studyHours || null);
    }
    if (exerciseMinutes !== undefined) {
        updates.push('Exercise_Minutes = ?');
        params.push(exerciseMinutes || null);
    }
    if (mood) {
        updates.push('Mood = ?');
        params.push(mood);
    }
    if (heartRate !== undefined) {
        updates.push('Heart_Rate = ?');
        params.push(heartRate || null);
    }
    if (temperature !== undefined) {
        updates.push('Temperature = ?');
        params.push(temperature || null);
    }
    if (pulse !== undefined) {
        updates.push('Pulse = ?');
        params.push(pulse || null);
    }
    if (complaint) {
        updates.push('Complaint = ?');
        params.push(complaint);
    }
    if (followUpDate) {
        updates.push('Follow_Up_Date = ?');
        params.push(followUpDate);
    }
    if (referralTo) {
        updates.push('Referral_To = ?');
        params.push(referralTo);
    }
    if (programCode) {
        updates.push('Program_Code = ?');
        params.push(programCode);
    }
    if (comments) {
        updates.push('Comments = ?');
        params.push(comments);
    }

    if (updates.length === 0) {
        res.status(400).json({ error: 'At least one field must be provided for update' });
        db.close();
        return;
    }

    query += updates.join(', ') + ' WHERE Record_ID = ?';
    params.push(recordId);

    db.run(query, params, function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Wellness record not found' });
            db.close();
            return;
        }

        res.json({ message: 'Wellness record updated successfully' });

        db.close();
    });
});

// PUT /api/admin/treatments/:id - Update treatment description
router.put('/treatments/:id', authenticateToken, adminOnly, (req, res) => {
    const treatmentId = parseInt(req.params.id);
    const { description } = req.body;

    // Validate treatment ID
    if (!treatmentId || treatmentId <= 0) {
        return res.status(400).json({ error: 'Valid treatment ID is required' });
    }

    // Description is required
    if (!description) {
        return res.status(400).json({ error: 'Treatment description is required' });
    }

    const db = new sqlite3.Database(dbPath);

    const query = 'UPDATE TREATMENT SET T_Description = ? WHERE T_ID = ?';

    db.run(query, [description, treatmentId], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Treatment not found' });
            db.close();
            return;
        }

        res.json({ message: 'Treatment updated successfully' });

        db.close();
    });
});

// DELETE /api/admin/treatments/:id - Delete treatment only if not referenced in RECORD_TREATMENT
router.delete('/treatments/:id', authenticateToken, adminOnly, (req, res) => {
    const treatmentId = parseInt(req.params.id);

    // Validate treatment ID
    if (!treatmentId || treatmentId <= 0) {
        return res.status(400).json({ error: 'Valid treatment ID is required' });
    }

    const db = new sqlite3.Database(dbPath);

    // Check if treatment is referenced in RECORD_TREATMENT table
    db.get('SELECT COUNT(*) as count FROM RECORD_TREATMENT WHERE T_ID = ?', [treatmentId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (result.count > 0) {
            res.status(400).json({ error: 'Cannot delete treatment: it is referenced in one or more wellness records' });
            db.close();
            return;
        }

        // Treatment is not referenced, safe to delete
        const query = 'DELETE FROM TREATMENT WHERE T_ID = ?';

        db.run(query, [treatmentId], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Database error' });
                db.close();
                return;
            }

            if (this.changes === 0) {
                res.status(404).json({ error: 'Treatment not found' });
                db.close();
                return;
            }

            res.json({ message: 'Treatment deleted successfully' });

            db.close();
        });
    });
});

module.exports = router;