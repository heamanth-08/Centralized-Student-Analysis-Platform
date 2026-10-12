# CampusIQ
## Centralised Student Analysis Platform

### About
CampusIQ is a proposed short name for the Centralised Student Analysis Platform, a web-based student analytics application developed as a Campus Innovation project. It centralises student information and provides insights into academic performance, attendance, departmental outcomes, student support, and approved development activities through Stride Point.

The frontend is based on the existing Stitch design, while Python provides backend and analytical functionality.

> CampusIQ is a proposed product name. The official project title remains Centralised Student Analysis Platform unless approved otherwise.

### Problem Statement
Student information may be spread across spreadsheets, attendance records, academic reports, and departmental systems. This makes it difficult to understand progress, identify concerns, compare performance, and prepare reports. The platform provides a unified interface for authorised data management and analytics.

### Objectives
- Centralise relevant student information.
- Analyse academic performance and attendance.
- Compare department/course outcomes.
- Identify students who may need support (for human review).
- Track approved Stride Point activities.
- Validate imported data.
- Generate useful reports.
- Provide a clean responsive interface.
- Protect institutional and student information.

### Key Features
- Secure login with role-based access.
- Dashboard and summary analytics.
- Student directory and profiles.
- Academic and attendance analytics.
- Department/course comparisons.
- Student-support indicators.
- Stride Point history and balances.
- CSV/Excel imports with validation.
- Reports and exports.
- In-app notifications.
- User management and settings.

### Technology Stack
| Component | Technology |
|---|---|
| UI design | Stitch |
| Frontend implementation | Existing Stitch-generated framework (verify in repository) |
| Backend | Python 3.11+ |
| Suggested backend framework | FastAPI (proposed) |
| Database | MySQL 8.x |
| ORM / migrations | SQLAlchemy and Alembic (proposed) |
| Data processing | Pandas and NumPy |
| Development | Visual Studio Code or equivalent |
| Version control | Git and GitHub |

Verify the actual frameworks, dependencies, and hosting configuration in the repository.

### Architecture
The frontend provides navigation, forms, charts, and reports. The Python backend validates requests, applies business rules, performs analytics, and accesses the database. MySQL stores persistent records. The frontend communicates with the backend through API endpoints and must never connect directly to MySQL.

### Main Application Areas
1. Login
2. Dashboard
3. Student Directory
4. Student Profile
5. Academic Analytics
6. Attendance Analytics
7. Department and Course Analytics
8. Student Support
9. Stride Point
10. Data Import
11. Reports
12. Notifications
13. User Management
14. Settings

### Suggested Project Structure
Adapt to the actual repository; do not reorganise a working project unnecessarily.

```text
CampusIQ/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── database/
│   │   └── analytics/
│   ├── migrations/          # Alembic versioned migrations (source of truth)
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── database/
│   └── schema.sql           # exported documentation only; migrations are authoritative
├── docs/
│   ├── Instruction.MD
│   ├── Knowledge.MD
│   ├── PRDfile.MD
│   └── Skill.MD
├── .gitignore               # must exclude .env, .venv, node_modules, uploads
└── Readme.MD
```

### Getting Started

#### Prerequisites
Git, Python 3.11+, MySQL 8.x, and Node.js/npm if the frontend needs them. Check the existing project documentation for exact versions.

#### 1. Clone the repository
```bash
git clone <your-repository-url>
cd CampusIQ
```
Replace the placeholder with the real repository URL.

#### 2. Set up the backend
```bash
cd backend
python -m venv .venv
```
Windows PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```
macOS/Linux:
```bash
source .venv/bin/activate
```
Install dependencies and create your local environment file:
```bash
pip install -r requirements.txt
cp .env.example .env      # Windows: copy .env.example .env
```
Edit `.env` with your values. Do not commit the real `.env` file.

#### 3. Configure MySQL
Create the database and a restricted application user (not root), then apply migrations:
```sql
CREATE DATABASE campusiq CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'campusiq_app'@'localhost' IDENTIFIED BY '<strong-password>';
GRANT SELECT, INSERT, UPDATE, DELETE ON campusiq.* TO 'campusiq_app'@'localhost';
```
Run migrations with a separate account that has schema privileges (for example `alembic upgrade head`). Adjust to the project's actual tooling.

#### 4. Start the backend
If the project uses FastAPI and its entry point is `app.main:app`:
```bash
uvicorn app.main:app --reload
```
Run from the backend directory and adjust to the actual entry point. Check `http://localhost:8000/api/health`.

