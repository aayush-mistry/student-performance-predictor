# Student Performance Predictor

## Project Overview
Student Performance Predictor is a full-stack school dashboard for monitoring student academics, attendance, assignments, study habits, screen time, exam schedules, and predicted performance. It includes separate Student and Admin portals backed by Flask APIs and a SQLite database.

```text
                    Student Performance Predictor

                           React + Vite
                                |
                                | REST API
                                v
                      Flask Backend (Python)
                                |
          +---------------------+---------------------+
          |                     |                     |
          v                     v                     v
      SQLite DB          Prediction Engine      Authentication
          ^
          |
    Exam Schedule Module
    Events & Activities Module
          ^
          |
          +--------------- Flask APIs ---------------+
                          |                           |
                          v                           v
        Student Portal                     Admin Portal
              |                                  |
      View Own Data                Manage All Students
      Prediction                   Attendance
      Assignments                  Assignments
      Attendance                   Risk Analysis
      Exam Schedule                Exam Schedule CRUD
      Events & Activities          Events & Activities CRUD
```

## Features

### Student Portal
- Login
- Dashboard
- Attendance
- Marks
- Assignments
- Performance Prediction
- Exam Schedule
- Events & Activities

### Admin Portal
- Dashboard
- Student Management
- Attendance Management
- Assignment Management
- Risk Analysis
- Reports
- Exam Schedule Management
- Events & Activities Management

## Tech Stack

Frontend:
- React
- Vite
- CSS
- Recharts

Backend:
- Flask
- Flask-CORS
- Flask-SQLAlchemy

Database:
- SQLite

## Project Structure
```text
student-performance-predictor/
|-- backend/
|   |-- app.py
|   |-- init_db.py
|   |-- models.py
|   |-- requirements.txt
|   `-- school.db
|-- frontend/
|   |-- src/
|   |   |-- main.jsx
|   |   |-- styles.css
|   |   `-- pages/
|   |       |-- AdminPortal.jsx
|   |       |-- AuthScreen.jsx
|   |       `-- StudentPortal.jsx
|   |-- dist/
|   |-- package.json
|   `-- index.html
`-- README.md
```

## Installation
Install backend and frontend dependencies separately. Run the Flask API first, then run the Vite frontend.

## Backend Setup
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python app.py
```

The backend runs at `http://127.0.0.1:5000`.

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the local Vite URL shown in the terminal.

## API Documentation
- `POST /api/admin/login` authenticates an admin.
- `POST /api/student/login` authenticates a student.
- `GET /api/students` lists all students.
- `GET /api/students/<id>` returns one student profile.
- `POST /api/students` creates a student.
- `PUT /api/students/<id>` updates a student.
- `DELETE /api/students/<id>` deletes a student.
- `PUT /api/marks/<student_id>` updates marks.
- `PUT /api/attendance/<student_id>` updates attendance.
- `PUT /api/assignments/<student_id>` updates assignments.
- `GET /api/prediction/<id>` returns prediction data.
- `GET /api/admin/dashboard` returns dashboard statistics.
- `GET /api/admin/students` returns admin-ready student summaries.
- `GET /api/admin/attendance` returns attendance dashboard data.
- `GET /api/admin/assignments` returns assignment dashboard data.
- `GET /api/admin/risk` returns risk analysis data.
- `GET /api/exams/schedule` returns student-visible unit tests, final exams, and completed exams.
- `GET /api/exams/completed` returns completed exams with result publication status.
- `GET /api/admin/exams` returns grouped exam schedules for administrators.
- `POST /api/admin/exams` creates an exam schedule.
- `PUT /api/admin/exams/<exam_id>` updates an exam schedule.
- `PATCH /api/admin/exams/<exam_id>/publish` publishes an exam schedule.
- `PATCH /api/admin/exams/<exam_id>/result` updates result publication status.
- `DELETE /api/admin/exams/<exam_id>` deletes an exam schedule.
- `GET /api/events` returns student-visible grouped event data.
- `GET /api/events/upcoming` returns upcoming and ongoing events.
- `GET /api/events/completed` returns completed events.
- `GET /api/admin/events` returns all events, including unpublished events.
- `POST /api/admin/events` creates an event.
- `PUT /api/admin/events/<event_id>` updates an event.
- `PATCH /api/admin/events/<event_id>/publish` publishes or unpublishes an event.
- `PATCH /api/admin/events/<event_id>/status` updates event status.
- `DELETE /api/admin/events/<event_id>` deletes an event.

