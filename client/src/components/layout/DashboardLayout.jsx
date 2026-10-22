import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import DemoBanner from '../common/DemoBanner';
import NotificationDropdown from '../common/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { Menu, Shield, User, Building, LogOut } from 'lucide-react';

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper to format title from URL path
  const getPageTitle = () => {
    const p = location.pathname;
    if (p.includes('/student/report')) return 'Report a Campus Issue';
    if (p.includes('/student/complaints')) return 'My Complaints Tracker';
    if (p.includes('/staff/tasks')) return 'Assigned Maintenance Tasks';
    if (p.includes('/admin/complaints')) return 'Complaint Management & Assignment';
    if (p.includes('/admin/departments')) return 'Department & Service Catalog';
    if (p.includes('/admin/users')) return 'User Role & Permissions';
    if (p.includes('/sustainability/records')) return 'Campus Resource Log Books';
    if (p.includes('/sustainability/campaigns')) return 'Green Campus Initiatives & Campaigns';
    if (p.includes('/sustainability')) return 'Campus Sustainability Intelligence';
    if (p.includes('/student')) return 'Student Portal Dashboard';
    if (p.includes('/staff')) return 'Maintenance Operations Hub';
    if (p.includes('/admin')) return 'Campus Administrative Operations';
    return 'Campus Management Dashboard';
  };

  return (
    <div className="min-h-screen flex flex-col bg-campus-bg">
      {/* Top Demo Banner for seamless grading review */}
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar */}
          <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-campus-border px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 rounded-lg text-campus-muted hover:text-navy-primary hover:bg-slate-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-navy-primary tracking-tight">
                  {getPageTitle()}
                </h1>
                <p className="text-[11px] text-campus-muted hidden sm:block">
                  Smart &amp; Sustainable Campus Platform &bull; {user?.campus || 'Main Campus'}
                </p>
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              <div className="h-6 w-px bg-campus-border hidden sm:block" />

              {/* User badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-campus-border text-xs">
                <div className="w-2 h-2 rounded-full bg-mint-DEFAULT" />
                <span className="font-semibold text-navy-primary">{user?.name}</span>
                <span className="text-campus-muted uppercase text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
