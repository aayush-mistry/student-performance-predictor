from app import app
from models import db, User, Student, StudyHours, Activity, ExamMark, Attendance, Assignment, Prediction
import json

def init_db():
    with app.app_context():
        db.create_all()
        
        # Check if we already have admin
        if User.query.filter_by(username='admin').first():
            print("Database already initialized.")
            return

        print("Initializing database...")

        # Create Admin
        admin_user = User(username='admin', password='password', role='admin')
        db.session.add(admin_user)

        # Create sample Student
        student_user = User(username='Student', password='password', role='student')
        db.session.add(student_user)
        db.session.commit()

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

        exams = [
            ExamMark(student_id=student.id, name='Unit Test 1', maths=72, science=76, ss=70, english=74, gujarati=82, hindi=78),
            ExamMark(student_id=student.id, name='Mid Term', maths=78, science=80, ss=73, english=79, gujarati=84, hindi=81),
            ExamMark(student_id=student.id, name='Unit Test 2', maths=83, science=85, ss=78, english=82, gujarati=87, hindi=84),
        ]
        db.session.bulk_save_objects(exams)
        
        # April attendance as in fallback
        import datetime
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

        assignments = [
            Assignment(student_id=student.id, subject='Maths', assigned=12, completed=11),
            Assignment(student_id=student.id, subject='Science', assigned=10, completed=9),
            Assignment(student_id=student.id, subject='SS', assigned=8, completed=7),
            Assignment(student_id=student.id, subject='English', assigned=9, completed=8),
            Assignment(student_id=student.id, subject='Gujarati', assigned=7, completed=7),
            Assignment(student_id=student.id, subject='Hindi', assigned=7, completed=6),
        ]
        db.session.bulk_save_objects(assignments)

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

        db.session.commit()
        print("Database initialized successfully with sample data!")

if __name__ == '__main__':
    init_db()
