import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  Search,
  Filter,
  Shield,
  Building2,
  CheckCircle2,
  XCircle,
  Phone,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchUsersAndDepts = async () => {
    setLoading(true);
    try {
      const [uRes, dRes] = await Promise.all([
        departmentService.getUsers(),
        departmentService.getAll(),
      ]);
      setUsers(uRes.users || []);
      setDepartments(dRes.departments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDepts();
  }, []);

  const handleToggleActive = async (user) => {
    try {
      await departmentService.updateUser(user._id || user.id, {
        isActive: !user.isActive,
      });
      toast.success(`User "${user.name}" status updated.`);
      await fetchUsersAndDepts();
    } catch (err) {
      toast.error(err.message || 'Failed to update user status.');
    }
  };

  const handleDepartmentChange = async (user, deptId) => {
    try {
      await departmentService.updateUser(user._id || user.id, {
        department: deptId || null,
      });
      toast.success(`Assigned ${user.name} to department.`);
      await fetchUsersAndDepts();
    } catch (err) {
      toast.error(err.message || 'Could not update user department.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesSearch =
      searchTerm === '' ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
          User Management &amp; Access Roles
        </h2>
        <p className="text-xs text-campus-muted mt-0.5">
          Audit campus accounts, manage technician department assignments, and toggle account access.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-campus-border p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-campus-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none"
          >
            <option value="All">All Roles</option>
            <option value="student">Students</option>
            <option value="staff">Maintenance Staff</option>
            <option value="admin">Administrators</option>
            <option value="sustainability_officer">Sustainability Officers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading campus users..." />
      ) : (
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">User Details</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Assigned Department</th>
                  <th className="px-5 py-3.5 font-semibold">Campus Zone</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Access Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy-primary">{user.name}</div>
                      <div className="text-[11px] text-campus-muted font-mono">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                          user.role === 'admin'
                            ? 'bg-rose-50 text-rose-700'
                            : user.role === 'sustainability_officer'
                            ? 'bg-mint-soft text-[#1b7a52]'
                            : user.role === 'staff'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {user.role === 'staff' ? (
                        <select
                          value={user.department?._id || user.department || ''}
                          onChange={(e) => handleDepartmentChange(user, e.target.value)}
                          className="text-xs p-1.5 rounded-lg border border-campus-border bg-slate-50 focus:bg-white"
                        >
                          <option value="">-- No Department --</option>
                          {departments.map((d) => (
                            <option key={d._id} value={d._id}>
                              {d.name} ({d.code})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-campus-muted italic text-[11px]">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-campus-text">
                      {user.campus || 'Main Campus'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded-full ${
                          user.isActive
                            ? 'bg-mint-soft text-[#1b7a52]'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleActive(user)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${
                          user.isActive
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            : 'bg-mint-soft text-[#1b7a52] hover:bg-mint-soft/80'
                        }`}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
