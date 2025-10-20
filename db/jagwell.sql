CREATE TABLE USER (
  U_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  U_Username TEXT UNIQUE NOT NULL,
  Password TEXT NOT NULL,
  U_Role TEXT CHECK(U_Role IN ('Admin', 'Doctor', 'Student')) NOT NULL
);

CREATE TABLE PATIENT (
  P_ID INTEGER PRIMARY KEY,
  P_Name TEXT NOT NULL,
  P_Age INTEGER,
  P_DOB TEXT,
  P_Sex TEXT,
  P_Ethnicity TEXT,
  P_Phone TEXT,
  P_Type TEXT, -- blood type?
  P_Status TEXT CHECK(P_Status IN ('Student', 'Staff'))
);

-- Link USER ↔ PATIENT (1:1)
-- (Assume U_ID = P_ID for simplicity, or add foreign key)

CREATE TABLE WELLNESS_RECORD (
  Record_ID INTEGER PRIMARY KEY AUTOINCREMENT,
  P_ID INTEGER NOT NULL,
  Heart_Rate REAL,
  Temperature REAL,
  Pulse INTEGER,
  Sleep_Hours REAL,
  Study_Hours REAL,
  Exercise_Minutes INTEGER,
  Mood TEXT, -- e.g., "Happy", "Stressed", or emoji code
  Complaint TEXT,
  Treatment TEXT,
  Record_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (P_ID) REFERENCES PATIENT(P_ID)
);

CREATE TABLE TREATMENT (
  T_ID INTEGER PRIMARY KEY,
  T_Description TEXT
);