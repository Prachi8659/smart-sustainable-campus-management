import React from 'react';
import { Check, Clock, AlertCircle, Wrench, CheckCircle2 } from 'lucide-react';

const STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved'];

export default function ComplaintTimeline({ currentStatus, statusHistory = [] }) {
  const isRejected = currentStatus === 'Rejected';
  const isReopened = currentStatus === 'Reopened';

  const getStepIndex = (status) => {
    if (status === 'Resolved' || status === 'Closed') return 4;
    if (status === 'In Progress') return 3;
    if (status === 'Assigned') return 2;
    if (status === 'Under Review') return 1;
    return 0; // Submitted
  };

  const currentStep = getStepIndex(currentStatus);

  return (
    <div className="bg-white rounded-2xl border border-campus-border p-6 shadow-xs">
      <h3 className="text-sm font-bold text-navy-primary uppercase tracking-wider mb-6 flex items-center justify-between">
        <span>Resolution Progress Lifecycle</span>
        {isRejected && (
          <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded font-semibold">
            Status: Rejected
          </span>
        )}
        {isReopened && (
          <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded font-semibold">
            Status: Reopened
          </span>
        )}
      </h3>

      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between mb-8">
        {/* Connecting horizontal line */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0">
          <div
            className="h-full bg-mint-DEFAULT transition-all duration-500"
            style={{ width: `${(currentStep / (STAGES.length - 1)) * 100}%` }}
          />
        </div>

        {STAGES.map((stage, idx) => {
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;
          const isPending = idx > currentStep;

          return (
            <div key={stage} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-smooth ${
                  isCompleted
                    ? 'bg-mint-DEFAULT text-navy-deep ring-4 ring-mint-soft shadow-xs'
                    : isCurrent
                    ? 'bg-navy-primary text-mint-DEFAULT ring-4 ring-mint-soft shadow-md animate-pulse'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : idx + 1}
              </div>
              <span
                className={`mt-2 text-xs font-semibold text-center whitespace-nowrap ${
                  isCurrent ? 'text-navy-primary font-bold' : isCompleted ? 'text-[#1b7a52]' : 'text-slate-400'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Audit Log / History List */}
      <div className="border-t border-campus-border pt-4">
        <h4 className="text-xs font-semibold text-campus-muted uppercase tracking-wider mb-3">
          Activity &amp; Remarks Log
        </h4>
        <div className="space-y-3">
          {statusHistory.length === 0 ? (
            <p className="text-xs text-campus-muted italic">No progress logs recorded yet.</p>
          ) : (
            statusHistory.map((item, index) => (
              <div key={index} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-navy-primary mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-navy-primary">{item.status}</span>
                    <span className="text-[11px] text-campus-muted">
                      {item.changedAt ? new Date(item.changedAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  {item.remarks && (
                    <p className="text-campus-muted mt-0.5 leading-relaxed">{item.remarks}</p>
                  )}
                  {item.changedBy && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Updated by: {typeof item.changedBy === 'object' ? item.changedBy.name : 'System'}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
