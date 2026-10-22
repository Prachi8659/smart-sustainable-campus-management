import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import {
  Search,
  Filter,
  UserCheck,
  Building2,
  Calendar,
  AlertCircle,
  Eye,
  CheckCircle,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ComplaintManagementPage() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [priorityToSet, setPriorityToSet] = useState('Medium');
  const [dueDateToSet, setDueDateToSet] = useState('');
  const [adminRemarksToSet, setAdminRemarksToSet] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Action status modal (Reopen / Reject / Close)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusToSet, setStatusToSet] = useState('');
  const [statusReason, setStatusReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, deptRes, userRes] = await Promise.all([
        complaintService.getAll({
          search: searchTerm,
          status: statusFilter,
          priority: priorityFilter,
          department: deptFilter,
        }),
        departmentService.getAll(),
        departmentService.getUsers(),
      ]);
      setComplaints(compRes.data?.complaints || []);
      setDepartments(deptRes.departments || []);
      setUsers(userRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, deptFilter]);

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedDeptId(complaint.assignedDepartment?._id || '');
    setSelectedStaffId(complaint.assignedStaff?._id || '');
    setPriorityToSet(complaint.priority || 'Medium');
    setDueDateToSet(complaint.dueDate ? complaint.dueDate.substring(0, 10) : '');
    setAdminRemarksToSet(complaint.adminRemarks || '');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeptId) {
      toast.error('Please select a department to assign.');
      return;
    }

    setAssigning(true);
    try {
      const deptObj = departments.find((d) => d._id === selectedDeptId);
      const staffObj = users.find((u) => u._id === selectedStaffId || u.id === selectedStaffId);

      await complaintService.assign(selectedComplaint._id, {
        departmentId: selectedDeptId,
        staffId: selectedStaffId || null,
        department: deptObj,
        staff: staffObj || null,
        priority: priorityToSet,
        dueDate: dueDateToSet ? new Date(dueDateToSet).toISOString() : null,
        adminRemarks: adminRemarksToSet,
      });

      toast.success(`Complaint ${selectedComplaint.complaintId} dispatched successfully!`);
      setAssignModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Assignment failed.');
    } finally {
      setAssigning(false);
    }
  };

  const handleDirectStatusChange = async (complaint, newStatus, reason = '') => {
    try {
      await complaintService.updateStatus(complaint._id, {
        status: newStatus,
        remarks: reason || `Administrator updated status to ${newStatus}`,
      });
      toast.success(`Ticket status changed to ${newStatus}`);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Status change failed.');
    }
  };

  // Staff members matching selected department
  const filteredStaff = users.filter((u) => u.role === 'staff');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
          Complaint Triage &amp; Staff Assignment
        </h2>
        <p className="text-xs text-campus-muted mt-0.5">
          Review campus-wide issue logs, assign maintenance crews, and adjust priority deadlines.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl border border-campus-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchData();
          }}
          className="relative flex-1 max-w-md"
        >
          <Search className="w-4 h-4 text-campus-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets by ID, keyword, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted (New)</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Reopened">Reopened</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Fetching tickets..." />
      ) : (
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Ticket ID</th>
                  <th className="px-5 py-3.5 font-semibold">Title &amp; Reporter</th>
                  <th className="px-5 py-3.5 font-semibold">Location</th>
                  <th className="px-5 py-3.5 font-semibold">Priority</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned Dept / Staff</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Dispatch Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="px-5 py-4 font-mono font-bold text-navy-primary whitespace-nowrap">
                      {item.complaintId}
                    </td>
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-navy-primary truncate">{item.title}</div>
                      <div className="text-[10px] text-campus-muted mt-0.5">
                        By {item.submittedBy?.name || 'Student'} &bull; {item.category}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-campus-text">
                      <div className="font-medium">{item.building}</div>
                      <div className="text-[10px] text-campus-muted">{item.locationDetails}</div>
                    </td>
                    <td className="px-5 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-navy-primary">
                        {item.assignedDepartment?.name || (
                          <span className="text-amber-600 font-semibold italic">Unassigned</span>
                        )}
                      </div>
                      <div className="text-[10px] text-campus-muted">
                        {item.assignedStaff?.name || 'No technician allocated'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAssignModal(item)}
                          className="px-2.5 py-1.5 rounded-lg bg-navy-primary text-white hover:bg-navy-secondary transition-smooth font-semibold text-[11px]"
                        >
                          Assign / Edit
                        </button>
                        {item.status === 'Resolved' && (
                          <button
                            onClick={() => handleDirectStatusChange(item, 'Reopened', 'Reopened by admin for verification')}
                            className="p-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-smooth"
                            title="Reopen ticket"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign & Dispatch: ${selectedComplaint?.complaintId}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-campus-border text-xs">
            <span className="font-bold text-navy-primary block">{selectedComplaint?.title}</span>
            <span className="text-campus-muted block mt-0.5">
              {selectedComplaint?.building} &bull; {selectedComplaint?.locationDetails}
            </span>
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">
              Select Maintenance Department <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code}) - {d.slaHours}h SLA
                </option>
              ))}
            </select>
          </div>

          {/* Staff Member Selection */}
          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">
              Allocate Technician / Staff (Optional)
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
            >
              <option value="">-- Assign to Dept Queue (Technician will self-claim) --</option>
              {filteredStaff.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Priority Level
              </label>
              <select
                value={priorityToSet}
                onChange={(e) => setPriorityToSet(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent (Immediate Safety Concern)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Target SLA Due Date
              </label>
              <input
                type="date"
                value={dueDateToSet}
                onChange={(e) => setDueDateToSet(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>
          </div>

          {/* Admin Dispatch Remarks */}
          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">
              Internal Dispatch Remarks for Staff
            </label>
            <textarea
              rows={3}
              value={adminRemarksToSet}
              onChange={(e) => setAdminRemarksToSet(e.target.value)}
              placeholder="E.g., Carry replacement ceramic washers and verify with hostel warden before entry..."
              className="w-full text-xs p-3 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-campus-border">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-campus-border text-xs font-semibold rounded-xl text-campus-text hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assigning}
              className="px-6 py-2 bg-navy-primary hover:bg-navy-secondary text-white text-xs font-semibold rounded-xl transition-smooth shadow-sm"
            >
              {assigning ? 'Dispatching...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