## Exam Schedule Module
The Exam Schedule module adds a timetable workflow for both portals without changing the project structure.

Student features:
- Sidebar item named `Exam Schedule`.
- Upcoming Unit Tests table with subject, exam name, date, time, duration, days left, status, and countdown badges such as Today, Tomorrow, or X Days Left.
- Final Examination Schedule table with subject, date, time, duration, hall number, maximum marks, and status.
- Completed Exams table with subject, date, exam type, result status, and a View Result button when marks are available.

Admin features:
- Dashboard summary card named `Upcoming Exams` that opens the Exam Schedule page.
- Admin sidebar item named `Exam Schedule`.
- Add, edit, delete, publish, and update result publication status for exam schedules.
- Separate sections for upcoming unit tests, final exams, and completed exams.

Database schema:
```text
Exams
- exam_id INTEGER PRIMARY KEY
- subject VARCHAR(50)
- exam_name VARCHAR(100)
- exam_type VARCHAR(30)
- class VARCHAR(20)
- division VARCHAR(10)
- date VARCHAR(20)
- start_time VARCHAR(20)
- end_time VARCHAR(20)
- duration VARCHAR(30)
- hall_number VARCHAR(30)
- maximum_marks INTEGER
- status VARCHAR(30)
- result_published BOOLEAN
```

Integration:
- The Student Portal uses `/api/exams/schedule` so students can view upcoming exams, completed exams, and result availability only.
- The Admin Portal uses `/api/admin/exams` and admin mutation endpoints to add, edit, delete, publish, and update schedules.
- The Flask backend stores schedule records in SQLite through the SQLAlchemy `Exam` model.

## Events & Activities Module
The Events & Activities module adds a school activity calendar for celebrations, competitions, sports, cultural programs, and academic events.

Student functionalities:
- View upcoming, ongoing, and completed events.
- Search events by event name, category, or venue.
- Filter events by category, month, class, and status.
- View event details including date, time, venue, organizer, description, eligibility, maximum participants, registration deadline, priority, and poster.
- See countdown badges for upcoming events.
- View event poster images.
- Register locally for competitions from the student UI.

Admin functionalities:
- Dashboard card named `Upcoming Events` with total, upcoming, ongoing, and completed counts.
- Add, edit, and delete events.
- Publish or unpublish events.
- Mark events as Upcoming, Ongoing, Completed, or Cancelled.
- Store event poster URLs or uploaded poster paths.
- Assign events to specific classes or all students.
- Filter and search the event table by category, month, class, status, event name, and venue.

Event categories:
- Festival Celebrations
- National Celebrations
- Competitions
- Sports Events
- Cultural Events
- Academic Events

Database schema:
```text
Events
- event_id INTEGER PRIMARY KEY
- event_name VARCHAR(140)
- category VARCHAR(80)
- description TEXT
- event_date VARCHAR(20)
- start_time VARCHAR(20)
- end_time VARCHAR(20)
- venue VARCHAR(120)
- organizer VARCHAR(120)
- applicable_classes VARCHAR(120)
- max_participants INTEGER
- registration_deadline VARCHAR(20)
- poster TEXT
- priority VARCHAR(20)
- status VARCHAR(30)
- published BOOLEAN
- created_at VARCHAR(30)
```

User flow:
- Students open `Events & Activities` from the sidebar, search or filter the event list, review event posters/details, and register for competition-type events.
- Admins open `Events & Activities` from the sidebar or the `Upcoming Events` dashboard card, then manage event records through the add/edit modal and table actions.
- The React portals call the Flask event APIs, and Flask persists event records in SQLite through the SQLAlchemy `Event` model.

## Authentication Flow
Students and admins log in from the same authentication screen. The backend validates the selected role and returns the user role and ID. Student users are routed to `/student`, while admins are routed to `/admin/dashboard`.

## Prediction Logic
The prediction engine uses the latest exam average and applies modifiers for weekly study time, attendance rate, assignment completion, and screen time. The API returns the predicted average, supporting metrics, and human-readable improvement reasons.

## Future Improvements
- JWT authentication and refresh tokens.
- Teacher accounts with subject-level permissions.
- Exportable PDF reports.
- Email or SMS alerts for high-risk students.
- PostgreSQL support for production deployments.

## License
MIT License.
