import React from 'react';

const statusStyles = {
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
  Assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'In Progress': 'bg-purple-50 text-purple-700 border-purple-200 animate-pulse',
  Resolved: 'bg-mint-soft text-[#1b7a52] border-[#a3edd7] font-semibold',
  Reopened: 'bg-orange-50 text-orange-700 border-orange-200',
  Closed: 'bg-slate-100 text-slate-700 border-slate-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function StatusBadge({ status, size = 'sm' }) {
  const badgeStyle = statusStyles[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  const sizeClasses = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-sm ${badgeStyle} ${sizeClasses}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === 'Resolved'
            ? 'bg-[#22A06B]'
            : status === 'In Progress'
            ? 'bg-purple-500'
            : status === 'Assigned'
            ? 'bg-indigo-500'
            : status === 'Under Review'
            ? 'bg-amber-500'
            : status === 'Rejected'
            ? 'bg-rose-500'
            : 'bg-blue-500'
        }`}
      />
      {status || 'Unknown'}
    </span>
  );
}
