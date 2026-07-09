from __future__ import annotations

from statistics import mean

from flask import Flask, jsonify
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


STUDENT_PROFILE = {
    "name": "Student Performance Overview",
    "studyHours": {
        "tuition": 2.5,
        "selfStudy": 3.0,
        "sports": 1.0,
        "mobileScreen": 2.2,
        "sleep": 7.5,
        "revision": 1.4,
    },
    "weeklyActivity": [
        {"day": "Mon", "study": 4.7, "screen": 2.0, "sports": 1.0},
        {"day": "Tue", "study": 5.0, "screen": 1.8, "sports": 0.8},
        {"day": "Wed", "study": 4.1, "screen": 2.6, "sports": 1.2},
        {"day": "Thu", "study": 5.4, "screen": 1.7, "sports": 0.7},
        {"day": "Fri", "study": 4.8, "screen": 2.1, "sports": 1.0},
        {"day": "Sat", "study": 3.6, "screen": 3.0, "sports": 1.5},
        {"day": "Sun", "study": 2.8, "screen": 3.4, "sports": 1.8},
    ],
    "previousExams": [
        {
            "name": "Unit Test 1",
            "maths": 72,
            "science": 76,
            "ss": 70,
            "english": 74,
            "gujarati": 82,
            "hindi": 78,
        },
        {
            "name": "Mid Term",
            "maths": 78,
            "science": 80,
            "ss": 73,
            "english": 79,
            "gujarati": 84,
            "hindi": 81,
        },
        {
            "name": "Unit Test 2",
            "maths": 83,
            "science": 85,
            "ss": 78,
            "english": 82,
            "gujarati": 87,
            "hindi": 84,
        },
    ],
    "attendance": [
        {"date": "2026-04-01", "status": "present"},
        {"date": "2026-04-02", "status": "present"},
        {"date": "2026-04-03", "status": "present"},
        {"date": "2026-04-04", "status": "holiday"},
        {"date": "2026-04-05", "status": "holiday"},
        {"date": "2026-04-06", "status": "present"},
        {"date": "2026-04-07", "status": "absent"},
        {"date": "2026-04-08", "status": "present"},
        {"date": "2026-04-09", "status": "present"},
        {"date": "2026-04-10", "status": "present"},
        {"date": "2026-04-11", "status": "holiday"},
        {"date": "2026-04-12", "status": "holiday"},
        {"date": "2026-04-13", "status": "present"},
        {"date": "2026-04-14", "status": "present"},
        {"date": "2026-04-15", "status": "present"},
        {"date": "2026-04-16", "status": "present"},
        {"date": "2026-04-17", "status": "absent"},
        {"date": "2026-04-18", "status": "holiday"},
        {"date": "2026-04-19", "status": "holiday"},
        {"date": "2026-04-20", "status": "present"},
        {"date": "2026-04-21", "status": "present"},
        {"date": "2026-04-22", "status": "present"},
        {"date": "2026-04-23", "status": "present"},
        {"date": "2026-04-24", "status": "present"},
        {"date": "2026-04-25", "status": "holiday"},
        {"date": "2026-04-26", "status": "holiday"},
        {"date": "2026-04-27", "status": "present"},
        {"date": "2026-04-28", "status": "present"},
        {"date": "2026-04-29", "status": "present"},
        {"date": "2026-04-30", "status": "present"},
    ],
    "assignments": [
        {"subject": "Maths", "assigned": 12, "completed": 11},
        {"subject": "Science", "assigned": 10, "completed": 9},
        {"subject": "SS", "assigned": 8, "completed": 7},
        {"subject": "English", "assigned": 9, "completed": 8},
        {"subject": "Gujarati", "assigned": 7, "completed": 7},
        {"subject": "Hindi", "assigned": 7, "completed": 6},
    ],
    "help": {
        "officeNumber": "+91 79 2456 1188",
        "email": "schooloffice@example.edu",
        "teacherNumber": "+91 98765 43210",
    },
}


def calculate_prediction(profile: dict) -> dict:
    subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"]
    latest_exam = profile["previousExams"][-1]
    previous_average = mean(latest_exam[subject] for subject in subjects)

    attendance_days = [day for day in profile["attendance"] if day["status"] != "holiday"]
    present_days = [day for day in attendance_days if day["status"] == "present"]
    attendance_rate = len(present_days) / len(attendance_days)

    assigned = sum(item["assigned"] for item in profile["assignments"])
    completed = sum(item["completed"] for item in profile["assignments"])
    assignment_rate = completed / assigned

    weekly_study = mean(day["study"] for day in profile["weeklyActivity"])
    weekly_screen = mean(day["screen"] for day in profile["weeklyActivity"])

    study_bonus = min(7, max(-4, (weekly_study - 3.5) * 2.2))
    attendance_bonus = (attendance_rate - 0.85) * 16
    assignment_bonus = (assignment_rate - 0.82) * 12
    screen_penalty = max(0, weekly_screen - 2.0) * 2.8

    predicted_average = previous_average + study_bonus + attendance_bonus + assignment_bonus - screen_penalty
    predicted_average = round(max(0, min(100, predicted_average)), 1)

    reasons = [
        f"Last exam average is strong at {previous_average:.1f}%.",
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


@app.get("/api/student")
def student() -> tuple:
    return jsonify(STUDENT_PROFILE)


@app.get("/api/prediction")
def prediction() -> tuple:
    return jsonify(calculate_prediction(STUDENT_PROFILE))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
