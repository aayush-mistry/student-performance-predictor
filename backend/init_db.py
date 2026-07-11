from app import app, serialize_student, calculate_prediction_logic
from models import db, User, Student, StudyHours, Activity, ExamMark, Attendance, Assignment, Prediction, Exam, Event
import json

SUBJECTS = ['maths', 'science', 'ss', 'english', 'gujarati', 'hindi']
DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
ASSIGNMENT_TOTALS = {
    'Maths': 12,
    'Science': 10,
    'SS': 8,
    'English': 9,
    'Gujarati': 7,
    'Hindi': 7,
}

EXAM_RECORDS = [
    ("Mathematics", "Unit Test 3", "Unit Test", "10", "A", "2026-07-11", "09:00 AM", "10:00 AM", "1 hour", "A-201", 25, "Published", False),
    ("Science", "Unit Test 3", "Unit Test", "10", "A", "2026-07-12", "09:00 AM", "10:00 AM", "1 hour", "A-202", 25, "Published", False),
    ("English", "Unit Test 3", "Unit Test", "10", "A", "2026-07-15", "10:30 AM", "11:30 AM", "1 hour", "B-104", 25, "Published", False),
    ("Social Studies", "Unit Test 3", "Unit Test", "10", "A", "2026-07-18", "09:00 AM", "10:00 AM", "1 hour", "B-105", 25, "Scheduled", False),
    ("Gujarati", "Final Examination", "Final", "10", "A", "2026-08-03", "09:30 AM", "12:30 PM", "3 hours", "Hall 1", 100, "Published", False),
    ("Hindi", "Final Examination", "Final", "10", "A", "2026-08-06", "09:30 AM", "12:30 PM", "3 hours", "Hall 1", 100, "Published", False),
    ("Mathematics", "Final Examination", "Final", "10", "A", "2026-08-10", "09:30 AM", "12:30 PM", "3 hours", "Hall 2", 100, "Published", False),
    ("Science", "Final Examination", "Final", "10", "A", "2026-08-13", "09:30 AM", "12:30 PM", "3 hours", "Hall 2", 100, "Published", False),
    ("English", "Final Examination", "Final", "10", "A", "2026-08-17", "09:30 AM", "12:30 PM", "3 hours", "Hall 3", 100, "Published", False),
    ("Social Studies", "Final Examination", "Final", "10", "A", "2026-08-20", "09:30 AM", "12:30 PM", "3 hours", "Hall 3", 100, "Published", False),
    ("Mathematics", "Unit Test 2", "Unit Test", "10", "A", "2026-06-10", "09:00 AM", "10:00 AM", "1 hour", "A-201", 25, "Completed", True),
    ("Science", "Unit Test 2", "Unit Test", "10", "A", "2026-06-12", "09:00 AM", "10:00 AM", "1 hour", "A-202", 25, "Completed", True),
    ("English", "Mid Term Oral", "Mid Term", "10", "A", "2026-06-18", "11:00 AM", "11:45 AM", "45 minutes", "Language Lab", 20, "Completed", False),
]

