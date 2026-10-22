import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No records found',
  description = 'There are currently no items matching your criteria or filters.',
  actionText,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-campus-border shadow-xs my-4">
      <div className="w-14 h-14 rounded-2xl bg-mint-soft flex items-center justify-center text-navy-primary mb-4 shadow-inner">
        <Icon className="w-7 h-7 text-navy-primary" />
      </div>
      <h3 className="text-base font-semibold text-navy-primary">{title}</h3>
      <p className="mt-1 text-sm text-campus-muted max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-sm font-medium text-white bg-navy-primary hover:bg-navy-secondary rounded-lg transition-smooth shadow-sm hover:shadow"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
