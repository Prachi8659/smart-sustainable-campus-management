import React from 'react';

export default function LoadingSpinner({ text = 'Loading data...', size = 'md' }) {
  const sizeMap = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[160px]">
      <div
        className={`${sizeMap[size] || sizeMap.md} rounded-full border-navy-primary/20 border-t-navy-primary animate-spin mb-3`}
      />
      {text && <p className="text-sm font-medium text-campus-muted">{text}</p>}
    </div>
  );
}
