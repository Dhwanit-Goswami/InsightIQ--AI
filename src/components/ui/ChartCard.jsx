import React from 'react';

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  badge,
  className = '',
  loading = false,
  height = 280,
}) => {
  if (loading) {
    return (
      <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="w-36 h-4 rounded shimmer mb-1.5" />
            <div className="w-24 h-3 rounded shimmer" />
          </div>
        </div>
        <div style={{ height }} className="rounded-lg shimmer" />
      </div>
    );
  }

  return (
    <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark transition-colors duration-180 hover:border-slate-300 dark:hover:border-slate-600 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
              {title}
            </h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-light-surface dark:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary rounded-full border border-light-border dark:border-dark-border">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div style={{ height }} className="w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
