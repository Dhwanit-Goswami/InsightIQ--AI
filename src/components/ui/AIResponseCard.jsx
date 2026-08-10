import React from 'react';
import { FiZap, FiTrendingUp, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import Badge from './Badge';

const typeConfig = {
  prediction: { label: 'Prediction', icon: FiTrendingUp, variant: 'success' },
  risk: { label: 'Risk Alert', icon: FiAlertTriangle, variant: 'warning' },
  opportunity: { label: 'Opportunity', icon: FiZap, variant: 'primary' },
  market: { label: 'Market Trend', icon: FiActivity, variant: 'neutral' },
  growth: { label: 'Growth', icon: FiTrendingUp, variant: 'primary' },
  health: { label: 'Health', icon: FiActivity, variant: 'success' },
};

const confidenceColors = {
  high: 'text-success',
  medium: 'text-warning',
  low: 'text-danger',
};

const AIResponseCard = ({
  type = 'prediction',
  title,
  summary,
  confidence,
  impact,
  details = [],
  actions = [],
  className = '',
  expanded = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(expanded);
  const config = typeConfig[type] || typeConfig.prediction;
  const TypeIcon = config.icon;

  const confidenceLevel = confidence >= 85 ? 'high' : confidence >= 70 ? 'medium' : 'low';

  const impactVariant = {
    high: 'danger',
    medium: 'warning',
    low: 'success',
  }[impact] || 'neutral';

  return (
    <div className={`bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card dark:shadow-card-dark hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-primary/10 dark:bg-primary/20 text-primary dark:text-white border border-primary/20">
            <TypeIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge variant={config.variant}>
                {config.label}
              </Badge>
              <Badge variant={impactVariant} dot>{impact} impact</Badge>
            </div>
            <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">{title}</h3>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className={`text-base font-bold ${confidenceColors[confidenceLevel]}`}>{confidence}%</div>
          <div className="text-[10px] text-light-text-muted dark:text-dark-text-muted">confidence</div>
        </div>
      </div>

      {/* Summary */}
      <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-3">{summary}</p>

      {/* Details */}
      {isExpanded && details.length > 0 && (
        <ul className="space-y-1.5 mb-3 pl-3 border-l-2 border-primary/30 my-3 py-1">
          {details.map((d, i) => (
            <li key={i} className="text-xs text-light-text-muted dark:text-dark-text-muted flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">•</span>
              {d}
            </li>
          ))}
        </ul>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t border-light-border dark:border-dark-border">
        <button
          onClick={() => setIsExpanded(p => !p)}
          className="text-xs font-medium text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
        >
          {isExpanded ? 'Hide details' : 'View details'}
        </button>
        <div className="flex gap-2">
          {actions.slice(0, 2).map((action, i) => (
            <button
              key={i}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                i === 0
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-white hover:bg-primary/20 border border-primary/20'
                  : 'bg-light-surface dark:bg-dark-surface text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary border border-light-border dark:border-dark-border'
              }`}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIResponseCard;
