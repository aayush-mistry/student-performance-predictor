# Student Performance Predictor

React + Python project for predicting student marks from study activity, previous exam results, attendance, screen time, and assignment completion.

The React app now includes login and signup screens. After the user logs in or signs up, the dashboard opens automatically.

## Run Backend

```powershell
cd "backend"
python -m pip install -r requirements.txt
python app.py
```

The backend runs on `http://127.0.0.1:5000`.

## Run Frontend

```powershell
cd "frontend"
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The existing `login.html` and `signup.html` remain in `frontend` and are linked from the React navbar.
