import React from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';

const StatCard = ({
  label,
  value,
  change,
  trend = 'neutral',
  period,
  icon: Icon,
  color = 'primary',
  loading = false,
  className = '',
}) => {
  const colorMap = {
    primary: { bg: 'bg-primary/10 dark:bg-primary/20', icon: 'text-primary dark:text-white', border: 'border-primary/20' },
    softblue: { bg: 'bg-softblue dark:bg-primary/20', icon: 'text-primary dark:text-primary-200', border: 'border-primary/20' },
    green: { bg: 'bg-success-bg dark:bg-success/20', icon: 'text-success dark:text-success', border: 'border-success/20' },
    gold: { bg: 'bg-warning-bg dark:bg-warning/20', icon: 'text-warning dark:text-warning', border: 'border-warning/20' },
    red: { bg: 'bg-danger-bg dark:bg-danger/20', icon: 'text-danger dark:text-danger', border: 'border-danger/20' },
    lavender: { bg: 'bg-lavender-bg dark:bg-lavender/20', icon: 'text-lavender dark:text-lavender', border: 'border-lavender/20' },
  };

  const colors = colorMap[color] || colorMap.primary;

  const trendIcon = trend === 'up'
    ? <FiTrendingUp className="w-3.5 h-3.5" />
    : trend === 'down'
      ? <FiTrendingDown className="w-3.5 h-3.5" />
      : <FiMinus className="w-3.5 h-3.5" />;

  const trendColor = trend === 'up'
    ? 'text-success bg-success-bg dark:bg-success/20 dark:text-success'
    : trend === 'down'
      ? 'text-danger bg-danger-bg dark:bg-danger/20 dark:text-danger'
      : 'text-light-text-muted dark:text-dark-text-muted bg-light-surface dark:bg-dark-surface';

  if (loading) {
    return (
      <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl shimmer" />
          <div className="w-16 h-5 rounded-full shimmer" />
        </div>
        <div className="w-24 h-7 rounded shimmer mb-1" />
        <div className="w-32 h-4 rounded shimmer" />
      </div>
    );
  }

  return (
    <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card dark:shadow-card-dark hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 group ${className}`}>
      <div className="flex items-start justify-between mb-4">
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
            <Icon className={`w-5 h-5 ${colors.icon}`} />
          </div>
        )}
        {change && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trendColor}`}>
            {trendIcon}
            {change}
          </span>
        )}
      </div>
      <div className="space-y-0.5">
        <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">{value}</p>
        <p className="text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
        {period && <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">{period}</p>}
      </div>
    </div>
  );
};

export default StatCard;