EVENT_RECORDS = [
    ("Independence Day Celebration", "National Celebrations", "Flag hoisting, patriotic performances, and student speeches.", "2026-08-15", "08:00 AM", "10:30 AM", "Main Ground", "Social Science Department", "All", 800, "2026-08-10", "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", True),
    ("Science Fair", "Competitions", "Model exhibition and science demonstrations for class teams.", "2026-07-26", "09:30 AM", "02:00 PM", "Science Block", "Science Club", "8,9,10", 120, "2026-07-20", "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", True),
    ("Inter-School Coding Competition", "Competitions", "Algorithmic problem solving and web prototype challenge.", "2026-08-02", "10:00 AM", "01:00 PM", "Computer Lab", "IT Department", "9,10", 60, "2026-07-28", "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", True),
    ("Khel Mahakumbh Trials", "Sports Events", "Selection trials for athletics, kabaddi, kho-kho, and volleyball.", "2026-07-18", "07:30 AM", "11:30 AM", "Sports Ground", "Sports Department", "6,7,8,9,10", 300, "2026-07-16", "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80", "Medium", "Ongoing", True),
    ("Navaratri Celebration", "Festival Celebrations", "Traditional garba evening with class-wise performances.", "2026-09-24", "05:30 PM", "08:30 PM", "Assembly Courtyard", "Cultural Committee", "All", 900, "2026-09-18", "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80", "Medium", "Upcoming", True),
    ("Teachers' Day Celebration", "Festival Celebrations", "Student-led assembly, gratitude wall, and cultural program.", "2026-09-05", "09:00 AM", "11:00 AM", "Auditorium", "Student Council", "All", 600, "2026-09-01", "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80", "Medium", "Upcoming", True),
    ("Annual Day", "Cultural Events", "Annual prize distribution and cultural showcase.", "2026-12-20", "05:00 PM", "09:00 PM", "Town Hall", "School Administration", "All", 1000, "2026-12-10", "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", True),
    ("Career Guidance Seminar", "Academic Events", "Counsellor-led session on streams, careers, and entrance pathways.", "2026-07-30", "11:00 AM", "12:30 PM", "Seminar Hall", "Counselling Cell", "9,10", 180, "2026-07-25", "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=900&q=80", "Medium", "Upcoming", True),
    ("Parent-Teacher Meeting", "Academic Events", "Monthly academic progress discussion with class teachers.", "2026-07-12", "09:00 AM", "12:00 PM", "Classrooms", "Academic Office", "All", 0, "2026-07-11", "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", True),
    ("Quiz Competition", "Competitions", "House-wise general knowledge and current affairs quiz.", "2026-06-28", "10:00 AM", "12:00 PM", "Auditorium", "Library Club", "6,7,8,9,10", 80, "2026-06-24", "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80", "Medium", "Completed", True),
    ("Sports Day", "Sports Events", "Track finals, march past, and inter-house relay events.", "2026-06-15", "07:30 AM", "12:30 PM", "Main Ground", "Sports Department", "All", 700, "2026-06-08", "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=900&q=80", "High", "Completed", True),
    ("Drawing Competition", "Competitions", "Theme-based drawing event for junior and senior groups.", "2026-05-22", "09:30 AM", "11:00 AM", "Art Room", "Art Department", "5,6,7,8", 90, "2026-05-18", "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=900&q=80", "Low", "Completed", True),
    ("Robotics Workshop", "Academic Events", "Hands-on robotics and sensors workshop.", "2026-08-24", "10:00 AM", "03:00 PM", "Innovation Lab", "STEM Cell", "8,9,10", 45, "2026-08-18", "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=900&q=80", "High", "Upcoming", False),
]

