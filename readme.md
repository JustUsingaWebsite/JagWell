
# Jagwell - Wellness App 🌿 
<img src="pictures/logo.png" alt="Stoway Logo" width="120" align = "left" style="margin-right:15px"/> 

<div style="display: flex; flex-direction: column; gap: 2px;">
<p> <strong>Jagwell Wellness App.</strong> A lightweight, secure wellness tracking application built with Node.js, Express, and SQLite. Designed to help users log and monitor their daily wellness habits—mindfully and privately.. Please consider going to the <a href="https://github.com/Zyn-ic/Stoway/releases">latest release</a> and downloading it there if you want a view at a basic set up.</p>
</div>

<br>



## 🚀 Features

- Simple RESTful API for wellness entries (e.g., mood, sleep, hydration)
- Secure by default: uses Helmet, CORS restrictions, and environment-based configuration
- Local SQLite database for easy setup and development
- Environment variable support via `dotenv`
- Development-friendly with auto-restart using `nodemon`

## 🛠️ Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite (`sqlite3`)
- **Security**: `helmet`, `cors`, `.env` isolation
- **Dev Tools**: `nodemon`

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone <your-repo-url>
   cd jagwell-wellness-app
   ```

2. **Initialize project & install dependencies**
   ```bash
   npm init -y
   npm install express sqlite3 cors helmet dotenv
   npm install -D nodemon
   ```

3. **Install SQLite CLI (optional, for manual DB inspection)**
   - On Windows (via Winget):
     ```bash
     winget install SQLite.SQLite
     ```
   - On macOS (via Homebrew):
     ```bash
     brew install sqlite
     ```
   - On Linux (Debian/Ubuntu):
     ```bash
     sudo apt install sqlite3
     ```

4. **Set up environment**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   ```

5. **Run the app**
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

## 🗂️ Project Structure

```
jagwell-wellness-app/
├── .env                 # Environment variables
├── .gitignore
├── README.md
├── package.json
├── server.js            # Main Express app
├── db/
│   └── wellness.db      # SQLite database (auto-created on first run)
└── routes/
    └── wellness.js      # Wellness entry endpoints
```

## 🔒 Security Notes

- All secrets and configuration are managed via `.env`.
- Passwords or sensitive data (if added later) should always be hashed (e.g., using `bcrypt`).
- The app uses `helmet()` for secure HTTP headers and restricts CORS origins in production.

## 🧪 Future Improvements

- Add input validation (e.g., with `express-validator`)
- Implement user authentication
- Add API documentation (Swagger/OpenAPI)
- Write unit and integration tests

---

Let me know if you'd like to include specific endpoints, deployment instructions, or license info!