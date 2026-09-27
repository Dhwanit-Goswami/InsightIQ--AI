import React, { useState, useEffect } from 'react';
import { getAIInsights, getAIRecommendations, getBusinessHealthScores } from '../services/api';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import AIResponseCard from '../components/ui/AIResponseCard';

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
          getBusinessHealthScores(),
        ]);
        setInsights(insRes.data || []);
        setRecs(recRes.data || []);
        setHealthScores(healRes.data || []);
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
      {/* Ã¢"€Ã¢"€Ã¢"€ Header Ã¢"€Ã¢"€Ã¢"€ */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="page-title">Decision Intelligence & Strategic Insights</h1>
            <Badge variant="ai">Autonomous Analyst</Badge>
          </div>
          <p className="page-subtitle">
            Explainable, high-confidence observations generated from live sales, inventory, and accounts ledgers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ã¢"€Ã¢"€Ã¢"€ Left 2 Columns: Active Insights Stream Ã¢"€Ã¢"€Ã¢"€ */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Active Business Observations</h2>
            <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
              {insights.length} validated findings
            </span>
          </div>

          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border p-5 rounded-xl h-48 shimmer" />
            ))
          ) : (
            insights.map((item) => (
              <AIResponseCard
                key={item.id}
                headline={item.title}
                whyChanged={item.summary}
                recommendedAction={item.details?.[0] || 'Schedule internal review with department heads.'}
                confidence={item.confidence}
                confidenceBasis={item.details?.join(' • ') || 'Multivariate regional dataset'}
                sources="Sales Ledger + Inventory ERP"
                category={item.type === 'risk' ? 'Risk Alert' : item.type === 'prediction' ? 'Forecast' : 'Opportunity'}
                actionLabel={item.actions?.[0] || 'Take Action'}
              />
            ))
          )}
        </div>

        {/* Ã¢"€Ã¢"€Ã¢"€ Right Column: Recommended Actions & Business Health Ã¢"€Ã¢"€Ã¢"€ */}
        <div className="space-y-6">
          {/* Prioritized Actions */}
          <Card padding={true} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                Prioritized Actions
              </h3>
              <Badge variant="neutral">Next 14 Days</Badge>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 rounded shimmer w-full" />
                    <div className="h-2 rounded shimmer w-1/3" />
                  </div>
                ))
              ) : (
                recs.map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-lg bg-light-surface/60 dark:bg-dark-surface/60 border border-light-border dark:border-dark-border space-y-1">
                    <p className="text-xs font-medium text-light-text-primary dark:text-dark-text-primary leading-snug">
                      {rec.text}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-light-text-muted dark:text-dark-text-muted pt-1">
                      <span className={`font-semibold uppercase tracking-wider ${
                        rec.priority === 'critical' ? 'text-danger' : rec.priority === 'high' ? 'text-warning' : 'text-primary'
                      }`}>
                        {rec.priority} priority
                      </span>
                      <span>Impact: {rec.impact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Business Health Dimensions */}
          <Card padding={true} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-light-border dark:border-dark-border">
              <h3 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider">
                Health Dimensions (82/100)
              </h3>
              <Badge variant="success">Grade A</Badge>
            </div>

            <div className="space-y-2.5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-1">
                    <div className="h-3 rounded shimmer w-2/3" />
                    <div className="h-3 rounded shimmer w-1/12" />
                  </div>
                ))
              ) : (
                healthScores.map((h, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{h.category}</span>
                      <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{h.score}%</span>
                    </div>
                    <div className="w-full bg-light-border dark:bg-dark-border rounded-full h-1 overflow-hidden">
                      <div
                        className="h-1 rounded-full bg-primary"
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
