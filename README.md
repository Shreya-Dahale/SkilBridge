# SkilBridge — Evidence-Based Career Re-entry Platform

> **“Don’t hide the career gap. Fill the evidence gap.”**

SkilBridge is an evidence-based career re-entry platform that helps professionals returning after a career break connect their past experience with modern job requirements and build verifiable proof of their current capabilities through hands-on practical assessments.

---

## 🚀 Core Re-entry Pipeline

```
Past Experience
      ↓
 Target Role
      ↓
Job Requirements
      ↓
Skill Gap Analysis
      ↓
Practical Assessments
      ↓
 Current Evidence
      ↓
Evidence Profile
      ↓
Employer Review
```

---

## 🔑 Demo Test Accounts

The platform includes two completely separate authentication portals:

### 1. Candidate Portal (`/auth/candidate/login`)
- **Email:** `candidate@skilbridge.com`
- **Password:** `Candidate123!`
- **Profile:** Priya Sharma (3.5-year career pause for caregiving, targeting Senior Full Stack Engineer, multiple verified skill badges in React 19, TypeScript, Node.js)

### 2. Employer Portal (`/auth/employer/login`)
- **Email:** `employer@techcorp.com`
- **Password:** `Employer123!`
- **Profile:** Arun Mehta, TechCorp Solutions (Enterprise Cloud & FinTech, 3 active returnship roles with skill verification requirements)

*(Both login screens also feature 1-click **"Auto-fill"** buttons for instant testing).*

---

## 🛠 Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
- **Backend:** Node.js, Express.js, REST APIs, JWT authentication, Bcrypt
- **Database & ORM:** PostgreSQL with Prisma ORM (with zero-config SQLite local dev support)

---

## 📦 Project Structure

```
gallery/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # PostgreSQL / SQLite Prisma Schema
│   │   ├── schema.sqlite.prisma # SQLite variant
│   │   └── seed.js              # Comprehensive demo seed data
│   ├── scripts/
│   │   └── switch-db.js         # Instant DB provider switcher
│   ├── src/
│   │   ├── config/              # Prisma client
│   │   ├── middleware/          # JWT auth & role protection
│   │   ├── routes/              # Auth, Candidate, Employer, Assessment, Jobs APIs
│   │   └── server.js            # Express application entry
│   ├── .env                     # Local environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer, PipelineSteps, ReadinessMeter, Modals
│   │   ├── context/             # AuthContext (Candidate/Employer separation)
│   │   ├── pages/               # Landing, Dashboards, Logins, Assessments, Jobs, Public Dossier
│   │   ├── services/            # API client with automatic JWT injection
│   │   └── index.css            # Professional career-tech design system
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── package.json
├── README.md
├── vercel.json
└── package.json
```

---

## 💻 Local Installation & Running

### Step 1: Install Dependencies
Open a terminal in the project directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 2: Initialize Database & Seed Demo Data
SkilBridge is pre-configured with Prisma. Run the setup command in `backend`:

```bash
cd backend
npm run db:setup
```
*(This generates the Prisma client, pushes database tables, and seeds demo candidates, assessments, and employers).*

#### Using PostgreSQL:
To connect to an external or local PostgreSQL database (e.g., Neon, Supabase, or local Postgres 5432):
1. In `backend/.env`, set:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/skilbridge?schema=public"
   ```
2. Switch schema to PostgreSQL and push:
   ```bash
   node scripts/switch-db.js pg
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

### Step 3: Run the Application Locally

In terminal 1 (Backend API):
```bash
cd backend
npm run dev
# Starts on http://localhost:5000
```

In terminal 2 (Frontend Client):
```bash
cd frontend
npm run dev
# Starts on http://localhost:5173
```

Now open: **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🌐 Deploying on Vercel

### Frontend (Vercel)
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and import the repository.
3. Configure the build settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your hosted backend URL (e.g. `https://skilbridge-api.onrender.com`)

### Backend (Render, Railway, or Fly.io)
1. Deploy the `backend/` folder to Render / Railway / Supabase.
2. Provide the environment variables:
   - `PORT`: `5000`
   - `DATABASE_URL`: Your production PostgreSQL connection string (from Neon or Supabase)
   - `JWT_SECRET`: A long random secret string
   - `FRONTEND_URL`: Your Vercel frontend URL
3. Build Command: `npm install && npx prisma generate && npx prisma db push && npm run db:seed`
4. Start Command: `npm start`

---

## 🧪 Verification & Feature Checklist

- [x] **Registration:** Separate candidate and employer signup with custom role profiling.
- [x] **Login & Logout:** Secure JWT issuance and automatic localStorage persistence.
- [x] **Role Separation:** 403 Forbidden protection prevents candidates from logging into employer portals and vice versa.
- [x] **Candidate Dashboard:**
  - 8-stage interactive pipeline progress bar.
  - Interactive Readiness Index meter.
  - Career History management (add/delete past jobs).
  - Target Role & Break Narrative editor.
  - Intelligent Skill Gap Analyzer with priority refresh classification.
  - Practical Assessment Center with timed scenario questions, automatic instant grading, and verified badge generation.
  - Evidence artifact manager for GitHub projects and case studies.
  - Shareable Evidence Profile view with copyable link.
  - Returnship job matching with Evidence Match percentage.
- [x] **Employer Dashboard:**
  - Talent pool search with filters (target role, break duration, verified score, skills).
  - Detailed Candidate Evidence Dossier inspection modal.
  - Pipeline review actions (Shortlist, Request Interview, Mark Reviewed).
  - Returnship job creation with required and preferred technical skills.