STUDENT_RECORDS = [
    ('S103', 'Aarav Sharma', 'Rajesh Sharma', '+91 98765 41003', 'aarav.sharma@example.edu', '10', 'A', 'top', [91, 93, 90, 92, 95, 89], 5.5, 1.4, 1, 52),
    ('S104', 'Diya Patel', 'Mehul Patel', '+91 98765 41004', 'diya.patel@example.edu', '10', 'A', 'top', [88, 90, 87, 91, 94, 90], 5.1, 1.6, 1, 50),
    ('S105', 'Kabir Mehta', 'Nilesh Mehta', '+91 98765 41005', 'kabir.mehta@example.edu', '10', 'B', 'average', [73, 76, 71, 75, 80, 74], 3.8, 2.5, 3, 43),
    ('S106', 'Ananya Iyer', 'Suresh Iyer', '+91 98765 41006', 'ananya.iyer@example.edu', '10', 'B', 'top', [92, 89, 91, 94, 88, 90], 5.3, 1.5, 1, 51),
    ('S107', 'Rohan Verma', 'Manish Verma', '+91 98765 41007', 'rohan.verma@example.edu', '10', 'C', 'weak', [52, 55, 49, 58, 61, 54], 2.4, 4.1, 6, 31),
    ('S108', 'Meera Nair', 'Prakash Nair', '+91 98765 41008', 'meera.nair@example.edu', '10', 'A', 'average', [78, 74, 76, 81, 79, 77], 4.0, 2.3, 2, 44),
    ('S109', 'Vivaan Reddy', 'Krishna Reddy', '+91 98765 41009', 'vivaan.reddy@example.edu', '10', 'B', 'top', [86, 88, 84, 87, 90, 86], 4.8, 1.8, 2, 49),
    ('S110', 'Saanvi Desai', 'Ketan Desai', '+91 98765 41010', 'saanvi.desai@example.edu', '10', 'C', 'average', [69, 72, 68, 74, 76, 71], 3.5, 2.8, 4, 40),
    ('S111', 'Arjun Singh', 'Harpreet Singh', '+91 98765 41011', 'arjun.singh@example.edu', '10', 'A', 'weak', [45, 48, 50, 52, 56, 49], 2.0, 4.6, 7, 27),
    ('S112', 'Ishita Joshi', 'Bhavesh Joshi', '+91 98765 41012', 'ishita.joshi@example.edu', '10', 'B', 'top', [94, 92, 89, 93, 96, 91], 5.7, 1.3, 0, 53),
    ('S113', 'Aditya Kulkarni', 'Vikram Kulkarni', '+91 98765 41013', 'aditya.kulkarni@example.edu', '10', 'C', 'average', [64, 66, 62, 70, 73, 68], 3.2, 3.0, 4, 38),
    ('S114', 'Priya Shah', 'Amit Shah', '+91 98765 41014', 'priya.shah@example.edu', '10', 'A', 'top', [87, 85, 88, 90, 93, 89], 4.9, 1.7, 1, 50),
    ('S115', 'Neel Choudhary', 'Mahendra Choudhary', '+91 98765 41015', 'neel.choudhary@example.edu', '10', 'B', 'weak', [58, 54, 57, 60, 63, 55], 2.6, 3.8, 5, 33),
    ('S116', 'Kavya Pillai', 'Ramesh Pillai', '+91 98765 41016', 'kavya.pillai@example.edu', '10', 'C', 'average', [75, 78, 72, 80, 82, 76], 4.1, 2.2, 2, 45),
    ('S117', 'Yash Gupta', 'Sanjay Gupta', '+91 98765 41017', 'yash.gupta@example.edu', '10', 'A', 'average', [70, 69, 73, 72, 75, 71], 3.6, 2.7, 3, 41),
    ('S118', 'Aisha Khan', 'Imran Khan', '+91 98765 41018', 'aisha.khan@example.edu', '10', 'B', 'top', [89, 91, 86, 92, 90, 88], 5.0, 1.6, 1, 51),
    ('S119', 'Dev Malhotra', 'Gaurav Malhotra', '+91 98765 41019', 'dev.malhotra@example.edu', '10', 'C', 'weak', [41, 44, 46, 50, 52, 47], 1.8, 4.9, 8, 25),
    ('S120', 'Nisha Banerjee', 'Subhash Banerjee', '+91 98765 41020', 'nisha.banerjee@example.edu', '10', 'A', 'average', [80, 77, 79, 82, 85, 78], 4.3, 2.1, 2, 46),
    ('S121', 'Om Prakash', 'Dinesh Prakash', '+91 98765 41021', 'om.prakash@example.edu', '10', 'B', 'weak', [55, 59, 53, 57, 60, 56], 2.5, 3.9, 6, 32),
    ('S122', 'Tara Menon', 'Anil Menon', '+91 98765 41022', 'tara.menon@example.edu', '10', 'C', 'top', [90, 88, 92, 89, 91, 90], 5.2, 1.5, 1, 52),
    ('S123', 'Harsh Vyas', 'Mukesh Vyas', '+91 98765 41023', 'harsh.vyas@example.edu', '10', 'A', 'average', [67, 71, 69, 73, 74, 70], 3.4, 2.9, 4, 39),
    ('S124', 'Riya Saxena', 'Pankaj Saxena', '+91 98765 41024', 'riya.saxena@example.edu', '10', 'B', 'top', [84, 87, 83, 86, 89, 85], 4.7, 1.9, 2, 48),
    ('S125', 'Manav Bansal', 'Deepak Bansal', '+91 98765 41025', 'manav.bansal@example.edu', '10', 'C', 'weak', [49, 51, 47, 53, 58, 50], 2.1, 4.4, 7, 28),
    ('S126', 'Zoya Sheikh', 'Farhan Sheikh', '+91 98765 41026', 'zoya.sheikh@example.edu', '10', 'A', 'average', [76, 73, 75, 78, 81, 77], 3.9, 2.4, 3, 43),
    ('S127', 'Parth Trivedi', 'Jignesh Trivedi', '+91 98765 41027', 'parth.trivedi@example.edu', '10', 'B', 'top', [93, 90, 91, 88, 92, 89], 5.4, 1.4, 1, 52),
]


