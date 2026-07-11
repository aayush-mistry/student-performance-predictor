import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  HelpCircle,
  Eye,
  LineChart,
  LogOut,
  Mail,
  Menu,
  Phone,
  Search,
  Timer,
  Trophy,
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
import { useNavigate } from "react-router-dom";

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
  { id: "examSchedule", label: "Exam Schedule", icon: CalendarClock },
  { id: "events", label: "Events & Activities", icon: Trophy },
  { id: "marks", label: "Previous Marks", icon: BookOpen },
  { id: "attendance", label: "Attendance", icon: CalendarDays },
  { id: "assignments", label: "Assignments", icon: ClipboardList },
  { id: "prediction", label: "Prediction", icon: TrendingUp },
  { id: "help", label: "Help", icon: HelpCircle },
];

const fallbackExamSchedule = {
  unitTests: [
    { exam_id: 1, subject: "Mathematics", exam_name: "Unit Test 3", date: "2026-07-11", start_time: "09:00 AM", end_time: "10:00 AM", duration: "1 hour", status: "Published" },
    { exam_id: 2, subject: "Science", exam_name: "Unit Test 3", date: "2026-07-12", start_time: "09:00 AM", end_time: "10:00 AM", duration: "1 hour", status: "Published" },
    { exam_id: 3, subject: "English", exam_name: "Unit Test 3", date: "2026-07-15", start_time: "10:30 AM", end_time: "11:30 AM", duration: "1 hour", status: "Published" },
  ],
  finalExams: [
    { exam_id: 5, subject: "Gujarati", date: "2026-08-03", start_time: "09:30 AM", end_time: "12:30 PM", duration: "3 hours", hall_number: "Hall 1", maximum_marks: 100, status: "Published" },
    { exam_id: 7, subject: "Mathematics", date: "2026-08-10", start_time: "09:30 AM", end_time: "12:30 PM", duration: "3 hours", hall_number: "Hall 2", maximum_marks: 100, status: "Published" },
    { exam_id: 10, subject: "Social Studies", date: "2026-08-20", start_time: "09:30 AM", end_time: "12:30 PM", duration: "3 hours", hall_number: "Hall 3", maximum_marks: 100, status: "Published" },
  ],
  completedExams: [
    { exam_id: 11, subject: "Mathematics", date: "2026-06-10", exam_type: "Unit Test", result_status: "Published", marks_available: true, maximum_marks: 25 },
    { exam_id: 12, subject: "Science", date: "2026-06-12", exam_type: "Unit Test", result_status: "Published", marks_available: true, maximum_marks: 25 },
    { exam_id: 13, subject: "English", date: "2026-06-18", exam_type: "Mid Term", result_status: "Awaiting Result", marks_available: false, maximum_marks: 20 },
  ],
};

