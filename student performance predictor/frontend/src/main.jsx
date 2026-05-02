import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  LineChart,
  LogOut,
  Mail,
  Menu,
  Phone,
  Timer,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./styles.css";

const API_BASE = "http://127.0.0.1:5000/api";

const fallbackStudent = {
  name: "Student Performance Overview",
  studyHours: {
    tuition: 2.5,
    selfStudy: 3,
    sports: 1,
    mobileScreen: 2.2,
    sleep: 7.5,
    revision: 1.4,
  },
  weeklyActivity: [
    { day: "Mon", study: 4.7, screen: 2, sports: 1 },
    { day: "Tue", study: 5, screen: 1.8, sports: 0.8 },
    { day: "Wed", study: 4.1, screen: 2.6, sports: 1.2 },
    { day: "Thu", study: 5.4, screen: 1.7, sports: 0.7 },
    { day: "Fri", study: 4.8, screen: 2.1, sports: 1 },
    { day: "Sat", study: 3.6, screen: 3, sports: 1.5 },
    { day: "Sun", study: 2.8, screen: 3.4, sports: 1.8 },
  ],
  previousExams: [
    { name: "Unit Test 1", maths: 72, science: 76, ss: 70, english: 74, gujarati: 82, hindi: 78 },
    { name: "Mid Term", maths: 78, science: 80, ss: 73, english: 79, gujarati: 84, hindi: 81 },
    { name: "Unit Test 2", maths: 83, science: 85, ss: 78, english: 82, gujarati: 87, hindi: 84 },
  ],
  attendance: [],
  assignments: [
    { subject: "Maths", assigned: 12, completed: 11 },
    { subject: "Science", assigned: 10, completed: 9 },
    { subject: "SS", assigned: 8, completed: 7 },
    { subject: "English", assigned: 9, completed: 8 },
    { subject: "Gujarati", assigned: 7, completed: 7 },
    { subject: "Hindi", assigned: 7, completed: 6 },
  ],
  help: {
    officeNumber: "+91 79 2456 1188",
    email: "schooloffice@example.edu",
    teacherNumber: "+91 98765 43210",
  },
};

const fallbackPrediction = {
  predictedAverage: 84.1,
  previousAverage: 83.2,
  attendanceRate: 91.7,
  assignmentRate: 90.6,
  weeklyStudyAverage: 4.3,
  weeklyScreenAverage: 2.4,
  reasons: [
    "Last exam average is strong at 83.2%.",
    "Attendance is 91.7%, which supports steady learning.",
    "Assignment completion is 90.6%, adding confidence to the prediction.",
    "Screen time is slightly high and may reduce revision quality.",
    "Current study time is consistent across the week.",
  ],
};

const tabs = [
  { id: "activity", label: "Study Activity", icon: Timer },
  { id: "marks", label: "Previous Marks", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "prediction", label: "Prediction", icon: TrendingUp },
  { id: "help", label: "Help", icon: HelpCircle },
];

function useStudentData() {
  const [student, setStudent] = useState(fallbackStudent);
  const [prediction, setPrediction] = useState(fallbackPrediction);
  const [apiStatus, setApiStatus] = useState("Loading Python backend...");

  useEffect(() => {
    async function load() {
      try {
        const [studentResponse, predictionResponse] = await Promise.all([
          fetch(`${API_BASE}/student`),
          fetch(`${API_BASE}/prediction`),
        ]);
        if (!studentResponse.ok || !predictionResponse.ok) {
          throw new Error("Backend unavailable");
        }
        setStudent(await studentResponse.json());
        setPrediction(await predictionResponse.json());
        setApiStatus("Live data from Python backend");
      } catch {
        setApiStatus("Using built-in demo data");
      }
    }
    load();
  }, []);

  return { student, prediction, apiStatus };
}

