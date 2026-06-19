import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: 'admin' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-light/35 border-t-brand-light rounded-full animate-spin"></div>
          <span className="text-xs text-brand-light font-semibold uppercase tracking-wider animate-pulse">
            Carregando Sessão...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // Redirect based on role if trying to access unauthorized area
    return user.role === 'admin' 
      ? <Navigate to="/admin" replace /> 
      : <Navigate to="/student" replace />;
  }

  return <>{children}</>;
};
