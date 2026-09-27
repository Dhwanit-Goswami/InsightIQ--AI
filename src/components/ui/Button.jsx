import React from 'react';

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-card border border-transparent',
  secondary: 'bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border',
  ghost: 'bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary border border-transparent',
  danger: 'bg-danger/10 hover:bg-danger/20 text-danger border border-danger/20 dark:bg-danger/15 dark:hover:bg-danger/25',
  success: 'bg-success/10 hover:bg-success/20 text-success border border-success/20 dark:bg-success/15 dark:hover:bg-success/25',
  outline: 'bg-transparent border border-light-border dark:border-dark-border hover:border-primary text-light-text-primary dark:text-dark-text-primary hover:text-primary',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs gap-1.5',
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-3.5 py-2 text-xs sm:text-sm gap-2',
  lg: 'px-4 py-2.5 text-sm gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  icon: Icon = null,
  iconRight = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg
        transition-colors duration-180 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && !iconRight && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
          {children}
          {Icon && iconRight && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
