import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiDownload, FiArrowRight } from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import AIResponseCard from '../components/ui/AIResponseCard';
import { AreaChartWidget, DonutChartWidget } from '../components/charts/Charts';
import { getDashboardKPIs, getAIPrimaryInsight, getRecentActivity, getMonthlyRevenue, getExpenseBreakdown } from '../services/api';
import { exportToCSV } from '../utils/exportUtils';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [primaryInsight, setPrimaryInsight] = useState(null);
  const [activities, setActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('September 2026');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [kpiRes, aiRes, actRes, revRes, expRes] = await Promise.all([
          getDashboardKPIs(),
          getAIPrimaryInsight(),
          getRecentActivity(),
          getMonthlyRevenue(),
          getExpenseBreakdown(),
        ]);
        setKpis(kpiRes.data);
        setPrimaryInsight(aiRes.data);
        setActivities(actRes.data);
        // Format revenue data for charts in ₹ Lakhs
        const chartFormatted = (revRes.data || []).map(d => ({
          month: d.month,
          revenue: Number((d.revenue / 100000).toFixed(1)),
          profit: Number((d.profit / 100000).toFixed(1)),
          expenses: Number((d.expenses / 100000).toFixed(1)),
        }));
        setRevenueData(chartFormatted);
        setExpenses(expRes.data || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportSummary = () => {
    const exportRows = [
      { Metric: 'Revenue', Current: kpis?.revenue?.value, Variance: kpis?.revenue?.change, Period: kpis?.revenue?.period },
      { Metric: 'Profit', Current: kpis?.profit?.value, Variance: kpis?.profit?.change, Period: kpis?.profit?.period },
      { Metric: 'Expenses', Current: kpis?.expenses?.value, Variance: kpis?.expenses?.change, Period: kpis?.expenses?.period },
      { Metric: 'Business Health', Current: kpis?.businessHealth?.value, Variance: kpis?.businessHealth?.change, Period: kpis?.businessHealth?.period },
      { Metric: 'Key Insight', Current: primaryInsight?.headline, Variance: `Confidence: ${primaryInsight?.confidence}%`, Period: primaryInsight?.sources },
    ];
    exportToCSV(exportRows, `Business_Overview_${timeRange.replace(/\s+/g, '_')}.csv`);
  };

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 text-xs text-light-text-muted dark:text-dark-text-muted font-normal mb-0.5">
            <span>Business overview</span>
            <span>•</span>
            <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">{timeRange}</span>
          </div>
          <h1 className="page-title">{getGreeting()}, Dhwanit</h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select pl-8"
            >
              <option value="September 2026">September 2026</option>
              <option value="August 2026">August 2026</option>
              <option value="Q3 FY26">Q3 FY26</option>
              <option value="FY 2025-26 YTD">FY 2025-26 YTD</option>
            </select>
            <FiCalendar className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-light-text-muted dark:text-dark-text-muted pointer-events-none" />
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportSummary}
            className="flex items-center gap-1.5"
          >
            <FiDownload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>

      {/* ─── Primary KPIs (4 Above the Fold) ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          label="Revenue"
          value={kpis?.revenue?.value ?? '₹24.8L'}
          change={kpis?.revenue?.change ?? '+12.4%'}
          trend={kpis?.revenue?.trend ?? 'up'}
          period={kpis?.revenue?.period ?? 'vs last month'}
          tooltip="Gross billings settled across regional business accounts"
        />
        <StatCard
          loading={loading}
          label="Profit"
          value={kpis?.profit?.value ?? '₹6.4L'}
          change={kpis?.profit?.change ?? '+8.7%'}
          trend={kpis?.profit?.trend ?? 'up'}
          period={kpis?.profit?.period ?? 'vs last month'}
          tooltip="Operating profit after fulfillment, taxes, and vendor deductions"
        />
        <StatCard
          loading={loading}
          label="Expenses"
          value={kpis?.expenses?.value ?? '₹18.4L'}
          change={kpis?.expenses?.change ?? '+3.2%'}
          trend={kpis?.expenses?.trend ?? 'down'}
          period={kpis?.expenses?.period ?? 'vs last month'}
          tooltip="Total expenditures including cloud infrastructure, transit, and payroll"
        />
        <StatCard
          loading={loading}
          label="Business Health"
          value={kpis?.businessHealth?.value ?? '82/100'}
          change={kpis?.businessHealth?.change ?? '+4 pts'}
          trend={kpis?.businessHealth?.trend ?? 'up'}
          period={kpis?.businessHealth?.period ?? 'composite score'}
          tooltip="Composite metric evaluated across margin resilience and cash flow"
        />
      </div>

      {/* ─── AI Primary Insight ─── */}
      {primaryInsight && (
        <AIResponseCard
          headline={primaryInsight.headline}
          whyChanged={primaryInsight.whyChanged}
          recommendedAction={primaryInsight.recommendedAction}
          confidence={primaryInsight.confidence}
          confidenceBasis={primaryInsight.confidenceBasis}
          sources={primaryInsight.sources}
          category={primaryInsight.category}
          actionLabel="Review Category Inventory"
          onAction={() => navigate('/inventory')}
        />
      )}

      {/* ─── Business Performance Charts ─── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="section-label">Business Performance</p>
            <h2 className="section-title mt-0.5">Revenue & Profit Trends</h2>
          </div>
          <button
            onClick={() => navigate('/analytics')}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer flex-shrink-0"
          >
            <span>Deep analytics</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Revenue Chart */}
        <Card padding={true} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-light-border dark:border-dark-border">
            <div>
              <p className="section-label">Primary Financial Trajectory</p>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">
                Revenue & Profit Trend — ₹ Lakhs
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs flex-shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
                <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-success flex-shrink-0" />
                <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Net Profit</span>
              </div>
            </div>
          </div>
          <div className="h-[280px] w-full min-h-[280px]">
            {loading ? (
              <div className="h-full rounded-lg shimmer" />
            ) : (
              <AreaChartWidget
                data={revenueData}
                keys={[
                  { key: 'revenue', name: 'Revenue (₹L)', color: '#5278A6' },
                  { key: 'profit', name: 'Net Profit (₹L)', color: '#5A8065' },
                ]}
                formatter={(v) => `₹${v}L`}
              />
            )}
          </div>
        </Card>

        {/* Secondary grid: Expenses Donut + Activity Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Operational Expenditure Donut */}
          <Card padding={true} className="flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-light-border dark:border-dark-border flex-shrink-0">
              <div>
                <p className="section-label">Secondary</p>
                <h4 className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">
                  Operational Expenditure
                </h4>
              </div>
              <Badge variant="neutral">₹18.4L</Badge>
            </div>
            <div className="h-[220px] min-h-[220px] flex-1">
              {loading ? (
                <div className="h-full rounded-lg shimmer" />
              ) : (
                <DonutChartWidget
                  data={expenses}
                  centerLabel="Monthly Spend"
                  centerValue="₹18.4L"
                />
              )}
            </div>
          </Card>

          {/* Recent Commercial Events */}
          <Card padding={true} className="lg:col-span-2 flex flex-col">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-light-border dark:border-dark-border flex-shrink-0">
              <div>
                <p className="section-label">Operational Activity</p>
                <h4 className="text-xs sm:text-sm font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">
                  Recent Commercial Events
                </h4>
              </div>
              <button
                onClick={() => navigate('/sales')}
                className="text-xs text-primary hover:underline font-medium cursor-pointer flex-shrink-0"
              >
                All transactions
              </button>
            </div>

            <div className="divide-y divide-light-border dark:divide-dark-border flex-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="w-1.5 h-1.5 rounded-full shimmer flex-shrink-0" />
                      <div className="h-3 rounded shimmer flex-1" />
                    </div>
                    <div className="h-3 w-16 rounded shimmer" />
                  </div>
                ))
              ) : (
                activities.slice(0, 5).map((a) => (
                  <div key={a.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        a.status === 'success' ? 'bg-success' : a.status === 'warning' ? 'bg-warning' : 'bg-primary'
                      }`} />
                      <span className="text-light-text-primary dark:text-dark-text-primary font-medium truncate">
                        {a.message}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-right">
                      {a.amount && (
                        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {a.amount}
                        </span>
                      )}
                      <span className="text-[11px] text-light-text-muted dark:text-dark-text-muted whitespace-nowrap">
                        {a.time}
                      </span>
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

export default Dashboard;
