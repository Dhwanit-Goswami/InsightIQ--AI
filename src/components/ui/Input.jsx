import React, { forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon: Icon,
  iconRight: IconRight,
  type = 'text',
  placeholder,
  className = '',
  containerClass = '',
  showPasswordToggle = false,
  showPassword,
  onTogglePassword,
  ...props
}, ref) => {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClass}`}>
      {label && (
        <label className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted pointer-events-none z-10">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={showPasswordToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`
            input-field
            ${Icon ? 'pl-10' : ''}
            ${showPasswordToggle || IconRight ? 'pr-10' : ''}
            ${error ? 'border-danger focus:border-danger focus:ring-danger/20' : ''}
            ${className}
          `}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer z-10"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
          </button>
        )}
        {IconRight && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted pointer-events-none">
            <IconRight className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-danger flex items-center gap-1 font-medium">{error}</p>}
      {hint && !error && <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