function App() {
  const { student, prediction, apiStatus } = useStudentData();
  const [activeTab, setActiveTab] = useState("activity");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);

  function handleAuthSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") || "Student";
    setCurrentUser({ name });
  }

  if (!currentUser) {
    return (
      <AuthScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  const page = {
    activity: <Activity student={student} />,
    marks: <PreviousMarks exams={student.previousExams} />,
    attendance: <Attendance attendance={student.attendance} />,
    assignments: <Assignments assignments={student.assignments} />,
    prediction: <Prediction student={student} prediction={prediction} />,
    help: <Help help={student.help} />,
  }[activeTab];

  return (
    <div className="app-shell">
      <nav className="topbar">
        <button className="menu-button" onClick={() => setIsMenuOpen((value) => !value)} aria-label="Toggle menu">
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="brand">
          <span className="brand-mark"><BarChart3 size={22} /></span>
          <div>
            <strong>Student Marks Predictor</strong>
            <small>{currentUser.name} · {apiStatus}</small>
          </div>
        </div>
        <div className="auth-links">
          <button onClick={() => setCurrentUser(null)} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </nav>

      <div className="layout">
        <aside className={`sidebar ${isMenuOpen ? "open" : ""}`}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={activeTab === tab.id ? "active" : ""}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="content">
          <section className="hero-panel">
            <div>
              <p>Academic dashboard</p>
              <h1>{student.name}</h1>
            </div>
            <div className="score-orb">
              <span>{prediction.predictedAverage}%</span>
              <small>Predicted average</small>
            </div>
          </section>
          {page}
        </main>
      </div>
    </div>
  );
}

function AuthScreen({ mode, onModeChange, onSubmit }) {
  const isSignup = mode === "signup";

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <span className="brand-mark"><BarChart3 size={26} /></span>
            <h1>Student Marks Predictor</h1>
            <p>Track study activity, previous marks, attendance, assignments, and predicted performance from one dashboard.</p>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-switch">
            <button className={!isSignup ? "selected" : ""} onClick={() => onModeChange("login")} type="button">
              Login
            </button>
            <button className={isSignup ? "selected" : ""} onClick={() => onModeChange("signup")} type="button">
              Sign Up
            </button>
          </div>

          <h2>{isSignup ? "Create an Account" : "Welcome Back"}</h2>
          <p>{isSignup ? "Create your student profile to continue." : "Login to view your student dashboard."}</p>

          <form className="auth-form" onSubmit={onSubmit}>
            <label htmlFor="name">Username</label>
            <input id="name" name="name" placeholder="Name" required type="text" />

            {isSignup && (
              <>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" placeholder="Email" required type="email" />
              </>
            )}

            <label htmlFor="password">Password</label>
            <input id="password" name="password" placeholder="Password" required type="password" />

            {isSignup && (
              <label className="terms-row" htmlFor="terms">
                <input id="terms" required type="checkbox" />
                Accept terms and conditions
              </label>
            )}

            <button className="auth-submit" type="submit">
              {isSignup ? "Sign Up and Continue" : "Login and Continue"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Activity({ student }) {
  const activityData = Object.entries(student.studyHours).map(([name, hours]) => ({
    name: formatName(name),
    hours,
  }));

  return (
    <section className="panel-grid">
      <div className="panel large">
        <PanelTitle icon={LineChart} title="Overall Activity" />
        <div className="chart tall">
          <ResponsiveContainer>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" radius={[8, 8, 0, 0]} fill="#f97316" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={Timer} title="Weekly Rhythm" />
        <div className="chart">
          <ResponsiveContainer>
            <AreaChart data={student.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="study" stroke="#2563eb" fill="#bfdbfe" name="Study" />
              <Area type="monotone" dataKey="screen" stroke="#ef4444" fill="#fecaca" name="Screen" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function PreviousMarks({ exams }) {
  const subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"];
  const subjectAverages = subjects.map((subject) => ({
    subject: formatName(subject),
    average: Math.round(exams.reduce((sum, exam) => sum + exam[subject], 0) / exams.length),
  }));

  return (
    <section className="panel-grid">
      <div className="panel large">
        <PanelTitle icon={BookOpen} title="Last Three Examinations" />
        <div className="marks-table">
          <div className="table-row header">
            <span>Exam</span>
            {subjects.map((subject) => <span key={subject}>{formatName(subject)}</span>)}
          </div>
          {exams.map((exam) => (
            <div className="table-row" key={exam.name}>
              <strong>{exam.name}</strong>
              {subjects.map((subject) => <span key={subject}>{exam[subject]}</span>)}
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={BarChart3} title="Subject Average" />
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={subjectAverages}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="average" fill="#16a34a" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Attendance({ attendance }) {
  const days = attendance.length ? attendance : buildFallbackAttendance();
  const counts = countStatuses(days);

  return (
    <section className="panel-grid">
      <div className="panel large">
        <PanelTitle icon={CalendarDays} title="April Attendance Calendar" />
        <div className="legend">
          <span><i className="present" /> Present</span>
          <span><i className="absent" /> Absent</span>
          <span><i className="holiday" /> Holiday</span>
        </div>
        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <strong key={day}>{day}</strong>)}
          <span className="blank" />
          <span className="blank" />
          {days.map((day) => (
            <div className={`calendar-day ${day.status}`} key={day.date}>
              <span>{Number(day.date.slice(-2))}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={CheckCircle2} title="Attendance Summary" />
        <div className="chart pie">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={counts} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={4}>
                {counts.map((item) => <Cell key={item.name} fill={item.color} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Assignments({ assignments }) {
  const completion = assignments.map((item) => ({
    subject: item.subject,
    completed: item.completed,
    remaining: item.assigned - item.completed,
  }));

  return (
    <section className="panel-grid">
      <div className="panel large">
        <PanelTitle icon={ClipboardList} title="Assigned vs Completed" />
        <div className="assignment-list">
          {assignments.map((item) => (
            <div className="assignment-row" key={item.subject}>
              <div>
                <strong>{item.subject}</strong>
                <span>{item.completed} of {item.assigned} completed</span>
              </div>
              <progress value={item.completed} max={item.assigned} />
            </div>
          ))}
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={BarChart3} title="Completion Graph" />
        <div className="chart">
          <ResponsiveContainer>
            <BarChart data={completion}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#2563eb" />
              <Bar dataKey="remaining" stackId="a" fill="#fed7aa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Prediction({ student, prediction }) {
  const trend = useMemo(() => {
    const subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"];
    return student.previousExams.map((exam) => ({
      name: exam.name,
      average: Number((subjects.reduce((sum, subject) => sum + exam[subject], 0) / subjects.length).toFixed(1)),
    })).concat({ name: "Predicted", average: prediction.predictedAverage });
  }, [student.previousExams, prediction.predictedAverage]);

  return (
    <section className="panel-grid">
      <div className="panel large">
        <PanelTitle icon={TrendingUp} title="Predicted Marks" />
        <div className="prediction-summary">
          <div>
            <span className="prediction-number">{prediction.predictedAverage}%</span>
            <p>Expected average marks based on current study time, previous marks, attendance, screen time, and assignment submission.</p>
          </div>
          <div className="metric-stack">
            <Metric label="Previous average" value={`${prediction.previousAverage}%`} />
            <Metric label="Attendance" value={`${prediction.attendanceRate}%`} />
            <Metric label="Assignments" value={`${prediction.assignmentRate}%`} />
            <Metric label="Study / day" value={`${prediction.weeklyStudyAverage} hr`} />
          </div>
        </div>
        <div className="reason-box">
          {prediction.reasons.map((reason) => <p key={reason}>{reason}</p>)}
        </div>
      </div>
      <div className="panel">
        <PanelTitle icon={LineChart} title="Average Trend" />
        <div className="chart">
          <ResponsiveContainer>
            <ReLineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="average" stroke="#f97316" strokeWidth={3} dot={{ r: 5 }} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Help({ help }) {
  return (
    <section className="panel-grid">
      <div className="panel">
        <PanelTitle icon={Phone} title="School Contacts" />
        <div className="contact-list">
          <Contact icon={Phone} label="Office number" value={help.officeNumber} />
          <Contact icon={Mail} label="Email" value={help.email} />
          <Contact icon={Phone} label="Teacher number" value={help.teacherNumber} />
        </div>
      </div>
      <div className="panel large">
        <PanelTitle icon={HelpCircle} title="Complaint Area" />
        <form className="complaint-form">
          <label htmlFor="complaint">Complaint text</label>
          <textarea id="complaint" placeholder="Write your complaint for the school office or teacher..." />
          <button type="button">Submit Complaint</button>
        </form>
      </div>
    </section>
  );
}

function PanelTitle({ icon: Icon, title }) {
  return (
    <div className="panel-title">
      <Icon size={20} />
      <h2>{title}</h2>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Contact({ icon: Icon, label, value }) {
  return (
    <div className="contact-card">
      <Icon size={20} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function formatName(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function buildFallbackAttendance() {
  return Array.from({ length: 30 }, (_, index) => {
    const day = index + 1;
    const status = [4, 5, 11, 12, 18, 19, 25, 26].includes(day)
      ? "holiday"
      : [7, 17].includes(day)
        ? "absent"
        : "present";
    return { date: `2026-04-${String(day).padStart(2, "0")}`, status };
  });
}

function countStatuses(days) {
  const colors = { present: "#22c55e", absent: "#ef4444", holiday: "#3b82f6" };
  return ["present", "absent", "holiday"].map((status) => ({
    name: formatName(status),
    value: days.filter((day) => day.status === status).length,
    color: colors[status],
  }));
}

createRoot(document.getElementById("root")).render(<App />);
