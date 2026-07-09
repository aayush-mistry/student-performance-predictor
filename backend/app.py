from flask import Flask, jsonify, request
from flask_cors import CORS
from statistics import mean
import json
import os

from sqlalchemy import func

from models import db, User, Student, StudyHours, Activity, ExamMark, Attendance, Assignment, Prediction

app = Flask(__name__)
CORS(app)

basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'school.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

def serialize_student(student):
    # Convert DB student model to a dict format expected by the frontend
    # studyHours
    sh = student.study_hours
    study_hours_dict = {
        "tuition": sh.tuition if sh else 0,
        "selfStudy": sh.self_study if sh else 0,
        "sports": sh.sports if sh else 0,
        "mobileScreen": sh.mobile_screen if sh else 0,
        "sleep": sh.sleep if sh else 0,
        "revision": sh.revision if sh else 0,
    }
    
    # weeklyActivity
    activities = [{"day": a.day, "study": a.study, "screen": a.screen, "sports": a.sports} for a in student.activities]
    
    # exams
    exams = [{"name": e.name, "maths": e.maths, "science": e.science, "ss": e.ss, "english": e.english, "gujarati": e.gujarati, "hindi": e.hindi} for e in student.exams]
    
    # attendance
    attendances = [{"date": a.date, "status": a.status} for a in student.attendance]
    
    # assignments
    assignments = [{"subject": a.subject, "assigned": a.assigned, "completed": a.completed} for a in student.assignments]
    
    return {
        "id": student.id,
        "name": student.name,
        "roll_no": student.roll_no,
        "current_class": student.current_class,
        "division": student.division,
        "parent_name": student.parent_name,
        "contact": student.contact,
        "email": student.email,
        "studyHours": study_hours_dict,
        "weeklyActivity": activities,
        "previousExams": exams,
        "attendance": attendances,
        "assignments": assignments,
        "help": {
            "officeNumber": "+91 79 2456 1188",
            "email": "schooloffice@example.edu",
            "teacherNumber": "+91 98765 43210",
        },
    }

def calculate_prediction_logic(student_dict):
    subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"]
    if not student_dict["previousExams"]:
        return None
        
    latest_exam = student_dict["previousExams"][-1]
    previous_average = mean(latest_exam.get(subject, 0) for subject in subjects)

    attendance_days = [day for day in student_dict["attendance"] if day["status"] != "holiday"]
    present_days = [day for day in attendance_days if day["status"] == "present"]
    attendance_rate = (len(present_days) / len(attendance_days)) if attendance_days else 0

    assigned = sum(item["assigned"] for item in student_dict["assignments"])
    completed = sum(item["completed"] for item in student_dict["assignments"])
    assignment_rate = (completed / assigned) if assigned > 0 else 0

    weekly_study = mean(day["study"] for day in student_dict["weeklyActivity"]) if student_dict["weeklyActivity"] else 0
    weekly_screen = mean(day["screen"] for day in student_dict["weeklyActivity"]) if student_dict["weeklyActivity"] else 0

    study_bonus = min(7, max(-4, (weekly_study - 3.5) * 2.2))
    attendance_bonus = (attendance_rate - 0.85) * 16
    assignment_bonus = (assignment_rate - 0.82) * 12
    screen_penalty = max(0, weekly_screen - 2.0) * 2.8

    predicted_average = previous_average + study_bonus + attendance_bonus + assignment_bonus - screen_penalty
    predicted_average = round(max(0, min(100, predicted_average)), 1)

    reasons = [
        f"Last exam average is strong at {previous_average:.1f}%." if previous_average >= 80 else f"Last exam average is {previous_average:.1f}%.",
        f"Attendance is {attendance_rate * 100:.1f}%, which supports steady learning.",
        f"Assignment completion is {assignment_rate * 100:.1f}%, adding confidence to the prediction.",
    ]

    if weekly_screen > 2.4:
        reasons.append("Screen time is slightly high and may reduce revision quality.")
    else:
        reasons.append("Screen time is controlled enough to protect study focus.")

    if weekly_study >= 4.2:
        reasons.append("Current study time is consistent across the week.")

    return {
        "predictedAverage": predicted_average,
        "previousAverage": round(previous_average, 1),
        "attendanceRate": round(attendance_rate * 100, 1),
        "assignmentRate": round(assignment_rate * 100, 1),
        "weeklyStudyAverage": round(weekly_study, 1),
        "weeklyScreenAverage": round(weekly_screen, 1),
        "reasons": reasons,
    }

# ----------------- AUTH -----------------

@app.post("/api/admin/login")
def admin_login():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    user = User.query.filter(
        func.lower(User.username) == username.lower(),
        User.password == password,
        User.role == 'admin'
    ).first()
    if user:
        return jsonify({"success": True, "userId": user.id, "role": "admin"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.post("/api/student/login")
def student_login():
    data = request.json or {}
    username = (data.get('username') or '').strip()
    password = (data.get('password') or '').strip()
    user = User.query.filter(
        func.lower(User.username) == username.lower(),
        User.password == password,
        User.role == 'student'
    ).first()
    if user:
        return jsonify({"success": True, "userId": user.id, "role": "student", "studentId": user.student_profile.id if user.student_profile else None})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401


# ----------------- STUDENT ENDPOINTS -----------------

@app.get("/api/students")
def get_students():
    students = Student.query.all()
    return jsonify([serialize_student(s) for s in students])

@app.get("/api/students/<int:id>")
def get_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"message": "Not found"}), 404
    return jsonify(serialize_student(student))

