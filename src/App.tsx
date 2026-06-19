import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentExams } from './pages/StudentExams';
import { StudentBDQ } from './pages/StudentBDQ';
import { StudentAIConsultant } from './pages/StudentAIConsultant';
import { StudentRanking } from './pages/StudentRanking';
import { StudentSupport } from './pages/StudentSupport';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminStudents } from './pages/AdminStudents';
import { AdminContent } from './pages/AdminContent';
import { AdminAcademic } from './pages/AdminAcademic';
import { AdminQuestions } from './pages/AdminQuestions';
import { AdminAIKnowledge } from './pages/AdminAIKnowledge';
import { AdminUsers } from './pages/AdminUsers';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          {/* Student Protected Routes */}
          <Route 
            path="/student" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/exams" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentExams />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/bdq" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentBDQ />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/ai-consultant" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentAIConsultant />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/ranking" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentRanking />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/student/support" 
            element={
              <ProtectedRoute allowedRole="student">
                <Layout>
                  <StudentSupport />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/students" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminStudents />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/content" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminContent />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/academic" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminAcademic />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/questions" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminQuestions />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/ai-knowledge" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminAIKnowledge />
                </Layout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute allowedRole="admin">
                <Layout>
                  <AdminUsers />
                </Layout>
              </ProtectedRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
