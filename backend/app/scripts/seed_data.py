import sys
import os
import random
from datetime import datetime, timedelta

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.database.session import Base, engine, SessionLocal
from app.models.models import (
    User, UserRole, Department, Course, AcademicPeriod, Student,
    AcademicRecord, AttendanceRecord, StrideActivity, StrideTransaction,
    SupportIntervention, Notification, SystemSetting, AuditLog
)
from app.services.auth_service import get_password_hash

def seed_database():
    print("Dropping and recreating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(User).filter(User.username == "admin").first():
            print("Database already contains seed data. Skipping.")
            return

        print("Seeding Departments...")
        departments = [
            Department(code="CSE", name="Computer Science & Engineering", description="Department of Computer Science and Engineering"),
            Department(code="ECE", name="Electronics & Communication Engineering", description="Department of Electronics & Communication"),
            Department(code="ME", name="Mechanical Engineering", description="Department of Mechanical Engineering"),
            Department(code="IT", name="Information Technology", description="Department of Information Technology")
        ]
        db.add_all(departments)
        db.flush()

        print("Seeding Users...")
        users = [
            User(
                username="admin",
                email="admin@campus.edu",
                hashed_password=get_password_hash("admin123"),
                full_name="Dr. Eleanor Vance (Administrator)",
                role=UserRole.ADMIN,
                is_active=True
            ),
            User(
                username="faculty.cs",
                email="faculty.cs@campus.edu",
                hashed_password=get_password_hash("faculty123"),
                full_name="Prof. Alan Turing",
                role=UserRole.FACULTY,
                department_id=departments[0].id,
                is_active=True
            ),
            User(
                username="coord.cs",
                email="coord.cs@campus.edu",
                hashed_password=get_password_hash("coord123"),
                full_name="Dr. Grace Hopper",
                role=UserRole.COORDINATOR,
                department_id=departments[0].id,
                is_active=True
            ),
            User(
                username="student.cs",
                email="student.cs@campus.edu",
                hashed_password=get_password_hash("student123"),
                full_name="Alex Mercer",
                role=UserRole.STUDENT,
                department_id=departments[0].id,
                is_active=True
            )
        ]
        db.add_all(users)
        db.flush()

        admin_user = users[0]

        print("Seeding Academic Periods...")
        periods = [
            AcademicPeriod(name="Fall 2025", is_current=False, start_date=datetime(2025, 8, 1), end_date=datetime(2025, 12, 15)),
            AcademicPeriod(name="Spring 2026", is_current=True, start_date=datetime(2026, 1, 10), end_date=datetime(2026, 5, 25))
        ]
        db.add_all(periods)
        db.flush()
        current_period = periods[1]

        print("Seeding Courses...")
        courses = [
            Course(code="CS101", title="Data Structures & Algorithms", department_id=departments[0].id, semester=4, credits=4),
            Course(code="CS102", title="Database Management Systems", department_id=departments[0].id, semester=4, credits=4),
            Course(code="CS103", title="Operating Systems & Concurrency", department_id=departments[0].id, semester=4, credits=3),
            Course(code="CS104", title="Software Engineering Practices", department_id=departments[0].id, semester=4, credits=3),
            Course(code="EC201", title="Digital Signal Processing", department_id=departments[1].id, semester=4, credits=4),
            Course(code="EC202", title="Microprocessors & Microcontrollers", department_id=departments[1].id, semester=4, credits=4),
            Course(code="ME301", title="Thermodynamics & Heat Transfer", department_id=departments[2].id, semester=4, credits=4),
            Course(code="IT401", title="Web Systems & Security", department_id=departments[3].id, semester=4, credits=3)
        ]
        db.add_all(courses)
        db.flush()

        print("Seeding Stride Activities...")
        stride_activities = [
            StrideActivity(name="Technical Hackathon Winner / Runner-up", category="Campus Events", default_points=35, description="Placing in an institutional or inter-college hackathon"),
            StrideActivity(name="Cloud Computing / DevOps Certification", category="Skill Development", default_points=30, description="Completion of certified industry skill track"),
            StrideActivity(name="Open-Source Software Contribution", category="Extracurricular", default_points=20, description="Merged PRs in verified open source repository"),
            StrideActivity(name="Peer Tutoring & Academic Mentorship", category="Institutional Contributions", default_points=15, description="Conducting tutorial sessions for junior batches"),
            StrideActivity(name="AI / ML Hands-on Workshop Attendance", category="Workshops", default_points=10, description="Full day technical workshop attendance"),
            StrideActivity(name="Annual Cultural / Sports Organization", category="Campus Events", default_points=15, description="Volunteering in college fest coordination")
        ]
        db.add_all(stride_activities)
        db.flush()

        print("Seeding Students...")
        student_data = [
            ("CS2026001", "Alex Mercer", "alex.mercer@campus.edu", "9876543201", departments[0], 4, 88.5, 9.2),
            ("CS2026002", "Sophia Chen", "sophia.chen@campus.edu", "9876543202", departments[0], 4, 94.0, 9.8),
            ("CS2026003", "Rahul Sharma", "rahul.sharma@campus.edu", "9876543203", departments[0], 4, 68.0, 6.2), # At-risk attendance (<75%)
            ("CS2026004", "Priya Nair", "priya.nair@campus.edu", "9876543204", departments[0], 4, 78.5, 4.6),    # At-risk GPA (<5.0)
            ("CS2026005", "David Miller", "david.miller@campus.edu", "9876543205", departments[0], 4, 62.0, 4.2), # Double at-risk (attendance & GPA)
            ("CS2026006", "Ananya Rao", "ananya.rao@campus.edu", "9876543206", departments[0], 4, 85.0, 8.5),
            ("CS2026007", "Karthik Verma", "karthik.verma@campus.edu", "9876543207", departments[0], 4, 91.5, 8.9),
            ("CS2026008", "Elena Rostova", "elena.rostova@campus.edu", "9876543208", departments[0], 4, 71.0, 7.4), # At-risk attendance
            ("EC2026001", "Vikram Patel", "vikram.patel@campus.edu", "9876543209", departments[1], 4, 89.0, 8.4),
            ("EC2026002", "Neha Gupta", "neha.gupta@campus.edu", "9876543210", departments[1], 4, 92.5, 9.1),
            ("EC2026003", "Rohan Iyer", "rohan.iyer@campus.edu", "9876543211", departments[1], 4, 64.5, 5.8), # At-risk attendance
            ("EC2026004", "Meera Sen", "meera.sen@campus.edu", "9876543212", departments[1], 4, 82.0, 7.9),
            ("ME2026001", "Arjun Reddy", "arjun.reddy@campus.edu", "9876543213", departments[2], 4, 86.0, 7.5),
            ("ME2026002", "Pooja Hegde", "pooja.hegde@campus.edu", "9876543214", departments[2], 4, 79.0, 6.8),
            ("ME2026003", "Siddharth Das", "siddharth.das@campus.edu", "9876543215", departments[2], 4, 69.5, 4.8), # Double at-risk
            ("IT2026001", "Tanvi Joshi", "tanvi.joshi@campus.edu", "9876543216", departments[3], 4, 95.0, 9.5),
            ("IT2026002", "Karan Malhotra", "karan.malhotra@campus.edu", "9876543217", departments[3], 4, 81.0, 7.2),
            ("IT2026003", "Zoya Khan", "zoya.khan@campus.edu", "9876543218", departments[3], 4, 73.0, 8.0) # At-risk attendance
        ]

        created_students = []
        for roll, name, email, phone, dept, sem, target_att, target_gpa in student_data:
            s = Student(
                roll_number=roll,
                full_name=name,
                email=email,
                phone=phone,
                department_id=dept.id,
                current_semester=sem,
                academic_year="2025-2026",
                status="active"
            )
            db.add(s)
            created_students.append((s, dept, target_att, target_gpa))

        db.flush()

        print("Seeding Academic and Attendance records...")
        dept_course_map = {
            departments[0].id: courses[:4],
            departments[1].id: courses[4:6],
            departments[2].id: [courses[6]],
            departments[3].id: [courses[7]]
        }

        grade_scales = [
            (90, "O", 10.0),
            (80, "A+", 9.0),
            (70, "A", 8.0),
            (60, "B+", 7.0),
            (50, "B", 6.0),
            (40, "C", 5.0),
            (0, "F", 0.0)
        ]

        for s, dept, target_att, target_gpa in created_students:
            assigned_courses = dept_course_map.get(dept.id, [courses[0]])
            for c in assigned_courses:
                # Attendance: compute classes attended out of 50 classes held
                total_classes = 50
                attended = int((target_att / 100.0) * total_classes)
                attended = max(0, min(total_classes, attended + random.randint(-2, 2)))
                att_rec = AttendanceRecord(
                    student_id=s.id,
                    course_id=c.id,
                    academic_period_id=current_period.id,
                    classes_held=total_classes,
                    classes_attended=attended
                )
                db.add(att_rec)

                # Academic record: generate marks corresponding to target GPA
                base_marks = (target_gpa / 10.0) * 100.0 + random.uniform(-4, 4)
                base_marks = max(35.0, min(98.0, base_marks))
                internal = round(base_marks * 0.4, 1)
                external = round(base_marks * 0.6, 1)
                total = internal + external

                # Determine grade
                assigned_grade, assigned_gp = "C", 5.0
                for cutoff, g, gp in grade_scales:
                    if total >= cutoff:
                        assigned_grade = g
                        assigned_gp = gp
                        break

                acad_rec = AcademicRecord(
                    student_id=s.id,
                    course_id=c.id,
                    academic_period_id=current_period.id,
                    internal_marks=internal,
                    external_marks=external,
                    total_marks=total,
                    grade=assigned_grade,
                    grade_point=assigned_gp,
                    is_passed=(assigned_gp > 0)
                )
                db.add(acad_rec)

        db.flush()

        print("Seeding Stride Transactions...")
        # Award sample stride points to students
        stride_samples = [
            (created_students[0][0], stride_activities[0], 35, "Winner in Hackathon 2026"),
            (created_students[0][0], stride_activities[4], 10, "Attended Deep Learning Workshop"),
            (created_students[1][0], stride_activities[1], 30, "AWS Solutions Architect Associate Certified"),
            (created_students[1][0], stride_activities[2], 20, "FastAPI core documentation contributor"),
            (created_students[5][0], stride_activities[3], 15, "Conducted 4 peer mentoring sessions for DSA"),
            (created_students[6][0], stride_activities[5], 15, "Campus tech fest lead organizer"),
            (created_students[8][0], stride_activities[0], 25, "Runner up in Embedded IoT Hackathon")
        ]

        for st, act, pts, reason in stride_samples:
            tx = StrideTransaction(
                student_id=st.id,
                activity_id=act.id,
                points=pts,
                status="approved",
                reason=reason,
                reference_doc="CERT-2026-REF",
                awarded_by_id=admin_user.id,
                approved_by_id=admin_user.id
            )
            db.add(tx)

        db.flush()

        print("Seeding Support Interventions...")
        # Rahul Sharma (CS2026003) - Low attendance intervention
        rahul = created_students[2][0]
        i1 = SupportIntervention(
            student_id=rahul.id,
            flag_reason="Attendance below 75% in CSE 4th Semester",
            intervention_type="Academic Counseling",
            status="in_progress",
            notes="Student had health issues; medical documentation provided. Faculty advisor assigned remedial material.",
            action_taken_by_id=admin_user.id
        )
        db.add(i1)

        # Priya Nair (CS2026004) - Low GPA intervention
        priya = created_students[3][0]
        i2 = SupportIntervention(
            student_id=priya.id,
            flag_reason="CGPA below 5.0 (Review Threshold)",
            intervention_type="Remedial Tutoring",
            status="open",
            notes="Scheduled twice-weekly tutoring in Data Structures with senior peer mentor.",
            action_taken_by_id=admin_user.id
        )
        db.add(i2)

        print("Seeding System Settings and Notifications...")
        settings_rows = [
            SystemSetting(key="attendance_threshold", value="75.0", description="Minimum attendance % before review flag", updated_by_id=admin_user.id),
            SystemSetting(key="at_risk_gpa_threshold", value="5.0", description="Minimum CGPA before academic review flag", updated_by_id=admin_user.id),
            SystemSetting(key="stride_policy_status", value="pending", description="Institutional status of Stride Point policy", updated_by_id=admin_user.id)
        ]
        db.add_all(settings_rows)

        notifications_rows = [
            Notification(
                title="Academic Term Initialized",
                message="Spring 2026 semester data loaded. All academic metrics and attendance tracking active.",
                type="info"
            ),
            Notification(
                title="Attendance Review Notice",
                message="4 students have been flagged with attendance below 75%. Authorised staff please review support queue.",
                type="warning"
            ),
            Notification(
                title="Stride Point Ledger Ready",
                message="Append-only transaction ledger is active. 7 verified activities recorded.",
                type="success"
            )
        ]
        db.add_all(notifications_rows)

        db.commit()
        print("Database seeded successfully with rich institutional data!")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
