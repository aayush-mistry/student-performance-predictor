# Student Performance Predictor

Student Performance Predictor is a full-stack academic dashboard for tracking student activity, previous exam marks, attendance, assignments, and predicted performance. The project uses a Flask backend to serve student data and prediction results, and a Vite + React frontend to display the dashboard with charts and responsive UI.

## Features

- Login and sign-up screen inside the React app.
- Student dashboard with separate sections for:
  - Study activity
  - Previous exam marks
  - Attendance calendar
  - Assignment completion
  - Predicted marks
  - Help and complaint contact area
- Flask API with CORS enabled for frontend access.
- Recharts visualizations for bar charts, area charts, line charts, and pie charts.
- Built-in fallback demo data in the frontend when the backend is not running.
- Responsive layout for desktop, tablet, and mobile screens.

## Tech Stack

### Backend

- Python
- Flask
- Flask-CORS

### Frontend

- React 18
- Vite
- Recharts
- Lucide React icons
- CSS

## Project Structure

```text
student performance predictor/
|-- README.md
|-- backend/
|   |-- app.py
|   |-- requirements.txt
|   `-- package-lock.json
`-- frontend/
    |-- index.html
    |-- package.json
    |-- package-lock.json
    |-- signup.html
    |-- signup.css
    |-- login.html
    |-- login.css
    |-- School image.png
    |-- src/
    |   |-- main.jsx
    |   `-- styles.css
    `-- dist/
```

## Backend API

The backend runs on:

```text
http://127.0.0.1:5000
```

### Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/student` | Returns the student profile, study hours, weekly activity, exam marks, attendance, assignments, and help contacts. |
| GET | `/api/prediction` | Returns calculated prediction metrics and explanation reasons. |

### Prediction Logic

The prediction in `backend/app.py` is calculated from:

- Latest exam average across Maths, Science, SS, English, Gujarati, and Hindi.
- Attendance rate, excluding holidays.
- Assignment completion rate.
- Weekly study average.
- Weekly screen-time average.

The final predicted average is adjusted with study, attendance, assignment, and screen-time factors, then limited to the range of 0 to 100.

## Getting Started

### Prerequisites

Install these tools before running the project:

- Python 3.10 or newer
- Node.js 18 or newer
- npm

## Backend Setup

Open a terminal in the project root:

```powershell
cd "D:\student performance predictor"
```

Create and activate a Python virtual environment:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

Start the Flask server:

```powershell
python app.py
```

The API will be available at:

```text
http://127.0.0.1:5000
```

You can test the endpoints in a browser:

```text
http://127.0.0.1:5000/api/student
http://127.0.0.1:5000/api/prediction
```

## Frontend Setup

Open another terminal in the project root:

```powershell
cd "D:\student performance predictor\frontend"
```

Install frontend dependencies:

```powershell
npm install
```

Start the development server:

```powershell
npm run dev
```

Vite will print a local URL, usually:

```text
http://127.0.0.1:5173
```

Open that URL in your browser to use the app.

## Running the Full Application

Use two terminals:

1. Backend terminal:

```powershell
cd "D:\student performance predictor\backend"
.\.venv\Scripts\Activate.ps1
python app.py
```

2. Frontend terminal:

```powershell
cd "D:\student performance predictor\frontend"
npm run dev
```

Then open the frontend URL shown by Vite.

## Frontend Pages and Components

The main React application is in `frontend/src/main.jsx`.

Important sections:

- `AuthScreen`: login and sign-up UI.
- `Activity`: study hours and weekly study/screen charts.
- `PreviousMarks`: previous exam table and subject averages.
- `Attendance`: monthly attendance calendar and attendance summary chart.
- `Assignments`: subject-wise assignment completion.
- `Prediction`: predicted average, key metrics, reasons, and trend graph.
- `Help`: school contact details and complaint form.

The styling is in:

```text
frontend/src/styles.css
```

The project also contains older standalone HTML/CSS pages:

- `frontend/login.html`
- `frontend/login.css`
- `frontend/signup.html`
- `frontend/signup.css`

The Vite React app uses `frontend/index.html` and `frontend/src/main.jsx` as its main entry point.

## Build for Production

To create a production build:

```powershell
cd "D:\student performance predictor\frontend"
npm run build
```

The generated files will be placed in:

```text
frontend/dist
```

To preview the production build:

```powershell
npm run preview
```

## Configuration

The frontend reads backend data from:

```javascript
const API_BASE = "http://127.0.0.1:5000/api";
```

This value is defined in:

```text
frontend/src/main.jsx
```

If the backend URL or port changes, update `API_BASE`.

## Troubleshooting

### Frontend says "Using built-in demo data"

This means the React app could not reach the Flask backend. Check that:

- The backend server is running.
- Flask is running on port `5000`.
- The API URL in `frontend/src/main.jsx` is correct.
- No firewall or port conflict is blocking the request.

### Port 5000 is already in use

Change the port in `backend/app.py`:

```python
app.run(debug=True, port=5000)
```

Then update `API_BASE` in `frontend/src/main.jsx` to match the new port.

### npm command fails

Run dependency installation again:

```powershell
cd "D:\student performance predictor\frontend"
npm install
```

### Python dependency error

Make sure the virtual environment is active and reinstall dependencies:

```powershell
cd "D:\student performance predictor\backend"
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Future Improvements

- Connect login and sign-up forms to real authentication.
- Store student profiles in a database.
- Add forms for teachers or admins to update marks, attendance, and assignments.
- Replace demo data with real student records.
- Add tests for backend prediction logic.
- Add environment variables for API configuration.

## License

No license file is currently included. Add a license before publishing or sharing the project publicly.
