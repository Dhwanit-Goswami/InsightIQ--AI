import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiHelpCircle } from 'react-icons/fi';

const StatCard = ({
  label,
  value,
  change,
  trend = 'neutral',
  period,
  tooltip,
  icon: Icon,
  loading = false,
  className = '',
}) => {
  const trendIcon = trend === 'up'
    ? <FiTrendingUp className="w-3.5 h-3.5" />
    : trend === 'down'
      ? <FiTrendingDown className="w-3.5 h-3.5" />
      : <FiMinus className="w-3.5 h-3.5" />;

  const trendBadge = trend === 'up'
    ? 'text-success bg-success/10 border-success/20 dark:bg-success/15'
    : trend === 'down'
      ? 'text-danger bg-danger/10 border-danger/20 dark:bg-danger/15'
      : 'text-light-text-muted dark:text-dark-text-muted bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border';

  if (loading) {
    return (
      <div className={`h-full flex flex-col justify-between bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark ${className}`}>
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="w-20 h-3 rounded shimmer" />
            <div className="w-12 h-4 rounded-full shimmer" />
          </div>
          <div className="w-28 h-7 rounded shimmer mb-2" />
        </div>
        <div className="w-24 h-3 rounded shimmer mt-2" />
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col justify-between bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark transition-colors duration-180 hover:border-slate-300 dark:hover:border-slate-600 ${className}`}>
      <div>
        {/* Top Header: Label + Optional Tooltip / Icon + Trend Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary truncate">{label}</span>
            {tooltip && (
              <span title={tooltip} className="text-light-text-muted dark:text-dark-text-muted cursor-help">
                <FiHelpCircle className="w-3 h-3" />
              </span>
            )}
          </div>
          {change && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${trendBadge}`}>
              {trendIcon}
              <span>{change}</span>
            </span>
          )}
        </div>

        {/* Main Metric Value */}
        <div className="flex items-baseline justify-between mt-1">
          <p className="text-xl sm:text-2xl font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
            {value}
          </p>
          {Icon && (
            <Icon className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Period / Context */}
      {period && (
        <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-2 pt-1 font-normal border-t border-light-border/40 dark:border-dark-border/40">
          {period}
        </p>
      )}
    </div>
  );
};

export default StatCard;
