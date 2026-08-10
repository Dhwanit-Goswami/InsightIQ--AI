import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      {/* Modal Dialog */}
      <div className={`
        relative w-full bg-light-card dark:bg-dark-card rounded-2xl
        shadow-card-lg dark:shadow-card-lg-dark border border-light-border dark:border-dark-border
        animate-fade-up overflow-hidden
        ${sizes[size] || sizes.md}
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-light-border dark:border-dark-border">
          <div>
            <h2 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">{title}</h2>
            {subtitle && <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-5">{children}</div>
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
