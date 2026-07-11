from flask import Flask, jsonify, request
from flask_cors import CORS
from statistics import mean
import json
import os

from sqlalchemy import func

from models import db, User, Student, StudyHours, Activity, ExamMark, Attendance, Assignment, Prediction, Exam

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

def get_risk_level(predicted_average, attendance_rate, assignment_rate):
    if predicted_average < 60 or attendance_rate < 75 or assignment_rate < 70:
        return "High"
    if predicted_average < 75 or attendance_rate < 88 or assignment_rate < 85:
        return "Medium"
    return "Low"

def get_student_summary(student):
    student_dict = serialize_student(student)
    prediction = calculate_prediction_logic(student_dict) or {
        "predictedAverage": 0,
        "previousAverage": 0,
        "attendanceRate": 0,
        "assignmentRate": 0,
        "weeklyStudyAverage": 0,
        "weeklyScreenAverage": 0,
        "reasons": ["Not enough data is available for prediction."],
    }
    subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"]
    latest_exam = student_dict["previousExams"][-1] if student_dict["previousExams"] else {}
    weak_subjects = [
        subject.upper() for subject in subjects
        if latest_exam.get(subject, 0) and latest_exam.get(subject, 0) < 60
    ]
    pending_assignments = sum(
        max(0, item["assigned"] - item["completed"])
        for item in student_dict["assignments"]
    )
    attendance_days = [day for day in student_dict["attendance"] if day["status"] != "holiday"]
    present_days = [day for day in attendance_days if day["status"] == "present"]
    absent_days = [day for day in attendance_days if day["status"] == "absent"]
    holidays = [day for day in student_dict["attendance"] if day["status"] == "holiday"]
    risk_level = get_risk_level(
        prediction["predictedAverage"],
        prediction["attendanceRate"],
        prediction["assignmentRate"],
    )
    suggestions = list(prediction["reasons"])
    if weak_subjects:
        suggestions.append(f"Schedule focused revision for {', '.join(weak_subjects)}.")
    if pending_assignments:
        suggestions.append(f"Clear {pending_assignments} pending assignments before the next review.")
    if prediction["weeklyStudyAverage"] < 3:
        suggestions.append("Increase daily study time with a fixed revision block.")

    return {
        **student_dict,
        "studentId": student_dict["id"],
        "attendancePercentage": prediction["attendanceRate"],
        "predictedScore": prediction["predictedAverage"],
        "riskLevel": risk_level,
        "weakSubjects": weak_subjects,
        "pendingAssignments": pending_assignments,
        "presentDays": len(present_days),
        "absentDays": len(absent_days),
        "holidays": len(holidays),
        "prediction": prediction,
        "aiSuggestions": suggestions,
    }

def get_all_student_summaries():
    return [get_student_summary(student) for student in Student.query.all()]

def serialize_exam(exam):
    return {
        "exam_id": exam.exam_id,
        "subject": exam.subject,
        "exam_name": exam.exam_name,
        "exam_type": exam.exam_type,
        "class": exam.current_class,
        "division": exam.division,
        "date": exam.date,
        "start_time": exam.start_time,
        "end_time": exam.end_time,
        "duration": exam.duration,
        "hall_number": exam.hall_number,
        "maximum_marks": exam.maximum_marks,
        "status": exam.status,
        "result_published": exam.result_published,
    }

def get_exam_payload(data, exam=None):
    payload = {
        "subject": data.get("subject", exam.subject if exam else None),
        "exam_name": data.get("exam_name", exam.exam_name if exam else None),
        "exam_type": data.get("exam_type", exam.exam_type if exam else "Unit Test"),
        "current_class": data.get("class", data.get("current_class", exam.current_class if exam else None)),
        "division": data.get("division", exam.division if exam else None),
        "date": data.get("date", exam.date if exam else None),
        "start_time": data.get("start_time", exam.start_time if exam else None),
        "end_time": data.get("end_time", exam.end_time if exam else None),
        "duration": data.get("duration", exam.duration if exam else None),
        "hall_number": data.get("hall_number", exam.hall_number if exam else None),
        "maximum_marks": data.get("maximum_marks", exam.maximum_marks if exam else 100),
        "status": data.get("status", exam.status if exam else "Draft"),
        "result_published": data.get("result_published", exam.result_published if exam else False),
    }
    required = ["subject", "exam_name", "exam_type", "date", "start_time", "end_time", "duration"]
    missing = [field for field in required if payload.get(field) in (None, "")]
    if missing:
        return None, missing
    return payload, []

