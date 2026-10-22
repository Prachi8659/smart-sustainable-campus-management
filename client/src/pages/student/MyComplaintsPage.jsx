import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/common/StatusBadge';
import PriorityBadge from '../../components/common/PriorityBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  PlusCircle,
  Calendar,
  MapPin,
  ArrowUpDown,
  LayoutGrid,
  List,
  Eye,
} from 'lucide-react';

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [viewMode, setViewMode] = useState('table'); // table, grid

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await complaintService.getAll({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
      });
      let list = res.data?.complaints || [];

      // Sort
      if (sortOrder === 'oldest') {
        list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }

      setComplaints(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, categoryFilter, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-navy-primary tracking-tight">
            My Registered Complaints
          </h2>
          <p className="text-xs text-campus-muted mt-0.5">
            Monitor resolution progress, maintenance notes, and rate completed work.
          </p>
        </div>

        <Link
          to="/student/report"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-primary hover:bg-navy-secondary text-white font-semibold text-xs transition-smooth shadow-sm"
        >
          <PlusCircle className="w-4 h-4 text-mint-DEFAULT" />
          <span>+ Report New Issue</span>
        </Link>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-campus-border p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-campus-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, keyword, or building..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-navy-primary/20 focus:border-navy-primary"
          />
        </form>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-campus-border bg-slate-50/50 text-navy-primary font-medium focus:outline-none focus:ring-2 focus:ring-navy-primary/20"
          >
            <option value="All">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing and Water">Plumbing &amp; Water</option>
            <option value="Cleanliness and Waste">Cleanliness &amp; Waste</option>
            <option value="IT and Wi-Fi">IT &amp; Wi-Fi</option>
            <option value="Laboratory Equipment">Lab Equipment</option>
            <option value="Furniture and Infrastructure">Furniture/Civil</option>
          </select>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="p-2 rounded-xl border border-campus-border text-campus-muted hover:text-navy-primary hover:bg-slate-50 transition-smooth flex items-center gap-1 text-xs"
            title="Toggle sort order"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="hidden sm:inline capitalize">{sortOrder}</span>
          </button>

          {/* View Toggle */}
          <div className="flex items-center border border-campus-border rounded-xl p-0.5 bg-slate-50">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-smooth ${
                viewMode === 'table' ? 'bg-white shadow-xs text-navy-primary' : 'text-campus-muted'
              }`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-smooth ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-navy-primary' : 'text-campus-muted'
              }`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <LoadingSpinner text="Fetching your complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description="You don't have any complaints registered with the selected filters. If something is broken on campus, log it now!"
          actionText="+ Report an Issue"
          onAction={() => window.location.assign('/student/report')}
        />
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-campus-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-campus-border text-campus-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">Complaint ID</th>
                  <th className="px-6 py-3.5 font-semibold">Title &amp; Category</th>
                  <th className="px-6 py-3.5 font-semibold">Location</th>
                  <th className="px-6 py-3.5 font-semibold">Priority</th>
                  <th className="px-6 py-3.5 font-semibold">Status</th>
                  <th className="px-6 py-3.5 font-semibold">Submitted On</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-campus-border">
                {complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-smooth">
                    <td className="px-6 py-4 font-mono font-bold text-navy-primary">
                      {item.complaintId}
                    </td>
                    <td className="px-6 py-4 max-w-sm">
                      <div className="font-semibold text-navy-primary truncate">{item.title}</div>
                      <span className="text-[10px] text-campus-muted font-medium inline-block mt-0.5">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-campus-text">
                      <div className="font-medium">{item.building}</div>
                      <div className="text-[10px] text-campus-muted">{item.locationDetails}</div>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-campus-muted">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/student/complaints/${item._id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-navy-primary/10 text-navy-primary hover:bg-navy-primary hover:text-white transition-smooth font-semibold text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {complaints.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl border border-campus-border p-5 shadow-xs hover:border-slate-300 hover:shadow-card transition-smooth flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono font-bold text-xs text-navy-primary bg-slate-100 px-2.5 py-1 rounded-lg">
                    {item.complaintId}
                  </span>
                  <StatusBadge status={item.status} />
                </div>

                <h3 className="font-bold text-navy-primary text-sm line-clamp-2 mb-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-campus-muted line-clamp-2 mb-4 leading-relaxed">
                  {item.description}
                </p>

                <div className="space-y-1.5 text-xs text-campus-text pt-3 border-t border-campus-border">
                  <div className="flex items-center gap-2 text-campus-muted">
                    <MapPin className="w-3.5 h-3.5 text-navy-primary" />
                    <span className="truncate">{item.building} &bull; {item.locationDetails}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-campus-muted">
                      Category: {item.category}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-campus-border flex items-center justify-between">
                <span className="text-[10px] text-campus-muted">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/student/complaints/${item._id}`}
                  className="text-xs font-bold text-navy-primary hover:text-[#22A06B] flex items-center gap-1"
                >
                  <span>Track Details</span> &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
