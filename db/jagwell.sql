-- USER table: login + role 
CREATE TABLE USER (
  U_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  U_Username TEXT UNIQUE NOT NULL,
  Password TEXT NOT NULL,
  U_Role TEXT NOT NULL CHECK(U_Role IN ('Admin', 'Doctor', 'Student')),
  U_FirstName TEXT,
  U_LastName TEXT,
  U_Email TEXT
);

-- PATIENT table: demograpic info
CREATE TABLE PATIENT (
  P_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  U_ID INTEGER NOT NULL,
  P_Name TEXT NOT NULL,
  P_StudentId TEXT,
  P_Age INTEGER,
  P_DOB DATE,
  P_Sex TEXT,
  P_Ethnicity TEXT,
  P_Phone TEXT,
  P_BloodType TEXT,        -- renamed from P_Type for clarity
  P_Status TEXT NOT NULL CHECK(P_Status IN ('Student', 'Staff')),
  FOREIGN KEY (U_ID) REFERENCES USER(U_ID)
);

-- WELLNESS_RECORD: all wellness data (student + doctor input)
CREATE TABLE WELLNESS_RECORD (
  Record_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Record_Date DATETIME DEFAULT CURRENT_TIMESTAMP,

  -- Student-input fields
  Sleep_Hours REAL,
  Study_Hours REAL,
  Exercise_Minutes INTEGER,
  Mood TEXT,

  -- Doctor-input fields
  Heart_Rate REAL,
  Temperature REAL,
  Pulse INTEGER,
  Complaint TEXT,
  Follow_Up_Date DATE,
  Referral_To TEXT,
  Program_Code TEXT,
  Comments TEXT,

  -- Foreign keys
  P_ID INTEGER NOT NULL,   -- which patient
  U_ID INTEGER NOT NULL,   -- who logged it (student or doctor)
  FOREIGN KEY (P_ID) REFERENCES PATIENT(P_ID),
  FOREIGN KEY (U_ID) REFERENCES USER(U_ID)
);

-- TREATMENT: master list
CREATE TABLE TREATMENT (
  T_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  T_Description TEXT NOT NULL UNIQUE
);

-- RECORD_TREATMENT: many-to-many with treatment details
CREATE TABLE RECORD_TREATMENT (
  RT_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  Record_ID INTEGER NOT NULL,
  T_ID INTEGER NOT NULL,
  Treatment_Details TEXT,  -- e.g., "Prescribed ibuprofen 200mg daily"
  FOREIGN KEY (Record_ID) REFERENCES WELLNESS_RECORD(Record_ID),
  FOREIGN KEY (T_ID) REFERENCES TREATMENT(T_ID)
);