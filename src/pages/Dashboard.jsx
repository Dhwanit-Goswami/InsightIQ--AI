import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiTrendingUp, FiTrendingDown, FiDollarSign, FiUsers,
  FiActivity, FiZap, FiCheck, FiArrowRight
} from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { AreaChartWidget } from '../components/charts/Charts';
import { getDashboardKPIs, getAISummary, getRecentActivity } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [aiHeadline, setAiHeadline] = useState('');
  const [aiBody, setAiBody] = useState('');
  const [aiHighlights, setAiHighlights] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Revenue trend data (in ₹ Lakhs)
  const revenueTrendData = [
    { month: 'Jul', revenue: 50.2, expenses: 34.4 },
    { month: 'Aug', revenue: 53.1, expenses: 35.9 },
    { month: 'Sep', revenue: 49.8, expenses: 34.7 },
    { month: 'Oct', revenue: 56.2, expenses: 37.3 },
    { month: 'Nov', revenue: 61.5, expenses: 40.1 },
    { month: 'Dec', revenue: 68.2, expenses: 43.4 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, aiRes, actRes] = await Promise.all([
          getDashboardKPIs(),
          getAISummary(),
          getRecentActivity()
        ]);
        setKpis(kpiRes.data);
        setAiHeadline(aiRes.data.headline);
        setAiBody(aiRes.data.body);
        setAiHighlights(aiRes.data.highlights);
        setActivities(actRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Executive Cockpit</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Real-time financial and operational highlights across regional operations.</p>
        </div>
        <div className="flex gap-2.5">
          <Button variant="secondary" size="sm" onClick={() => navigate('/analytics')}>
            Full Analytics
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/ai-assistant')}>
            <FiZap className="w-3.5 h-3.5" /> Ask AI
          </Button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          label="Total Revenue"
          value={kpis?.revenue.value}
          change={kpis?.revenue.change}
          trend={kpis?.revenue.trend}
          period={kpis?.revenue.period}
          icon={FiDollarSign}
          color="primary"
        />
        <StatCard
          loading={loading}
          label="Net Profit"
          value={kpis?.profit.value}
          change={kpis?.profit.change}
          trend={kpis?.profit.trend}
          period={kpis?.profit.period}
          icon={FiTrendingUp}
          color="green"
        />
        <StatCard
          loading={loading}
          label="Total Expenses"
          value={kpis?.expenses.value}
          change={kpis?.expenses.change}
          trend={kpis?.expenses.trend}
          period={kpis?.expenses.period}
          icon={FiTrendingDown}
          color="red"
        />
        <StatCard
          loading={loading}
          label="Active Clients"
          value={kpis?.customers.value}
          change={kpis?.customers.change}
          trend={kpis?.customers.trend}
          period={kpis?.customers.period}
          icon={FiUsers}
          color="gold"
        />
      </div>

      {/* AI Summary Card */}
      <Card padding={false} className="overflow-hidden relative">
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-5 items-start">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-white flex items-center justify-center flex-shrink-0 border border-primary/20">
            <FiZap className="w-5 h-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">AI Executive Summary</span>
                <Badge variant="info">Q3 Active</Badge>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">{loading ? 'Synthesizing data...' : aiHeadline}</h2>
            </div>
            <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              {loading ? 'Crunching operational metrics and building forecasts...' : aiBody}
            </p>
            {!loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {aiHighlights.map((h, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 ${
                    h.type === 'warning'
                      ? 'bg-warning-bg dark:bg-warning/20 border-warning/30 text-warning'
                      : 'bg-success-bg dark:bg-success/20 border-success/30 text-success'
                  }`}>
                    <FiCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    {h.text}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex-shrink-0 self-end lg:self-center">
            <Button size="sm" variant="primary" onClick={() => navigate('/ai-insights')}>
              Explore Insights
              <FiArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue/Expenses Area Chart */}
        <Card className="lg:col-span-2" padding={true}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Revenue & Expenses Trend</h3>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">Monthly tracking (in ₹ Lakhs) over the last 6 months.</p>
            </div>
            <Badge variant="primary">Monthly</Badge>
          </div>
          <div className="h-[280px]">
            <AreaChartWidget
              data={revenueTrendData}
              keys={[
                { key: 'revenue', name: 'Revenue (₹L)', color: '#5278A6' },
                { key: 'expenses', name: 'Expenses (₹L)', color: '#B76868' }
              ]}
              formatter={(v) => `₹${v}L`}
            />
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding={true}>
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Operational Activity</h3>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">Real-time business events across hubs.</p>
            </div>
          </div>
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="w-2/3 h-3 rounded shimmer" />
                    <div className="w-1/3 h-2 rounded shimmer" />
                  </div>
                </div>
              ))
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border">
                    <FiActivity className={`w-4 h-4 ${
                      a.status === 'success'
                        ? 'text-success'
                        : a.status === 'warning'
                          ? 'text-warning'
                          : 'text-primary'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary leading-tight truncate">{a.message}</p>
                    <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium">{a.time}</span>
                  </div>
                  {a.amount && (
                    <span className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary flex-shrink-0">{a.amount}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Business Performance Metric Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center flex flex-col justify-between py-6">
          <div>
            <h4 className="text-[11px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Business Health Score</h4>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Composite operational & financial weighting</p>
          </div>
          <div className="my-5">
            <span className="text-5xl font-extrabold text-light-text-primary dark:text-dark-text-primary tracking-tight">87</span>
            <span className="text-xl font-bold text-success ml-1">/100</span>
          </div>
          <Badge variant="success" className="mx-auto">Grade A — Excellent</Badge>
        </Card>

        <Card className="text-center flex flex-col justify-between py-6">
          <div>
            <h4 className="text-[11px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">AI Confidence Index</h4>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Prediction probability for Q4 operational targets</p>
          </div>
          <div className="my-5">
            <span className="text-5xl font-extrabold text-light-text-primary dark:text-dark-text-primary tracking-tight">94</span>
            <span className="text-xl font-bold text-primary ml-1">%</span>
          </div>
          <Badge variant="primary" className="mx-auto">Very High Accuracy</Badge>
        </Card>

        <Card className="text-center flex flex-col justify-between py-6">
          <div>
            <h4 className="text-[11px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">Active Risk Index</h4>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Anomalies flagged across supply chain</p>
          </div>
          <div className="my-5">
            <span className="text-5xl font-extrabold text-light-text-primary dark:text-dark-text-primary tracking-tight">23</span>
            <span className="text-xl font-bold text-warning ml-1">/100</span>
          </div>
          <Badge variant="warning" className="mx-auto">Low Risk Profile</Badge>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
