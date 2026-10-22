import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Building2,
  PlusCircle,
  Edit2,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    contactEmail: '',
    contactPhone: '',
    slaHours: 24,
  });
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await departmentService.getAll();
      setDepartments(res.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      headOfDepartment: '',
      contactEmail: '',
      contactPhone: '',
      slaHours: 24,
    });
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      description: dept.description || '',
      headOfDepartment: dept.headOfDepartment || '',
      contactEmail: dept.contactEmail || '',
      contactPhone: dept.contactPhone || '',
      slaHours: dept.slaHours || 24,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      toast.error('Please enter department name and code.');
      return;
    }

    setSaving(true);
    try {
      if (editingDept) {
        await departmentService.update(editingDept._id, formData);
        toast.success(`Department "${formData.name}" updated successfully!`);
      } else {
        await departmentService.create(formData);
        toast.success(`Department "${formData.name}" created!`);
      }
      setModalOpen(false);
      await fetchDepts();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (dept) => {
    try {
      if (dept.isActive) {
        const res = await departmentService.delete(dept._id);
        toast.success(res.message || `Department "${dept.name}" deactivated.`);
      } else {
        await departmentService.update(dept._id, { isActive: true });
        toast.success(`Department "${dept.name}" reactivated!`);
      }
      await fetchDepts();
    } catch (err) {
      toast.error(err.message || 'Could not update department status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
            Department &amp; Service Catalog
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Configure campus maintenance units, service SLAs, and coordinators.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary text-white font-semibold text-xs hover:bg-navy-secondary transition-smooth shadow-xs"
        >
          <PlusCircle className="w-4 h-4 text-mint-DEFAULT" />
          <span>+ Add Department</span>
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Loading departments..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-smooth ${
                dept.isActive ? 'border-campus-border hover:shadow-card' : 'border-slate-200 bg-slate-50/50 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono font-extrabold text-xs text-navy-primary bg-navy-primary/10 px-2.5 py-1 rounded-lg">
                    {dept.code}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      dept.isActive
                        ? 'bg-mint-soft text-[#1b7a52]'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dept.isActive ? 'Active' : 'Deactivated'}
                  </span>
                </div>

                <h3 className="font-bold text-navy-primary text-base mb-1">{dept.name}</h3>
                <p className="text-xs text-campus-muted line-clamp-2 mb-4 leading-relaxed">
                  {dept.description || 'General maintenance and campus service operations.'}
                </p>

                <div className="space-y-2 text-xs text-campus-text pt-3 border-t border-campus-border">
                  <div className="flex items-center justify-between">
                    <span className="text-campus-muted">Head / Lead:</span>
                    <span className="font-semibold text-navy-primary">{dept.headOfDepartment || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-campus-muted flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-navy-primary" /> Target SLA:
                    </span>
                    <span className="font-bold text-navy-primary">{dept.slaHours || 24} Hours</span>
                  </div>
                  {dept.contactEmail && (
                    <div className="flex items-center justify-between">
                      <span className="text-campus-muted">Contact:</span>
                      <span className="text-navy-primary truncate max-w-[160px] font-mono text-[11px]">{dept.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-campus-border flex items-center justify-between">
                <button
                  onClick={() => openEditModal(dept)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-navy-primary hover:text-navy-secondary"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Settings
                </button>

                <button
                  onClick={() => handleToggleActive(dept)}
                  className={`text-xs font-semibold transition-smooth ${
                    dept.isActive
                      ? 'text-rose-600 hover:text-rose-700'
                      : 'text-[#22A06B] hover:text-emerald-700'
                  }`}
                >
                  {dept.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? `Edit Department: ${editingDept.name}` : 'Create New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Department Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., HVAC &amp; Refrigeration"
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Short Code (Uppercase) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., HVAC"
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-primary mb-1">
              Description of Scope
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Responsibilities and equipment maintained..."
              className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Head of Department / Lead
              </label>
              <input
                type="text"
                value={formData.headOfDepartment}
                onChange={(e) => setFormData({ ...formData, headOfDepartment: e.target.value })}
                placeholder="e.g., Er. Sandeep Shinde"
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Target SLA (Hours)
              </label>
              <input
                type="number"
                min={1}
                max={168}
                value={formData.slaHours}
                onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Contact Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="dept@campus.edu"
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-primary mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="+91 98220 00000"
                className="w-full text-xs p-2.5 rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-campus-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-campus-border text-xs font-semibold rounded-xl text-campus-text hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-navy-primary hover:bg-navy-secondary text-white text-xs font-semibold rounded-xl transition-smooth shadow-sm"
            >
              {saving ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
