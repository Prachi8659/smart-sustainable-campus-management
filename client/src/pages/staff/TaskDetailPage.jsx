import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Wrench,
  CheckCircle2,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function TaskDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Form states for status update
  const [nextStatus, setNextStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  const fetchTaskDetails = async () => {
    try {
      const res = await complaintService.getById(id);
      setTask(res.data);
      // Set reasonable default next status
      if (res.data.status === 'Assigned') setNextStatus('In Progress');
      else if (res.data.status === 'In Progress') setNextStatus('Resolved');
      else setNextStatus(res.data.status);
    } catch (err) {
      toast.error(err.message || 'Failed to fetch task details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!nextStatus) {
      toast.error('Please select a valid status.');
      return;
    }
    if (nextStatus === 'Resolved' && !remarks.trim()) {
      toast.error('Please provide maintenance remarks detailing the resolution before marking as Resolved.');
      return;
    }

    setUpdating(true);
    try {
      await complaintService.updateStatus(task._id, {
        status: nextStatus,
        remarks: remarks.trim(),
      });
      toast.success(`Task status successfully updated to "${nextStatus}"!`);
      setRemarks('');
      await fetchTaskDetails();
    } catch (err) {
      toast.error(err.message || 'Status update failed.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving task details..." />;
  if (!task) return <div className="p-8 text-center text-sm text-campus-muted">Task not found.</div>;

  const isResolved = task.status === 'Resolved' || task.status === 'Closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/staff/tasks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-muted hover:text-navy-primary transition-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Work Orders</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Main Task Card */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-campus-border pb-4 mb-4">
          <div>
            <span className="font-mono text-xs font-bold text-navy-primary bg-slate-100 px-2.5 py-1 rounded-md">
              {task.complaintId}
            </span>
            <span className="text-xs text-campus-muted ml-3">
              Reported: {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
            {task.category}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary mb-3">
          {task.title}
        </h2>

        <p className="text-xs sm:text-sm text-campus-text leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-campus-border">
          {task.description}
        </p>

        {/* Location & Reporter metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-campus-border text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">Location Site</span>
              <span className="font-semibold text-navy-primary">{task.building}</span>
              <span className="text-campus-muted block text-[11px]">{task.locationDetails}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <User className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">Student Reporter</span>
              <span className="font-semibold text-navy-primary">{task.submittedBy?.name || 'Student'}</span>
              <span className="text-campus-muted block text-[11px]">{task.submittedBy?.email || ''}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">SLA Target Date</span>
              <span className="font-semibold text-navy-primary">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Immediate dispatch'}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Remarks if any */}
        {task.adminRemarks && (
          <div className="mt-6 pt-4 border-t border-campus-border">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
              <span className="font-bold text-blue-900 block mb-0.5">Admin Dispatch Instructions:</span>
              <p className="text-blue-800">{task.adminRemarks}</p>
            </div>
          </div>
        )}
      </div>

      {/* Technician Action Panel */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Wrench className="w-5 h-5 text-navy-primary" />
          <h3 className="text-sm font-bold text-navy-primary">Field Work Status Update</h3>
        </div>

        {isResolved ? (
          <div className="p-4 rounded-xl bg-mint-soft/50 border border-[#a3edd7] text-xs text-[#1b7a52]">
            <div className="flex items-center gap-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-[#22A06B]" />
              <span>This task has been resolved and closed.</span>
            </div>
            {task.staffRemarks && (
              <p className="text-[#13573a] mt-1 italic">
                Final Remarks: "{task.staffRemarks}"
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleStatusUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Progress State
              </label>
              <select
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              >
                {task.status === 'Assigned' && (
                  <>
                    <option value="Assigned">Assigned (Reviewing requirements)</option>
                    <option value="In Progress">In Progress (Work started on site)</option>
                    <option value="Resolved">Resolved (Quick fix completed)</option>
                  </>
                )}
                {task.status === 'In Progress' && (
                  <>
                    <option value="In Progress">In Progress (Still ongoing)</option>
                    <option value="Resolved">Resolved (Repairs completed)</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Technician Work Remarks &amp; Resolution Details
              </label>
              <textarea
                rows={3}
                required={nextStatus === 'Resolved'}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="E.g., Replaced 25A circuit breaker, tightened terminal connections, tested voltage output..."
                className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs rounded-xl transition-smooth shadow-sm"
              >
                {updating ? 'Saving Status...' : `Confirm & Save as ${nextStatus}`}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lifecycle Timeline */}
      <ComplaintTimeline
        currentStatus={task.status}
        statusHistory={task.statusHistory || []}
      />
    </div>
  );
}
