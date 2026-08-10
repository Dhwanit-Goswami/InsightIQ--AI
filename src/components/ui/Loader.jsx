import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10', xl: 'w-14 h-14' };
  return (
    <div className={`${sizes[size] || sizes.md} ${className}`}>
      <div className="w-full h-full border-2 border-light-border dark:border-dark-border border-t-primary rounded-full animate-spin" />
    </div>
  );
};

export const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-light-bg dark:bg-dark-bg z-50 transition-colors duration-200">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-light-border dark:border-dark-border rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-light-text-primary dark:text-dark-text-primary font-bold text-sm">NexusAI Platform</p>
        <p className="text-light-text-muted dark:text-dark-text-muted text-xs mt-0.5">Loading enterprise decision model...</p>
      </div>
    </div>
  </div>
);

export const LoadingSkeleton = ({ lines = 3, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className={`h-3.5 rounded shimmer ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
    ))}
  </div>
);

export const CardSkeleton = ({ className = '' }) => (
  <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 ${className}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl shimmer" />
      <div className="flex-1">
        <div className="w-24 h-4 rounded shimmer mb-1" />
        <div className="w-16 h-3 rounded shimmer" />
      </div>
    </div>
    <LoadingSkeleton lines={3} />
  </div>
);

export default Loader;