def add_exam_result_state(exam_dict):
    exam_dict["marks_available"] = bool(exam_dict["result_published"])
    exam_dict["result_status"] = "Published" if exam_dict["result_published"] else "Awaiting Result"
    return exam_dict

def query_exams():
    return Exam.query.order_by(Exam.date.asc(), Exam.start_time.asc()).all()

def get_exam_groups():
    exams = [serialize_exam(exam) for exam in query_exams()]
    upcoming = [exam for exam in exams if exam["exam_type"] == "Unit Test" and exam["status"] in ("Published", "Scheduled")]
    finals = [exam for exam in exams if exam["exam_type"] == "Final"]
    completed = [add_exam_result_state(exam) for exam in exams if exam["status"] == "Completed"]
    return {"unitTests": upcoming, "finalExams": finals, "completedExams": completed}

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


# ----------------- ADMIN ANALYTICS ENDPOINTS -----------------

@app.get("/api/admin/dashboard")
def admin_dashboard_stats():
    summaries = get_all_student_summaries()
    total_students = len(summaries)
    avg_attendance = round(mean([s["attendancePercentage"] for s in summaries]), 1) if summaries else 0
    assignments_done = sum(item["completed"] for s in summaries for item in s["assignments"])
    at_risk = len([s for s in summaries if s["riskLevel"] != "Low"])
    return jsonify({
        "totalStudents": total_students,
        "avgAttendance": avg_attendance,
        "assignmentsDone": assignments_done,
        "studentsAtRisk": at_risk,
    })

@app.get("/api/admin/students")
def admin_student_summaries():
    return jsonify(get_all_student_summaries())

@app.get("/api/admin/attendance")
def admin_attendance_dashboard():
    summaries = get_all_student_summaries()
    class_stats = {}
    for student in summaries:
        class_name = student["current_class"] or "Unassigned"
        class_stats.setdefault(class_name, []).append(student["attendancePercentage"])
    return jsonify({
        "students": summaries,
        "classStats": [
            {
                "class": class_name,
                "attendancePercentage": round(mean(values), 1) if values else 0,
                "students": len(values),
            }
            for class_name, values in class_stats.items()
        ],
    })

@app.get("/api/admin/assignments")
def admin_assignment_dashboard():
    summaries = get_all_student_summaries()
    return jsonify(summaries)

@app.get("/api/admin/risk")
def admin_risk_dashboard():
    summaries = get_all_student_summaries()
    return jsonify([s for s in summaries if s["riskLevel"] != "Low"])


# ----------------- EXAM SCHEDULE ENDPOINTS -----------------

@app.get("/api/exams/schedule")
def student_exam_schedule():
    groups = get_exam_groups()
    visible_completed = [
        exam for exam in groups["completedExams"]
        if exam["result_published"] or exam["status"] == "Completed"
    ]
    return jsonify({
        "unitTests": groups["unitTests"],
        "finalExams": [exam for exam in groups["finalExams"] if exam["status"] in ("Published", "Scheduled", "Completed")],
        "completedExams": visible_completed,
    })

@app.get("/api/exams/completed")
def completed_exams():
    return jsonify(get_exam_groups()["completedExams"])

@app.get("/api/admin/exams")
def admin_exam_schedule():
    return jsonify(get_exam_groups())

@app.post("/api/admin/exams")
def create_exam():
    payload, missing = get_exam_payload(request.json or {})
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    exam = Exam(**payload)
    db.session.add(exam)
    db.session.commit()
    return jsonify(serialize_exam(exam)), 201

@app.put("/api/admin/exams/<int:exam_id>")
def update_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return jsonify({"message": "Not found"}), 404
    payload, missing = get_exam_payload(request.json or {}, exam)
    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400
    for field, value in payload.items():
        setattr(exam, field, value)
    db.session.commit()
    return jsonify(serialize_exam(exam))

@app.patch("/api/admin/exams/<int:exam_id>/publish")
def publish_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return jsonify({"message": "Not found"}), 404
    exam.status = "Published"
    db.session.commit()
    return jsonify(serialize_exam(exam))

@app.patch("/api/admin/exams/<int:exam_id>/result")
def update_exam_result(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return jsonify({"message": "Not found"}), 404
    data = request.json or {}
    exam.result_published = bool(data.get("result_published", exam.result_published))
    if data.get("status"):
        exam.status = data["status"]
    db.session.commit()
    return jsonify(serialize_exam(exam))

@app.delete("/api/admin/exams/<int:exam_id>")
def delete_exam(exam_id):
    exam = Exam.query.get(exam_id)
    if not exam:
        return jsonify({"message": "Not found"}), 404
    db.session.delete(exam)
    db.session.commit()
    return jsonify({"success": True})


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
