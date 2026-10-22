import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import { sustainabilityService } from '../../services/sustainabilityService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  PlusCircle,
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  Leaf,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [sustainabilitySummary, setSustainabilitySummary] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [compRes, sustainRes, campRes] = await Promise.all([
          complaintService.getAll(),
          sustainabilityService.getSummary(),
          sustainabilityService.getCampaigns(),
        ]);
        setComplaints(compRes.data.complaints || []);
        setSustainabilitySummary(sustainRes.data);
        setCampaigns(campRes.campaigns ? campRes.campaigns.slice(0, 2) : []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Loading student portal..." />;

  const total = complaints.length;
  const pending = complaints.filter((c) => ['Submitted', 'Under Review'].includes(c.status)).length;
  const inProgress = complaints.filter((c) => ['Assigned', 'In Progress'].includes(c.status)).length;
  const resolved = complaints.filter((c) => ['Resolved', 'Closed'].includes(c.status)).length;

  const recentComplaints = complaints.slice(0, 5);

  // Sample weekly complaints chart data
  const trendData = [
    { week: 'Week 1', submitted: 1, resolved: 1 },
    { week: 'Week 2', submitted: 2, resolved: 1 },
    { week: 'Week 3', submitted: 3, resolved: 2 },
    { week: 'Week 4', submitted: total || 4, resolved: resolved || 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Greeting & Action Header */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-mint-soft text-[#1b7a52] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Student Facility Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary tracking-tight">
            Welcome, {user?.name || 'Aarav'}!
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Track active maintenance requests and campus sustainability drives from here.
          </p>
        </div>

        <Link
          to="/student/report"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white font-semibold text-xs hover:bg-navy-secondary transition-smooth shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-mint-DEFAULT" />
          <span>+ Report New Issue</span>
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs hover:border-slate-300 transition-smooth">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">Total Reported</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-primary">{total}</div>
          <p className="text-[11px] text-campus-muted mt-1">Campus grievances logged</p>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs hover:border-slate-300 transition-smooth">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">Under Review</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pending}</div>
          <p className="text-[11px] text-campus-muted mt-1">Awaiting dispatch</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs hover:border-slate-300 transition-smooth">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{inProgress}</div>
          <p className="text-[11px] text-campus-muted mt-1">Under active repair</p>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs hover:border-slate-300 transition-smooth">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">Resolved</span>
            <div className="w-8 h-8 rounded-lg bg-mint-soft text-[#1b7a52] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#22A06B]">{resolved}</div>
          <p className="text-[11px] text-campus-muted mt-1">Fixed &amp; closed</p>
        </div>
      </div>

      {/* Grid: Recent Complaints & Sustainability Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Complaints (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-campus-border shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-navy-primary">Recent Reported Issues</h3>
                <p className="text-xs text-campus-muted">Your latest registered campus maintenance requests</p>
              </div>
              <Link
                to="/student/complaints"
                className="text-xs font-semibold text-navy-primary hover:text-navy-secondary flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">ID</th>
                    <th className="pb-3 font-semibold">Issue Title</th>
                    <th className="pb-3 font-semibold">Location</th>
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-campus-border">
                  {recentComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-campus-muted">
                        No complaints submitted yet. Click "+ Report New Issue" to file one.
                      </td>
                    </tr>
                  ) : (
                    recentComplaints.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/70 transition-smooth">
                        <td className="py-3 font-mono font-medium text-navy-primary">
                          {item.complaintId}
                        </td>
                        <td className="py-3 font-medium text-navy-primary max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-3 text-campus-muted">{item.building}</td>
                        <td className="py-3">
                          <PriorityBadge priority={item.priority} />
                        </td>
                        <td className="py-3">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="py-3 text-right">
                          <Link
                            to={`/student/complaints/${item._id}`}
                            className="text-xs font-bold text-navy-primary hover:text-[#22A06B]"
                          >
                            Details &rarr;
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Trend Chart */}
          <div className="mt-6 pt-6 border-t border-campus-border">
            <h4 className="text-xs font-bold text-navy-primary mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-navy-primary" /> Resolution Velocity
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#718096' }} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E3EAF2',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="submitted" name="Reported" fill="#142B4A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" name="Resolved" fill="#75E0C0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Sustainability Snapshot (1 col) */}
        <div className="space-y-6">
          {/* Sustainability Score Card */}
          <div className="bg-gradient-to-br from-navy-primary to-navy-secondary text-white rounded-2xl p-6 shadow-card relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-mint-DEFAULT uppercase tracking-wider flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" /> Eco Campus Score
              </span>
              <span className="text-[10px] bg-navy-deep px-2 py-0.5 rounded text-slate-300 font-mono">
                Live Metric
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-extrabold text-white">
                {sustainabilitySummary?.sustainabilityScore || 83}
              </span>
              <span className="text-slate-300 text-sm font-semibold">/ 100</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Calculated dynamically from campus rooftop solar, water conservation, and recycling efficiency.
            </p>

            <div className="mt-4 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs">
              <span className="text-slate-300">Clean Energy Offset:</span>
              <span className="font-bold text-mint-DEFAULT">
                {sustainabilitySummary?.solarGeneratedKWh?.toLocaleString() || '12,900'} kWh
              </span>
            </div>

            <Link
              to="/sustainability"
              className="mt-4 w-full py-2 bg-mint-DEFAULT hover:bg-mint-hover text-navy-deep font-bold text-xs rounded-xl transition-smooth flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Explore Sustainability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Active Eco Campaigns */}
          <div className="bg-white rounded-2xl border border-campus-border p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-navy-primary uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-navy-primary" /> Active Eco Campaigns
              </h4>
              <Link to="/sustainability/campaigns" className="text-xs text-navy-primary font-semibold hover:underline">
                All
              </Link>
            </div>

            <div className="space-y-3">
              {campaigns.map((camp) => (
                <div
                  key={camp._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-mint-soft/30 transition-smooth"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="font-bold text-navy-primary text-xs leading-snug">{camp.title}</h5>
                    <span className="text-[10px] font-bold text-[#1b7a52] bg-mint-soft px-1.5 py-0.5 rounded whitespace-nowrap">
                      +{camp.rewardsOrPoints || 50} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-campus-muted mt-1 line-clamp-2">
                    {camp.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-campus-muted">
                    <span>{camp.participantCount || 20}+ Students Participating</span>
                    <Link
                      to="/sustainability/campaigns"
                      className="font-bold text-navy-primary hover:text-navy-secondary"
                    >
                      Join &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
