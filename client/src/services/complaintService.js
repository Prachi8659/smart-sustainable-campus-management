import api from './api';
import { DEMO_COMPLAINTS } from './mockData';

// Local storage key for demo mode persistence
const DEMO_STORAGE_KEY = 'campus_complaints_data';

const getLocalComplaints = () => {
  const saved = localStorage.getItem(DEMO_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [...DEMO_COMPLAINTS];
};

const saveLocalComplaints = (data) => {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
};

export const complaintService = {
  // Get all complaints with filters
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/complaints', { params });
      return { success: true, data: response.data, source: 'api' };
    } catch (err) {
      console.warn('[ComplaintService] Using demo fallback:', err.message);
      let list = getLocalComplaints();

      // Scoping for demo role
      const user = JSON.parse(localStorage.getItem('campus_auth_user') || '{}');
      if (user.role === 'student') {
        list = list.filter((c) => c.submittedBy?._id === user.id || c.submittedBy?._id === user._id);
      } else if (user.role === 'staff') {
        list = list.filter((c) => c.assignedStaff?._id === user.id || c.assignedStaff?._id === user._id);
      }

      if (params.status && params.status !== 'All') {
        list = list.filter((c) => c.status === params.status);
      }
      if (params.category && params.category !== 'All') {
        list = list.filter((c) => c.category === params.category);
      }
      if (params.priority && params.priority !== 'All') {
        list = list.filter((c) => c.priority === params.priority);
      }
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(s) ||
            c.complaintId.toLowerCase().includes(s) ||
            c.building.toLowerCase().includes(s)
        );
      }

      return {
        success: true,
        data: {
          complaints: list,
          count: list.length,
          total: list.length,
          totalPages: 1,
          currentPage: 1,
        },
        source: 'demo',
      };
    }
  },

  // Get complaint by ID
  getById: async (id) => {
    try {
      const response = await api.get(`/complaints/${id}`);
      return { success: true, data: response.data.complaint, source: 'api' };
    } catch (err) {
      const list = getLocalComplaints();
      const complaint = list.find((c) => c._id === id || c.complaintId === id);
      if (!complaint) throw new Error('Complaint not found in records.');
      return { success: true, data: complaint, source: 'demo' };
    }
  },

  // Create complaint
  create: async (formData) => {
    try {
      // Support FormData or JSON
      const isFormData = formData instanceof FormData;
      const headers = isFormData ? { 'Content-Type': 'multipart/form-data' } : {};
      const response = await api.post('/complaints', formData, { headers });
      return { success: true, data: response.data.complaint, source: 'api' };
    } catch (err) {
      console.warn('[ComplaintService] Fallback demo creation:', err.message);
      const list = getLocalComplaints();
      const currentUser = JSON.parse(localStorage.getItem('campus_auth_user') || '{}');

      let newRecord;
      if (formData instanceof FormData) {
        const count = list.length + 1;
        const cid = `CMP-2026-${String(count).padStart(4, '0')}`;
        newRecord = {
          _id: `cmp_${Date.now()}`,
          complaintId: cid,
          title: formData.get('title'),
          description: formData.get('description'),
          category: formData.get('category'),
          building: formData.get('building'),
          locationDetails: formData.get('locationDetails'),
          priority: formData.get('priority') || 'Medium',
          status: 'Submitted',
          createdAt: new Date().toISOString(),
          submittedBy: {
            _id: currentUser.id || 'usr_student_01',
            name: currentUser.name || 'Aarav Sharma',
            email: currentUser.email || 'student@campus.edu',
          },
          statusHistory: [
            {
              status: 'Submitted',
              changedBy: { name: currentUser.name || 'Student' },
              changedAt: new Date().toISOString(),
              remarks: 'Complaint registered by student',
            },
          ],
        };
      } else {
        const count = list.length + 1;
        newRecord = {
          _id: `cmp_${Date.now()}`,
          complaintId: `CMP-2026-${String(count).padStart(4, '0')}`,
          ...formData,
          status: 'Submitted',
          createdAt: new Date().toISOString(),
          submittedBy: currentUser,
          statusHistory: [
            {
              status: 'Submitted',
              changedBy: { name: currentUser.name || 'Student' },
              changedAt: new Date().toISOString(),
              remarks: 'Complaint registered',
            },
          ],
        };
      }

      list.unshift(newRecord);
      saveLocalComplaints(list);
      return { success: true, data: newRecord, source: 'demo' };
    }
  },

  // Assign complaint
  assign: async (id, assignData) => {
    try {
      const response = await api.patch(`/complaints/${id}/assign`, assignData);
      return { success: true, data: response.data.complaint, source: 'api' };
    } catch (err) {
      const list = getLocalComplaints();
      const index = list.findIndex((c) => c._id === id || c.complaintId === id);
      if (index === -1) throw new Error('Complaint not found.');

      list[index].assignedDepartment = assignData.department;
      list[index].assignedStaff = assignData.staff;
      list[index].priority = assignData.priority || list[index].priority;
      if (assignData.dueDate) list[index].dueDate = assignData.dueDate;
      if (assignData.adminRemarks) list[index].adminRemarks = assignData.adminRemarks;
      list[index].status = 'Assigned';

      list[index].statusHistory.push({
        status: 'Assigned',
        changedBy: { name: 'Campus Administrator' },
        changedAt: new Date().toISOString(),
        remarks: assignData.adminRemarks || 'Assigned to maintenance department',
      });

      saveLocalComplaints(list);
      return { success: true, data: list[index], source: 'demo' };
    }
  },

  // Update status (staff/admin)
  updateStatus: async (id, statusData) => {
    try {
      const response = await api.patch(`/complaints/${id}/status`, statusData);
      return { success: true, data: response.data.complaint, source: 'api' };
    } catch (err) {
      const list = getLocalComplaints();
      const index = list.findIndex((c) => c._id === id || c.complaintId === id);
      if (index === -1) throw new Error('Complaint not found.');

      list[index].status = statusData.status;
      if (statusData.remarks) list[index].staffRemarks = statusData.remarks;
      if (statusData.status === 'Resolved') {
        list[index].resolvedAt = new Date().toISOString();
      }

      list[index].statusHistory.push({
        status: statusData.status,
        changedBy: { name: 'Maintenance Staff' },
        changedAt: new Date().toISOString(),
        remarks: statusData.remarks || `Status updated to ${statusData.status}`,
      });

      saveLocalComplaints(list);
      return { success: true, data: list[index], source: 'demo' };
    }
  },

  // Submit feedback (student)
  submitFeedback: async (id, feedbackData) => {
    try {
      const response = await api.post(`/complaints/${id}/feedback`, feedbackData);
      return { success: true, data: response.data.feedback, source: 'api' };
    } catch (err) {
      const list = getLocalComplaints();
      const index = list.findIndex((c) => c._id === id || c.complaintId === id);
      if (index === -1) throw new Error('Complaint not found.');

      list[index].feedback = {
        rating: Number(feedbackData.rating),
        comments: feedbackData.comments,
        isSatisfied: feedbackData.isSatisfied !== false,
        createdAt: new Date().toISOString(),
      };

      saveLocalComplaints(list);
      return { success: true, data: list[index].feedback, source: 'demo' };
    }
  },
};
