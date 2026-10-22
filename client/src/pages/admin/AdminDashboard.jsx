import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  Timer,
  ArrowRight,
  Sparkles,
  BarChart3,
  TrendingUp,
  RefreshCw,
  UserCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#142B4A', '#75E0C0', '#203D5B', '#F4B942', '#22A06B', '#E05260', '#8b5cf6'];

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTableTab, setActiveTableTab] = useState('critical'); // 'critical' | 'recent'

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await dashboardService.getAdminDashboard();
      if (res?.success && res?.data) {
        setDashboardData(res.data);
      } else {
        throw new Error(res?.message || 'Failed to retrieve administrative metrics.');
      }
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to load operations metrics from the server. Please check database connection.';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <LoadingSpinner text="Aggregating campus operations metrics from database..." />;
  }

  if (error && !dashboardData) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center max-w-lg mx-auto my-12 shadow-card">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-navy-primary">Failed to Load Dashboard Data</h3>
        <p className="text-xs text-campus-muted mt-1 mb-5">{error}</p>
        <button
          onClick={() => fetchData(false)}
          className="px-5 py-2.5 bg-navy-primary hover:bg-navy-secondary text-white text-xs font-semibold rounded-xl transition-smooth shadow-xs inline-flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Connection
        </button>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    total: 0,
    newUnderReview: 0,
    assigned: 0,
    inProgress: 0,
    resolved: 0,
    overdue: 0,
    avgResolutionHours: 28.5,
  };

  const complaintsByCategory = dashboardData?.complaintsByCategory || [];
  const complaintsByStatus = dashboardData?.complaintsByStatus || [];
  const buildingWise = dashboardData?.buildingWise || [];
  const departmentStats = dashboardData?.departmentStats || [];
  const criticalIssues = dashboardData?.criticalIssues || [];
  const recentComplaints = dashboardData?.recentComplaints || [];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-navy-primary/10 text-navy-primary text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-mint-DEFAULT" />
            <span>Campus Administrative Command</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary tracking-tight">
            Campus Operations Overview
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Real-time complaint triage, maintenance dispatch, and department performance index from MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            title="Refresh dashboard data from database"
            className="p-2 border border-campus-border hover:bg-slate-50 text-navy-primary text-xs font-semibold rounded-xl transition-smooth shadow-xs inline-flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-mint-DEFAULT' : ''}`} />
            <span className="hidden md:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <Link
            to="/admin/complaints"
            className="px-4 py-2 bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs rounded-xl transition-smooth shadow-xs"
          >
            Dispatch &amp; Assign Work
          </Link>
          <Link
            to="/admin/departments"
            className="px-4 py-2 border border-campus-border hover:bg-slate-50 text-navy-primary font-semibold text-xs rounded-xl transition-smooth shadow-xs"
          >
            Departments
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Total Issues</span>
            <FileText className="w-4 h-4 text-navy-primary/60" />
          </div>
          <span className="text-2xl font-extrabold text-navy-primary mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Campus-wide recorded</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Under Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-500 mt-1 block">{stats.newUnderReview}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Awaiting triage</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Assigned</span>
            <UserCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block">{stats.assigned}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">With technician</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">In Progress</span>
            <Wrench className="w-4 h-4 text-purple-600" />
          </div>
          <span className="text-2xl font-extrabold text-purple-600 mt-1 block">{stats.inProgress}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Active repair</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
          </div>
          <span className="text-2xl font-extrabold text-[#22A06B] mt-1 block">{stats.resolved}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Closed / verified</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-1">
            <span className="text-[11px] font-semibold">Overdue SLA</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{stats.overdue}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Passed target SLA</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-primary mb-0.5">Complaints by Category</h3>
              <p className="text-xs text-campus-muted">Volume distribution across campus facilities</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-navy-primary rounded-lg">
              {complaintsByCategory.length} categories
            </span>
          </div>

          <div className="h-64 w-full">
            {complaintsByCategory.length === 0 ? (
              <div className="h-full flex items-center justify-center text-campus-muted text-xs">
                No complaint categories recorded yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintsByCategory} margin={{ top: 5, right: 10, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#718096' }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#718096' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E3EAF2',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                    {complaintsByCategory.map((entry, index) => (
                      <Cell key={`cell-cat-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Building-wise Counts */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-primary mb-0.5">Building-Wise Incident Density</h3>
              <p className="text-xs text-campus-muted">Facility load mapped to physical campus structures</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-navy-primary rounded-lg">
              {buildingWise.length} buildings
            </span>
          </div>

          <div className="h-64 w-full">
            {buildingWise.length === 0 ? (
              <div className="h-full flex items-center justify-center text-campus-muted text-xs">
                No building incident logs available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={buildingWise} margin={{ top: 5, right: 10, left: -20, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="building"
                    tick={{ fontSize: 10, fill: '#718096' }}
                    angle={-15}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#718096' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E3EAF2',
                      fontSize: '11px',
                    }}
                  />
                  <Bar dataKey="count" name="Incidents" fill="#75E0C0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Department-Wise Complaint Statistics */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-navy-primary">Department Operations &amp; Workload</h3>
            <p className="text-xs text-campus-muted">Live dispatch volume and resolution rates across active departments</p>
          </div>
          <Link
            to="/admin/departments"
            className="text-xs font-semibold text-navy-primary hover:underline flex items-center gap-1"
          >
            Manage Departments <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentStats.length === 0 ? (
            <div className="col-span-full py-6 text-center text-campus-muted text-xs">
              No departments registered in the database.
            </div>
          ) : (
            departmentStats.map((dept) => (
              <div
                key={dept._id}
                className="p-4 rounded-xl border border-campus-border bg-slate-50/50 hover:bg-white hover:shadow-xs transition-smooth"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-navy-primary leading-tight">{dept.name}</h4>
                    <span className="text-[10px] font-mono text-campus-muted mt-0.5 inline-block">
                      Code: {dept.code} {dept.headOfDepartment ? `• ${dept.headOfDepartment}` : ''}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-navy-primary text-mint-DEFAULT">
                    {dept.total} {dept.total === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-200/80 text-[11px]">
                  <div>
                    <span className="text-[10px] text-campus-muted block">Pending</span>
                    <span className="font-bold text-amber-600">{dept.pending}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-campus-muted block">In Progress</span>
                    <span className="font-bold text-indigo-600">{dept.inProgress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-campus-muted block">Resolved</span>
                    <span className="font-bold text-[#22A06B]">{dept.resolved}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Critical Issues & Recent Complaints Section */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTableTab('critical')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-smooth ${
                  activeTableTab === 'critical'
                    ? 'bg-navy-primary text-white shadow-xs'
                    : 'text-campus-muted hover:text-navy-primary hover:bg-slate-100'
                }`}
              >
                Critical &amp; Urgent Issues ({criticalIssues.length})
              </button>
              <button
                onClick={() => setActiveTableTab('recent')}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-smooth ${
                  activeTableTab === 'recent'
                    ? 'bg-navy-primary text-white shadow-xs'
                    : 'text-campus-muted hover:text-navy-primary hover:bg-slate-100'
                }`}
              >
                Recent Complaints ({recentComplaints.length})
              </button>
            </div>
            <p className="text-xs text-campus-muted mt-1.5">
              {activeTableTab === 'critical'
                ? 'Unresolved tickets tagged with Urgent or High priority requiring immediate dispatch'
                : 'Real-time feed of recently logged campus work orders with staff assignments'}
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="text-xs font-semibold text-navy-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            Open Dispatch Console <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Tab 1: Critical Issues Table */}
        {activeTableTab === 'critical' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ticket ID</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Zone</th>
                  <th className="px-4 py-3 font-semibold">Priority</th>
                  <th className="px-4 py-3 font-semibold">Assigned Dept</th>
                  <th className="px-4 py-3 font-semibold">Assigned Staff</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {criticalIssues.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-campus-muted">
                      <CheckCircle2 className="w-6 h-6 text-[#22A06B] mx-auto mb-1.5" />
                      No critical issues requiring attention. All severe tickets are resolved!
                    </td>
                  </tr>
                ) : (
                  criticalIssues.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-smooth">
                      <td className="px-4 py-3 font-mono font-bold text-navy-primary">
                        {item.complaintId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-primary max-w-xs truncate" title={item.title}>
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-campus-muted">
                        {item.building} {item.locationDetails ? `(${item.locationDetails})` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={item.priority} />
                      </td>
                      <td className="px-4 py-3 font-medium text-navy-primary">
                        {item.assignedDepartment?.name || (
                          <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-campus-muted">
                        {item.assignedStaff?.name || <span className="text-slate-400 italic">No technician</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/complaints?id=${item._id}`}
                          className="px-3 py-1 rounded-lg bg-navy-primary text-white font-semibold text-[11px] hover:bg-navy-secondary transition-smooth inline-block"
                        >
                          Dispatch
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Recent Complaints Table */}
        {activeTableTab === 'recent' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-semibold">Ticket ID</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Reporter</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Assigned Dept</th>
                  <th className="px-4 py-3 font-semibold">Technician</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Logged</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {recentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-campus-muted">
                      No complaints recorded in the database yet.
                    </td>
                  </tr>
                ) : (
                  recentComplaints.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-smooth">
                      <td className="px-4 py-3 font-mono font-bold text-navy-primary">
                        {item.complaintId}
                      </td>
                      <td className="px-4 py-3 font-semibold text-navy-primary max-w-xs truncate" title={item.title}>
                        {item.title}
                      </td>
                      <td className="px-4 py-3 text-campus-muted">
                        {item.submittedBy?.name || 'Student'}
                      </td>
                      <td className="px-4 py-3 text-navy-primary">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 font-medium text-navy-primary">
                        {item.assignedDepartment?.name || (
                          <span className="text-amber-600 font-semibold text-[11px]">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-campus-muted">
                        {item.assignedStaff?.name || <span className="text-slate-400 italic">No technician</span>}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-campus-muted whitespace-nowrap">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/complaints?id=${item._id}`}
                          className="px-3 py-1 rounded-lg bg-navy-primary text-white font-semibold text-[11px] hover:bg-navy-secondary transition-smooth inline-block"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
