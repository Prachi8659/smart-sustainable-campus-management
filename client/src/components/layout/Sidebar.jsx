import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  CheckCircle2,
  Users,
  Building2,
  Leaf,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Flame,
  Droplets,
  Recycle,
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user, logout } = useAuth();

  const getNavLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
          { name: 'Report Issue', path: '/student/report', icon: PlusCircle },
          { name: 'My Complaints', path: '/student/complaints', icon: FileText },
          { name: 'Sustainability', path: '/sustainability', icon: Leaf },
          { name: 'Eco Campaigns', path: '/sustainability/campaigns', icon: Calendar },
        ];
      case 'staff':
        return [
          { name: 'Staff Dashboard', path: '/staff', icon: LayoutDashboard },
          { name: 'Assigned Tasks', path: '/staff/tasks', icon: CheckCircle2 },
          { name: 'Sustainability', path: '/sustainability', icon: Leaf },
        ];
      case 'sustainability_officer':
        return [
          { name: 'Eco Dashboard', path: '/sustainability', icon: Leaf },
          { name: 'Resource Records', path: '/sustainability/records', icon: BarChart3 },
          { name: 'Eco Campaigns', path: '/sustainability/campaigns', icon: Calendar },
          { name: 'Complaints Scrutiny', path: '/admin/complaints', icon: FileText },
        ];
      case 'admin':
      default:
        return [
          { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
          { name: 'Complaint Center', path: '/admin/complaints', icon: FileText },
          { name: 'Departments', path: '/admin/departments', icon: Building2 },
          { name: 'User Management', path: '/admin/users', icon: Users },
          { name: 'Sustainability Portal', path: '/sustainability', icon: Leaf },
          { name: 'Resource Records', path: '/sustainability/records', icon: BarChart3 },
          { name: 'Eco Campaigns', path: '/sustainability/campaigns', icon: Calendar },
        ];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-deep/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-navy-deep text-white transition-all duration-300 border-r border-navy-secondary md:static ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'} w-64`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-secondary/80">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-navy-primary flex-shrink-0 flex items-center justify-center text-mint-DEFAULT border border-mint-DEFAULT/30 shadow-md">
              <Leaf className="w-5 h-5 fill-mint-DEFAULT" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-extrabold text-sm text-white tracking-tight block">SmartCampus</span>
                <span className="text-[10px] font-semibold text-mint-DEFAULT uppercase tracking-wider block">Eco OS</span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-secondary transition-smooth"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          <div className="px-3 pb-2">
            {!isCollapsed && (
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {user?.role?.replace('_', ' ') || 'Navigation'}
              </span>
            )}
          </div>

          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/student' || item.path === '/staff' || item.path === '/admin'}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-smooth ${
                  isActive
                    ? 'bg-navy-secondary text-mint-DEFAULT font-semibold shadow-xs border-l-4 border-mint-DEFAULT'
                    : 'text-slate-300 hover:bg-navy-secondary/60 hover:text-white'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={`w-4 h-4 flex-shrink-0 ${
                  ({ isActive }) => (isActive ? 'text-mint-DEFAULT' : 'text-slate-400')
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          ))}
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-navy-secondary/80 bg-navy-dark/50">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-secondary/50 border border-slate-700/50">
            <div className="w-9 h-9 rounded-xl bg-navy-primary text-mint-DEFAULT font-bold flex items-center justify-center flex-shrink-0 border border-mint-DEFAULT/20">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Guest User'}</p>
                <p className="text-[10px] text-mint-DEFAULT capitalize truncate font-medium">
                  {user?.role ? user.role.replace('_', ' ') : 'Visitor'}
                </p>
              </div>
            )}
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-smooth"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
