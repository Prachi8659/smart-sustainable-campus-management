import api from './api';
import { DEMO_DEPARTMENTS, DEMO_USERS } from './mockData';

const KEY_DEPTS = 'campus_departments';
const KEY_USERS = 'campus_users';

const getStored = (key, fallback) => {
  const s = localStorage.getItem(key);
  if (s) {
    try {
      return JSON.parse(s);
    } catch (e) {
      console.error(e);
    }
  }
  return [...fallback];
};

const saveStored = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const departmentService = {
  getAll: async () => {
    try {
      const res = await api.get('/departments');
      return { success: true, departments: res.data.departments, source: 'api' };
    } catch (e) {
      return { success: true, departments: getStored(KEY_DEPTS, DEMO_DEPARTMENTS), source: 'demo' };
    }
  },

  create: async (payload) => {
    try {
      const res = await api.post('/departments', payload);
      return { success: true, department: res.data.department, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_DEPTS, DEMO_DEPARTMENTS);
      const newD = { _id: `dept_${Date.now()}`, ...payload, isActive: true };
      list.push(newD);
      saveStored(KEY_DEPTS, list);
      return { success: true, department: newD, source: 'demo' };
    }
  },

  update: async (id, payload) => {
    try {
      const res = await api.patch(`/departments/${id}`, payload);
      return { success: true, department: res.data.department, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_DEPTS, DEMO_DEPARTMENTS);
      const idx = list.findIndex((d) => d._id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        saveStored(KEY_DEPTS, list);
      }
      return { success: true, department: list[idx], source: 'demo' };
    }
  },

  delete: async (id) => {
    try {
      const res = await api.delete(`/departments/${id}`);
      return { success: true, message: res.data.message, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_DEPTS, DEMO_DEPARTMENTS);
      const idx = list.findIndex((d) => d._id === id);
      if (idx !== -1) {
        list[idx].isActive = false; // Safe deactivation
        saveStored(KEY_DEPTS, list);
      }
      return { success: true, message: 'Department safely deactivated to protect audit logs.', source: 'demo' };
    }
  },

  // Admin User Management
  getUsers: async (params = {}) => {
    try {
      const res = await api.get('/auth/users', { params });
      return { success: true, users: res.data.users, source: 'api' };
    } catch (e) {
      return { success: true, users: getStored(KEY_USERS, DEMO_USERS), source: 'demo' };
    }
  },

  updateUser: async (id, payload) => {
    try {
      const res = await api.patch(`/auth/users/${id}`, payload);
      return { success: true, user: res.data.user, source: 'api' };
    } catch (e) {
      const list = getStored(KEY_USERS, DEMO_USERS);
      const idx = list.findIndex((u) => u._id === id || u.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...payload };
        saveStored(KEY_USERS, list);
      }
      return { success: true, user: list[idx], source: 'demo' };
    }
  },
};
