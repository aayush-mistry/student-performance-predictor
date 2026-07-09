import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthScreen from "./pages/AuthScreen";
import StudentPortal from "./pages/StudentPortal";
import AdminPortal from "./pages/AdminPortal";
import "./styles.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            currentUser ? (
              <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} />
            ) : (
              <AuthScreen onLogin={handleLogin} />
            )
          } 
        />
        
        <Route 
          path="/student/*" 
          element={
            currentUser && currentUser.role === 'student' ? (
              <StudentPortal currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
        
        <Route 
          path="/admin/*" 
          element={
            currentUser && currentUser.role === 'admin' ? (
              <AdminPortal currentUser={currentUser} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

createRoot(document.getElementById("root")).render(<App />);
