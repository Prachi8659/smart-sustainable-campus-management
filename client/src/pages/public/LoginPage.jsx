import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Leaf, Sparkles, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const result = await login(email, password);
      toast.success(`Welcome back, ${result.user.name}!`);
      redirectByRole(result.user.role);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin') navigate('/admin');
    else if (role === 'staff') navigate('/staff');
    else if (role === 'sustainability_officer') navigate('/sustainability');
    else navigate('/student');
  };

  const handleQuickFill = (roleEmail, rolePass, roleName) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage('');
    toast(`Pre-filled ${roleName} credentials! Click 'Sign In' or demo switch.`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-[#F5F8FC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 group mb-4">
          <div className="w-12 h-12 rounded-2xl bg-navy-primary flex items-center justify-center text-mint-DEFAULT shadow-card">
            <Leaf className="w-6 h-6 fill-mint-DEFAULT" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-primary tracking-tight">
          Welcome to SmartCampus
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-campus-muted">
          Sign in to access your campus operations &amp; sustainability portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-campus-border shadow-card">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., student@campus.edu"
                  className="block w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary transition-smooth"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary transition-smooth"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-campus-muted hover:text-navy-primary"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-navy-primary rounded border-campus-border focus:ring-navy-primary"
                />
                <span className="text-campus-muted">Remember this device</span>
              </label>
              <span className="text-navy-primary hover:underline cursor-pointer">Forgot password?</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs transition-smooth shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fills for WT Viva */}
          <div className="mt-6 pt-5 border-t border-campus-border">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-campus-muted uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-mint-DEFAULT" /> Quick Demo Accounts
              </span>
              <span className="text-[10px] text-slate-400">Click to fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('student@campus.edu', 'student123', 'Student')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-mint-soft text-left border border-slate-200/80 transition-smooth"
              >
                <span className="font-bold text-navy-primary block">Student</span>
                <span className="text-[10px] text-campus-muted">student@campus.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('staff.elec@campus.edu', 'staff123', 'Staff')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-mint-soft text-left border border-slate-200/80 transition-smooth"
              >
                <span className="font-bold text-navy-primary block">Staff (Elec)</span>
                <span className="text-[10px] text-campus-muted">staff.elec@campus.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@campus.edu', 'admin123', 'Admin')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-mint-soft text-left border border-slate-200/80 transition-smooth"
              >
                <span className="font-bold text-navy-primary block">Admin</span>
                <span className="text-[10px] text-campus-muted">admin@campus.edu</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('sustainability@campus.edu', 'sustain123', 'Officer')}
                className="p-2 rounded-lg bg-slate-50 hover:bg-mint-soft text-left border border-slate-200/80 transition-smooth"
              >
                <span className="font-bold text-navy-primary block">Sustainability</span>
                <span className="text-[10px] text-campus-muted">sustainability@campus.edu</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-campus-muted">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-navy-primary hover:text-navy-secondary underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
