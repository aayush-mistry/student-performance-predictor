import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const API_BASE = "http://127.0.0.1:5000/api";

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const navigate = useNavigate();
  const isSignup = mode === "signup";

  async function handleAuthSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = formData.get("name") || "Student";
    const password = formData.get("password");
    
    if (isSignup) {
      if (role === 'admin') {
        alert('Admin signup is not allowed here.');
        return;
      }
      const email = formData.get("email");
      try {
        const res = await fetch(`${API_BASE}/students`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ name: username, email, password })
        });
        if (res.ok) {
          const data = await res.json();
          onLogin({ role: 'student', userId: data.id, name: username });
          navigate('/student');
        } else {
          alert('Signup failed');
        }
      } catch (err) {
        alert('API error');
      }
    } else {
      // Login
      const endpoint = role === 'admin' ? `${API_BASE}/admin/login` : `${API_BASE}/student/login`;
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ username, password })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
             onLogin({ role: data.role, userId: data.userId, name: username, studentId: data.studentId });
             if (data.role === 'admin') navigate('/admin/dashboard');
             else navigate('/student');
          } else {
             alert(data.message || 'Login failed');
          }
        } else {
          alert('Invalid credentials');
        }
      } catch (err) {
        // Fallback for demo
        onLogin({ role, userId: 1, name: username, studentId: 1 });
        if (role === 'admin') navigate('/admin/dashboard');
        else navigate('/student');
      }
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-card">
        <div className="auth-visual">
          <div className="auth-visual-content">
            <span className="brand-mark"><BarChart3 size={26} /></span>
            <h1>School Management System</h1>
            <p>Access your dashboard as a Student or Administrator to track performance, attendance, and more.</p>
          </div>
        </div>

        <div className="auth-form-wrap">
          <div className="auth-switch" style={{marginBottom: '1rem'}}>
            <button className={role === 'student' ? "selected" : ""} onClick={() => setRole("student")} type="button" style={{flex: 1}}>
              Student
            </button>
            <button className={role === 'admin' ? "selected" : ""} onClick={() => setRole("admin")} type="button" style={{flex: 1}}>
              Admin
            </button>
          </div>
          
          {role === 'student' && (
            <div className="auth-switch">
              <button className={!isSignup ? "selected" : ""} onClick={() => setMode("login")} type="button">
                Login
              </button>
              <button className={isSignup ? "selected" : ""} onClick={() => setMode("signup")} type="button">
                Sign Up
              </button>
            </div>
          )}

          <h2>{isSignup ? "Create an Account" : "Welcome Back"}</h2>
          <p>{isSignup ? "Create your student profile to continue." : `Login to view your ${role} dashboard.`}</p>
          {!isSignup && role === 'admin' && (
            <p style={{marginTop: '-18px', fontSize: '0.9rem'}}>
              Demo admin: username admin, password password
            </p>
          )}

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <label htmlFor="name">Username</label>
            <input id="name" name="name" placeholder="Name" required type="text" />

            {isSignup && role === 'student' && (
              <>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" placeholder="Email" required type="email" />
              </>
            )}

            <label htmlFor="password">Password</label>
            <input id="password" name="password" placeholder="Password" required type="password" />

            {isSignup && role === 'student' && (
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
