import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size] || sizes.md} ${className}`}>
      <div className="w-full h-full border-2 border-light-border dark:border-dark-border border-t-primary rounded-full animate-spin" />
    </div>
  );
};

export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-light-bg dark:bg-dark-bg z-50 transition-colors duration-200">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-2 border-light-border dark:border-dark-border border-t-primary rounded-full animate-spin" />
      <div className="text-center">
        <p className="text-light-text-primary dark:text-dark-text-primary font-semibold text-xs tracking-tight">Loading intelligence workspace...</p>
      </div>
    </div>
  </div>
);

export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2.5 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3 rounded shimmer ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 4, className = '' }) => (
  <div className={`w-full divide-y divide-light-border dark:divide-dark-border ${className}`}>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="py-3 px-4 flex items-center justify-between gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <div key={c} className="h-3.5 rounded shimmer" style={{ width: `${60 + (c * 10) % 35}%` }} />
        ))}
      </div>
    ))}
  </div>
);

export const StatRowSkeleton = ({ count = 4, className = '' }) => (
  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark">
        <div className="flex justify-between items-center mb-3">
          <div className="w-20 h-3 rounded shimmer" />
          <div className="w-12 h-4 rounded-full shimmer" />
        </div>
        <div className="w-24 h-6 rounded shimmer mb-2" />
        <div className="w-16 h-2.5 rounded shimmer" />
      </div>
    ))}
  </div>
);

export default Loader;