const fallbackEvents = {
  events: [
    { event_id: 1, event_name: "Independence Day Celebration", category: "National Celebrations", description: "Flag hoisting, patriotic performances, and student speeches.", event_date: "2026-08-15", start_time: "08:00 AM", end_time: "10:30 AM", venue: "Main Ground", organizer: "Social Science Department", applicable_classes: "All", max_participants: 800, registration_deadline: "2026-08-10", poster: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?auto=format&fit=crop&w=900&q=80", priority: "High", status: "Upcoming", published: true },
    { event_id: 2, event_name: "Science Fair", category: "Competitions", description: "Model exhibition and science demonstrations for class teams.", event_date: "2026-07-26", start_time: "09:30 AM", end_time: "02:00 PM", venue: "Science Block", organizer: "Science Club", applicable_classes: "8,9,10", max_participants: 120, registration_deadline: "2026-07-20", poster: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=80", priority: "High", status: "Upcoming", published: true },
    { event_id: 4, event_name: "Khel Mahakumbh Trials", category: "Sports Events", description: "Selection trials for athletics, kabaddi, kho-kho, and volleyball.", event_date: "2026-07-18", start_time: "07:30 AM", end_time: "11:30 AM", venue: "Sports Ground", organizer: "Sports Department", applicable_classes: "6,7,8,9,10", max_participants: 300, registration_deadline: "2026-07-16", poster: "https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=900&q=80", priority: "Medium", status: "Ongoing", published: true },
    { event_id: 10, event_name: "Quiz Competition", category: "Competitions", description: "House-wise general knowledge and current affairs quiz.", event_date: "2026-06-28", start_time: "10:00 AM", end_time: "12:00 PM", venue: "Auditorium", organizer: "Library Club", applicable_classes: "6,7,8,9,10", max_participants: 80, registration_deadline: "2026-06-24", poster: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?auto=format&fit=crop&w=900&q=80", priority: "Medium", status: "Completed", published: true },
  ],
  upcomingEvents: [],
  completedEvents: [],
  stats: { totalEvents: 4, upcomingEvents: 2, ongoingEvents: 1, completedEvents: 1 },
};

fallbackEvents.upcomingEvents = fallbackEvents.events.filter(event => ["Upcoming", "Ongoing"].includes(event.status));
fallbackEvents.completedEvents = fallbackEvents.events.filter(event => event.status === "Completed");

function useStudentData(studentId) {
  const [student, setStudent] = useState(fallbackStudent);
  const [prediction, setPrediction] = useState(fallbackPrediction);
  const [apiStatus, setApiStatus] = useState("Loading Python backend...");

  useEffect(() => {
    async function load() {
      try {
        const studentEndpoint = studentId ? `${API_BASE}/students/${studentId}` : `${API_BASE}/student`;
        const predEndpoint = studentId ? `${API_BASE}/prediction/${studentId}` : `${API_BASE}/prediction`;
        const [studentResponse, predictionResponse] = await Promise.all([
          fetch(studentEndpoint),
          fetch(predEndpoint),
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
  }, [studentId]);

  return { student, prediction, apiStatus };
}

function useExamSchedule() {
  const [schedule, setSchedule] = useState(fallbackExamSchedule);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/exams/schedule`);
        if (!response.ok) throw new Error("Exam schedule unavailable");
        setSchedule(await response.json());
      } catch {
        setSchedule(fallbackExamSchedule);
      }
    }
    load();
  }, []);

  return schedule;
}

function useEvents() {
  const [eventsData, setEventsData] = useState(fallbackEvents);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`${API_BASE}/events`);
        if (!response.ok) throw new Error("Events unavailable");
        setEventsData(await response.json());
      } catch {
        setEventsData(fallbackEvents);
      }
    }
    load();
  }, []);

  return eventsData;
}

export default function StudentPortal({ currentUser, onLogout }) {
  const { student, prediction, apiStatus } = useStudentData(currentUser?.studentId);
  const examSchedule = useExamSchedule();
  const eventsData = useEvents();
  const [activeTab, setActiveTab] = useState("activity");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const page = {
    activity: <Activity student={student} />,
    examSchedule: <ExamSchedule schedule={examSchedule} />,
    events: <EventsActivities eventsData={eventsData} student={student} />,
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
            <small>{currentUser?.name} · {apiStatus}</small>
          </div>
        </div>
        <div className="auth-links">
          <button onClick={handleLogout} type="button">
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
    average: Math.round(exams.reduce((sum, exam) => sum + exam[subject], 0) / (exams.length || 1)),
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
      average: Number((subjects.reduce((sum, subject) => sum + exam[subject], 0) / (subjects.length || 1)).toFixed(1)),
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

function ExamSchedule({ schedule }) {
  const [selectedResult, setSelectedResult] = useState(null);

  return (
    <section className="exam-module">
      <div className="panel">
        <PanelTitle icon={CalendarClock} title="Upcoming Unit Tests" />
        <div className="responsive-table">
          <table className="admin-table exam-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Days Left</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.unitTests.map(exam => (
                <tr key={exam.exam_id}>
                  <td><strong>{exam.subject}</strong></td>
                  <td>{exam.exam_name}</td>
                  <td>{formatDisplayDate(exam.date)}</td>
                  <td>{exam.start_time} - {exam.end_time}</td>
                  <td>{exam.duration}</td>
                  <td><CountdownBadge date={exam.date} /></td>
                  <td><StatusBadge status={exam.status} /></td>
                </tr>
              ))}
              {!schedule.unitTests.length && <EmptyExamRow columns={7} />}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={CalendarDays} title="Final Examination Schedule" />
        <div className="responsive-table">
          <table className="admin-table exam-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Time</th>
                <th>Duration</th>
                <th>Hall Number</th>
                <th>Maximum Marks</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {schedule.finalExams.map(exam => (
                <tr key={exam.exam_id}>
                  <td><strong>{exam.subject}</strong></td>
                  <td>{formatDisplayDate(exam.date)}</td>
                  <td>{exam.start_time} - {exam.end_time}</td>
                  <td>{exam.duration}</td>
                  <td>{exam.hall_number || "-"}</td>
                  <td>{exam.maximum_marks}</td>
                  <td><StatusBadge status={exam.status} /></td>
                </tr>
              ))}
              {!schedule.finalExams.length && <EmptyExamRow columns={7} />}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <PanelTitle icon={CheckCircle2} title="Completed Exams" />
        <div className="responsive-table">
          <table className="admin-table exam-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Exam Type</th>
                <th>Result Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {schedule.completedExams.map(exam => (
                <tr key={exam.exam_id}>
                  <td><strong>{exam.subject}</strong></td>
                  <td>{formatDisplayDate(exam.date)}</td>
                  <td>{exam.exam_type}</td>
                  <td><StatusBadge status={exam.result_status} /></td>
                  <td>
                    {exam.marks_available ? (
                      <button className="secondary-action compact-action" onClick={() => setSelectedResult(exam)} type="button">
                        <Eye size={16} />
                        View Result
                      </button>
                    ) : "Not available"}
                  </td>
                </tr>
              ))}
              {!schedule.completedExams.length && <EmptyExamRow columns={5} />}
            </tbody>
          </table>
        </div>
      </div>

      {selectedResult && (
        <div className="modal-backdrop">
          <div className="panel admin-modal">
            <div className="modal-title-row">
              <h3>{selectedResult.subject} Result</h3>
              <button onClick={() => setSelectedResult(null)} aria-label="Close result"><X size={20} /></button>
            </div>
            <div className="metric-stack">
              <Metric label="Exam Type" value={selectedResult.exam_type} />
              <Metric label="Maximum Marks" value={selectedResult.maximum_marks || 100} />
              <Metric label="Status" value={selectedResult.result_status} />
              <Metric label="Date" value={formatDisplayDate(selectedResult.date)} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function EventsActivities({ eventsData, student }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registeredIds, setRegisteredIds] = useState([]);
  const controls = useEventControls(eventsData.events, student?.current_class);
  const upcoming = controls.events.filter(event => ["Upcoming", "Ongoing"].includes(event.status));
  const completed = controls.events.filter(event => event.status === "Completed");

  const handleRegister = (event) => {
    if (!registeredIds.includes(event.event_id)) {
      setRegisteredIds([...registeredIds, event.event_id]);
    }
  };

  return (
    <section className="events-module">
      <div className="panel event-hero-panel">
        <div>
          <span className="event-eyebrow">Events & Activities</span>
          <h2>School calendar, competitions, celebrations, and activity updates</h2>
        </div>
        <div className="event-stat-strip">
          <Metric label="Total Events" value={eventsData.stats.totalEvents} />
          <Metric label="Upcoming" value={eventsData.stats.upcomingEvents} />
          <Metric label="Ongoing" value={eventsData.stats.ongoingEvents} />
          <Metric label="Completed" value={eventsData.stats.completedEvents} />
        </div>
      </div>

      <EventFilters controls={controls} />

      <EventSection title="Upcoming Events" events={upcoming} onView={setSelectedEvent} onRegister={handleRegister} registeredIds={registeredIds} />
      <EventSection title="Completed Events" events={completed} onView={setSelectedEvent} onRegister={handleRegister} registeredIds={registeredIds} />

      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onRegister={handleRegister}
          isRegistered={registeredIds.includes(selectedEvent.event_id)}
        />
      )}
    </section>
  );
}

function EventFilters({ controls }) {
  return (
    <div className="panel event-filters">
      <label className="search-control">
        <Search size={18} />
        <input value={controls.search} onChange={(e) => controls.setSearch(e.target.value)} placeholder="Search events, category, or venue" />
      </label>
      <select value={controls.category} onChange={(e) => controls.setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {controls.categories.map(category => <option value={category} key={category}>{category}</option>)}
      </select>
      <select value={controls.month} onChange={(e) => controls.setMonth(e.target.value)}>
        <option value="">All Months</option>
        {controls.months.map(month => <option value={month} key={month}>{month}</option>)}
      </select>
      <select value={controls.classFilter} onChange={(e) => controls.setClassFilter(e.target.value)}>
        <option value="">All Classes</option>
        {controls.classes.map(item => <option value={item} key={item}>Class {item}</option>)}
      </select>
      <select value={controls.status} onChange={(e) => controls.setStatus(e.target.value)}>
        <option value="">All Statuses</option>
        {["Upcoming", "Ongoing", "Completed", "Cancelled"].map(status => <option value={status} key={status}>{status}</option>)}
      </select>
    </div>
  );
}

function EventSection({ title, events, onView, onRegister, registeredIds }) {
  return (
    <div className="event-section">
      <div className="event-section-title">
        <h2>{title}</h2>
        <span>{events.length} events</span>
      </div>
      <div className="event-card-grid">
        {events.map(event => (
          <EventCard
            event={event}
            key={event.event_id}
            onView={onView}
            onRegister={onRegister}
            isRegistered={registeredIds.includes(event.event_id)}
          />
        ))}
        {!events.length && <div className="panel loading-panel">No matching events found.</div>}
      </div>
    </div>
  );
}

function EventCard({ event, onView, onRegister, isRegistered }) {
  const isCompetition = event.category === "Competitions";
  return (
    <article className="event-card">
      <img src={event.poster} alt={`${event.event_name} poster`} />
      <div className="event-card-body">
        <div className="event-card-top">
          <StatusBadge status={event.status} />
          <span className={`priority-badge ${String(event.priority).toLowerCase()}`}>{event.priority}</span>
        </div>
        <h3>{event.event_name}</h3>
        <p>{event.description}</p>
        <div className="event-meta-grid">
          <span>{formatDisplayDate(event.event_date)}</span>
          <span>{event.start_time} - {event.end_time}</span>
          <span>{event.venue}</span>
          <CountdownBadge date={event.event_date} />
        </div>
        <div className="event-actions">
          <button className="secondary-action compact-action" onClick={() => onView(event)} type="button">
            <Eye size={16} />
            Details
          </button>
          {isCompetition && event.status === "Upcoming" && (
            <button className="primary-action compact-action" onClick={() => onRegister(event)} type="button">
              {isRegistered ? "Registered" : "Register"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EventDetailsModal({ event, onClose, onRegister, isRegistered }) {
  const isCompetition = event.category === "Competitions";
  return (
    <div className="modal-backdrop">
      <div className="panel event-modal">
        <div className="modal-title-row">
          <h3>{event.event_name}</h3>
          <button onClick={onClose} aria-label="Close event details"><X size={20} /></button>
        </div>
        <img className="event-modal-poster" src={event.poster} alt={`${event.event_name} poster`} />
        <p className="event-description">{event.description}</p>
        <div className="metric-stack">
          <Metric label="Category" value={event.category} />
          <Metric label="Date" value={formatDisplayDate(event.event_date)} />
          <Metric label="Time" value={`${event.start_time} - ${event.end_time}`} />
          <Metric label="Venue" value={event.venue} />
          <Metric label="Organizer" value={event.organizer} />
          <Metric label="Eligibility" value={event.applicable_classes === "All" ? "All students" : `Classes ${event.applicable_classes}`} />
          <Metric label="Max Participants" value={event.max_participants || "Open"} />
          <Metric label="Deadline" value={formatDisplayDate(event.registration_deadline)} />
        </div>
        {isCompetition && event.status === "Upcoming" && (
          <button className="primary-action full-width" onClick={() => onRegister(event)} type="button">
            {isRegistered ? "Registered" : "Register for Competition"}
          </button>
        )}
      </div>
    </div>
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

function useEventControls(events, studentClass) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [month, setMonth] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [status, setStatus] = useState("");

  const categories = useMemo(() => uniqueValues(events.map(event => event.category)), [events]);
  const months = useMemo(() => uniqueValues(events.map(event => getMonthLabel(event.event_date))), [events]);
  const classes = useMemo(() => uniqueValues(events.flatMap(event => parseClasses(event.applicable_classes))), [events]);
  const effectiveClass = classFilter || studentClass || "";
  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return events
      .filter(event => !query || [event.event_name, event.category, event.venue].some(value => String(value || "").toLowerCase().includes(query)))
      .filter(event => !category || event.category === category)
      .filter(event => !month || getMonthLabel(event.event_date) === month)
      .filter(event => !status || event.status === status)
      .filter(event => !effectiveClass || event.applicable_classes === "All" || parseClasses(event.applicable_classes).includes(String(effectiveClass)))
      .sort((a, b) => new Date(`${a.event_date}T00:00:00`) - new Date(`${b.event_date}T00:00:00`));
  }, [events, search, category, month, status, effectiveClass]);

  return {
    search,
    setSearch,
    category,
    setCategory,
    month,
    setMonth,
    classFilter,
    setClassFilter,
    status,
    setStatus,
    categories,
    months,
    classes,
    events: filteredEvents,
  };
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function parseClasses(value) {
  if (!value || value === "All") return [];
  return String(value).split(",").map(item => item.trim()).filter(Boolean);
}

function getMonthLabel(date) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function formatDisplayDate(date) {
  if (!date) return "-";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getDaysLeft(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const examDate = new Date(`${date}T00:00:00`);
  return Math.ceil((examDate - today) / 86400000);
}

function CountdownBadge({ date }) {
  const days = getDaysLeft(date);
  const label = days === 0 ? "Today" : days === 1 ? "Tomorrow" : days > 1 ? `${days} Days Left` : "Completed";
  return <span className={`countdown-badge ${days <= 1 && days >= 0 ? "urgent" : ""}`}>{label}</span>;
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${String(status).toLowerCase().replace(/\s+/g, "-")}`}>{status}</span>;
}

function EmptyExamRow({ columns }) {
  return <tr><td className="empty-table" colSpan={columns}>No exam records found.</td></tr>;
}
