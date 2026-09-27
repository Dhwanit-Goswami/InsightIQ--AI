import React from 'react';
import { FiInbox, FiAlertCircle } from 'react-icons/fi';
import Button from './Button';

export const EmptyState = ({
  title = 'No business records found',
  description = 'Connect your ERP or sales channels to start tracking real-time performance.',
  icon: Icon = FiInbox,
  actionText,
  onAction,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-14 px-6 text-center ${className}`}>
    <div className="w-12 h-12 rounded-xl bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center mb-3 text-light-text-muted dark:text-dark-text-muted">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 tracking-tight">
      {title}
    </h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mb-4 leading-relaxed">
      {description}
    </p>
    {actionText && onAction && (
      <Button variant="primary" size="sm" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

export const ErrorState = ({
  title = 'Something went wrong',
  description = "We couldn't load your business data. Please verify your connection or try again.",
  onRetry,
  className = '',
}) => (
  <div className={`flex flex-col items-center justify-center py-12 px-6 text-center ${className}`}>
    <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-3 text-danger">
      <FiAlertCircle className="w-5 h-5" />
    </div>
    <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mb-1 tracking-tight">
      {title}
    </h3>
    <p className="text-xs text-light-text-muted dark:text-dark-text-muted mb-4 max-w-sm leading-relaxed">
      {description}
    </p>
    {onRetry && (
      <Button variant="secondary" size="sm" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

export default EmptyState;
