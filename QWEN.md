# JagWell Wellness App - Project Context

## Project Overview

JagWell is a lightweight, secure wellness tracking application built with Node.js, Express, and SQLite. It helps users log and monitor their daily wellness habits with privacy and security in mind, designed specifically for student wellness tracking at educational institutions.

### Key Features
- **Multi-role system**: Supports Admin, Doctor, and Student user roles with appropriate permissions
- **Wellness tracking**: Students can log daily wellness data (mood, sleep, heart rate, etc.)
- **Medical oversight**: Doctors can view anonymous wellness trends and add medical data
- **Student ID integration**: Doctors can associate school-generated student IDs with patient records for linking to school records
- **Secure authentication**: JWT-based authentication with bcrypt password hashing
- **Data privacy**: All sensitive data stored locally in SQLite database

### Tech Stack
- **Backend**: Node.js + Express
- **Database**: SQLite (`sqlite3`)
- **Authentication**: JWT + `bcrypt` for password hashing
- **Security**: `helmet`, `cors`, environment variables
- **Development**: `nodemon`, `dotenv`
- **Frontend**: HTML, CSS (with Poppins font), JavaScript

## Project Structure

```
JagWell/
├── db/                     # Database files
│   ├── jagwell.db          # SQLite database file
│   └── jagwell.sql         # Database schema
├── public/                 # Static files (login, CSS, JS, images)
│   ├── 404.html
│   ├── login.html
│   ├── manifest.json
│   ├── wip.html
│   ├── css/                # Stylesheets
│   ├── js/                 # Client-side JavaScript
│   │   ├── doctor/         # Doctor-specific scripts
│   │   ├── error-pages.js
│   │   └── login.js
│   └── pictures/           # Image assets
├── src/                    # Application source code
│   └── App/
│       ├── app.js          # Main Express app (entry point)
│       ├── Admin-Routes/   # Admin-specific routes
│       ├── API-Routes/     # API route handlers
│       ├── Doctor-Routes/  # Doctor-specific routes
│       ├── Student-Routes/ # Student-specific routes
│       └── middleware/     # Authentication middleware
├── views/                  # Protected HTML dashboards by role
│   ├── admin/
│   ├── doctor/
│   └── student/
└── scripts/                # Utility scripts
```

## Database Schema

The application uses SQLite with the following tables:

1. **USER**: Stores user credentials and roles (Admin, Doctor, Student)
2. **PATIENT**: Contains demographic information for patients, including a school-generated Student ID for linking to school records
3. **WELLNESS_RECORD**: Tracks wellness data (student and doctor inputs)
4. **TREATMENT**: Master list of treatments
5. **RECORD_TREATMENT**: Links treatments to specific wellness records (many-to-many)

## User Roles & Permissions

- **Admin**: 
  - Create, edit, and delete users (not patients)
  - Edit patient information (excluding patient ID)
  - Edit wellness records (excluding Record ID, User ID, and Patient ID)
  - Edit and delete treatment information (excluding treatment ID and details from record-treatment)
  - Delete users with wellness records reassigned to system user (ID 0)
  - Delete treatments only if not referenced in other tables
- **Doctor**: Can view anonymous wellness trends, manage patient data and treatments
- **Student**: Can log and view their own wellness data

## Building and Running

### Prerequisites
- Node.js installed
- SQLite CLI (for Windows users: `winget install SQLite.SQLite`)

### Setup Commands
1. Install dependencies: `npm install`
2. Create database: `sqlite3 db/jagwell.db < jagwell.sql`
3. Create first user: `node scripts/create-user.js`
4. Configure environment in `.env` file:
   ```
   PORT=3000
   JWT_SECRET=jagwell-secret-2025-do-not-use-in-prod
   ```
5. Start the app: `npm run dev`

### Development Scripts
- `npm run dev`: Start development server with nodemon

## Security Features

- Passwords hashed with bcrypt
- JWT tokens with 1-day expiry stored in httpOnly cookies
- Helmet middleware for hardened HTTP headers
- CORS enabled with proper configuration
- Secrets stored in `.env` file
- Server-side validation using authenticated user ID from token

## Key Endpoints

### Authentication API
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### Doctor API Endpoints
- `GET /api/doctor/patients` - Get list of patients with search, sort, and pagination (includes Student ID)
- `GET /api/doctor/patients/dropdown` - Get all patients for dropdown selection (includes Student ID)
- `GET /api/doctor/patient/:id/records` - Get all records for a specific patient
- `GET /api/doctor/patient/:id/treatments` - Get all treatments for a specific patient
- `POST /api/doctor/patients` - Create new patient (includes optional Student ID field for school records)
- `POST /api/doctor/wellness` - Create new wellness record
- `PUT /api/doctor/wellness/:id` - Update wellness record
- `GET /api/doctor/treatments` - Get all treatments for dropdown selection
- `POST /api/doctor/treatments` - Create new treatment
- `PUT /api/doctor/treatments/:id` - Update treatment
- `POST /api/doctor/record-treatments` - Link treatment to wellness record
- `PUT /api/doctor/record-treatments/:id` - Update record-treatment link

### Admin API Endpoints
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:id` - Get a single user by ID
- `POST /api/admin/users` - Create new user (admin only)
- `PUT /api/admin/users/:id` - Update user information (excluding ID)
- `DELETE /api/admin/users/:id` - Delete user and reassign wellness records to system user (ID 0)
- `PUT /api/admin/patients/:id` - Update patient information (excluding P_ID)
- `PUT /api/admin/wellness/:id` - Update wellness record (excluding Record_ID, U_ID, P_ID)
- `PUT /api/admin/treatments/:id` - Update treatment description (excluding T_ID)
- `DELETE /api/admin/treatments/:id` - Delete treatment only if not referenced in RECORD_TREATMENT

### Role-Specific Pages
- Student routes: `/student-dashboard`, `/student-log`, `/student-trends`, `/student-profile`
- Doctor routes: `/doctor-dashboard`, `/doctor-patients`, `/doctor-logging`, `/doctor-stats`
- Admin routes: `/admin-dashboard`

## Development Conventions

- Code is organized by user roles with separate route files
- Authentication middleware is consistently applied to protected routes
- Frontend JavaScript uses modular functions and proper error handling
- Security headers are applied via helmet middleware
- Passwords are always hashed before storage
- API responses follow consistent JSON format
- XSS prevention is implemented with HTML escaping functions

## Current State & Future Plans

### Implemented Features
- Complete multi-role authentication system
- Comprehensive doctor dashboard with patient search, sort, and pagination
- Wellness record logging with both student and doctor data fields
- Treatment tracking system linked to wellness records
- Student ID integration for linking to school records
- Admin role repurposed for user and data management
- Admin dashboard with user management, patient editing, and treatment management
- User creation, editing, and deletion with wellness record reassignment to system user
- Patient information editing (excluding patient ID)
- Wellness record editing (excluding critical IDs)
- Treatment editing and constraint-checked deletion
- Responsive UI with modern CSS styling
- Modal-based data viewing with toggles for treatments
- Proper error handling and user feedback

### Planned Enhancements
- Doctor dashboard with wellness trend charts
- Student wellness logging form (HTML + JS)
- Input validation using express-validator
- API documentation (Swagger)
- Docker support