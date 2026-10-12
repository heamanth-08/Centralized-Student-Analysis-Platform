# SKILL.MD
## Development Skills and Technical Standards

### Project Context
Project: Centralised Student Analysis Platform. Suggested short name: CampusIQ. Use the existing Stitch frontend, Python backend, and MySQL database where appropriate. Items marked "proposed" are not confirmed requirements (see Knowledge.MD).

### Frontend Skills
- Inspect and maintain the existing framework and Stitch components; do not change frameworks without a clear reason.
- Build reusable components and responsive layouts.
- Implement forms, tables, search (debounced), filters, sorting, pagination, charts, and state management.
- Integrate REST APIs through one central client; handle loading, empty, success, and error states, and 401/403 responses.
- Maintain consistent navigation, accessibility (semantic HTML, labels, keyboard use, contrast), and light/dark themes where supported.
- Keep access tokens out of insecure storage where possible (prefer HttpOnly cookies); never place secrets in frontend code.

### Backend Skills
- Python 3.11+ and REST API development (FastAPI proposed for a new backend; retain an existing framework when practical).
- Request/response validation (Pydantic), consistent error format, and pagination.
- Authentication and authorisation, including record-level checks.
- Password hashing (Argon2id or bcrypt), token/session expiry, login rate limiting.
- Exception handling and structured logging without personal data.
- Database integration and transaction management.
- File import processing and report generation (CSV/Excel via Pandas/openpyxl; PDF via a library such as ReportLab or WeasyPrint if required).
- Separation of API, business logic (services), and data access.
- Background handling for long imports/reports where needed.

### Database Skills
- MySQL 8 schema design and SQL (InnoDB, utf8mb4).
- Primary/foreign keys, unique and check constraints, and indexes on filter/join columns.
- Versioned migrations (Alembic proposed); never edit applied migrations.
- CRUD, transactions, soft deactivation, and data integrity.
- Secure connection configuration with a least-privilege application account.
- SQLAlchemy 2.x or an existing suitable library; avoid N+1 queries.

### Data Analysis
Use Pandas and NumPy for CSV/Excel processing, missing-value handling, validation, aggregation, performance summaries, attendance, trends, department comparisons, and report preparation. Use charting libraries compatible with the existing frontend. Power BI is not a mandatory dependency. Keep calculation functions pure and unit-tested.

### Analytics Rules
- Attendance Percentage = (Classes Attended / Total Classes Held) × 100.
- Zero total classes or missing records → "not available" (null), not 0%.
- Academic averages follow institutional grading rules (pending); compare only compatible periods/scales.
- Display rounding only at the presentation layer.
- Support indicators are transparent, configurable, and show their reason; do not claim predictive accuracy without a properly trained and evaluated model.

### Stride Point
Confirm the official policy before finalising calculations. Define eligible activities and point values; validate awards; prevent disallowed duplicates; record dates, reasons, approvers, and statuses; keep append-only transaction history; calculate totals from valid transactions; and audit corrections/reversals.

### API Integration
The frontend uses a central API client and environment configuration. The backend validates requests, verifies permissions, applies business rules, persists data, and returns structured responses. Never connect the browser directly to MySQL.

### Security
Secure password hashing, authentication, role-based access, input validation, safe file uploads (type, size, content checks), export formula-injection protection, restricted student-record access, environment-based secrets, CORS restricted to configured origins, dependency updates/vulnerability checks, and audit logs for sensitive actions. Never expose credentials in frontend source or commit them to version control.

### Testing
Test endpoints, database operations, calculations, Stride Point, validation, authentication, authorisation (each role vs each protected route), imports, exports, and key frontend workflows. Include missing data, invalid input, empty datasets, duplicates, and boundary conditions. Suggested tools (proposed): pytest and httpx/TestClient for the backend; a test database separate from development data; ruff/black for code style.

### Deployment
Prepare the production frontend build, Python backend, database configuration, pinned dependency files, environment-variable documentation, health/readiness checks, startup commands, CORS, logging, HTTPS, and backup/restore guidance. Test the deployed system end to end.

### Engineering Standards
Descriptive names, focused functions, reusable components, documented formulas, minimal necessary dependencies, and separate presentation/business/data layers. Preserve working features, test incremental changes, make small commits with clear messages, and record decisions in Knowledge.MD.
