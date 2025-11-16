// src/routes/doctor.js
const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

const dbPath = path.join(__dirname, '..', '..', 'db', 'jagwell.db');

// GET /api/doctor/patients - Get list of patients with their most recent visit
router.get('/patients', authenticateToken, async (req, res) => {
    // Only doctors and admins can access this endpoint
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can view patients' });
    }

    try {
        const { search = '', status = 'all', sort = 'name', page = 1, limit = 10 } = req.query;

        // Convert page and limit to integers with defaults
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page
        const offset = (pageNum - 1) * limitNum;

        // Build the SQL query to get unique patients with their most recent visit
        let query = `
            SELECT
                p.P_ID as patientId,
                p.P_Name as name,
                p.P_StudentId as studentId,
                p.P_Age as age,
                p.P_Status as status,
                wr.Record_Date as lastVisitDate
            FROM PATIENT p
            LEFT JOIN (
                SELECT
                    P_ID,
                    MAX(Record_Date) as Record_Date
                FROM WELLNESS_RECORD
                GROUP BY P_ID
            ) wr ON p.P_ID = wr.P_ID
            WHERE 1=1
        `;

        // Add search condition if provided
        if (search) {
            query += ` AND (p.P_Name LIKE ? OR p.P_ID LIKE ?)`;
        }

        // Add status condition if not 'all'
        if (status && status !== 'all') {
            query += ` AND p.P_Status = ?`;
        }

        // Add sorting
        query += ` ORDER BY `;
        switch(sort) {
            case 'id':
                query += 'p.P_ID';
                break;
            case 'status':
                query += 'p.P_Status, p.P_Name';
                break;
            case 'name':
            default:
                query += 'p.P_Name';
                break;
        }
        query += ` LIMIT ? OFFSET ?`;

        // Prepare parameters for the query
        const params = [];
        if (search) {
            params.push(`%${search}%`, `%${search}%`);
        }
        if (status && status !== 'all') {
            if (params.length === 2) { // If we had search params, status is the 3rd param
                params.push(status);
            } else { // If no search params, status is the 1st param
                params.push(status);
            }
        }

        // Add pagination params
        params.push(limitNum, offset);

        const db = new sqlite3.Database(dbPath);

        db.all(query, params, (err, patients) => {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Database error' });
                db.close();
                return;
            }

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) as total
                FROM PATIENT p
                LEFT JOIN (
                    SELECT
                        P_ID,
                        MAX(Record_Date) as Record_Date
                    FROM WELLNESS_RECORD
                    GROUP BY P_ID
                ) wr ON p.P_ID = wr.P_ID
                WHERE 1=1
            `;

            const countParams = [];
            if (search) {
                countQuery += ` AND (p.P_Name LIKE ? OR p.P_ID LIKE ?)`;
                countParams.push(`%${search}%`, `%${search}%`);
            }
            if (status && status !== 'all') {
                if (countParams.length === 2) {
                    countQuery += ` AND p.P_Status = ?`;
                    countParams.push(status);
                } else {
                    countQuery += ` AND p.P_Status = ?`;
                    countParams.push(status);
                }
            }

            db.get(countQuery, countParams, (err, countResult) => {
                if (err) {
                    console.error('Database count error:', err.message);
                    res.status(500).json({ error: 'Database count error' });
                    db.close();
                    return;
                }

                const total = countResult.total;
                const totalPages = Math.ceil(total / limitNum);

                const pagination = {
                    currentPage: pageNum,
                    totalPages: totalPages,
                    totalItems: total,
                    itemsPerPage: limitNum
                };

                // Format the patients data for the response
                const formattedPatients = patients.map(patient => ({
                    patientId: patient.patientId,
                    name: patient.name,
                    studentId: patient.studentId,
                    age: patient.age,
                    id: `P${String(patient.patientId).padStart(3, '0')}`, // Format ID as P001, P002, etc.
                    status: patient.status,
                    lastVisitDate: patient.lastVisitDate ? new Date(patient.lastVisitDate).toISOString() : null
                }));

                res.json({
                    patients: formattedPatients,
                    pagination: pagination
                });

                db.close();
            });
        });
    } catch (error) {
        console.error('Error in /api/doctor/patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/doctor/patient/:id/records - Get all records for a specific patient
router.get('/patient/:id/records', authenticateToken, (req, res) => {
    // Only doctors and admins can access this endpoint
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can view patient records' });
    }

    const patientId = req.params.id;

    // Validate patient ID
    if (!patientId || isNaN(patientId) || parseInt(patientId) <= 0) {
        return res.status(400).json({ error: 'Invalid patient ID' });
    }

    const db = new sqlite3.Database(dbPath);

    // Query to get all records for a specific patient
    const query = `
        SELECT
            wr.Record_ID as recordId,
            wr.Record_Date as recordDate,
            wr.Sleep_Hours,
            wr.Study_Hours,
            wr.Exercise_Minutes,
            wr.Mood,
            wr.Heart_Rate,
            wr.Temperature,
            wr.Pulse,
            wr.Complaint,
            wr.Follow_Up_Date,
            wr.Referral_To,
            wr.Program_Code,
            wr.Comments,
            u.U_Username as recordedBy
        FROM WELLNESS_RECORD wr
        LEFT JOIN USER u ON wr.U_ID = u.U_ID
        WHERE wr.P_ID = ?
        ORDER BY wr.Record_Date DESC
    `;

    db.all(query, [patientId], (err, records) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        // Format the records
        const formattedRecords = records.map(record => ({
            recordId: record.recordId,
            recordDate: record.recordDate ? new Date(record.recordDate).toISOString() : null,
            sleepHours: record.Sleep_Hours,
            studyHours: record.Study_Hours,
            exerciseMinutes: record.Exercise_Minutes,
            mood: record.Mood,
            heartRate: record.Heart_Rate,
            temperature: record.Temperature,
            pulse: record.Pulse,
            complaint: record.Complaint,
            followUpDate: record.Follow_Up_Date,
            referralTo: record.Referral_To,
            programCode: record.Program_Code,
            comments: record.Comments,
            recordedBy: record.recordedBy
        }));

        res.json({
            patientId: patientId,
            records: formattedRecords
        });

        db.close();
    });
});

// GET /api/doctor/patient/:id/treatments - Get all treatments for a specific patient
router.get('/patient/:id/treatments', authenticateToken, (req, res) => {
    // Only doctors and admins can access this endpoint
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can view patient treatments' });
    }

    const patientId = req.params.id;

    // Validate patient ID
    if (!patientId || isNaN(patientId) || parseInt(patientId) <= 0) {
        return res.status(400).json({ error: 'Invalid patient ID' });
    }

    const db = new sqlite3.Database(dbPath);

    // Query to get all treatments for a specific patient
    // Join TREATMENT, RECORD_TREATMENT, and WELLNESS_RECORD tables
    const query = `
        SELECT
            t.T_Description as treatmentName,
            rt.Treatment_Details as details,
            wr.Record_Date as treatmentDate,
            wr.Record_ID as recordId
        FROM TREATMENT t
        JOIN RECORD_TREATMENT rt ON t.T_ID = rt.T_ID
        JOIN WELLNESS_RECORD wr ON rt.Record_ID = wr.Record_ID
        WHERE wr.P_ID = ?
        ORDER BY wr.Record_Date DESC, t.T_Description
    `;

    db.all(query, [patientId], (err, treatments) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        // Format the treatments
        const formattedTreatments = treatments.map(treatment => ({
            treatmentName: treatment.treatmentName,
            details: treatment.details,
            treatmentDate: treatment.treatmentDate ? new Date(treatment.treatmentDate).toISOString() : null,
            recordId: treatment.recordId
        }));

        res.json({
            patientId: patientId,
            treatments: formattedTreatments
        });

        db.close();
    });
});

// GET /api/doctor/patients/dropdown - Get all patients for dropdown selection
router.get('/patients/dropdown', authenticateToken, (req, res) => {
    // Only doctors and admins can access this endpoint
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can view patients' });
    }

    const db = new sqlite3.Database(dbPath);

    const query = `
        SELECT
            P_ID,
            P_Name,
            P_StudentId
        FROM PATIENT
        ORDER BY P_Name
    `;

    db.all(query, [], (err, patients) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        // Format the patients data for the dropdown
        const formattedPatients = patients.map(patient => ({
            P_ID: patient.P_ID,
            P_Name: patient.P_Name,
            P_StudentId: patient.P_StudentId
        }));

        res.json({
            patients: formattedPatients
        });

        db.close();
    });
});

// POST /api/doctor/patients - Create new patient
router.post('/patients', authenticateToken, (req, res) => {
    // Only doctors and admins can create patients
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can register patients' });
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        studentId,
        age,
        dob,
        sex,
        ethnicity,
        bloodType,
        status
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !status) {
        return res.status(400).json({ error: 'First name, last name, and status are required' });
    }

    // Check if status is valid
    if (!['Student', 'Staff'].includes(status)) {
        return res.status(400).json({ error: 'Status must be either "Student" or "Staff"' });
    }

    const patientName = `${firstName.trim()} ${lastName.trim()}`;
    const db = new sqlite3.Database(dbPath);

    // For now, we'll create a patient without linking to a user account
    // In a real system, you might want to create a user account first
    const query = `
        INSERT INTO PATIENT (
            U_ID,
            P_Name,
            P_StudentId,
            P_Age,
            P_DOB,
            P_Sex,
            P_Ethnicity,
            P_Phone,
            P_BloodType,
            P_Status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Using req.user.id as the U_ID (user creating the patient record)
    // In a real system, you might have a different approach for linking patients to users
    db.run(query, [
        req.user.id, // Link to the doctor creating the record
        patientName,
        studentId || null, // School-generated student ID
        age || null,
        dob || null,
        sex || null,
        ethnicity || null,
        phone || null,
        bloodType || null,
        status
    ], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        res.json({
            message: 'Patient registered successfully',
            patientId: this.lastID
        });

        db.close();
    });
});

