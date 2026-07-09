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
  Plus
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
    <div className="app-shell">
      <nav className="topbar" style={{ backgroundColor: '#1e293b', color: 'white' }}>
        <button className="menu-button" style={{color: 'white'}} onClick={() => setIsMenuOpen((value) => !value)}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
        <div className="brand" style={{color: 'white'}}>
          <span className="brand-mark"><TrendingUp size={22} color="white" /></span>
          <div>
            <strong>Admin Portal</strong>
            <small style={{color: '#cbd5e1'}}>{currentUser?.name}</small>
          </div>
        </div>
        <div className="auth-links">
          <button onClick={handleLogout} type="button" style={{color: 'white'}}>
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </nav>

      <div className="layout">
        <aside className={`sidebar ${isMenuOpen ? "open" : ""}`} style={{backgroundColor: '#f8fafc'}}>
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
    <div>
      <section className="hero-panel" style={{backgroundColor: '#0f172a'}}>
        <div>
          <p style={{color: '#94a3b8'}}>Overview</p>
          <h1 style={{color: 'white'}}>Admin Dashboard</h1>
        </div>
      </section>
      
      <section className="panel-grid" style={{marginTop: '1rem'}}>
        <div className="panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
           <Users size={32} color="#3b82f6" />
           <h3 style={{margin: '0.5rem 0 0 0'}}>{totalStudents}</h3>
           <p style={{color: '#64748b'}}>Total Students</p>
        </div>
        <div className="panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
           <CalendarDays size={32} color="#22c55e" />
           <h3 style={{margin: '0.5rem 0 0 0'}}>{avgAttendance}%</h3>
           <p style={{color: '#64748b'}}>Avg Attendance</p>
        </div>
        <div className="panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
           <ClipboardList size={32} color="#f59e0b" />
           <h3 style={{margin: '0.5rem 0 0 0'}}>{totalCompleted}</h3>
           <p style={{color: '#64748b'}}>Assignments Done</p>
        </div>
        <div className="panel" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
           <AlertTriangle size={32} color="#ef4444" />
           <h3 style={{margin: '0.5rem 0 0 0'}}>{atRisk}</h3>
           <p style={{color: '#64748b'}}>Students At Risk</p>
        </div>
      </section>

      <section className="panel-grid" style={{marginTop: '1rem'}}>
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
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
        <h2>Manage Students</h2>
        <div>
          <button onClick={handleExportCSV} style={{marginRight: '0.5rem', padding: '0.5rem 1rem', background: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>Export CSV</button>
          <button onClick={() => setShowAddForm(true)} style={{padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}>
            <Plus size={16} style={{verticalAlign: 'middle', marginRight: '4px'}} /> Add Student
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

      <div className="panel" style={{overflowX: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
          <thead>
            <tr style={{borderBottom: '1px solid #e2e8f0'}}>
              <th style={{padding: '1rem'}}>Roll No</th>
              <th style={{padding: '1rem'}}>Name</th>
              <th style={{padding: '1rem'}}>Class</th>
              <th style={{padding: '1rem'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                <td style={{padding: '1rem'}}>{s.roll_no}</td>
                <td style={{padding: '1rem'}}>{s.name}</td>
                <td style={{padding: '1rem'}}>{s.current_class} - {s.division}</td>
                <td style={{padding: '1rem'}}>
                  <button onClick={() => setEditingStudent(s)} style={{background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem'}}><Edit size={18}/></button>
                  <button onClick={() => handleDelete(s.id)} style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}><Trash2 size={18}/></button>
                </td>
              </tr>
            ))}
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
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="panel" style={{width: '400px', maxWidth: '90%'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
          <h3>{student ? 'Edit Student' : 'Add Student'}</h3>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X size={20}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <input name="name" defaultValue={student?.name} placeholder="Full Name" required style={{padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
          <input name="roll_no" defaultValue={student?.roll_no} placeholder="Roll Number" required style={{padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
          <input name="current_class" defaultValue={student?.current_class} placeholder="Class (e.g. 10)" required style={{padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
          <input name="division" defaultValue={student?.division} placeholder="Division (e.g. A)" required style={{padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
          <input name="email" defaultValue={student?.email} placeholder="Email" type="email" required style={{padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px'}} />
          <button type="submit" style={{padding: '0.75rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'}}>
            Save Student
          </button>
        </form>
      </div>
    </div>
  );
}
