# PRDfile.MD
# Product Requirements Document

## 1. Product Information
- Official title: Centralised Student Analysis Platform
- Suggested short name: CampusIQ (pending team approval)
- Category: Campus Innovation
- Type: Web application
- Users: Students (if portal included), faculty, department coordinators, authorised administrators
- Frontend: Existing Stitch-generated interface
- Backend: Python
- Database: MySQL
- Data processing: Pandas and NumPy
- Version control: Git and GitHub

## 2. Product Vision
Centralise student-related institutional data and turn it into useful academic insights. Help authorised users review student performance, monitor attendance, compare institutional outcomes, identify students who may need support, and track approved development activities through Stride Point.

## 3. Problem Statement
Student information may be scattered across spreadsheets, attendance systems, academic records, and departmental processes. This makes it difficult to understand progress, detect concerns, compare performance, and prepare reports. The platform provides a unified interface for authorised data management and analytics.

## 4. Goals and Success Measures
| Goal | How success is checked |
|---|---|
| Centralise student information | Records for all in-scope students stored in one database |
| Simplify academic and attendance analytics | Metrics computed by the backend and matching manual spot-checks |
| Reduce manual calculation | A semester's attendance/performance report generated without spreadsheets |
| Identify students who may need support | Flags shown with a reason and reviewable by authorised staff |
| Track Stride Point | Balances derived from auditable transactions |
| Generate useful reports | Required reports export correctly and respect permissions |
| Protect information | Role tests show no unauthorised access |
Targets (e.g. import time, page load) are to be agreed with the team.

## 5. Non-Goals
The initial release does not replace the entire student information system, guarantee academic success, automatically make disciplinary decisions, make unsupported predictions, replace official policies, or claim external integrations (email/SMS, ERP, biometric systems) that have not been implemented. Power BI is not required.

## 6. User Roles
### Administrator
Manage users, departments, courses, student records, imports, thresholds, Stride Point, reports, and settings.

### Faculty
View permitted student records and analytics; review academic performance and attendance; record authorised interventions where allowed.

### Department Coordinator
Review department-level summaries, compare courses/semesters, and access permitted reports for their department.

### Student (only if a portal is included)
View their own permitted academic information, attendance, Stride Point balance/history, notifications, and approved reports. Students must not access other students' records.

Implement only roles and permissions required for the actual deployment.

### 6.1 Draft Permission Matrix (confirm with the team)
| Capability | Admin | Coordinator | Faculty | Student |
|---|---|---|---|---|
| Manage users/roles/settings | ✔ | – | – | – |
| Create/update/deactivate students | ✔ | – | – | – |
| View student records | All | Own department | Assigned courses/students | Self only |
| Dashboard & analytics | All | Own department | Permitted scope | Self only |
| Import data | ✔ | – | – | – |
| Support flags & interventions | ✔ | View | Record/update | – |
| Stride Point award/approve/reverse | ✔ | Approve (if policy allows) | Propose (if policy allows) | View own |
| Reports/exports | All | Own department | Permitted scope | Own approved |

## 7. Information Architecture
Separate screens for Login, Dashboard, Students, Student Profile, Academic Analytics, Attendance, Departments and Courses, Student Support, Stride Point, Data Management, Reports, Notifications, User Management, and Settings, plus Access Denied and Not Found pages. Respect roles and avoid putting every feature on one screen.

## 8. Functional Requirements

### 8.1 Authentication
Login, input validation, secure password handling, authenticated sessions with expiry, role-based access, logout, login rate limiting, and clear (non-revealing) errors. Account creation and recovery follow the institution's process. No unrestricted public administrator registration. Seed administrator credentials are created via a secure setup step, never hardcoded.

### 8.2 Dashboard
Concise summary of available permitted metrics: student count, departments, courses, average performance, average attendance, students needing review, Stride Point activity. Include only metrics supported by data. A limited number of useful cards, date/semester filters, readable charts, and links to detail screens. Loading, error, and empty states.

### 8.3 Student Directory
List, search, filter, sort, and paginate. Filters by department, course, semester, or academic year. Profile navigation and authorised create/update/deactivate. Validate required fields and unique identifiers (e.g. roll number). Deactivation must not destroy historical records and is reversible by an administrator.

### 8.4 Student Profile
Focused sections: basic information, department/course, academic history, attendance summary, performance trends, Stride Point balance/history, approved interventions. Enforce permissions.

