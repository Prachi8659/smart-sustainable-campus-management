import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ComplaintTimeline from '../../components/complaints/ComplaintTimeline';
import FeedbackForm from '../../components/complaints/FeedbackForm';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Tag,
  User,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDetails = async () => {
    try {
      const res = await complaintService.getById(id);
      setComplaint(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to retrieve complaint record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleFeedbackSubmit = async (feedbackData) => {
    await complaintService.submitFeedback(complaint._id, feedbackData);
    await fetchDetails();
  };

  if (loading) return <LoadingSpinner text="Retrieving complaint details..." />;
  if (!complaint) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-campus-muted">Complaint not found.</p>
        <Link to="/student/complaints" className="mt-4 inline-block text-xs font-bold text-navy-primary underline">
          &larr; Back to Complaints
        </Link>
      </div>
    );
  }

  const isResolved = complaint.status === 'Resolved' || complaint.status === 'Closed';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          to="/student/complaints"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-campus-muted hover:text-navy-primary transition-smooth"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Complaints</span>
        </Link>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-campus-border p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-campus-border pb-4 mb-4">
          <div>
            <span className="font-mono text-xs font-bold text-navy-primary bg-slate-100 px-2.5 py-1 rounded-md">
              {complaint.complaintId}
            </span>
            <span className="text-xs text-campus-muted ml-3">
              Reported on {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700">
            {complaint.category}
          </span>
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-navy-primary mb-3">
          {complaint.title}
        </h2>

        <p className="text-xs sm:text-sm text-campus-text leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-campus-border">
          {complaint.description}
        </p>

        {/* Location & Meta info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-campus-border text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">Campus Zone</span>
              <span className="font-semibold text-navy-primary">{complaint.building}</span>
              <span className="text-campus-muted block text-[11px]">{complaint.locationDetails}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">Assigned Unit</span>
              <span className="font-semibold text-navy-primary">
                {complaint.assignedDepartment?.name || 'Awaiting Department Assignment'}
              </span>
              {complaint.assignedStaff && (
                <span className="text-campus-muted block text-[11px]">
                  Technician: {complaint.assignedStaff.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-navy-primary flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-campus-muted block">Expected Due Date</span>
              <span className="font-semibold text-navy-primary">
                {complaint.dueDate
                  ? new Date(complaint.dueDate).toLocaleDateString()
                  : 'Standard 48-Hour SLA'}
              </span>
            </div>
          </div>
        </div>

        {/* Staff & Admin Remarks */}
        {(complaint.staffRemarks || complaint.adminRemarks) && (
          <div className="mt-6 pt-4 border-t border-campus-border space-y-3">
            {complaint.adminRemarks && (
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-xs">
                <span className="font-bold text-blue-900 block mb-0.5">Administrative Dispatch Note:</span>
                <p className="text-blue-800">{complaint.adminRemarks}</p>
              </div>
            )}
            {complaint.staffRemarks && (
              <div className="p-3 rounded-xl bg-mint-soft/50 border border-[#a3edd7] text-xs">
                <span className="font-bold text-[#1b7a52] block mb-0.5">Maintenance Technician Notes:</span>
                <p className="text-[#13573a]">{complaint.staffRemarks}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Timeline Stepper */}
      <ComplaintTimeline
        currentStatus={complaint.status}
        statusHistory={complaint.statusHistory || []}
      />

      {/* Feedback Section (if Resolved) */}
      {isResolved && (
        <FeedbackForm
          complaintId={complaint._id}
          existingFeedback={complaint.feedback}
          onSubmitSuccess={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}
