import React, { useEffect, useCallback } from 'react';
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
    lg: 'max-w-xl',
    xl: 'max-w-3xl',
    full: 'max-w-5xl',
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Dialog */}
      <div className={`
        relative w-full bg-light-card dark:bg-dark-card rounded-2xl
        shadow-card-lg dark:shadow-card-lg-dark border border-light-border dark:border-dark-border
        animate-fade-up overflow-hidden z-10 max-h-[90vh] flex flex-col
        ${sizes[size] || sizes.md}
        ${className}
      `}>
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-light-border dark:border-dark-border flex-shrink-0">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-light-surface dark:hover:bg-dark-surface text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs sm:text-sm">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