### 8.5 Academic Analytics
Subject-wise and semester-wise performance, department/course comparisons, assessment summaries, distributions, and trends. Follow institutional grading rules; explain metrics; do not compare incompatible scales without suitable normalisation. Show sample size so small groups are not over-interpreted.

### 8.6 Attendance Analytics
Student, course, and department attendance; trends; date/semester filters; configured thresholds; records below the applicable threshold.
Formula: Attendance Percentage = (Classes Attended / Total Classes Held) × 100.
Handle missing records and zero total classes safely (return "not available"), and distinguish missing data from low attendance. Leave/excused-absence treatment follows institutional policy (pending).

### 8.7 Department and Course Analytics
Department/course summaries, student counts, performance and attendance comparisons, and period filters. Enforce departmental permissions.

### 8.8 Student Support
Transparent indicators such as attendance below a configured threshold, declining comparable assessment results, or incomplete records. Show the reason for each flag; allow authorised support actions; track status/history (e.g. Open → In review → Resolved/Dismissed) with who acted and when. Flags support human review and must not automatically label students as failures. Visibility of flags to students is a pending decision.

### 8.9 Stride Point
Track institution-approved activities and points. Suggested categories (not official until approved): workshops, skill development, approved campus events, verified extracurricular participation, institutional contributions.

Student view (if enabled): balance, total earned, activity history, category, award date, status.

Admin view: activity configuration, point values, award forms, student search, transaction history, approval/rejection workflow if needed, duplicate prevention, audit history, corrections/reversals.

Transactions are append-only and include: transaction ID, student ID, activity/category, points, date, status (pending/approved/rejected/reversed), created-by, approver where applicable, reason/reference, and timestamps. Balances are calculated from valid transactions. Corrections are made by reversal transactions, never by editing history. Official rules for eligibility, values, approval, duplicates, expiry, and reversals must be confirmed first.

### 8.10 Data Import
CSV and Excel (.csv, .xlsx) when required. File selection, size/type validation, preview, column mapping, required-field checks, duplicate and missing-value detection, import summary, row-level errors (downloadable), confirmation, and import history. Downloadable template files per dataset. Invalid data must not silently corrupt records: validate before commit or use controlled transactions; re-importing the same file must not create duplicates (define the unique key per dataset).

### 8.11 Reports and Exports
Academic, attendance, department, support, and Stride Point reports. CSV/Excel and PDF if required. Respect permissions and filters; avoid unnecessary private data; protect against spreadsheet formula injection; log exports of student data.

### 8.12 Notifications
In-app notifications for import results, support updates, Stride Point decisions, and administrative updates, with read/unread state. Do not claim email/SMS functionality unless configured and tested.

### 8.13 User Management
Authorised admins can list users, assign roles, activate/deactivate accounts, reset access per institutional process, update permitted details, and review access information. An admin cannot remove their own last administrator role.

### 8.14 Settings
Profile preferences, theme, academic thresholds, academic period configuration, and display settings. Separate user preferences from system-wide configuration; changes to system-wide settings are audit-logged.

## 9. UI/UX Requirements
Use the existing Stitch design as the primary reference. Simple, professional, readable, consistent, accessible (target WCAG 2.1 AA), and responsive. Clear headings, contextual actions, whitespace, consistent navigation, meaningful chart labels/units, and appropriate empty/error states. Avoid overcrowding, excessive decoration, tiny text, fake live metrics, and non-functional buttons. Wide tables must not cause full-page overflow.

## 10. Technical Architecture
- Frontend: existing Stitch-generated framework; UI, navigation, forms, charts, API communication, client-side validation.
- Backend: Python (FastAPI proposed); authentication, business rules, validation, database operations, analytics, imports, reports, API responses.
- Database: MySQL 8.x; persistent records, managed with versioned migrations.
- Processing: Pandas and NumPy where appropriate.
- API: REST/JSON under `/api`; the browser never connects directly to MySQL.

## 11. Suggested Data Entities
users, roles, students, departments, courses, enrollments, academic_periods, academic_records, attendance_records, stride_activities, stride_transactions, support_interventions, imported_datasets, import_errors, notifications, system_settings, audit_logs. Adapt to existing data and avoid redundancy.