// POST /api/doctor/wellness - Create new wellness record
router.post('/wellness', authenticateToken, (req, res) => {
    // Only doctors and admins can create wellness records
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can log wellness records' });
    }

    const {
        patientId,
        date,
        heartRate,
        temperature,
        pulse,
        bloodPressure, // Note: blood pressure is not in the database schema
        sleepHours,
        studyHours,
        exerciseMinutes,
        mood,
        complaint,
        followUpDate,
        referralTo,
        programCode,
        comments
    } = req.body;

    // Basic validation
    if (!patientId) {
        return res.status(400).json({ error: 'Patient ID is required' });
    }

    // Check if patient exists
    const db = new sqlite3.Database(dbPath);

    // First, verify the patient exists
    db.get('SELECT P_ID FROM PATIENT WHERE P_ID = ?', [patientId], (err, patient) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (!patient) {
            res.status(400).json({ error: 'Patient not found' });
            db.close();
            return;
        }

        // Insert the wellness record
        const query = `
            INSERT INTO WELLNESS_RECORD (
                P_ID,
                U_ID,
                Record_Date,
                Sleep_Hours,
                Study_Hours,
                Exercise_Minutes,
                Mood,
                Heart_Rate,
                Temperature,
                Pulse,
                Complaint,
                Follow_Up_Date,
                Referral_To,
                Program_Code,
                Comments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        // Use the current user's ID for the U_ID (the doctor logging the record)
        const userId = req.user.id;
        const recordDate = date || new Date().toISOString().slice(0, 19).replace('T', ' '); // Format for SQLite

        db.run(query, [
            patientId,
            userId,
            recordDate,
            sleepHours || null,
            studyHours || null,
            exerciseMinutes || null,
            mood || null,
            heartRate || null,
            temperature || null,
            pulse || null,
            complaint || null,
            followUpDate || null,
            referralTo || null,
            programCode || null,
            comments || null
        ], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Database error' });
                db.close();
                return;
            }

            res.json({
                message: 'Wellness record logged successfully',
                recordId: this.lastID
            });

            db.close();
        });
    });
});

// PUT /api/doctor/wellness/:id - Update wellness record
router.put('/wellness/:id', authenticateToken, (req, res) => {
    // Only doctors and admins can update wellness records
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can update wellness records' });
    }

    const recordId = req.params.id;

    // Validate record ID
    if (!recordId || isNaN(recordId) || parseInt(recordId) <= 0) {
        return res.status(400).json({ error: 'Invalid record ID' });
    }

    const {
        patientId,
        date,
        heartRate,
        temperature,
        pulse,
        bloodPressure, // Note: blood pressure is not in the database schema
        sleepHours,
        studyHours,
        exerciseMinutes,
        mood,
        complaint,
        followUpDate,
        referralTo,
        programCode,
        comments
    } = req.body;

    const db = new sqlite3.Database(dbPath);

    // Check if the record exists and belongs to the right user (or is accessible)
    const query = `
        UPDATE WELLNESS_RECORD
        SET
            Record_Date = COALESCE(?, Record_Date),
            Sleep_Hours = COALESCE(?, Sleep_Hours),
            Study_Hours = COALESCE(?, Study_Hours),
            Exercise_Minutes = COALESCE(?, Exercise_Minutes),
            Mood = COALESCE(?, Mood),
            Heart_Rate = COALESCE(?, Heart_Rate),
            Temperature = COALESCE(?, Temperature),
            Pulse = COALESCE(?, Pulse),
            Complaint = COALESCE(?, Complaint),
            Follow_Up_Date = COALESCE(?, Follow_Up_Date),
            Referral_To = COALESCE(?, Referral_To),
            Program_Code = COALESCE(?, Program_Code),
            Comments = COALESCE(?, Comments)
        WHERE Record_ID = ?
    `;

    const recordDate = date || new Date().toISOString().slice(0, 19).replace('T', ' '); // Format for SQLite

    db.run(query, [
        recordDate,
        sleepHours,
        studyHours,
        exerciseMinutes,
        mood,
        heartRate,
        temperature,
        pulse,
        complaint,
        followUpDate,
        referralTo,
        programCode,
        comments,
        recordId
    ], function(err) {
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

        res.json({
            message: 'Wellness record updated successfully'
        });

        db.close();
    });
});

// GET /api/doctor/treatments - Get all treatments (for dropdown selection)
router.get('/treatments', authenticateToken, (req, res) => {
    // Only doctors and admins can access this endpoint
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can view treatments' });
    }

    const db = new sqlite3.Database(dbPath);

    const query = `
        SELECT
            T_ID,
            T_Description
        FROM TREATMENT
        ORDER BY T_Description
    `;

    db.all(query, [], (err, treatments) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        res.json({
            treatments: treatments
        });

        db.close();
    });
});

// POST /api/doctor/treatments - Create new treatment
router.post('/treatments', authenticateToken, (req, res) => {
    // Only doctors and admins can create treatments
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can add treatments' });
    }

    const { description, category } = req.body;

    // Basic validation
    if (!description) {
        return res.status(400).json({ error: 'Treatment description is required' });
    }

    const db = new sqlite3.Database(dbPath);

    const query = `
        INSERT INTO TREATMENT (T_Description)
        VALUES (?)
    `;

    db.run(query, [description], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        res.json({
            message: 'Treatment added successfully',
            treatmentId: this.lastID
        });

        db.close();
    });
});

// PUT /api/doctor/treatments/:id - Update treatment
router.put('/treatments/:id', authenticateToken, (req, res) => {
    // Only doctors and admins can update treatments
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can update treatments' });
    }

    const treatmentId = req.params.id;

    // Validate treatment ID
    if (!treatmentId || isNaN(treatmentId) || parseInt(treatmentId) <= 0) {
        return res.status(400).json({ error: 'Invalid treatment ID' });
    }

    const { description } = req.body;

    const db = new sqlite3.Database(dbPath);

    const query = `
        UPDATE TREATMENT
        SET
            T_Description = COALESCE(?, T_Description)
        WHERE T_ID = ?
    `;

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

        res.json({
            message: 'Treatment updated successfully'
        });

        db.close();
    });
});

// POST /api/doctor/record-treatments - Link treatment to wellness record
router.post('/record-treatments', authenticateToken, (req, res) => {
    // Only doctors and admins can link treatments to records
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can apply treatments' });
    }

    const { recordId, treatmentId, details, startDate, endDate } = req.body;

    // Basic validation
    if (!recordId || !treatmentId) {
        return res.status(400).json({ error: 'Record ID and Treatment ID are required' });
    }

    const db = new sqlite3.Database(dbPath);

    // First, verify that both the record and treatment exist
    db.get(`
        SELECT wr.Record_ID, t.T_ID
        FROM WELLNESS_RECORD wr, TREATMENT t
        WHERE wr.Record_ID = ? AND t.T_ID = ?
    `, [recordId, treatmentId], (err, result) => {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (!result) {
            res.status(400).json({ error: 'Record or treatment not found' });
            db.close();
            return;
        }

        // Insert the record-treatment relationship
        const query = `
            INSERT INTO RECORD_TREATMENT (
                Record_ID,
                T_ID,
                Treatment_Details
            ) VALUES (?, ?, ?)
        `;

        db.run(query, [recordId, treatmentId, details || null], function(err) {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ error: 'Database error' });
                db.close();
                return;
            }

            res.json({
                message: 'Treatment applied to record successfully',
                recordTreatmentId: this.lastID
            });

            db.close();
        });
    });
});

// PUT /api/doctor/record-treatments/:id - Update record-treatment link
router.put('/record-treatments/:id', authenticateToken, (req, res) => {
    // Only doctors and admins can update record-treatment links
    if (req.user.role !== 'Doctor' && req.user.role !== 'Admin') {
        return res.status(403).json({ error: 'Access denied: only doctors and admins can update treatment records' });
    }

    const recordTreatmentId = req.params.id;

    // Validate record-treatment ID
    if (!recordTreatmentId || isNaN(recordTreatmentId) || parseInt(recordTreatmentId) <= 0) {
        return res.status(400).json({ error: 'Invalid record-treatment ID' });
    }

    const { details, startDate, endDate, outcome } = req.body;

    const db = new sqlite3.Database(dbPath);

    const query = `
        UPDATE RECORD_TREATMENT
        SET
            Treatment_Details = COALESCE(?, Treatment_Details)
        WHERE RT_ID = ?
    `;

    db.run(query, [details, recordTreatmentId], function(err) {
        if (err) {
            console.error('Database error:', err.message);
            res.status(500).json({ error: 'Database error' });
            db.close();
            return;
        }

        if (this.changes === 0) {
            res.status(404).json({ error: 'Record-treatment link not found' });
            db.close();
            return;
        }

        res.json({
            message: 'Treatment record updated successfully'
        });

        db.close();
    });
});

module.exports = router;