def build_attendance(absent_count):
    holidays = {4, 5, 11, 12, 18, 19, 25, 26}
    absent_options = [3, 7, 10, 14, 17, 21, 23, 28]
    absent_days = set(absent_options[:absent_count])
    return [
        {
            'date': f"2026-04-{day:02d}",
            'status': 'holiday' if day in holidays else 'absent' if day in absent_days else 'present'
        }
        for day in range(1, 31)
    ]


def build_activities(study_average, screen_average, profile):
    study_offsets = [-0.2, 0.3, -0.4, 0.4, 0.1, -0.6, -0.8]
    screen_offsets = [-0.1, -0.3, 0.2, -0.2, 0.1, 0.5, 0.7]
    sports_base = 1.2 if profile == 'top' else 1.0 if profile == 'average' else 0.7
    return [
        {
            'day': day,
            'study': round(max(0.8, study_average + study_offsets[index]), 1),
            'screen': round(max(0.6, screen_average + screen_offsets[index]), 1),
            'sports': round(max(0.3, sports_base + ([0.0, -0.1, 0.2, -0.2, 0.1, 0.4, 0.5][index])), 1),
        }
        for index, day in enumerate(DAYS)
    ]


def build_exams(latest_marks, profile):
    growth = 7 if profile == 'top' else 5 if profile == 'average' else 3
    unit_1 = [max(0, mark - growth) for mark in latest_marks]
    mid_term = [max(0, mark - max(2, growth // 2)) for mark in latest_marks]
    return [
        dict(zip(SUBJECTS, unit_1), name='Unit Test 1'),
        dict(zip(SUBJECTS, mid_term), name='Mid Term'),
        dict(zip(SUBJECTS, latest_marks), name='Unit Test 2'),
    ]


def build_assignments(completed_total):
    completed = {}
    remaining = sum(ASSIGNMENT_TOTALS.values()) - completed_total
    for subject, assigned in reversed(ASSIGNMENT_TOTALS.items()):
        missed = min(assigned, remaining)
        completed[subject] = assigned - missed
        remaining -= missed
    return [
        {'subject': subject, 'assigned': assigned, 'completed': completed[subject]}
        for subject, assigned in ASSIGNMENT_TOTALS.items()
    ]


def seed_student_record(record):
    roll_no, name, parent_name, contact, email, current_class, division, profile, latest_marks, study_avg, screen_avg, absent_count, completed_total = record
    student = Student.query.filter_by(roll_no=roll_no).first()
    if student:
        return False

    user = User(
        username=roll_no.lower(),
        password='password',
        role='student'
    )
    db.session.add(user)
    db.session.flush()

    student = Student(
        user_id=user.id,
        name=name,
        roll_no=roll_no,
        current_class=current_class,
        division=division,
        parent_name=parent_name,
        contact=contact,
        email=email
    )
    db.session.add(student)
    db.session.flush()

    db.session.add(StudyHours(
        student_id=student.id,
        tuition=round(1.0 + (study_avg * 0.28), 1),
        self_study=round(max(0.8, study_avg - 1.2), 1),
        sports=1.2 if profile == 'top' else 1.0 if profile == 'average' else 0.7,
        mobile_screen=screen_avg,
        sleep=7.6 if profile == 'top' else 7.1 if profile == 'average' else 6.5,
        revision=round(0.6 + (study_avg * 0.18), 1)
    ))

    for activity in build_activities(study_avg, screen_avg, profile):
        db.session.add(Activity(student_id=student.id, **activity))

    for exam in build_exams(latest_marks, profile):
        db.session.add(ExamMark(student_id=student.id, **exam))

    for attendance in build_attendance(absent_count):
        db.session.add(Attendance(student_id=student.id, **attendance))

    for assignment in build_assignments(completed_total):
        db.session.add(Assignment(student_id=student.id, **assignment))

    db.session.flush()
    prediction_data = calculate_prediction_logic(serialize_student(student))
    if prediction_data:
        db.session.add(Prediction(
            student_id=student.id,
            predicted_average=prediction_data['predictedAverage'],
            previous_average=prediction_data['previousAverage'],
            attendance_rate=prediction_data['attendanceRate'],
            assignment_rate=prediction_data['assignmentRate'],
            weekly_study_average=prediction_data['weeklyStudyAverage'],
            weekly_screen_average=prediction_data['weeklyScreenAverage'],
            reasons=json.dumps(prediction_data['reasons'])
        ))
    return True


def seed_additional_students():
    added = 0
    for record in STUDENT_RECORDS:
        if seed_student_record(record):
            added += 1
    return added

def seed_exam_records():
    added = 0
    for subject, exam_name, exam_type, current_class, division, date, start_time, end_time, duration, hall_number, maximum_marks, status, result_published in EXAM_RECORDS:
        exists = Exam.query.filter_by(
            subject=subject,
            exam_name=exam_name,
            exam_type=exam_type,
            current_class=current_class,
            division=division,
            date=date,
        ).first()
        if exists:
            continue
        db.session.add(Exam(
            subject=subject,
            exam_name=exam_name,
            exam_type=exam_type,
            current_class=current_class,
            division=division,
            date=date,
            start_time=start_time,
            end_time=end_time,
            duration=duration,
            hall_number=hall_number,
            maximum_marks=maximum_marks,
            status=status,
            result_published=result_published,
        ))
        added += 1
    return added

def seed_event_records():
    added = 0
    for event_name, category, description, event_date, start_time, end_time, venue, organizer, applicable_classes, max_participants, registration_deadline, poster, priority, status, published in EVENT_RECORDS:
        exists = Event.query.filter_by(event_name=event_name, event_date=event_date).first()
        if exists:
            continue
        db.session.add(Event(
            event_name=event_name,
            category=category,
            description=description,
            event_date=event_date,
            start_time=start_time,
            end_time=end_time,
            venue=venue,
            organizer=organizer,
            applicable_classes=applicable_classes,
            max_participants=max_participants,
            registration_deadline=registration_deadline,
            poster=poster,
            priority=priority,
            status=status,
            published=published,
            created_at="2026-07-11T09:00:00",
        ))
        added += 1
    return added

def init_db():
    with app.app_context():
        db.create_all()
        
        print("Initializing database...")

        # Create Admin
        if not User.query.filter_by(username='admin').first():
            admin_user = User(username='admin', password='password', role='admin')
            db.session.add(admin_user)

        # Create sample Student
        student_user = User.query.filter_by(username='Student').first()
        if not student_user:
            student_user = User(username='Student', password='password', role='student')
            db.session.add(student_user)
            db.session.commit()

        student = Student.query.filter_by(roll_no='S101').first()
        if not student:
            student = Student(
                user_id=student_user.id,
                name='Student Performance Overview',
                roll_no='S101',
                current_class='10',
                division='A',
                parent_name='Parent',
                contact='+91 9876543210',
                email='student@example.edu'
            )
            db.session.add(student)
            db.session.commit()

        if student and not student.study_hours:
            study_hours = StudyHours(
                student_id=student.id,
                tuition=2.5,
                self_study=3.0,
                sports=1.0,
                mobile_screen=2.2,
                sleep=7.5,
                revision=1.4
            )
            db.session.add(study_hours)

        if student and not student.activities:
            activities = [
                Activity(student_id=student.id, day='Mon', study=4.7, screen=2.0, sports=1.0),
                Activity(student_id=student.id, day='Tue', study=5.0, screen=1.8, sports=0.8),
                Activity(student_id=student.id, day='Wed', study=4.1, screen=2.6, sports=1.2),
                Activity(student_id=student.id, day='Thu', study=5.4, screen=1.7, sports=0.7),
                Activity(student_id=student.id, day='Fri', study=4.8, screen=2.1, sports=1.0),
                Activity(student_id=student.id, day='Sat', study=3.6, screen=3.0, sports=1.5),
                Activity(student_id=student.id, day='Sun', study=2.8, screen=3.4, sports=1.8),
            ]
            db.session.bulk_save_objects(activities)

        if student and not student.exams:
            exams = [
                ExamMark(student_id=student.id, name='Unit Test 1', maths=72, science=76, ss=70, english=74, gujarati=82, hindi=78),
                ExamMark(student_id=student.id, name='Mid Term', maths=78, science=80, ss=73, english=79, gujarati=84, hindi=81),
                ExamMark(student_id=student.id, name='Unit Test 2', maths=83, science=85, ss=78, english=82, gujarati=87, hindi=84),
            ]
            db.session.bulk_save_objects(exams)
        
        if student and not student.attendance:
            # April attendance as in fallback
            attendances = []
            for i in range(1, 31):
                date_str = f"2026-04-{i:02d}"
                status = 'present'
                if i in [4, 5, 11, 12, 18, 19, 25, 26]:
                    status = 'holiday'
                elif i in [7, 17]:
                    status = 'absent'
                attendances.append(Attendance(student_id=student.id, date=date_str, status=status))
            db.session.bulk_save_objects(attendances)

        if student and not student.assignments:
            assignments = [
                Assignment(student_id=student.id, subject='Maths', assigned=12, completed=11),
                Assignment(student_id=student.id, subject='Science', assigned=10, completed=9),
                Assignment(student_id=student.id, subject='SS', assigned=8, completed=7),
                Assignment(student_id=student.id, subject='English', assigned=9, completed=8),
                Assignment(student_id=student.id, subject='Gujarati', assigned=7, completed=7),
                Assignment(student_id=student.id, subject='Hindi', assigned=7, completed=6),
            ]
            db.session.bulk_save_objects(assignments)

        if student and not student.predictions:
            reasons = [
                "Last exam average is strong at 83.2%.",
                "Attendance is 91.7%, which supports steady learning.",
                "Assignment completion is 90.6%, adding confidence to the prediction.",
                "Screen time is controlled enough to protect study focus.",
                "Current study time is consistent across the week."
            ]
            prediction = Prediction(
                student_id=student.id,
                predicted_average=84.1,
                previous_average=83.2,
                attendance_rate=91.7,
                assignment_rate=90.6,
                weekly_study_average=4.3,
                weekly_screen_average=2.4,
                reasons=json.dumps(reasons)
            )
            db.session.add(prediction)

        added = seed_additional_students()
        exams_added = seed_exam_records()
        events_added = seed_event_records()

        db.session.commit()
        print(f"Database initialized successfully. Added {added} student records, {exams_added} exam records, and {events_added} event records.")

if __name__ == '__main__':
    init_db()
