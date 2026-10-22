import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Database, UserCheck, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DemoBanner() {
  const { user, isBackendConnected, demoMode, switchDemoRole, checkBackendHealth } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role) => {
    const newUser = await switchDemoRole(role);
    const targetRole = newUser?.role || role;
    if (targetRole === 'student') navigate('/student');
    else if (targetRole === 'staff') navigate('/staff');
    else if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'sustainability_officer') navigate('/sustainability');
  };

  return (
    <aside aria-label="Demo portal controls" className="bg-navy-deep text-white px-4 py-2 border-b border-navy-secondary text-xs flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-3">
        {/* Backend status indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isBackendConnected
                ? 'bg-mint-DEFAULT ring-4 ring-mint-DEFAULT/20'
                : 'bg-amber-400 ring-4 ring-amber-400/20'
            }`}
          />
          <span className="font-medium text-slate-200 flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-mint-DEFAULT" />
            {isBackendConnected ? (
              <span className="text-emerald-300">Backend API &amp; MongoDB Active</span>
            ) : (
              <span className="text-amber-300">Standalone Demo Mode</span>
            )}
          </span>
          <button
            onClick={checkBackendHealth}
            title="Check backend health"
            className="text-slate-400 hover:text-white p-0.5 rounded transition-smooth"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        <span className="hidden md:inline text-slate-500">|</span>

        {/* Current Active User & Role */}
        {user && (
          <div className="hidden sm:flex items-center gap-1.5 text-slate-300">
            <span>Logged in as:</span>
            <span className="font-semibold text-white px-2 py-0.5 rounded bg-navy-secondary border border-slate-700">
              {user.name} ({user.role})
            </span>
          </div>
        )}
      </div>

      {/* Quick Role Switcher for Evaluators */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-mint-DEFAULT" /> Switch Role:
        </span>

        <button
          onClick={() => handleRoleSwitch('student')}
          className={`px-2.5 py-1 rounded font-medium transition-smooth ${
            user?.role === 'student'
              ? 'bg-mint-DEFAULT text-navy-deep font-bold shadow-xs'
              : 'bg-navy-secondary text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Student
        </button>

        <button
          onClick={() => handleRoleSwitch('staff')}
          className={`px-2.5 py-1 rounded font-medium transition-smooth ${
            user?.role === 'staff'
              ? 'bg-mint-DEFAULT text-navy-deep font-bold shadow-xs'
              : 'bg-navy-secondary text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Staff
        </button>

        <button
          onClick={() => handleRoleSwitch('admin')}
          className={`px-2.5 py-1 rounded font-medium transition-smooth ${
            user?.role === 'admin'
              ? 'bg-mint-DEFAULT text-navy-deep font-bold shadow-xs'
              : 'bg-navy-secondary text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Admin
        </button>

        <button
          onClick={() => handleRoleSwitch('sustainability_officer')}
          className={`px-2.5 py-1 rounded font-medium transition-smooth ${
            user?.role === 'sustainability_officer'
              ? 'bg-mint-DEFAULT text-navy-deep font-bold shadow-xs'
              : 'bg-navy-secondary text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          Sustainability
        </button>
      </div>
    </aside>
  );
}
