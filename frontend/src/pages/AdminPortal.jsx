import React, { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  BookOpen,
  ClipboardList,
  Edit,
  Trash2,
  Plus,
  Download,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:5000/api";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: TrendingUp },
  { id: "students", label: "Students", icon: Users },
];

export default function AdminPortal({ currentUser, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_BASE}/students`);
      if (res.ok) {
        setStudents(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const page = {
    dashboard: <AdminDashboard students={students} />,
    students: <StudentManagement students={students} refresh={fetchStudents} />,
  }[activeTab];

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
          {page}
        </main>
      </div>
    </div>
  );
}

function AdminDashboard({ students }) {
  const totalStudents = students.length;
  
  // Quick metrics
  let totalAttendanceDays = 0;
  let totalPresent = 0;
  let totalCompleted = 0;
  let atRisk = 0;
  
  const subjects = ["maths", "science", "ss", "english", "gujarati", "hindi"];
  let subjectScores = { maths: 0, science: 0, ss: 0, english: 0, gujarati: 0, hindi: 0 };
  let examCount = 0;

  students.forEach(s => {
    // Attendance
    s.attendance.forEach(a => {
      if (a.status !== 'holiday') {
        totalAttendanceDays++;
        if (a.status === 'present') totalPresent++;
      }
    });

    // Assignments
    s.assignments.forEach(a => {
      totalCompleted += a.completed;
    });

    // Subject Performance
    s.previousExams.forEach(e => {
      examCount++;
      subjects.forEach(sub => {
        subjectScores[sub] += (e[sub] || 0);
      });
    });
    
    // Simple at risk check (e.g., if predicted < 60)
    // Real app would fetch pred per student here, or we calculate a rough estimate based on latest exam
    if (s.previousExams.length > 0) {
      const latest = s.previousExams[s.previousExams.length - 1];
      const avg = subjects.reduce((sum, sub) => sum + (latest[sub] || 0), 0) / subjects.length;
      if (avg < 60) atRisk++;
    }
  });

  const avgAttendance = totalAttendanceDays ? Math.round((totalPresent / totalAttendanceDays) * 100) : 0;
  
  const subjectChartData = subjects.map(sub => ({
    name: sub.toUpperCase(),
    average: examCount ? Math.round(subjectScores[sub] / examCount) : 0
  }));

  const pieData = [
    { name: 'Present', value: totalPresent, color: '#22c55e' },
    { name: 'Absent', value: totalAttendanceDays - totalPresent, color: '#ef4444' }
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
          <strong>{totalStudents}</strong>
          <small>Students</small>
        </div>
      </section>
      
      <section className="admin-metrics-grid">
        <div className="admin-metric-card blue">
          <span><Users size={22} /></span>
          <div>
            <strong>{totalStudents}</strong>
            <p>Total Students</p>
          </div>
        </div>
        <div className="admin-metric-card green">
          <span><CalendarDays size={22} /></span>
          <div>
            <strong>{avgAttendance}%</strong>
            <p>Avg Attendance</p>
          </div>
        </div>
        <div className="admin-metric-card amber">
          <span><ClipboardList size={22} /></span>
          <div>
            <strong>{totalCompleted}</strong>
            <p>Assignments Done</p>
          </div>
        </div>
        <div className="admin-metric-card red">
          <span><AlertTriangle size={22} /></span>
          <div>
            <strong>{atRisk}</strong>
            <p>Students At Risk</p>
          </div>
        </div>
      </section>

      <section className="panel-grid admin-chart-grid">
        <div className="panel large">
          <div className="panel-title">
            <BookOpen size={20} />
            <h2>Subject Performance</h2>
          </div>
          <div className="chart">
            <ResponsiveContainer>
              <BarChart data={subjectChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="panel">
          <div className="panel-title">
            <CalendarDays size={20} />
            <h2>Overall Attendance</h2>
          </div>
          <div className="chart pie">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

function StudentManagement({ students, refresh }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this student?")) {
      await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' });
      refresh();
    }
  };

  const handleExportCSV = () => {
    let csv = "ID,Name,Roll No,Class,Division,Email\n";
    students.forEach(s => {
      csv += `${s.id},${s.name},${s.roll_no},${s.current_class},${s.division},${s.email}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "students.csv";
    a.click();
  };

  return (
    <div className="admin-page">
      <div className="admin-section-header">
        <div>
          <p>Records</p>
          <h1>Manage Students</h1>
        </div>
        <div className="admin-toolbar">
          <button className="secondary-action" onClick={handleExportCSV}>
            <Download size={16} />
            Export CSV
          </button>
          <button className="primary-action" onClick={() => setShowAddForm(true)}>
            <Plus size={16} />
            Add Student
          </button>
        </div>
      </div>

      {(showAddForm || editingStudent) && (
        <StudentForm 
          student={editingStudent} 
          onClose={() => {setShowAddForm(false); setEditingStudent(null);}} 
          onSave={() => {setShowAddForm(false); setEditingStudent(null); refresh();}} 
        />
      )}

      <div className="panel admin-table-panel">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Class</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id}>
                <td>{s.roll_no || "-"}</td>
                <td>
                  <strong>{s.name}</strong>
                  <span>{s.email || "No email"}</span>
                </td>
                <td>{s.current_class || "-"}{s.division ? ` - ${s.division}` : ""}</td>
                <td>
                  <div className="table-actions">
                    <button aria-label={`Edit ${s.name}`} onClick={() => setEditingStudent(s)}><Edit size={18}/></button>
                    <button aria-label={`Delete ${s.name}`} className="danger" onClick={() => handleDelete(s.id)}><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {!students.length && (
              <tr>
                <td className="empty-table" colSpan="4">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StudentForm({ student, onClose, onSave }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd.entries());
    
    const method = student ? 'PUT' : 'POST';
    const url = student ? `${API_BASE}/students/${student.id}` : `${API_BASE}/students`;
    
    await fetch(url, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    onSave();
  };

  return (
    <div className="modal-backdrop">
      <div className="panel admin-modal">
        <div className="modal-title-row">
          <h3>{student ? 'Edit Student' : 'Add Student'}</h3>
          <button onClick={onClose} aria-label="Close form"><X size={20}/></button>
        </div>
        <form className="admin-form" onSubmit={handleSubmit}>
          <label>
            Full Name
            <input name="name" defaultValue={student?.name} placeholder="Full Name" required />
          </label>
          <label>
            Roll Number
            <input name="roll_no" defaultValue={student?.roll_no} placeholder="Roll Number" required />
          </label>
          <label>
            Class
            <input name="current_class" defaultValue={student?.current_class} placeholder="Class (e.g. 10)" required />
          </label>
          <label>
            Division
            <input name="division" defaultValue={student?.division} placeholder="Division (e.g. A)" required />
          </label>
          <label>
            Email
            <input name="email" defaultValue={student?.email} placeholder="Email" type="email" required />
          </label>
          <button className="primary-action full-width" type="submit">
            Save Student
          </button>
        </form>
      </div>
    </div>
  );
}
