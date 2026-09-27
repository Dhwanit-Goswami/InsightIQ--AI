import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiArrowRight, FiCheck } from 'react-icons/fi';
import Badge from './Badge';

const AIResponseCard = ({
  headline,
  whyChanged,
  recommendedAction,
  confidence = 91,
  confidenceBasis = '3,842 sales records, 12 months of historical data',
  sources = 'Sales + Inventory data',
  impact = 'medium',
  category = 'Revenue',
  actionLabel = 'Review recommended action',
  onAction,
  className = '',
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);

  const handleAction = () => {
    setActionCompleted(true);
    onAction?.();
  };

  return (
    <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-4 sm:p-5 shadow-card dark:shadow-card-dark transition-colors duration-180 hover:border-slate-300 dark:hover:border-slate-600 ${className}`}>
      {/* Top Meta Header: Badge + Category + Source */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="ai" className="text-[10px] font-medium tracking-normal">
            Business insight
          </Badge>
          <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted font-normal">• {category}</span>
          {impact && (
            <Badge variant={impact === 'high' ? 'danger' : impact === 'medium' ? 'warning' : 'neutral'} className="text-[9px] uppercase tracking-wider py-0 px-1.5">
              {impact}
            </Badge>
          )}
        </div>
        <div className="text-[11px] text-light-text-muted dark:text-dark-text-muted">
          Source: <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{sources}</span>
        </div>
      </div>

      {/* Main Headline */}
      <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight leading-snug mb-3">
        {headline}
      </h3>

      {/* Structured Sections: Why It Changed & Recommended Action */}
      <div className="space-y-3 pt-1 border-t border-light-border dark:border-dark-border">
        {/* Why it changed */}
        <div>
          <span className="text-[11px] uppercase tracking-wider font-semibold text-light-text-muted dark:text-dark-text-muted block mb-0.5">
            Why it changed
          </span>
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {whyChanged}
          </p>
        </div>

        {/* Recommended action */}
        <div className="p-3 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-primary block mb-0.5">
            Recommended action
          </span>
          <p className="text-xs text-light-text-primary dark:text-dark-text-primary leading-relaxed font-medium">
            {recommendedAction}
          </p>
        </div>
      </div>

      {/* Expandable Confidence & Data Basis (Section 18) */}
      <div className="mt-3 pt-3 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="flex items-center gap-1.5 text-xs text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer select-none"
          >
            <span>AI confidence:</span>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{confidence}%</span>
            {detailsExpanded ? <FiChevronUp className="w-3.5 h-3.5 ml-0.5" /> : <FiChevronDown className="w-3.5 h-3.5 ml-0.5" />}
          </button>

          {actionCompleted ? (
            <span className="inline-flex items-center gap-1 text-xs text-success font-medium">
              <FiCheck className="w-3.5 h-3.5" /> Action Scheduled
            </span>
          ) : (
            <button
              onClick={handleAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30 dark:text-primary-100 transition-colors cursor-pointer"
            >
              <span>{actionLabel}</span>
              <FiArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {detailsExpanded && (
          <div className="mt-2.5 p-2.5 rounded-lg bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border text-[11px] text-light-text-muted dark:text-dark-text-muted space-y-1 animate-fade-in">
            <p>
              <strong className="text-light-text-secondary dark:text-dark-text-secondary">Data basis:</strong> {confidenceBasis}
            </p>
            <p>
              <strong className="text-light-text-secondary dark:text-dark-text-secondary">Underlying methodology:</strong> Multi-variate regression weighted against regional seasonality and historical customer cohort retention.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIResponseCard;
