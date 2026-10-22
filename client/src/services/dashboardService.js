import api from './api';

export const dashboardService = {
  // Fetch real aggregated administrative metrics
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Fetch real maintenance staff work orders
  getStaffDashboard: async () => {
    const response = await api.get('/dashboard/staff');
    return response.data;
  },

  // Fetch student ticket status and sustainability index
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },
};
