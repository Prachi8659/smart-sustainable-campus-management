import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ReportIssuePage from './pages/student/ReportIssuePage';
import MyComplaintsPage from './pages/student/MyComplaintsPage';
import ComplaintDetailPage from './pages/student/ComplaintDetailPage';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import AssignedTasksPage from './pages/staff/AssignedTasksPage';
import TaskDetailPage from './pages/staff/TaskDetailPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ComplaintManagementPage from './pages/admin/ComplaintManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import UserManagementPage from './pages/admin/UserManagementPage';

// Sustainability Pages
import SustainabilityDashboard from './pages/sustainability/SustainabilityDashboard';
import ResourceRecordsPage from './pages/sustainability/ResourceRecordsPage';
import CampaignsPage from './pages/sustainability/CampaignsPage';

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-campus-bg text-navy-primary font-semibold text-sm">
        Verifying authorization...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If authenticated but visiting another portal, route gracefully to their portal
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    if (user.role === 'sustainability_officer') return <Navigate to="/sustainability" replace />;
    return <Navigate to="/student" replace />;
  }

  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#0B172A',
              color: '#FFFFFF',
              fontSize: '12px',
              borderRadius: '12px',
              border: '1px solid #203D5B',
              boxShadow: '0 4px 12px rgba(11, 23, 42, 0.15)',
            },
            success: {
              iconTheme: {
                primary: '#75E0C0',
                secondary: '#0B172A',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Portal */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['student', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StudentDashboard />} />
            <Route path="report" element={<ReportIssuePage />} />
            <Route path="complaints" element={<MyComplaintsPage />} />
            <Route path="complaints/:id" element={<ComplaintDetailPage />} />
          </Route>

          {/* Maintenance Staff Portal */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={['staff', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="tasks" element={<AssignedTasksPage />} />
            <Route path="tasks/:id" element={<TaskDetailPage />} />
          </Route>

          {/* Administrator Portal */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="complaints" element={<ComplaintManagementPage />} />
            <Route path="departments" element={<DepartmentManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
          </Route>

          {/* Sustainability Portal (Accessible by All Authenticated Roles) */}
          <Route
            path="/sustainability"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SustainabilityDashboard />} />
            <Route path="records" element={<ResourceRecordsPage />} />
            <Route path="campaigns" element={<CampaignsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  );
}
