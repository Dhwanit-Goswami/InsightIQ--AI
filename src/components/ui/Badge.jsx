import React from 'react';

const variants = {
  success: 'bg-success/10 text-success border-success/20 dark:bg-success/15 dark:border-success/30',
  warning: 'bg-warning/10 text-warning border-warning/20 dark:bg-warning/15 dark:border-warning/30',
  danger:  'bg-danger/10 text-danger border-danger/20 dark:bg-danger/15 dark:border-danger/30',
  primary: 'bg-primary/10 text-primary border-primary/20 dark:bg-primary/20 dark:text-primary-200 dark:border-primary/30',
  ai:      'bg-lavender/10 text-lavender border-lavender/25 dark:bg-lavender/20 dark:text-lavender dark:border-lavender/30',
  neutral: 'bg-light-surface text-light-text-secondary border-light-border dark:bg-dark-surface dark:text-dark-text-secondary dark:border-dark-border',
};

const Badge = ({ children, variant = 'neutral', className = '', dot = false }) => {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border
      ${variants[variant] || variants.neutral}
      ${className}
    `}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
};

export default Badge;
