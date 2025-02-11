import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { CallPanel } from './pages/CallPanel';
import { PatientsPage } from './pages/patients/PatientsPage';
import { ProfessionalsPage } from './pages/professionals/ProfessionalPage';
import { MedicalConsultation } from './pages/MedicalConsultation';
import { Layout } from './components/Layout';
import { getCurrentUser, isDoctor } from './utils';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token || !getCurrentUser()) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

const DoctorRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isDoctor()) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/*"
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/professionals/*"
          element={
            <ProtectedRoute>
              <ProfessionalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/medical-consultation"
          element={
            <ProtectedRoute>
              <DoctorRoute>
                <MedicalConsultation />
              </DoctorRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <CallPanel />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;