import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Building, Phone, ArrowRight, Leaf, ShieldAlert, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    campus: 'Main Academic Campus',
    role: 'student', // Admin is forbidden from self-registration
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password strength check
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { label: 'Empty', color: 'bg-slate-200', width: '0%' };
    if (pwd.length < 6) return { label: 'Too short (min 6 chars)', color: 'bg-rose-500', width: '25%' };
    const hasNum = /\d/.test(pwd);
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

    if (hasNum && hasLetter && hasSpecial && pwd.length >= 8) {
      return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
    }
    if ((hasNum && hasLetter) || pwd.length >= 8) {
      return { label: 'Fair', color: 'bg-amber-500', width: '65%' };
    }
    return { label: 'Weak', color: 'bg-orange-400', width: '40%' };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await register(formData);
      toast.success('Registration successful! Welcome to SmartCampus.');
      if (res.user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-10 sm:px-6 lg:px-8 bg-[#F5F8FC]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-navy-primary flex items-center justify-center text-mint-DEFAULT shadow-card">
            <Leaf className="w-6 h-6 fill-mint-DEFAULT" />
          </div>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-primary tracking-tight">
          Create Your Campus Account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-campus-muted">
          Join the smart maintenance and sustainability network
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-campus-border shadow-card">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Aarav Sharma"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Campus Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@campus.edu"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                />
              </div>
            </div>

            {/* Role (Protected: Only Student or Staff allowed) */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Primary Account Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
              >
                <option value="student">Student</option>
                <option value="staff">Maintenance Staff (Technician)</option>
              </select>
              <p className="text-[10px] text-campus-muted mt-1">
                * Note: Administrator and Sustainability Officer accounts are provisioned exclusively by central campus IT.
              </p>
            </div>

            {/* Campus / Wing */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Campus Location
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                >
                  <option value="Main Academic Campus">Main Academic Campus</option>
                  <option value="North Wing Campus">North Wing Campus</option>
                  <option value="Engineering & Tech Complex">Engineering &amp; Tech Complex</option>
                  <option value="Hostel & Residential Zone">Hostel &amp; Residential Zone</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Minimum 6 characters"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                />
              </div>

              {/* Password strength bar */}
              {formData.password && (
                <div className="mt-1.5">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-300`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <span className="text-[10px] text-campus-muted mt-0.5 block">
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-campus-muted">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-type password"
                  className="block w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs transition-smooth shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Register Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-campus-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-navy-primary hover:text-navy-secondary underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
