# 🎓 College Event Management System (CEMS)

A full-stack web application for managing college events.  
**Stack:** React + Vite (frontend) · Node.js + Express + MongoDB (backend)

---

## 📁 Project Structure

```
cems-fixed/
├── backend/          ← Express API (Node.js)
│   ├── config/       ← MongoDB connection
│   ├── controllers/  ← Business logic
│   ├── middleware/   ← JWT auth + role checks
│   ├── models/       ← Mongoose schemas
│   ├── routes/       ← API route definitions
│   ├── server.js
│   └── vercel.json
└── frontend/         ← React + Vite SPA
    ├── src/
    │   ├── pages/    ← Login, Register, Dashboards
    │   ├── App.jsx   ← Routes + Protected routes
    │   ├── api.js    ← Axios instance
    │   └── index.css
    └── vercel.json
```

---

## 🐛 Bugs Fixed from Original Code

| # | File | Bug | Fix |
|---|------|-----|-----|
| 1 | `middleware/events.js` | Orphan router snippet — not a valid module, caused crash | Deleted; logic moved into `routes/events.js` |
| 2 | `middleware/auth.js` | No check for `Bearer` prefix; split could return undefined | Added `startsWith('Bearer ')` guard |
| 3 | `controllers/eventController.js` | Role check (`req.user.role !== 'organizer'`) duplicated in every handler; bypassed with no ownership check | Moved to `requireRole()` middleware; added ownership check on delete/update |
| 4 | `controllers/registrationController.js` | `XLSX` imported but only `applyEvent` and `getApplicants` exported — no export function | Added `exportApplicants` controller and route |
| 5 | `routes/registrations.js` | `/my/registrations` route conflicted with `/:eventId` (Express matched `my` as eventId) | Moved `/my/registrations` route **before** `/:eventId` |
| 6 | `models/Registration.js` | No unique index on `(student, event)` — race condition could allow duplicate registrations | Added compound unique index |
| 7 | `server.js` | Uses Express 5 (`^5.x`) which has breaking changes; `app.use` error handler signature changed | Pinned to Express 4.x; added proper 4-arg error handler |
| 8 | `frontend/src/vercel.json` | `vercel.json` placed inside `src/` — Vercel ignores it there | Moved to `frontend/` root |
| 9 | `pages/Login.jsx` | Used `<center>` tags (deprecated HTML); uncontrolled inputs (no `value` prop) | Replaced with CSS; added controlled inputs with `value` + `onChange` |
| 10 | `pages/Register.jsx` | Student fields shown for organizer role; no conditional rendering | Added `{form.role === 'student' && ...}` conditional block |
| 11 | `pages/OrganizerDashboard.jsx` | `fetchEvents()` called without try/catch; `deleteEvent` had no ownership feedback; no form reset after create | Added try/catch everywhere, form reset, success/error state |
| 12 | `api.js` | `baseURL` hardcoded to `localhost:5000` — breaks in production | Reads from `VITE_API_URL` env var; falls back to `/api` (Vite proxy) |
| 13 | All pages | No loading state on any async call; buttons clickable multiple times | Added `loading`/`submitting`/`applying` states with disabled buttons |
| 14 | `App.jsx` | No protected routes — any unauthenticated user could visit `/student` or `/organizer` | Added `<Protected>` component checking token + role |
| 15 | Auth controller | `bcrypt.hash` salt rounds set to 10; `findOne` email not lowercased | Salt rounds 12; emails always lowercased on save and lookup |

---

## ⚙️ Prerequisites

- **Node.js** v18+ — [nodejs.org](https://nodejs.org)
- **MongoDB Atlas** account (free tier works) — [mongodb.com/atlas](https://mongodb.com/atlas)
- **Git** — to clone the repo

---

## 🚀 Local Development Setup

### 1. Clone & enter the project

```bash
git clone <your-repo-url>
cd cems-fixed
```

### 2. Set up the Backend

```bash
cd backend
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/cems?retryWrites=true&w=majority
JWT_SECRET=choose_a_long_random_string_here
CLIENT_URL=http://localhost:3000
```

> **Get your MONGO_URI:** MongoDB Atlas → Clusters → Connect → Drivers → Node.js → copy the connection string, replace `<password>` with your Atlas user password.

Start the backend:

```bash
npm run dev        # with hot reload (nodemon)
# or
npm start          # production
```

Backend will run at: **http://localhost:5000**  
Test: open http://localhost:5000 — should return `{"message":"CEMS API is running ✅"}`

---

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env.local` (for local dev, the Vite proxy handles API calls — no URL needed):

```bash
# No VITE_API_URL needed for local dev (uses vite proxy to localhost:5000)
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at: **http://localhost:3000**

---

### 4. First Use

1. Open http://localhost:3000
2. Click **Create one** to register
3. Create an **Organizer** account, then a **Student** account
4. Log in as Organizer → create events
5. Log in as Student → register for events

---

## 🌐 Deploy to Vercel (Free)

### Deploy Backend

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. Set **Root Directory** to `backend`
4. Add these **Environment Variables** in Vercel:
   - `MONGO_URI` → your MongoDB Atlas URI
   - `JWT_SECRET` → your secret key
   - `CLIENT_URL` → `https://your-frontend.vercel.app`
5. Deploy. Copy the backend URL, e.g. `https://cems-backend.vercel.app`

### Deploy Frontend

1. New Project again → same repo
2. Set **Root Directory** to `frontend`
3. Add Environment Variable:
   - `VITE_API_URL` → `https://cems-backend.vercel.app/api`
4. Deploy.

### MongoDB Atlas Network Access

In MongoDB Atlas → Network Access → Add IP Address → **Allow access from anywhere** (`0.0.0.0/0`) so Vercel's dynamic IPs can connect.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Body | Auth | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | `name, email, password, role, [regno, dept, year]` | ❌ | Register user |
| POST | `/api/auth/login` | `email, password` | ❌ | Login → returns JWT |
| GET | `/api/auth/profile` | — | ✅ | Get own profile |

### Events

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/events` | ✅ | Any | List all events |
| GET | `/api/events/:id` | ✅ | Any | Get single event |
| POST | `/api/events` | ✅ | Organizer | Create event |
| PUT | `/api/events/:id` | ✅ | Organizer | Update event |
| DELETE | `/api/events/:id` | ✅ | Organizer | Delete event |

### Registrations

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/registrations/my/registrations` | ✅ | Student | My registrations |
| POST | `/api/registrations/:eventId` | ✅ | Student | Register for event |
| DELETE | `/api/registrations/:eventId` | ✅ | Student | Cancel registration |
| GET | `/api/registrations/:eventId` | ✅ | Organizer | View all registrants |
| GET | `/api/registrations/:eventId/export` | ✅ | Organizer | Download Excel |

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (salt rounds: 12)
- JWTs expire in **7 days**
- Role-based access enforced on every protected route via middleware
- Duplicate registrations prevented at both application and database level (unique compound index)
- Auto-logout on 401 responses (expired/invalid token)
