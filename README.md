# Student Performance Predictor (AI-Powered School Management System)

## Project Overview
The Student Performance Predictor is an advanced, AI-powered School Management System that allows institutions to monitor, predict, and analyze student performance seamlessly. Built as a comprehensive suite, it provides dedicated portals for both Administrators and Students. Administrators can manage student data, track attendance, update marks, and view high-level analytics. Students can monitor their academic progress, review past exam results, and see data-driven predictions of their future performance.

## Features
* **Role-Based Access Control**: Secure login mechanisms separating Admin capabilities from Student viewing rights.
* **AI Predictions**: Advanced algorithms calculate expected exam performance based on past averages, study habits, attendance, screen time, and assignment completion.
* **RESTful API**: Standardized backend operations for scalability and cross-platform compatibility.
* **Data Persistence**: Robust SQLite database using SQLAlchemy ORM.

### Student Dashboard Features
* **Study Activity Tracking**: Monitor daily and weekly study versus screen time.
* **Previous Marks History**: Track and visualize past exam performance across all subjects.
* **Attendance Calendar**: Monthly visualization of present, absent, and holiday statuses.
* **Assignments Tracking**: Monitor completed vs assigned tasks for each subject.
* **AI Prediction Panel**: View predicted upcoming scores and automated suggestions for improvement.
* **Help & Support**: Direct school contact and complaint form access.

### Admin Dashboard Features
* **High-Level Analytics**: Overview cards showing Total Students, Avg Attendance, Assignment Completions, and Students at Risk.
* **Subject Performance Charts**: Visualize the overall average scores per subject across the entire student body.
* **Student Management (CRUD)**: Create, Read, Update, and Delete student profiles seamlessly.
* **Export Functionality**: Export student lists directly to CSV format for external analysis.

## Architecture Diagram
```text
                      Student Performance Predictor

                   +------------------------------+
                   |         React Frontend       |
                   +------------------------------+
                         |                 |
                         | REST API        |
                         v
                   +------------------------------+
                   |         Flask Backend        |
                   +------------------------------+
                         |
              --------------------------
              |           |            |
              |           |            |
        SQLite DB    Prediction    Authentication
                       Engine

               -------------------------
               |                       |
               |                       |
         Student Portal         Admin Portal
```

## Tech Stack
* **Frontend**: React (Vite), CSS, Recharts, Lucide-React, React-Router-DOM
* **Backend**: Flask, Flask-CORS, Flask-SQLAlchemy
* **Database**: SQLite
* **Prediction Engine**: Rule-based Python heuristics calculation

## Folder Structure
```
student-performance-predictor/
├── backend/
│   ├── app.py           # Main Flask API and Endpoints
│   ├── models.py        # SQLAlchemy Database Models
│   ├── init_db.py       # Database initialization script
│   └── school.db        # SQLite Database (generated)
├── frontend/
│   ├── src/
│   │   ├── main.jsx                 # React Router Configuration
│   │   ├── styles.css               # Global Styling
│   │   └── pages/
│   │       ├── AuthScreen.jsx       # Login/Signup UI
│   │       ├── AdminPortal.jsx      # Admin Dashboard and CRUD
│   │       └── StudentPortal.jsx    # Student Dashboard and Charts
│   ├── index.html
│   └── package.json
└── README.md
```

## Installation

### Backend Setup
1. Open a terminal and navigate to the `backend` folder.
2. (Optional) Create and activate a Python virtual environment.
3. Install dependencies:
   ```bash
   pip install flask flask-cors flask-sqlalchemy
   ```
4. Initialize the database and sample data:
   ```bash
   python init_db.py
   ```
5. Run the Flask server:
   ```bash
   python app.py
   ```
   The backend will be available at `http://127.0.0.1:5000`.

### Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at the URL provided by Vite (e.g., `http://localhost:5173`).

### Database Setup
The system uses SQLite, and all tables are defined in `backend/models.py`. Running `init_db.py` automatically constructs the `school.db` file and populates it with a sample Admin account (username: admin, password: password) and a sample Student profile.

## API Documentation
The backend exposes the following REST API endpoints:
- `POST /api/admin/login` - Authenticates an admin user.
- `POST /api/student/login` - Authenticates a student user.
- `GET /api/students` - Retrieves a list of all students.
- `GET /api/students/<id>` - Retrieves details for a specific student.
- `POST /api/students` - Creates a new student profile.
- `PUT /api/students/<id>` - Updates an existing student profile.
- `DELETE /api/students/<id>` - Deletes a student profile.
- `PUT /api/marks/<id>` - Updates exam marks for a specific student.
- `PUT /api/attendance/<id>` - Updates attendance for a specific student.
- `PUT /api/assignments/<id>` - Updates assignment completion for a specific student.
- `GET /api/prediction/<id>` - Fetches the AI prediction data dynamically based on the student's current metrics.

## Prediction Logic
The AI prediction dynamically assesses the student's latest exam average and applies heuristic modifiers:
- **Study Bonus**: Rewards consistent weekly study time.
- **Attendance Bonus**: Increases prediction based on high attendance rates.
- **Assignment Bonus**: Increases prediction based on assignment completion ratios.
- **Screen Penalty**: Penalizes high weekly screen time.
The combined score results in the final `predictedAverage`, accompanied by textual `reasons` explaining the calculation to the user.

## Authentication Flow
The application routes users dynamically upon login based on their role:
- When a user logs in via the `Student` tab, they receive a standard JSON Web token/session ID allowing access strictly to `/student`.
- When an admin logs in via the `Admin` tab, the backend validates their `role='admin'` and the frontend routing navigates them exclusively to `/admin`.

## Future Improvements
- Migration to PostgreSQL for cloud scalability.
- JWT-based authentication layer implementation.
- Email notifications for At-Risk student alerts.
- Dedicated teacher accounts for granular grading.

## License
MIT License.
