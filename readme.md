# Jagwell - Wellness App 🌿  
<img src="./public/pictures/logo.png" alt="Stoway Logo" width="120" align = "left" style="margin-right:15px"/> 

<div style="display: flex; flex-direction: column; gap: 2px;">
<p> <strong>Jagwell Wellness App.</strong> A lightweight, secure wellness tracking application built with Node.js, Express, and SQLite. Designed to help users log and monitor their daily wellness habits—mindfully and privately.. Please consider going to the <a href="https://github.com/JustUsingaWebsite/JagWell/releases">latest release</a> and downloading it there if you want a view at a basic set up.</p>
</div>

<br>

---

## 🌟 What Can JagWell Do?

JagWell supports **three user roles**—each with their own dashboard and permissions:

- 👩‍💼 **Admin**: Manage all users and records  
- 🩺 **Doctor**: View anonymous wellness trends  
- 🎓 **Student**: Log daily wellness data (mood, sleep, heart rate, etc.)

All data is stored securely in a local SQLite database, and passwords are **hashed with bcrypt**.

--- 

## 🛠️ Tech Stack

| Layer        | Tools Used                          |
|--------------|-------------------------------------|
| **Backend**  | Node.js + Express                   |
| **Database** | SQLite (`sqlite3`)                  |
| **Auth**     | JWT + `bcrypt`                      |
| **Security** | `helmet`, `cors`, `.env`            |
| **Dev Tools**| `nodemon`, `dotenv`                 |

---

## 📦 Quick Setup

> ✅ **Prerequisite**: [Node.js](https://nodejs.org/) installed

### 1. Clone & Install
```bash
npm install
```
> 💡 Dependencies are already listed in `package.json` — no need for `npm init -y`.

### 1.5 Manual install
```bash
npm init -y
npm install express sqlite3 cors helmet dotenv
npm install -D nodemon
npm install cookie-parser
```
> 💡 This is only if when you ran `npm install` and it did not download the dependencies


### 2. Set Up the Database
Run this **once** to create the database and tables:
```bash
sqlite3 db/jagwell.db < jagwell.sql
```

> 🪟 **Windows users**: Install SQLite CLI first:
> ```bash
> winget install SQLite.SQLite
> ```

### 3. Create Your First User (e.g., Admin)
```bash
node scripts/create-user.js
```
> This creates user `borland` with password `password123` and role `Admin`.

### 4. Configure Environment
Create a `.env` file in the project root:
```env
PORT=3000
JWT_SECRET=jagwell-secret-2025-do-not-use-in-prod
```

### 5. Launch the App!
```bash
npm run dev
```
Visit: 👉 [http://localhost:3000](http://localhost:3000)

Log in with:
- **Username**: `borland`
- **Password**: `password123`

You’ll be redirected to your role-specific dashboard!

---

## 🗂️ Project Structure

```
JagWell/
│
├── public/                 → static files (login.html, CSS, JS, images)
├── views/                  → protected HTML dashboards (served via routes)
│
└── src/
    └── App/
        ├── app.js          → main Express app (entry point)
        ├── Student-Routes/ → all /student-* routes
        ├── Doctor-Routes/  → all /doctor-* routes
        ├── Admin-Routes/   → all /admin-* routes
        └── API-Routes/     → /api/auth, /api/wellness
```

---

## 🔒 Security Highlights

- 🔑 Passwords are **hashed** using `bcrypt`
- 🪪 Sessions use **JWT tokens** (1-day expiry)
- 🛡️ `helmet()` hardens HTTP headers
- 🌐 CORS is enabled (adjust in production)
- 🤫 Secrets live only in `.env` — never in code!

> ⚠️ **Never commit `.env` or `jagwell.db` to Git!**

---

## 🧪 What’s Next?

We’re planning to add:
- 📊 Doctor dashboard with wellness trend charts  
- ✍️ Student wellness logging form (HTML + JS)  
- 🧪 Input validation (`express-validator`)  
- 📄 API documentation (Swagger)  
- 🐳 Docker support  

---

> 💚 **Built with care for student wellness at Jaguar High.**  
> Made by Rosal & team — because your health matters. 🌿