@app.post("/api/students")
def create_student():
    data = request.json
    # Create user first
    user = User(username=data.get('username', data['name']), password='password', role='student')
    db.session.add(user)
    db.session.flush()

    student = Student(
        user_id=user.id,
        name=data['name'],
        roll_no=data.get('roll_no'),
        current_class=data.get('current_class'),
        division=data.get('division'),
        parent_name=data.get('parent_name'),
        contact=data.get('contact'),
        email=data.get('email')
    )
    db.session.add(student)
    db.session.commit()
    
    return jsonify(serialize_student(student)), 201

@app.put("/api/students/<int:id>")
def update_student(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"message": "Not found"}), 404
    data = request.json
    student.name = data.get('name', student.name)
    student.roll_no = data.get('roll_no', student.roll_no)
    student.current_class = data.get('current_class', student.current_class)
    student.division = data.get('division', student.division)
    student.parent_name = data.get('parent_name', student.parent_name)
    student.contact = data.get('contact', student.contact)
    student.email = data.get('email', student.email)
    db.session.commit()
    return jsonify(serialize_student(student))

@app.delete("/api/students/<int:id>")
def delete_student(id):
    student = Student.query.get(id)
    if student:
        db.session.delete(student.user) # Cascades delete to student
        db.session.commit()
        return jsonify({"success": True})
    return jsonify({"message": "Not found"}), 404


# ----------------- MARKS, ATTENDANCE, ASSIGNMENTS -----------------

@app.put("/api/marks/<int:student_id>")
def update_marks(student_id):
    data = request.json
    # Example data: {"name": "Mid Term", "maths": 80, ...}
    mark = ExamMark.query.filter_by(student_id=student_id, name=data['name']).first()
    if not mark:
        mark = ExamMark(student_id=student_id, name=data['name'])
        db.session.add(mark)
    
    mark.maths = data.get('maths', mark.maths)
    mark.science = data.get('science', mark.science)
    mark.ss = data.get('ss', mark.ss)
    mark.english = data.get('english', mark.english)
    mark.gujarati = data.get('gujarati', mark.gujarati)
    mark.hindi = data.get('hindi', mark.hindi)
    
    db.session.commit()
    return jsonify({"success": True})

@app.put("/api/attendance/<int:student_id>")
def update_attendance(student_id):
    data = request.json
    # Expected data: {"date": "2026-04-10", "status": "absent"}
    att = Attendance.query.filter_by(student_id=student_id, date=data['date']).first()
    if not att:
        att = Attendance(student_id=student_id, date=data['date'])
        db.session.add(att)
    att.status = data['status']
    db.session.commit()
    return jsonify({"success": True})

@app.put("/api/assignments/<int:student_id>")
def update_assignment(student_id):
    data = request.json
    # Expected data: {"subject": "Maths", "completed": 12, "assigned": 12}
    assign = Assignment.query.filter_by(student_id=student_id, subject=data['subject']).first()
    if not assign:
        assign = Assignment(student_id=student_id, subject=data['subject'])
        db.session.add(assign)
    assign.assigned = data.get('assigned', assign.assigned)
    assign.completed = data.get('completed', assign.completed)
    db.session.commit()
    return jsonify({"success": True})


# ----------------- PREDICTION AND LEGACY COMPAT -----------------

@app.get("/api/prediction/<int:id>")
def get_prediction(id):
    student = Student.query.get(id)
    if not student:
        return jsonify({"message": "Not found"}), 404
        
    s_dict = serialize_student(student)
    pred_data = calculate_prediction_logic(s_dict)
    
    # Update or create prediction in DB
    if pred_data:
        pred = Prediction.query.filter_by(student_id=id).first()
        if not pred:
            pred = Prediction(student_id=id)
            db.session.add(pred)
        pred.predicted_average = pred_data['predictedAverage']
        pred.previous_average = pred_data['previousAverage']
        pred.attendance_rate = pred_data['attendanceRate']
        pred.assignment_rate = pred_data['assignmentRate']
        pred.weekly_study_average = pred_data['weeklyStudyAverage']
        pred.weekly_screen_average = pred_data['weeklyScreenAverage']
        pred.reasons = json.dumps(pred_data['reasons'])
        db.session.commit()
        return jsonify(pred_data)
    
    return jsonify({"message": "Not enough data"}), 400

# Legacy endpoints for backward compatibility if needed by frontend
@app.get("/api/student")
def legacy_student():
    student = Student.query.first()
    if student:
        return jsonify(serialize_student(student))
    return jsonify({"message": "No student found"}), 404

@app.get("/api/prediction")
def legacy_prediction():
    student = Student.query.first()
    if student:
        return get_prediction(student.id)
    return jsonify({"message": "No student found"}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)
