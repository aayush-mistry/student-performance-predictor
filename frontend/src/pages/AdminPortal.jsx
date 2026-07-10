import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  LogOut,
  Menu,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000/api";
const SUBJECTS = ["maths", "science", "ss", "english", "gujarati", "hindi"];

const navItems = [
  { path: "dashboard", label: "Dashboard", icon: TrendingUp },
  { path: "students", label: "Students", icon: Users },
  { path: "attendance", label: "Attendance", icon: CalendarDays },
  { path: "assignments", label: "Assignments", icon: ClipboardList },
  { path: "risk", label: "Risk Analysis", icon: AlertTriangle },
];

export default function AdminPortal({ currentUser, onLogout }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/students`);
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <div className="app-shell admin-shell">
      <nav className="topbar admin-topbar">
        <button className="menu-button admin-menu-button" onClick={() => setIsMenuOpen((value) => !value)} aria-label="Toggle admin menu">
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="brand admin-brand">
          <span className="brand-mark admin-brand-mark"><TrendingUp size={22} /></span>
          <div>
            <strong>Admin Portal</strong>
            <small>{currentUser?.name || "Administrator"}</small>
          </div>
        </div>
        <div className="auth-links admin-actions">
          <button onClick={handleLogout} type="button">
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </nav>

      <div className="layout">
        <aside className={`sidebar admin-sidebar ${isMenuOpen ? "open" : ""}`}>
          <div className="admin-nav-label">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={`/admin/${item.path}`}
                className={({ isActive }) => isActive ? "active" : ""}
                onClick={() => setIsMenuOpen(false)}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        <main className="content">
          <Routes>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard students={students} isLoading={isLoading} />} />
            <Route path="students" element={<StudentsPage students={students} isLoading={isLoading} refresh={fetchStudents} />} />
            <Route path="attendance" element={<AttendancePage students={students} isLoading={isLoading} />} />
            <Route path="assignments" element={<AssignmentsPage students={students} isLoading={isLoading} />} />
            <Route path="risk" element={<RiskPage students={students} isLoading={isLoading} />} />
            <Route path="student/:id" element={<StudentProfile students={students} isLoading={isLoading} refresh={fetchStudents} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ students, isLoading }) {
  const navigate = useNavigate();
  const stats = useMemo(() => getDashboardStats(students), [students]);
  const cards = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, color: "blue", to: "/admin/students" },
    { label: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: CalendarDays, color: "green", to: "/admin/attendance" },
    { label: "Assignments Done", value: stats.assignmentsDone, icon: ClipboardList, color: "amber", to: "/admin/assignments" },
    { label: "Students At Risk", value: stats.atRisk, icon: AlertTriangle, color: "red", to: "/admin/risk" },
  ];

  return (
    <div className="admin-page">
      <section className="hero-panel admin-hero">
        <div>
          <p>Overview</p>
          <h1>Admin Dashboard</h1>
          <span>Monitor performance, attendance, assignment progress, and students who may need support.</span>
        </div>
        <div className="admin-hero-stat">
          <strong>{isLoading ? "--" : stats.totalStudents}</strong>
          <small>Students</small>
        </div>
      </section>

      {isLoading ? <LoadingBlock /> : (
        <section className="admin-metrics-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button className={`admin-metric-card clickable ${card.color}`} key={card.label} onClick={() => navigate(card.to)} type="button">
                <span><Icon size={22} /></span>
                <div>
                  <strong>{card.value}</strong>
                  <p>{card.label}</p>
                  <small>View Details &rarr;</small>
                </div>
              </button>
            );
          })}
        </section>
      )}
    </div>
  );
}

function StudentsPage({ students, isLoading, refresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const navigate = useNavigate();
  const controls = useStudentControls(students, "prediction");

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
      refresh();
    }
  };

  const handleExportCSV = () => {
    let csv = "Student ID,Name,Roll No,Class,Division,Attendance %,Predicted Score,Risk Level\n";
    controls.rows.forEach(s => {
      csv += `${s.id},${s.name},${s.roll_no},${s.current_class},${s.division},${s.attendancePercentage},${s.predictedScore},${s.riskLevel}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Records" title="Students" actions={(
        <>
          <button className="secondary-action" onClick={handleExportCSV} type="button"><Download size={16} />Export CSV</button>
          <button className="primary-action" onClick={() => setShowAddForm(true)} type="button"><Plus size={16} />Add Student</button>
        </>
      )} />

      <DataControls controls={controls} showRisk />

      {(showAddForm || editingStudent) && (
        <StudentForm
          student={editingStudent}
          onClose={() => { setShowAddForm(false); setEditingStudent(null); }}
          onSave={() => { setShowAddForm(false); setEditingStudent(null); refresh(); }}
        />
      )}

      {isLoading ? <LoadingBlock /> : (
        <div className="panel admin-table-panel">
          <table className="admin-table wide-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Division</th>
                <th>Attendance</th>
                <th>Prediction</th>
                <th>Risk</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {controls.rows.map(s => (
                <tr key={s.id}>
                  <td>S{s.id}</td>
                  <td><strong>{s.name}</strong><span>{s.email || "No email"}</span></td>
                  <td>{s.roll_no || "-"}</td>
                  <td>{s.current_class || "-"}</td>
                  <td>{s.division || "-"}</td>
                  <td>{s.attendancePercentage}%</td>
                  <td>{s.predictedScore}%</td>
                  <td><RiskBadge level={s.riskLevel} /></td>
                  <td>
                    <div className="table-actions">
                      <button aria-label={`View ${s.name}`} onClick={() => navigate(`/admin/student/${s.id}`)}><Eye size={18} /></button>
                      <button aria-label={`Edit ${s.name}`} onClick={() => setEditingStudent(s)}><Edit size={18} /></button>
                      <button aria-label={`Delete ${s.name}`} className="danger" onClick={() => handleDelete(s.id)}><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!controls.rows.length && <EmptyRow columns={9} />}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AttendancePage({ students, isLoading }) {
  const controls = useStudentControls(students, "attendance");
  const classStats = useMemo(() => getClassAttendanceStats(students), [students]);

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Attendance" title="Attendance Dashboard" />
      <DataControls controls={controls} />
      {isLoading ? <LoadingBlock /> : (
        <>
          <section className="summary-grid">
            {classStats.map(stat => (
              <div className="mini-stat-card" key={stat.className}>
                <span>Class {stat.className}</span>
                <strong>{stat.attendance}%</strong>
                <ProgressBar value={stat.attendance} />
              </div>
            ))}
          </section>
          <div className="panel admin-table-panel">
            <table className="admin-table wide-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Holidays</th>
                  <th>Attendance %</th>
                  <th>Progress</th>
                  <th>Monthly Calendar</th>
                </tr>
              </thead>
              <tbody>
                {controls.rows.map(s => (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong><span>{s.roll_no}</span></td>
                    <td>{s.current_class} - {s.division}</td>
                    <td>{s.presentDays}</td>
                    <td>{s.absentDays}</td>
                    <td>{s.holidays}</td>
                    <td>{s.attendancePercentage}%</td>
                    <td><ProgressBar value={s.attendancePercentage} /></td>
                    <td><MiniCalendar attendance={s.attendance} /></td>
                  </tr>
                ))}
                {!controls.rows.length && <EmptyRow columns={8} />}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function AssignmentsPage({ students, isLoading }) {
  const controls = useStudentControls(students, "assignments");
  return (
    <div className="admin-page">
      <PageHeader eyebrow="Assignments" title="Assignment Dashboard" />
      <DataControls controls={controls} />
      {isLoading ? <LoadingBlock /> : (
        <div className="panel admin-table-panel">
          <table className="admin-table wide-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Completion</th>
                <th>Subject Status</th>
              </tr>
            </thead>
            <tbody>
              {controls.rows.map(s => {
                const total = getAssignmentTotal(s);
                const completed = getAssignmentCompleted(s);
                const pending = Math.max(0, total - completed);
                const completion = total ? Math.round((completed / total) * 100) : 0;
                return (
                  <tr key={s.id}>
                    <td><strong>{s.name}</strong><span>{s.roll_no}</span></td>
                    <td>{total}</td>
                    <td>{completed}</td>
                    <td>{pending}</td>
                    <td><ProgressBar value={completion} label={`${completion}%`} /></td>
                    <td>
                      <div className="subject-pill-list">
                        {s.assignments.map(item => (
                          <span key={item.subject}>{item.subject}: {item.completed}/{item.assigned}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!controls.rows.length && <EmptyRow columns={6} />}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RiskPage({ students, isLoading }) {
  const riskStudents = students.filter(s => s.riskLevel !== "Low");
  const controls = useStudentControls(riskStudents, "prediction");

  return (
    <div className="admin-page">
      <PageHeader eyebrow="Intervention" title="Risk Analysis" />
      <DataControls controls={controls} showRisk />
      {isLoading ? <LoadingBlock /> : (
        <div className="panel admin-table-panel">
          <table className="admin-table wide-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Prediction</th>
                <th>Attendance</th>
                <th>Risk Level</th>
                <th>Weak Subjects</th>
                <th>Pending</th>
                <th>Study Hours</th>
                <th>AI Suggestions</th>
              </tr>
            </thead>
            <tbody>
              {controls.rows.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong><span>{s.roll_no}</span></td>
                  <td>{s.predictedScore}%</td>
                  <td>{s.attendancePercentage}%</td>
                  <td><RiskBadge level={s.riskLevel} /></td>
                  <td>{s.weakSubjects.length ? s.weakSubjects.join(", ") : "None"}</td>
                  <td>{s.pendingAssignments}</td>
                  <td>{s.prediction.weeklyStudyAverage} hr/day</td>
                  <td className="suggestion-cell">{s.aiSuggestions.slice(0, 2).join(" ")}</td>
                </tr>
              ))}
              {!controls.rows.length && <EmptyRow columns={8} message="No students currently match the risk filters." />}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StudentProfile({ students, isLoading, refresh }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = students.find(s => String(s.id) === String(id));
  const [editingStudent, setEditingStudent] = useState(null);

  if (isLoading) return <LoadingBlock />;
  if (!student) return <PageHeader eyebrow="Missing" title="Student not found" actions={<button className="secondary-action" onClick={() => navigate("/admin/students")}>Back to Students</button>} />;

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={student.roll_no || `S${student.id}`}
        title={student.name}
        actions={(
          <>
            <button className="secondary-action" onClick={() => navigate("/admin/students")} type="button">
              Back to Students
            </button>
            <button className="primary-action" onClick={() => setEditingStudent(student)} type="button">
              <Edit size={16} />
              Edit Profile
            </button>
          </>
        )}
      />
      {editingStudent && (
        <StudentForm
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
          onSave={() => { setEditingStudent(null); refresh(); }}
        />
      )}
      <section className="profile-grid">
        <InfoPanel title="Personal Information" icon={UserRound} rows={[
          ["Student ID", `S${student.id}`],
          ["Roll Number", student.roll_no || "-"],
          ["Class", student.current_class || "-"],
          ["Division", student.division || "-"],
        ]} />
        <InfoPanel title="Parent Information" icon={Users} rows={[["Parent Name", student.parent_name || "-"]]} />
        <InfoPanel title="Contact Details" icon={FileText} rows={[["Phone", student.contact || "-"], ["Email", student.email || "-"]]} />
        <InfoPanel title="Performance Prediction" icon={TrendingUp} rows={[
          ["Predicted Score", `${student.predictedScore}%`],
          ["Previous Average", `${student.prediction.previousAverage}%`],
          ["Risk Level", student.riskLevel],
        ]} />
      </section>

      <section className="panel-grid profile-detail-grid">
        <div className="panel large">
          <div className="panel-title"><GraduationCap size={20} /><h2>Subject Marks</h2></div>
          <div className="marks-table">
            <div className="table-row header"><strong>Exam</strong>{SUBJECTS.map(sub => <span key={sub}>{labelize(sub)}</span>)}</div>
            {student.previousExams.map(exam => (
              <div className="table-row" key={exam.name}><strong>{exam.name}</strong>{SUBJECTS.map(sub => <span key={sub}>{exam[sub]}</span>)}</div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><CalendarDays size={20} /><h2>Attendance History</h2></div>
          <MetricStack items={[
            ["Present Days", student.presentDays],
            ["Absent Days", student.absentDays],
            ["Holidays", student.holidays],
            ["Attendance", `${student.attendancePercentage}%`],
          ]} />
          <MiniCalendar attendance={student.attendance} large />
        </div>
      </section>

      <section className="panel-grid profile-detail-grid">
        <div className="panel">
          <div className="panel-title"><ClipboardList size={20} /><h2>Assignment Progress</h2></div>
          <div className="assignment-list">
            {student.assignments.map(item => (
              <div className="assignment-row" key={item.subject}>
                <div><strong>{item.subject}</strong><span>{item.completed} of {item.assigned}</span></div>
                <ProgressBar value={item.assigned ? Math.round((item.completed / item.assigned) * 100) : 0} />
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><TrendingUp size={20} /><h2>Study and Screen Time</h2></div>
          <MetricStack items={[
            ["Tuition", `${student.studyHours.tuition} hr`],
            ["Self Study", `${student.studyHours.selfStudy} hr`],
            ["Revision", `${student.studyHours.revision} hr`],
            ["Screen Time", `${student.studyHours.mobileScreen} hr`],
          ]} />
          <div className="weekly-list">
            {student.weeklyActivity.map(day => (
              <div key={day.day}><strong>{day.day}</strong><span>Study {day.study} hr</span><span>Screen {day.screen} hr</span></div>
            ))}
          </div>
        </div>
      </section>

      <div className="panel">
        <div className="panel-title"><AlertTriangle size={20} /><h2>AI Suggestions</h2></div>
        <div className="reason-box">
          {student.aiSuggestions.map(reason => <p key={reason}>{reason}</p>)}
        </div>
      </div>
    </div>
  );
}

function PageHeader({ eyebrow, title, actions }) {
  return (
    <div className="admin-section-header">
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      {actions && <div className="admin-toolbar">{actions}</div>}
    </div>
  );
}

function DataControls({ controls, showRisk = false }) {
  return (
    <div className="panel admin-controls">
      <label className="search-control">
        <Search size={18} />
        <input value={controls.search} onChange={(e) => controls.setSearch(e.target.value)} placeholder="Search by name, student ID, or roll number" />
      </label>
      <CustomSelect
        icon={Filter}
        options={[{ label: "All Classes", value: "" }, ...controls.classes.map(item => ({ label: `Class ${item}`, value: item }))]}
        value={controls.classFilter}
        onChange={controls.setClassFilter}
      />
      <CustomSelect
        icon={Filter}
        options={[{ label: "All Divisions", value: "" }, ...controls.divisions.map(item => ({ label: `Division ${item}`, value: item }))]}
        value={controls.divisionFilter}
        onChange={controls.setDivisionFilter}
      />
      {showRisk && (
        <CustomSelect
          icon={Filter}
          options={[
            { label: "All Risk Levels", value: "" },
            { label: "High Risk", value: "High" },
            { label: "Medium Risk", value: "Medium" },
            { label: "Low Risk", value: "Low" },
          ]}
          value={controls.riskFilter}
          onChange={controls.setRiskFilter}
        />
      )}
      <CustomSelect
        icon={TrendingUp}
        options={[
          { label: "Sort by Marks", value: "marks" },
          { label: "Sort by Attendance", value: "attendance" },
          { label: "Sort by Prediction", value: "prediction" },
          { label: "Sort by Assignments", value: "assignments" },
        ]}
        value={controls.sortBy}
        onChange={controls.setSortBy}
      />
    </div>
  );
}

function CustomSelect({ icon: Icon, options, value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  const selected = options.find(option => option.value === value) || options[0];

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`custom-select ${isOpen ? "open" : ""}`} ref={selectRef}>
      <button className="custom-select-trigger" onClick={() => setIsOpen(open => !open)} type="button">
        <Icon size={16} />
        <span>{selected.label}</span>
        <span className="custom-select-arrow" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="custom-select-menu">
          {options.map(option => (
            <button
              className={option.value === value ? "selected" : ""}
              key={option.value || option.label}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentForm({ student, onClose, onSave }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    const method = student ? "PUT" : "POST";
    const url = student ? `${API_BASE}/students/${student.id}` : `${API_BASE}/students`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    onSave();
  };

  return (
    <div className="modal-backdrop">
      <div className="panel admin-modal">
        <div className="modal-title-row">
          <h3>{student ? "Edit Student" : "Add Student"}</h3>
          <button onClick={onClose} aria-label="Close form"><X size={20} /></button>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>Full Name<input name="name" defaultValue={student?.name} placeholder="Full Name" required /></label>
          <label>Roll Number<input name="roll_no" defaultValue={student?.roll_no} placeholder="Roll Number" required /></label>
          <label>Class<input name="current_class" defaultValue={student?.current_class} placeholder="Class (e.g. 10)" required /></label>
          <label>Division<input name="division" defaultValue={student?.division} placeholder="Division (e.g. A)" required /></label>
          <label>Parent Name<input name="parent_name" defaultValue={student?.parent_name} placeholder="Parent Name" /></label>
          <label>Contact<input name="contact" defaultValue={student?.contact} placeholder="Contact Number" /></label>
          <label>Email<input name="email" defaultValue={student?.email} placeholder="Email" type="email" required /></label>
          <button className="primary-action full-width" type="submit">Save Student</button>
        </form>
      </div>
    </div>
  );
}

function useStudentControls(students, defaultSort) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [sortBy, setSortBy] = useState(defaultSort);

  const classes = useMemo(() => unique(students.map(s => s.current_class).filter(Boolean)), [students]);
  const divisions = useMemo(() => unique(students.map(s => s.division).filter(Boolean)), [students]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students
      .filter(s => !query || [s.name, s.roll_no, `S${s.id}`, String(s.id)].some(value => String(value || "").toLowerCase().includes(query)))
      .filter(s => !classFilter || s.current_class === classFilter)
      .filter(s => !divisionFilter || s.division === divisionFilter)
      .filter(s => !riskFilter || s.riskLevel === riskFilter)
      .sort((a, b) => getSortValue(b, sortBy) - getSortValue(a, sortBy));
  }, [students, search, classFilter, divisionFilter, riskFilter, sortBy]);

  return {
    search,
    setSearch,
    classFilter,
    setClassFilter,
    divisionFilter,
    setDivisionFilter,
    riskFilter,
    setRiskFilter,
    sortBy,
    setSortBy,
    classes,
    divisions,
    rows,
  };
}

function getDashboardStats(students) {
  const totalStudents = students.length;
  const avgAttendance = totalStudents ? Math.round(students.reduce((sum, s) => sum + s.attendancePercentage, 0) / totalStudents) : 0;
  const assignmentsDone = students.reduce((sum, s) => sum + getAssignmentCompleted(s), 0);
  const atRisk = students.filter(s => s.riskLevel !== "Low").length;
  return { totalStudents, avgAttendance, assignmentsDone, atRisk };
}

function getClassAttendanceStats(students) {
  const groups = students.reduce((map, student) => {
    const key = student.current_class || "Unassigned";
    map[key] = map[key] || [];
    map[key].push(student.attendancePercentage);
    return map;
  }, {});
  return Object.entries(groups).map(([className, values]) => ({
    className,
    attendance: values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0,
  }));
}

function getSortValue(student, sortBy) {
  if (sortBy === "attendance") return student.attendancePercentage || 0;
  if (sortBy === "prediction") return student.predictedScore || 0;
  if (sortBy === "assignments") return getAssignmentCompletion(student);
  return student.prediction?.previousAverage || 0;
}

function getAssignmentTotal(student) {
  return student.assignments.reduce((sum, item) => sum + item.assigned, 0);
}

function getAssignmentCompleted(student) {
  return student.assignments.reduce((sum, item) => sum + item.completed, 0);
}

function getAssignmentCompletion(student) {
  const total = getAssignmentTotal(student);
  return total ? Math.round((getAssignmentCompleted(student) / total) * 100) : 0;
}

function unique(values) {
  return [...new Set(values)].sort();
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, letter => letter.toUpperCase());
}

function RiskBadge({ level }) {
  return <span className={`risk-badge ${String(level).toLowerCase()}`}>{level}</span>;
}

function ProgressBar({ value, label }) {
  return (
    <div className="progress-wrap">
      <div className="progress-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
      {label && <small>{label}</small>}
    </div>
  );
}

function MiniCalendar({ attendance, large = false }) {
  return (
    <div className={`mini-calendar ${large ? "large" : ""}`}>
      {attendance.map(day => <span className={day.status} key={day.date}>{Number(day.date.slice(-2))}</span>)}
    </div>
  );
}

function MetricStack({ items }) {
  return (
    <div className="metric-stack">
      {items.map(([label, value]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function InfoPanel({ title, icon: Icon, rows }) {
  return (
    <div className="panel">
      <div className="panel-title"><Icon size={20} /><h2>{title}</h2></div>
      <MetricStack items={rows} />
    </div>
  );
}

function LoadingBlock() {
  return <div className="panel loading-panel">Loading dashboard data...</div>;
}

function EmptyRow({ columns, message = "No matching records found." }) {
  return <tr><td className="empty-table" colSpan={columns}>{message}</td></tr>;
}
