# KNOWLEDGE.MD
# CampusIQ Project Knowledge Base

## 1. Project Identity
Official name: Centralised Student Analysis Platform.
Suggested short name: CampusIQ (pending team approval).
Project type: Campus Innovation.
Purpose: centralise student data and provide academic, attendance, department, and student-development analytics.
Design source: Stitch. Development assistant: Antigravity.

Use the official title unless the team approves a short name. Do not rename repositories, folders, databases, or deployed services without checking their configuration.

## 2. Established Direction
- Stitch-generated frontend.
- Python backend.
- MySQL as the relational database.
- Pandas and NumPy for data processing.
- Web-based analytics; Python performs calculations, the frontend presents results.
- Stride Point feature.
- Reports and exports.
- Git/GitHub version control.
- Power BI is not mandatory.

## 3. Existing Frontend
Inspect the actual Stitch project files before development. Do not assume framework, file structure, component names, or styling technology (Stitch output may be HTML/Tailwind rather than a framework project). Preserve the established visual identity and reuse components. Keep screens focused, navigation consistent, and controls functional. Avoid overcrowding and fake statistics.

## 4. Application Areas
Dashboard; student directory and profiles; academic analytics; attendance; department/course analytics; student support; Stride Point; data import; reports; notifications; user management; settings. Align final screens with the actual Stitch design.

## 5. Backend
Python is required. FastAPI is preferred for a new backend if suitable; retain an existing framework where practical. The backend owns APIs, authentication, permissions, business logic, database operations, analytics, imports, reports, and error handling. Never expose MySQL directly to the browser.

## 6. Database
MySQL 8.x (InnoDB, utf8mb4). Possible entities: users, roles, students, departments, courses, enrollments, academic records, attendance, Stride Point activities/transactions, interventions, imports, notifications, settings, and audit history. Inspect existing configuration before changing schemas. Schema changes go through versioned migrations. Never destroy or overwrite data during migrations/testing; deactivate rather than delete students and users.

## 7. Analytics
Attendance Percentage = (Classes Attended / Total Classes Held) × 100.
- If Total Classes Held = 0 or no record exists, return "not available" (null), never 0%.
- Treatment of excused/medical/duty leave is **pending policy** (see §14); default: count only classes marked present as attended.
- Round for display only (e.g. 1–2 decimals); keep full precision in calculation.

Academic metrics (marks, grade points, CGPA/SGPA) follow the institution's grading rules, which are **not yet provided**. Compare only compatible periods/scales. Student-support indicators must be explainable, configurable, and used for human review.

## 8. Stride Point
Intended student-development points feature. Official policy is not established. Confirm eligible activities, point values, approval rules, duplicate-award policy, expiry, reversal rules, role permissions, and visibility before final implementation. Store append-only auditable transactions; derive balances from valid (approved, non-reversed, non-expired) records.

## 9. UI Principles
Simple professional layouts, clear headings, readable charts with labelled axes/units, consistent navigation, whitespace, useful filters, focused detail screens, accessible controls, and meaningful feedback. Avoid overcrowded screens, excessive cards, tiny text, redundant information, fake live statistics, and placeholder controls presented as functional.

## 10. Data Integrity
Validate imports, identifiers, dates, numeric ranges, missing values, and duplicates. Preserve relationships, prevent unauthorised updates, use transactions for related operations, and document formulas. Use fictional/anonymised development data unless real data use is authorised. Clearly label demonstration data.

## 11. Security
Secure password hashing (Argon2id/bcrypt), authentication with token/session expiry, role-based access with backend and record-level checks, login rate limiting, environment variables for secrets, restricted database credentials, safe uploads (type/size limits), export formula-injection protection, HTTPS in production, and audit logs for sensitive actions. Never commit secrets or expose credentials in frontend code.

## 12. API Integration
The frontend communicates with the Python backend through configured endpoints and a central API client. Handle success, invalid input, authentication/permission errors, missing records, network failures, backend errors, and empty datasets. Refresh the interface after successful operations. Do not use hardcoded frontend arrays for production analytics.

## 13. Deployment
Configure frontend and backend environment variables, database credentials, API base URL, CORS, startup commands, dependencies, health checks, HTTPS, and backup/restore guidance. The frontend host must support the selected build, the backend host must support Python, and the database must be securely reachable from the backend only. Test the entire deployed system.

## 14. Established vs. Pending
### Established
- Official title: Centralised Student Analysis Platform.
- Frontend design source: Stitch.
- Backend language: Python.
- Database: MySQL.
- Processing: Pandas and NumPy.
- Stride Point is intended.
- Python analytics rather than mandatory Power BI.

### Proposed / Pending Confirmation (do not treat as requirements)
- Short name CampusIQ.
- FastAPI, SQLAlchemy, Alembic for the backend.
- Exact metrics, roles (especially whether a Student portal is included), schema, grading rules/scale, attendance thresholds and leave treatment, support-flag thresholds.
- Hosting providers and deployment architecture.
- Official Stride Point policy.
- Applicable data-protection requirements and real-data authorisation.
- Report formats required (CSV/Excel/PDF).

## 15. Development Continuity
At the start of each session: inspect the repository, read Readme.MD and project instructions, check the Status Tracker, and avoid repeating completed work. At the end of major phases: record completed work, changed files, configuration changes, tests, issues, and decisions below. Update this file when decisions change.

### Decision Log
| Date | Decision / Assumption | Status | Decided by |
|---|---|---|---|
| 2026-10-12 | Full full-stack architecture implemented: FastAPI + SQLAlchemy + Alembic backend, Vite + React + TailwindCSS frontend | Confirmed | Engineering Team |
| 2026-10-12 | Attendance calculation adheres to (Classes Attended / Classes Held) * 100 with safe null return on zero held | Confirmed | Engineering Team |
| 2026-10-12 | Stride Point implemented as append-only auditable ledger with non-destructive reversal entries | Confirmed | Engineering Team |
| 2026-10-12 | Neutralize spreadsheet formula injection by prepending quote on cells starting with =, +, -, @ | Confirmed | Security Baseline |
| 2026-10-12 | Dual environment support: MySQL 8.x with PyMySQL, and SQLite fallback for local developer velocity | Confirmed | Engineering Team |

### Open Questions for the Team
1. Is the Student portal in scope for the first release?
2. What are the grading scale and CGPA/SGPA rules?
3. What are the attendance threshold and leave-treatment rules?
4. What are the official Stride Point categories, values, approvals, expiry and reversal rules?
5. Which export formats (CSV, Excel, PDF) are required?
6. Where will the system be hosted, and is real student data authorised?

## 16. Guiding Principle
Build a reliable student analytics product, not merely a visual prototype. Every important feature should have a clear UI, validated business logic, an appropriate API, persistent storage where needed, and a tested workflow.