#### 5. Set up the frontend
From the frontend directory:
```bash
npm install
```
Set the API base URL using the variable the implementation expects (Vite example):
```text
VITE_API_BASE_URL=http://localhost:8000
```

#### 6. Start the frontend
```bash
npm run dev
```
Follow the actual framework's instructions if different.

#### 7. Verify integration
Check frontend startup, backend startup, database connectivity, API requests, login, student retrieval, analytics results, database persistence, and error handling.

### Environment Variables
Backend (names are examples; use those the implementation expects):
```text
DATABASE_URL=mysql+pymysql://campusiq_app:<password>@localhost:3306/campusiq
SECRET_KEY=<long random value>
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
ACCESS_TOKEN_EXPIRE_MINUTES=60
MAX_UPLOAD_MB=10
```
Frontend:
```text
VITE_API_BASE_URL=http://localhost:8000
```
Never commit production secrets. Use the hosting provider's secret manager in production.

### Analytics
Pandas and NumPy support data cleaning, aggregation, performance summaries, attendance, trends, department comparisons, and reports.

Attendance Percentage = (Classes Attended / Total Classes Held) × 100

Missing records and zero total classes return "not available", never 0%. Academic calculations must follow the institution's actual grading rules (pending).

### Stride Point
Tracks institution-approved student-development activities. Transactions are append-only; balances are derived from valid transactions; corrections are reversal entries. Confirm the official policy before finalising categories or point values.

### Security and Privacy
Authentication with expiring sessions/tokens, role-based and record-level access, password hashing (Argon2id/bcrypt), input validation, safe uploads, export formula-injection protection, protected database credentials, HTTPS in production, and audit logs. Use fictional or anonymised data for demonstrations unless real-data use is authorised.

### Testing
Test authentication, navigation, student operations, search/filtering, imports, calculations (including zero/missing/boundary cases), Stride Point, exports, database persistence, permissions per role, API errors, responsive layouts, and production configuration. Do not mark features complete until implemented and tested.

```bash
cd backend && pytest
```

### Deployment
Build the frontend, deploy the Python backend, configure the database, set the API URL and CORS, enable HTTPS, configure health checks and backups, and test important workflows in the deployed system. Document actual hosting providers and commands once selected.

### Development Guidelines
- Preserve the Stitch design.
- Keep screens focused and uncluttered.
- Reuse components.
- Separate frontend and backend responsibilities.
- Validate important inputs.
- Use persistent storage and migrations.
- Protect student information.
- Test every important workflow.
- Document configuration changes in Knowledge.MD.

### Project Status Tracker
Update this table at the end of each phase. Do not mark an item complete until it is tested.

| Area | Status |
|---|---|
| Stitch frontend designed | Done (Academic dashboard, directory, profiles, analytics, stride, reports) |
| Frontend inspected / API client wired | Done (Central API client, AuthContext, Axios/fetch, full integration) |
| Backend + authentication | Done (FastAPI, JWT Bearer, bcrypt, RBAC roles, health check tested) |
| MySQL schema + migrations | Done (Alembic versioned migrations + exported database/schema.sql) |
| Analytics | Done (Pandas + NumPy, safe 0-held null handling, unit tests passing) |
| Stride Point (policy pending) | Done (Append-only ledger, auditable reversals, unit tests passing) |
| Imports / reports | Done (CSV/Excel validator, row error reporting, injection neutralized) |
| Deployment & Testing | Done (10/10 pytest passing, production build verified, npm scripts ready) |

### Conclusion
Success depends on a usable Stitch-based interface, reliable Python services, accurate calculations, secure database operations, and tested deployment.

**Project principle: Keep the interface simple, the data accurate, and every important feature functional.**
