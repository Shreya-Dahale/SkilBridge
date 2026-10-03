import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { CandidateLoginPage } from './pages/CandidateLoginPage';
import { CandidateRegisterPage } from './pages/CandidateRegisterPage';
import { EmployerLoginPage } from './pages/EmployerLoginPage';
import { EmployerRegisterPage } from './pages/EmployerRegisterPage';
import { CandidateDashboard } from './pages/CandidateDashboard';
import { EmployerDashboard } from './pages/EmployerDashboard';
import { PublicEvidenceProfile } from './pages/PublicEvidenceProfile';
import { JobsPage } from './pages/JobsPage';
import { TakeAssessmentPage } from './pages/TakeAssessmentPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRole?: 'CANDIDATE' | 'EMPLOYER';
}> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={allowedRole === 'EMPLOYER' ? '/auth/employer/login' : '/auth/candidate/login'} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'CANDIDATE' ? '/candidate/dashboard' : '/employer/dashboard'} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/assessments" element={<TakeAssessmentPage />} />
          <Route path="/evidence/:id" element={<PublicEvidenceProfile />} />

          {/* Candidate Auth */}
          <Route path="/auth/candidate/login" element={<CandidateLoginPage />} />
          <Route path="/auth/candidate/register" element={<CandidateRegisterPage />} />

          {/* Employer Auth */}
          <Route path="/auth/employer/login" element={<EmployerLoginPage />} />
          <Route path="/auth/employer/register" element={<EmployerRegisterPage />} />

          {/* Candidate Dashboard (Protected) */}
          <Route
            path="/candidate/dashboard"
            element={
              <ProtectedRoute allowedRole="CANDIDATE">
                <CandidateDashboard />
              </ProtectedRoute>
            }
          />

          {/* Employer Dashboard (Protected) */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRole="EMPLOYER">
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
