import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Menu, X, ArrowRight, Leaf, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role) => {
    const newUser = await switchDemoRole(role);
    const targetRole = newUser?.role || role;
    if (targetRole === 'student') navigate('/student');
    else if (targetRole === 'staff') navigate('/staff');
    else if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'sustainability_officer') navigate('/sustainability');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-campus-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-navy-primary flex items-center justify-center text-mint-DEFAULT shadow-card group-hover:scale-105 transition-smooth">
                <Leaf className="w-5 h-5 fill-mint-DEFAULT" />
              </div>
              <div>
                <span className="text-base font-extrabold text-navy-primary tracking-tight block leading-tight">
                  SmartCampus
                </span>
                <span className="text-[11px] font-semibold text-campus-muted uppercase tracking-wider block">
                  Eco &amp; Operations OS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-campus-text hover:text-navy-primary transition-smooth">
              Home
            </Link>
            <a href="#features" className="text-sm font-medium text-campus-text hover:text-navy-primary transition-smooth">
              Features
            </a>
            <a href="#workflow" className="text-sm font-medium text-campus-text hover:text-navy-primary transition-smooth">
              How It Works
            </a>
            <a href="#sustainability" className="text-sm font-medium text-campus-text hover:text-navy-primary transition-smooth">
              Sustainability
            </a>

            {/* Quick Demo Selector */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-primary bg-mint-soft hover:bg-mint-soft/80 rounded-lg transition-smooth border border-mint-DEFAULT/40">
                <Sparkles className="w-3.5 h-3.5 text-[#1b7a52]" />
                Demo Logins
              </button>
              <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-campus-border p-2 hidden group-hover:block transition-all z-50">
                <p className="text-[10px] uppercase font-bold text-campus-muted px-2 py-1">Instant Role Preview</p>
                <button
                  onClick={() => handleQuickDemo('student')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-campus-text hover:bg-slate-50 hover:text-navy-primary rounded-lg"
                >
                  Student (Aarav)
                </button>
                <button
                  onClick={() => handleQuickDemo('staff')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-campus-text hover:bg-slate-50 hover:text-navy-primary rounded-lg"
                >
                  Maintenance Staff (Vikram)
                </button>
                <button
                  onClick={() => handleQuickDemo('admin')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-campus-text hover:bg-slate-50 hover:text-navy-primary rounded-lg"
                >
                  Campus Admin (Dr. Rao)
                </button>
                <button
                  onClick={() => handleQuickDemo('sustainability_officer')}
                  className="w-full text-left px-3 py-1.5 text-xs font-medium text-campus-text hover:bg-slate-50 hover:text-navy-primary rounded-lg"
                >
                  Sustainability Officer (Priya)
                </button>
              </div>
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'staff'
                      ? '/staff'
                      : user.role === 'sustainability_officer'
                      ? '/sustainability'
                      : '/student'
                  }
                  className="px-4 py-2 text-sm font-semibold text-white bg-navy-primary hover:bg-navy-secondary rounded-xl transition-smooth shadow-sm flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="text-xs font-medium text-rose-600 hover:text-rose-700 underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-navy-primary hover:text-navy-secondary px-3 py-2 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-navy-primary hover:bg-navy-secondary rounded-xl transition-smooth shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-campus-muted hover:text-navy-primary focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-campus-border bg-white px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-campus-text rounded-md hover:bg-slate-50"
          >
            Home
          </Link>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-campus-text rounded-md hover:bg-slate-50"
          >
            Features
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-campus-text rounded-md hover:bg-slate-50"
          >
            How It Works
          </a>
          <a
            href="#sustainability"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-sm font-medium text-campus-text rounded-md hover:bg-slate-50"
          >
            Sustainability
          </a>

          <div className="pt-2 border-t border-campus-border">
            <p className="text-xs font-semibold text-campus-muted mb-2 px-3">Quick Demo Logins:</p>
            <div className="grid grid-cols-2 gap-2 px-3">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickDemo('student');
                }}
                className="text-xs bg-slate-100 hover:bg-mint-soft p-2 rounded text-left font-medium text-navy-primary"
              >
                Student
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickDemo('staff');
                }}
                className="text-xs bg-slate-100 hover:bg-mint-soft p-2 rounded text-left font-medium text-navy-primary"
              >
                Staff
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickDemo('admin');
                }}
                className="text-xs bg-slate-100 hover:bg-mint-soft p-2 rounded text-left font-medium text-navy-primary"
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleQuickDemo('sustainability_officer');
                }}
                className="text-xs bg-slate-100 hover:bg-mint-soft p-2 rounded text-left font-medium text-navy-primary"
              >
                Sustainability
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-campus-border flex flex-col gap-2">
            {user ? (
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'staff'
                    ? '/staff'
                    : user.role === 'sustainability_officer'
                    ? '/sustainability'
                    : '/student'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-navy-primary text-white rounded-xl font-semibold text-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-navy-primary border border-navy-primary rounded-xl font-semibold text-sm"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 bg-navy-primary text-white rounded-xl font-semibold text-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
