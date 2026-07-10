# Student Performance Predictor

## Project Overview
Student Performance Predictor is a full-stack school dashboard for monitoring student academics, attendance, assignments, study habits, screen time, and predicted performance. It includes separate Student and Admin portals backed by Flask APIs and a SQLite database.

```text
                    Student Performance Predictor

                           React + Vite
                                 │
                                 │ REST API
                                 ▼
                      Flask Backend (Python)
                                 │
          ┌──────────────┬───────────────┬───────────────┐
          │              │               │
          ▼              ▼               ▼
      SQLite DB    Prediction Engine   Authentication

                                 │
               ┌─────────────────┴─────────────────┐
               │                                   │
               ▼                                   ▼
        Student Portal                     Admin Portal
               │                                   │
      View Own Data                Manage All Students
      Prediction                   Attendance
      Assignments                  Assignments
      Attendance                   Risk Analysis
```

## Features

### Student Portal
- Login
- Dashboard
- Attendance
- Marks
- Assignments
- Performance Prediction

### Admin Portal
- Dashboard
- Student Management
- Attendance Management
- Assignment Management
- Risk Analysis
- Reports

## Tech Stack

Frontend:
- React
- Vite
- CSS
- Recharts

Backend:
- Flask
- Flask-CORS

Database:
- SQLite

## Project Structure
```text
student-performance-predictor/
├── backend/
│   ├── app.py
│   ├── init_db.py
│   ├── models.py
│   ├── requirements.txt
│   └── school.db
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── styles.css
│   │   └── pages/
│   │       ├── AdminPortal.jsx
│   │       ├── AuthScreen.jsx
│   │       └── StudentPortal.jsx
│   ├── dist/
│   ├── package.json
│   └── index.html
└── README.md
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
