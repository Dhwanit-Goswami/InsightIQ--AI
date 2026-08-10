import React from 'react';
import { FiInbox } from 'react-icons/fi';

export const EmptyState = ({
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  icon: Icon = FiInbox,
  action,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-16 px-8 text-center ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center mb-4 text-light-text-muted dark:text-dark-text-muted">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">{title}</h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-xs mb-4">{description}</p>
    {action}
  </div>
);

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'Failed to load metrics. Please retry.',
  onRetry,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-8 text-center ${className}`}>
    <div className="w-14 h-14 rounded-2xl bg-danger-bg dark:bg-danger/20 border border-danger/30 flex items-center justify-center mb-4">
      <span className="text-xl">⚠️</span>
    </div>
    <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">{title}</h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-4">{description}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary-hover transition-all"
      >
        Try Again
      </button>
    )}
  </div>
);

export default EmptyState;
