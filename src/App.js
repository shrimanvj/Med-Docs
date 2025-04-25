import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DoctorLoginPage from './components/DoctorLoginPage';
import DoctorRegisterPage from './components/DoctorRegisterPage';
import PatientLoginPage from './components/PatientLoginPage';
import Signup from './components/Signup';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/patient-login" element={<PatientLoginPage />} />
          <Route path="/doctor-login" element={<DoctorLoginPage />} />
          <Route path="/doctor-register" element={<DoctorRegisterPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/doctor-dashboard" element={<Dashboard isDoctor={true} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
