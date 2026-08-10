import React from 'react';

const ChartCard = ({
  title,
  subtitle,
  children,
  action,
  badge,
  className = '',
  loading = false,
  height = 300,
}) => {
  if (loading) {
    return (
      <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="w-40 h-5 rounded shimmer mb-2" />
            <div className="w-28 h-4 rounded shimmer" />
          </div>
        </div>
        <div style={{ height }} className="rounded-xl shimmer" />
      </div>
    );
  }

  return (
    <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card dark:shadow-card-dark ${className}`}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary dark:bg-primary/20 dark:text-white rounded-full border border-primary/20">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