## 12. Suggested API Groups
Adapt to existing conventions; enforce authentication/permissions. Lists accept `page`, `page_size`, `search`, `sort`, and filters.

**Platform:** GET /api/health
**Auth:** POST /api/auth/login · POST /api/auth/logout · GET /api/auth/me
**Students:** GET /api/students · GET /api/students/{student_id} · POST /api/students · PUT /api/students/{student_id} · PATCH /api/students/{student_id}/status
**Reference data:** GET/POST/PUT /api/departments · /api/courses · /api/academic-periods
**Analytics:** GET /api/analytics/dashboard · /academic · /attendance · /departments · /student-support
**Support:** GET /api/support/flags · POST /api/support/interventions · PATCH /api/support/interventions/{id}
**Stride Point:** GET /api/stride/activities · POST/PUT /api/stride/activities · GET /api/stride/students/{student_id} · GET /api/stride/transactions · POST /api/stride/transactions · POST /api/stride/transactions/{id}/approve · POST /api/stride/transactions/{id}/reject · POST /api/stride/transactions/{id}/reverse
**Imports:** POST /api/imports (upload+validate) · POST /api/imports/{id}/confirm · GET /api/imports · GET /api/imports/{id}
**Reports:** GET /api/reports/academic · /attendance · /stride · /support
**Notifications:** GET /api/notifications · PATCH /api/notifications/{id}/read
**Users & settings:** GET/POST /api/users · PATCH /api/users/{id} · GET/PUT /api/settings

These are suggested routes, not proof that endpoints already exist.

## 13. Data Quality
Validate required fields, identifiers, dates, numerical ranges, missing values, and duplicates. Report import errors, preserve relationships, prevent unintended duplicate transactions, and distinguish zero from missing/unavailable values. Marks/attendance cannot exceed their maximums or be negative; attended ≤ held.

## 14. Security and Privacy
Secure authentication, role-based and record-level permissions, password hashing, validation, protected credentials, safe uploads, restricted student-record access, audit logs for sensitive actions, HTTPS in production, and export restrictions. Use fictional/anonymised development data unless real data use is authorised. Confirm applicable data-protection obligations (e.g. India's DPDP Act, 2023) and the institution's retention policy.

## 15. Non-Functional Requirements
- Performance: paginate large lists, index filter columns, avoid N+1 queries, aggregate analytics on the backend, process imports efficiently.
- Reliability: handle errors gracefully, preserve valid data on failed imports, use transactions for related changes, maintain database backups.
- Maintainability: separate layers, reuse components, test calculations, document environment variables, keep schema in migrations.
- Usability: predictable navigation, clear labels, useful empty states, focused screens.
- Compatibility: current Chrome, Edge, Firefox, Safari; mobile, tablet, desktop widths.

## 16. Implementation Phases
1. Inspect repository, Stitch screens, framework, backend, APIs, and database; resolve open questions in Knowledge.MD.
2. Complete frontend screens and navigation while preserving design.
3. Configure Python backend, schema/migrations, authentication, CRUD, and validation.
4. Implement and test analytics calculations.
5. Confirm Stride Point policy and implement auditable transactions.
6. Implement imports, validation, and reports.
7. Integrate and test end-to-end workflows and permissions.
8. Configure and test production deployment.

## 17. Acceptance Criteria
- Stitch design is preserved appropriately.
- Required screens and navigation work.
- Authentication and permissions work (verified per role).
- Student records can be managed by authorised users.
- Search/filtering/pagination work.
- Imports validate records and report row-level errors.
- Analytics use correct formulas and backend data, with tests for zero/missing/boundary cases.
- Stride Point follows documented rules and persists auditable transactions.
- Required exports work and respect permissions.
- Errors are clear; empty/loading states exist.
- Student data is protected.
- Frontend, backend, and database work together.
- Production build and deployment instructions are verified.

## 18. Assumptions and Risks
- Assumption: official grading, attendance, and Stride Point rules will be supplied by the institution.
- Risk: rules or data formats arrive late → keep thresholds and categories configurable.
- Risk: Stitch export lacks reusable components → extract shared layout/components early.
- Risk: real student data used without authorisation → default to synthetic data.

## 19. Final Principle
CampusIQ must be a unified application, not disconnected dashboards. Every important feature needs an appropriate UI, validated business logic, API, persistent storage where necessary, and a tested workflow.
