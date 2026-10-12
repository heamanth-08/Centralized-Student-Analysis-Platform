# INSTRUCTION.MD
## Centralised Student Analysis Platform (CampusIQ)

> Read order for every session: Readme.MD → Instruction.MD → Knowledge.MD → PRDfile.MD → Skill.MD.
> If documents conflict, PRDfile.MD defines *what* to build, Knowledge.MD records *confirmed decisions*, and this file defines *how* to work.

### 1. Project Overview
Official project title: **Centralised Student Analysis Platform**. Suggested short name: **CampusIQ** (pending team approval; do not rename repositories, folders, databases or services until approved).

Build a complete, responsive student analytics web application using the existing Stitch-generated frontend, a Python backend, and MySQL. Inspect the actual project files before making changes. Preserve the existing Stitch design and improve it only where necessary.

### 2. Mandatory Development Rules
1. Inspect the repository and all available Stitch screens before editing.
2. Identify the frontend framework, dependencies, backend, APIs, and database configuration. Do not assume Vite/React; Stitch exports may be plain HTML/Tailwind.
3. Reuse existing components and preserve working functionality.
4. Keep screens focused; do not put every feature on one dashboard.
5. Make every visible interactive control perform a meaningful action. If a control cannot yet work, hide or disable it and label it "Coming soon"; never leave a silent placeholder.
6. Connect frontend actions to real backend functionality.
7. Validate data on both frontend and backend (the backend is the source of truth).
8. Use persistent database storage.
9. Provide loading, success, empty, and error states.
10. Do not present fabricated data as real institutional data. Label demo data clearly.
11. Protect student data and never expose secrets in frontend code or commit them to Git.
12. Test end-to-end workflows before claiming completion.
13. Do not treat items marked "Proposed / Pending" in Knowledge.MD as confirmed requirements.
14. When a requirement is ambiguous, state the assumption in Knowledge.MD (Decision Log) instead of silently guessing; ask the team for policy questions (grading, thresholds, Stride Point).
15. Make small, reviewable commits; never run destructive commands (DROP, TRUNCATE, `git reset --hard`, force-push) against shared data or branches without explicit approval.

### 3. UI Requirements
Clean, modern, academic analytics interface with consistent navigation, readable typography, whitespace, responsive tables and charts, accessible forms (labels, focus states, keyboard navigation, sufficient contrast, target WCAG 2.1 AA), and a clear visual hierarchy. Preserve the Stitch design's established styling. Support light and dark themes if present or planned, with a consistent toggle and a saved preference (stored per user where practical). Wide tables scroll inside their own container; the page must not overflow horizontally.

### 4. Recommended Screens
Login; Dashboard; Student directory; Individual student profile; Academic performance analytics; Attendance analytics; Department and course analytics; Student support and risk indicators; Stride Point; Data import and management; Reports and exports; Notifications; User and role management; Settings; plus an Access Denied / Not Found page and a Student portal view only if the student role is enabled.

Implement screens according to the actual Stitch design and approved requirements. Do not overcrowd the dashboard.

### 5. Backend Requirements
Use Python 3.11+. If no backend exists, prefer FastAPI when suitable; retain an existing framework when appropriate. Implement API routes (versioned under `/api`), authentication, role-based authorisation, validation (Pydantic), database access, analytics, imports, reports, logging, and structured error handling. Keep business logic out of frontend components and out of route handlers (use a services layer).

Error responses use one consistent shape, e.g. `{"error": {"code": "...", "message": "...", "details": []}}`. Lists are paginated (`page`, `page_size`, `total`). Provide `GET /api/health` (liveness) and a readiness check that verifies database connectivity.

### 6. Database Requirements
Use MySQL 8.x (InnoDB, `utf8mb4`). Model users, roles, students, departments, courses, enrollments, academic records, attendance, Stride Point activities and transactions, interventions, imports, notifications, settings, and audit logs as required. Use primary/foreign keys, unique constraints (e.g. student roll number), CHECK constraints where supported, and indexes on filter/join columns. Use **versioned migrations (e.g. Alembic)** as the single source of schema truth; any `schema.sql` is generated/exported documentation only. Do not overwrite or destroy existing data. Use soft deactivation (status flags) rather than hard deletes for students and users. Store timestamps in UTC.

### 7. Analytics
Use Pandas and NumPy where appropriate for CSV/Excel processing, cleaning, aggregation, academic performance, attendance, trends, department comparisons, and reports. Document every formula in code and in `docs/`. Handle missing data and zero denominators safely and distinguish **missing** from **zero**. Compare only compatible periods and scales. Identify students for review using transparent, configurable criteria and show the reason for each flag; never automatically make consequential decisions. Do not claim predictive accuracy.

### 8. Stride Point
Treat Stride Point as a configurable student-development points feature. Confirm official activity categories, values, approvals, expiry, duplicate-award, reversal rules, role permissions, and student visibility before final implementation. Until confirmed, build it configuration-driven (no hardcoded values) and mark it "policy pending" in the UI/docs. Store auditable, append-only transactions (corrections are new reversal transactions); derive balances from valid transactions rather than keeping a manually editable total.

### 9. Frontend–Backend Integration
Use a central API client and environment-based API configuration. Implement request/response handling, authentication, permission errors (401 → login, 403 → access denied), loading states, form validation, request cancellation/debouncing for search, and refreshes after successful updates. Do not leave important controls as decorative placeholders and do not use hardcoded arrays for production analytics.

### 10. Security Baseline
- Hash passwords with Argon2id or bcrypt; never store or log plaintext passwords or tokens.
- Use short-lived access tokens or secure server sessions (HttpOnly, Secure, SameSite cookies preferred); enforce expiry and logout.
- Rate-limit login; lock or delay after repeated failures.
- Enforce authorisation on the backend for every route and for record-level access (e.g. faculty see only permitted students; students see only themselves).
- Restrict CORS to configured origins; use HTTPS in production.
- Validate uploads (type, size limit, content), never execute or trust uploaded content, and neutralise spreadsheet formula injection in exports (cells starting with `=`, `+`, `-`, `@`).
- Use a least-privilege MySQL account; never expose MySQL to the browser.
- Do not log full student records or personal data; write audit logs for sensitive actions (login, import, role change, Stride Point award/reversal, exports).
- Follow the institution's data-protection obligations (confirm applicable law/policy, e.g. India's DPDP Act, 2023) and use fictional/anonymised data for development.

### 11. Testing
Test startup, login/logout, navigation, student CRUD, search/filtering, imports, analytics formulas (including zero/missing/boundary cases), Stride Point, exports, database persistence, permissions (each role vs each protected route), API errors, responsive layouts, theme switching, and the production build. Prefer automated tests (pytest for backend; a frontend test or documented manual checklist) and record results.

### 12. Deployment
Document production environment variables, dependencies (pinned), startup/build commands, database setup and migration command, API URL, CORS, HTTPS, health checks, backups and restore testing, logging, and secure secret handling. Verify the deployed frontend, backend, and database together.

### 13. Working Method
Work in phases (see PRDfile.MD §16). At the end of each phase: run tests, update Knowledge.MD (completed work, changed files, config changes, issues, decisions) and the Status Tracker in Readme.MD. Report honestly what is done, partial, or untested.

### 14. Definition of Done
The Stitch UI is preserved appropriately; required screens and navigation work; APIs and database persist real records; analytics are correct and tested; Stride Point follows documented, confirmed rules; imports and reports work; errors are handled; student information is protected and role-restricted; documentation is current; and deployment instructions and end-to-end tests are complete.
