import React, { useState, useEffect } from 'react';
import { getAIInsights, getAIRecommendations, getBusinessHealthScores } from '../services/api';
import Card from '../components/ui/Card';
import AIResponseCard from '../components/ui/AIResponseCard';
import { FiCheck, FiZap, FiActivity } from 'react-icons/fi';

const AIInsights = () => {
  const [insights, setInsights] = useState([]);
  const [recs, setRecs] = useState([]);
  const [healthScores, setHealthScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [insRes, recRes, healRes] = await Promise.all([
          getAIInsights(),
          getAIRecommendations(),
          getBusinessHealthScores()
        ]);
        setInsights(insRes.data);
        setRecs(recRes.data);
        setHealthScores(healRes.data);
      } catch (err) {
        console.error('Error fetching AI insights', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">AI Insights Portal</h1>
        <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Autonomous forecasting, risk alerts, and operational health monitoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Insights List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary flex items-center gap-2">
            <FiZap className="text-primary w-4 h-4" />
            Active Intelligence & Operational Alerts
          </h2>
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-light-card dark:bg-dark-card p-5 rounded-2xl h-44 shimmer" />
            ))
          ) : (
            insights.map((item) => (
              <AIResponseCard
                key={item.id}
                type={item.type}
                title={item.title}
                summary={item.summary}
                confidence={item.confidence}
                impact={item.impact}
                details={item.details}
                actions={item.actions}
              />
            ))
          )}
        </div>

        {/* Sidebar: Action Priorities & Health Metrics */}
        <div className="space-y-6">
          {/* Action Priorities */}
          <Card>
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiCheck className="text-success w-4 h-4" />
              AI Recommended Actions
            </h3>
            <div className="space-y-3.5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 rounded shimmer w-full" />
                    <div className="h-2 rounded shimmer w-1/3" />
                  </div>
                ))
              ) : (
                recs.map((rec) => (
                  <div key={rec.id} className="border-l-2 border-primary/40 pl-3 py-0.5 space-y-1">
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-snug font-medium">{rec.text}</p>
                    <div className="flex gap-2 items-center">
                      <span className={`text-[9px] uppercase font-bold ${
                        rec.priority === 'critical'
                          ? 'text-danger'
                          : rec.priority === 'high'
                            ? 'text-warning'
                            : 'text-light-text-muted dark:text-dark-text-muted'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span className="text-[9px] text-light-text-muted dark:text-dark-text-muted">• Impact: {rec.impact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Health Index Breakdown */}
          <Card>
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiActivity className="text-primary w-4 h-4" />
              Health Score Breakdown
            </h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-3 rounded shimmer w-2/3" />
                    <div className="h-3 rounded shimmer w-1/12" />
                  </div>
                ))
              ) : (
                healthScores.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary">{h.category}</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{h.score}%</span>
                    </div>
                    <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${h.score}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
