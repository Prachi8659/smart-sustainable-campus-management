import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  MapPin,
  Check,
} from 'lucide-react';

export default function StaffDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await complaintService.getAll();
        setTasks(res.data?.complaints || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) return <LoadingSpinner text="Loading staff operations hub..." />;

  const now = new Date();
  const newAssigned = tasks.filter((t) => t.status === 'Assigned').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const completed = tasks.filter((t) => ['Resolved', 'Closed'].includes(t.status)).length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && !['Resolved', 'Closed'].includes(t.status)
  ).length;

  const urgentTasks = tasks.filter(
    (t) => (t.priority === 'Urgent' || t.priority === 'High') && !['Resolved', 'Closed'].includes(t.status)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Wrench className="w-3.5 h-3.5" />
            <span>Field Maintenance Technician Desk</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary tracking-tight">
            Hello, {user?.name || 'Vikram Singh'}!
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            You have <strong className="text-navy-primary">{newAssigned}</strong> new assignment(s) and{' '}
            <strong className="text-purple-600">{inProgress}</strong> task(s) currently underway.
          </p>
        </div>

        <Link
          to="/staff/tasks"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white font-semibold text-xs hover:bg-navy-secondary transition-smooth shadow-sm"
        >
          <span>View All Work Orders</span>
          <ArrowRight className="w-4 h-4 text-mint-DEFAULT" />
        </Link>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New Assigned */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">New Assigned</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-navy-primary">{newAssigned}</div>
          <p className="text-[11px] text-campus-muted mt-1">Pending technician pickup</p>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">In Progress</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-600">{inProgress}</div>
          <p className="text-[11px] text-campus-muted mt-1">Active site repairs</p>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-mint-soft text-[#1b7a52] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#22A06B]">{completed}</div>
          <p className="text-[11px] text-campus-muted mt-1">Resolved work orders</p>
        </div>

        {/* Overdue */}
        <div className="bg-white p-5 rounded-2xl border border-campus-border shadow-xs">
          <div className="flex items-center justify-between text-campus-muted mb-2">
            <span className="text-xs font-semibold">Overdue SLA</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{overdue}</div>
          <p className="text-[11px] text-campus-muted mt-1">Past targeted deadline</p>
        </div>
      </div>

      {/* Priority Action Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent & Assigned Tasks */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-navy-primary">Urgent &amp; High Priority Dispatch</h3>
              <p className="text-xs text-campus-muted">Items requiring immediate site visit and diagnosis</p>
            </div>
            <Link to="/staff/tasks" className="text-xs font-semibold text-navy-primary hover:underline">
              All Tasks &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {urgentTasks.length === 0 ? (
              <p className="text-xs text-campus-muted py-8 text-center bg-slate-50 rounded-xl">
                No high-priority or urgent maintenance tasks currently pending!
              </p>
            ) : (
              urgentTasks.map((t) => (
                <div
                  key={t._id}
                  className="p-4 rounded-xl border border-campus-border hover:border-slate-300 transition-smooth bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-navy-primary bg-white px-2 py-0.5 rounded border border-campus-border">
                        {t.complaintId}
                      </span>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <h4 className="text-xs font-bold text-navy-primary line-clamp-1">{t.title}</h4>
                    <div className="text-[11px] text-campus-muted flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-navy-primary" />
                      <span>{t.building} &bull; {t.locationDetails}</span>
                    </div>
                  </div>

                  <Link
                    to={`/staff/tasks/${t._id}`}
                    className="px-4 py-2 bg-navy-primary hover:bg-navy-secondary text-white text-xs font-semibold rounded-xl transition-smooth whitespace-nowrap text-center shadow-xs"
                  >
                    Manage &amp; Update
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Workflow Guidelines */}
        <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-navy-primary uppercase tracking-wider">
            Field Technician Protocol
          </h3>

          <div className="space-y-3 text-xs text-campus-text">
            <div className="p-3 rounded-xl bg-slate-50 border border-campus-border">
              <span className="font-bold text-navy-primary block mb-0.5">1. Acknowledge &amp; Start</span>
              <p className="text-[11px] text-campus-muted">
                Transition ticket from <em>Assigned</em> to <em>In Progress</em> when parts are verified and diagnosis commences.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-campus-border">
              <span className="font-bold text-navy-primary block mb-0.5">2. Safety First</span>
              <p className="text-[11px] text-campus-muted">
                Turn off supply breakers/isolation valves before opening enclosures or conducting pipe cutting.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-campus-border">
              <span className="font-bold text-navy-primary block mb-0.5">3. Record Evidence</span>
              <p className="text-[11px] text-campus-muted">
                Upload resolution photos or add replacement remarks before marking as <em>Resolved</em> for audit review.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
