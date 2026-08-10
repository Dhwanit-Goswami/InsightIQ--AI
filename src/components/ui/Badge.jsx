import React from 'react';

const variants = {
  success: 'bg-success-bg dark:bg-success/20 text-success border-success/30',
  warning: 'bg-warning-bg dark:bg-warning/20 text-warning border-warning/30',
  danger: 'bg-danger-bg dark:bg-danger/20 text-danger border-danger/30',
  info: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-300 border-primary/20',
  primary: 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white border-primary/20',
  purple: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  gold: 'bg-warning-bg dark:bg-warning/20 text-warning border-warning/30',
  neutral: 'bg-light-surface dark:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary border-light-border dark:border-dark-border',
};

const Badge = ({ children, variant = 'neutral', className = '', dot = false }) => {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
      ${variants[variant] || variants.neutral}
      ${className}
    `}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
};

export default Badge;
