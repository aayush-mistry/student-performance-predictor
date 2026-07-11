from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'admin' or 'student'
    student_profile = relationship("Student", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    roll_no = db.Column(db.String(20), unique=True)
    current_class = db.Column(db.String(20))
    division = db.Column(db.String(10))
    parent_name = db.Column(db.String(100))
    contact = db.Column(db.String(20))
    email = db.Column(db.String(120))
    
    user = relationship("User", back_populates="student_profile")
    study_hours = relationship("StudyHours", back_populates="student", uselist=False, cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="student", cascade="all, delete-orphan")
    exams = relationship("ExamMark", back_populates="student", cascade="all, delete-orphan")
    attendance = relationship("Attendance", back_populates="student", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="student", cascade="all, delete-orphan")

class StudyHours(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), unique=True, nullable=False)
    tuition = db.Column(db.Float, default=0.0)
    self_study = db.Column(db.Float, default=0.0)
    sports = db.Column(db.Float, default=0.0)
    mobile_screen = db.Column(db.Float, default=0.0)
    sleep = db.Column(db.Float, default=0.0)
    revision = db.Column(db.Float, default=0.0)
    
    student = relationship("Student", back_populates="study_hours")

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    day = db.Column(db.String(10), nullable=False)
    study = db.Column(db.Float, default=0.0)
    screen = db.Column(db.Float, default=0.0)
    sports = db.Column(db.Float, default=0.0)
    
    student = relationship("Student", back_populates="activities")

class ExamMark(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    maths = db.Column(db.Float, default=0.0)
    science = db.Column(db.Float, default=0.0)
    ss = db.Column(db.Float, default=0.0)
    english = db.Column(db.Float, default=0.0)
    gujarati = db.Column(db.Float, default=0.0)
    hindi = db.Column(db.Float, default=0.0)
    
    student = relationship("Student", back_populates="exams")

class Exam(db.Model):
    exam_id = db.Column(db.Integer, primary_key=True)
    subject = db.Column(db.String(50), nullable=False)
    exam_name = db.Column(db.String(100), nullable=False)
    exam_type = db.Column(db.String(30), nullable=False)
    current_class = db.Column("class", db.String(20))
    division = db.Column(db.String(10))
    date = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(20), nullable=False)
    end_time = db.Column(db.String(20), nullable=False)
    duration = db.Column(db.String(30), nullable=False)
    hall_number = db.Column(db.String(30))
    maximum_marks = db.Column(db.Integer, default=100)
    status = db.Column(db.String(30), nullable=False, default="Draft")
    result_published = db.Column(db.Boolean, default=False)

class Event(db.Model):
    event_id = db.Column(db.Integer, primary_key=True)
    event_name = db.Column(db.String(140), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    description = db.Column(db.Text)
    event_date = db.Column(db.String(20), nullable=False)
    start_time = db.Column(db.String(20), nullable=False)
    end_time = db.Column(db.String(20), nullable=False)
    venue = db.Column(db.String(120), nullable=False)
    organizer = db.Column(db.String(120), nullable=False)
    applicable_classes = db.Column(db.String(120), default="All")
    max_participants = db.Column(db.Integer, default=0)
    registration_deadline = db.Column(db.String(20))
    poster = db.Column(db.Text)
    priority = db.Column(db.String(20), default="Medium")
    status = db.Column(db.String(30), nullable=False, default="Upcoming")
    published = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.String(30))

class Attendance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    date = db.Column(db.String(20), nullable=False) # 'YYYY-MM-DD'
    status = db.Column(db.String(20), nullable=False) # 'present', 'absent', 'holiday'
    
    student = relationship("Student", back_populates="attendance")

class Assignment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    subject = db.Column(db.String(50), nullable=False)
    assigned = db.Column(db.Integer, default=0)
    completed = db.Column(db.Integer, default=0)
    
    student = relationship("Student", back_populates="assignments")

class Prediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    predicted_average = db.Column(db.Float)
    previous_average = db.Column(db.Float)
    attendance_rate = db.Column(db.Float)
    assignment_rate = db.Column(db.Float)
    weekly_study_average = db.Column(db.Float)
    weekly_screen_average = db.Column(db.Float)
    reasons = db.Column(db.Text) # Storing as JSON string
    
    student = relationship("Student", back_populates="predictions")
