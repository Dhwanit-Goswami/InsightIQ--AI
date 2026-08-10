import React from 'react';

const variants = {
  primary: 'bg-primary hover:bg-primary-hover text-white shadow-xs',
  secondary: 'bg-light-surface dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border',
  ghost: 'bg-transparent hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary',
  danger: 'bg-danger-bg dark:bg-danger/20 hover:bg-danger/30 text-danger border border-danger/30',
  success: 'bg-success-bg dark:bg-success/20 hover:bg-success/30 text-success border border-success/30',
  gradient: 'bg-primary hover:bg-primary-hover text-white shadow-xs',
  outline: 'bg-transparent border border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary/20',
};

const sizes = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
  xl: 'px-6 py-3 text-base',
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
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-175 cursor-pointer select-none
        disabled:opacity-50 disabled:cursor-not-allowed
        active:scale-[0.99]
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
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && !iconRight && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconRight && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
