import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import {
  Leaf,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Droplets,
  Recycle,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  Building,
  Check,
} from 'lucide-react';

export default function LandingPage() {
  const { user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleDemoLaunch = async (role) => {
    const newUser = await switchDemoRole(role);
    const targetRole = newUser?.role || role;
    if (targetRole === 'student') navigate('/student');
    else if (targetRole === 'staff') navigate('/staff');
    else if (targetRole === 'admin') navigate('/admin');
    else if (targetRole === 'sustainability_officer') navigate('/sustainability');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FC]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white to-[#F5F8FC] border-b border-campus-border">
        {/* Subtle decorative background eco circles */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-mint-soft/50 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-mint-soft border border-mint-DEFAULT/40 text-navy-deep text-xs font-semibold mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#1b7a52]" />
            <span>Smart &amp; Sustainable Campus Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-deep tracking-tight max-w-4xl mx-auto leading-tight">
            A Smarter Campus. <br />
            <span className="text-navy-primary underline decoration-mint-DEFAULT decoration-4 underline-offset-8">
              A Greener Future.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-campus-muted max-w-2xl mx-auto leading-relaxed">
            Unifying student complaint resolution, facility maintenance dispatch, and campus-wide resource monitoring (energy, water, waste, and carbon footprint) into one transparent platform.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/student/report' : '/login'}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-navy-primary text-white font-semibold text-sm hover:bg-navy-secondary transition-smooth shadow-card flex items-center justify-center gap-2 group"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/sustainability"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-campus-border text-navy-primary font-semibold text-sm hover:bg-slate-50 transition-smooth shadow-xs flex items-center justify-center gap-2"
            >
              <Leaf className="w-4 h-4 text-[#22A06B]" />
              <span>Explore Sustainability</span>
            </Link>
          </div>

          {/* Demonstration Quick Role Selectors */}
          <div className="mt-12 p-4 max-w-3xl mx-auto bg-white rounded-2xl border border-campus-border shadow-card">
            <p className="text-xs font-bold text-campus-muted uppercase tracking-wider mb-3">
              College WT Presentation: Instant Live Demo Portals
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleDemoLaunch('student')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-mint-soft text-navy-primary border border-slate-200/80 transition-smooth text-left"
              >
                <div className="text-[11px] font-bold text-navy-primary flex items-center gap-1">
                  <span>Student Portal</span>
                  <ArrowRight className="w-3 h-3 text-mint-hover" />
                </div>
                <div className="text-[10px] text-campus-muted mt-0.5">Aarav Sharma</div>
              </button>

              <button
                onClick={() => handleDemoLaunch('staff')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-mint-soft text-navy-primary border border-slate-200/80 transition-smooth text-left"
              >
                <div className="text-[11px] font-bold text-navy-primary flex items-center gap-1">
                  <span>Staff Tasks</span>
                  <ArrowRight className="w-3 h-3 text-mint-hover" />
                </div>
                <div className="text-[10px] text-campus-muted mt-0.5">Vikram Singh (Elec)</div>
              </button>

              <button
                onClick={() => handleDemoLaunch('admin')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-mint-soft text-navy-primary border border-slate-200/80 transition-smooth text-left"
              >
                <div className="text-[11px] font-bold text-navy-primary flex items-center gap-1">
                  <span>Admin Dispatch</span>
                  <ArrowRight className="w-3 h-3 text-mint-hover" />
                </div>
                <div className="text-[10px] text-campus-muted mt-0.5">Dr. Sunita Rao</div>
              </button>

              <button
                onClick={() => handleDemoLaunch('sustainability_officer')}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-mint-soft text-navy-primary border border-slate-200/80 transition-smooth text-left"
              >
                <div className="text-[11px] font-bold text-navy-primary flex items-center gap-1">
                  <span>Eco Intelligence</span>
                  <ArrowRight className="w-3 h-3 text-mint-hover" />
                </div>
                <div className="text-[10px] text-campus-muted mt-0.5">Priya Deshmukh</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1b7a52] bg-mint-soft inline-block px-3 py-1 rounded-full mb-3">
              Comprehensive Campus Governance
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-deep tracking-tight">
              Two Powerful Pillars, One Unified Platform
            </h3>
            <p className="mt-3 text-sm text-campus-muted leading-relaxed">
              Eliminate facility blind-spots and drive sustainable operational standards with real-time tracking and metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-campus-border hover:border-mint-DEFAULT hover:shadow-card transition-smooth group">
              <div className="w-12 h-12 rounded-xl bg-navy-primary text-mint-DEFAULT flex items-center justify-center mb-5 group-hover:scale-105 transition-smooth">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-navy-primary mb-2">Complaint Management</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Students report water leaks, electrical faults, and room damages with instant photo uploads, location tagging, and priority routing.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-campus-border hover:border-mint-DEFAULT hover:shadow-card transition-smooth group">
              <div className="w-12 h-12 rounded-xl bg-navy-primary text-mint-DEFAULT flex items-center justify-center mb-5 group-hover:scale-105 transition-smooth">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-navy-primary mb-2">Maintenance Tracking</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Admins assign work to specialized staff with clear SLAs. Technicians update progress, record resolution evidence, and receive student feedback.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-campus-border hover:border-mint-DEFAULT hover:shadow-card transition-smooth group">
              <div className="w-12 h-12 rounded-xl bg-navy-primary text-mint-DEFAULT flex items-center justify-center mb-5 group-hover:scale-105 transition-smooth">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-navy-primary mb-2">Resource Monitoring</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Detailed monthly and building-level logs for grid electricity, rooftop solar, municipal water, harvested water, and segregated waste.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-50/70 border border-campus-border hover:border-mint-DEFAULT hover:shadow-card transition-smooth group">
              <div className="w-12 h-12 rounded-xl bg-navy-primary text-mint-DEFAULT flex items-center justify-center mb-5 group-hover:scale-105 transition-smooth">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-navy-primary mb-2">Sustainability Analytics</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Transparent carbon emission estimation (kg CO₂e), documented sustainability index (0-100), and interactive eco-campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="workflow" className="py-16 sm:py-24 bg-[#F5F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-navy-primary bg-blue-100/60 inline-block px-3 py-1 rounded-full mb-3">
              Workflow Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-deep tracking-tight">
              End-to-End Lifecycle Execution
            </h3>
            <p className="mt-3 text-sm text-campus-muted">
              From the moment an issue occurs until it is repaired, verified, and accounted for in campus sustainability metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-campus-border shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-navy-primary text-mint-DEFAULT font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-navy-primary text-sm mb-2">1. Report Issue</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Student captures water leak in library, selects category and building, and attaches proof.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-campus-border shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-navy-primary text-mint-DEFAULT font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-navy-primary text-sm mb-2">2. Department Dispatch</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Administrator reviews ticket, sets priority deadline, and assigns to plumbing technician.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-campus-border shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-navy-primary text-mint-DEFAULT font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-navy-primary text-sm mb-2">3. Technician Repair</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Plumber fixes the faucet valve, uploads resolution photos, and marks task as Resolved.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-campus-border shadow-xs text-center relative">
              <div className="w-10 h-10 rounded-full bg-navy-primary text-mint-DEFAULT font-bold flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold text-navy-primary text-sm mb-2">4. Review &amp; Eco Impact</h4>
              <p className="text-xs text-campus-muted leading-relaxed">
                Student rates repair quality; prevented water waste reflects positively in the sustainability index.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainability Impact Metrics Preview (Demonstration Data) */}
      <section id="sustainability" className="py-16 sm:py-24 bg-white border-t border-campus-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-navy-deep text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-mint-DEFAULT/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="max-w-xl">
                <span className="text-xs font-bold text-mint-DEFAULT uppercase tracking-wider bg-navy-secondary px-3 py-1 rounded-full border border-mint-DEFAULT/20 inline-block mb-4">
                  Campus Live Environmental Index
                </span>
                <h3 className="text-3xl font-extrabold tracking-tight leading-tight">
                  Driving Measurable Eco Impact Across All Campus Blocks
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Real-time aggregation of clean solar generation, recycled greywater, composted organic waste, and calculated carbon emissions reduction.
                </p>
                <p className="mt-2 text-[11px] text-mint-DEFAULT font-mono">
                  * Metrics shown represent active campus demonstration benchmark data.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="p-4 rounded-2xl bg-navy-secondary/70 border border-slate-700 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-mint-DEFAULT">83 / 100</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Sustainability Score</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Target: 85+</div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-secondary/70 border border-slate-700 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">12,900</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Solar Generated (kWh)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+18% vs last quarter</div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-secondary/70 border border-slate-700 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">1,40,000</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Water Recycled (Litres)</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">STP &amp; Rainwater Units</div>
                </div>

                <div className="p-4 rounded-2xl bg-navy-secondary/70 border border-slate-700 text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold text-white">88.5%</div>
                  <div className="text-xs text-slate-300 font-semibold mt-1">Waste Diverted</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Recycling &amp; Biogas</div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Want to dive deeper into building-wise energy trends?
              </span>
              <Link
                to="/sustainability"
                className="px-5 py-2.5 rounded-xl bg-mint-DEFAULT text-navy-deep font-bold text-xs hover:bg-mint-hover transition-smooth flex items-center gap-1.5 shadow-glow"
              >
                <span>Launch Sustainability Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
