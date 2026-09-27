import React, { useState, useEffect } from 'react';
import {
  FiFilter, FiDownload, FiCalendar, FiMapPin,
  FiLayers
} from 'react-icons/fi';
import {
  getMonthlyRevenue, getExpenseBreakdown, getCustomerGrowth,
  getQuarterlyComparison, getTopProducts
} from '../services/api';
import Card from '../components/ui/Card';
import ChartCard from '../components/ui/ChartCard';
import StatCard from '../components/ui/StatCard';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';
import {
  AreaChartWidget, LineChartWidget, BarChartWidget,
  DonutChartWidget
} from '../components/charts/Charts';
import { exportToCSV } from '../utils/exportUtils';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [custGrowth, setCustGrowth] = useState([]);
  const [quartComp, setQuartComp] = useState([]);
  const [products, setProducts] = useState([]);

  // Filters (Section 20)
  const [periodFilter, setPeriodFilter] = useState('Last 12 Months');
  const [regionFilter, setRegionFilter] = useState('All Hubs');
  const [segmentFilter, setSegmentFilter] = useState('All Segments');
  const [tableSearch, setTableSearch] = useState('');
  const [secondaryTab, setSecondaryTab] = useState('growth'); // 'growth' | 'expenses' | 'variance'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rev, exp, cust, quart, prod] = await Promise.all([
          getMonthlyRevenue(),
          getExpenseBreakdown(),
          getCustomerGrowth(),
          getQuarterlyComparison(),
          getTopProducts(),
        ]);

        // Format revenue in ₹ Lakhs for clean chart scaling
        const formattedRev = (rev.data || []).map(d => ({
          month: d.month,
          revenue: Number((d.revenue / 100000).toFixed(1)),
          profit: Number((d.profit / 100000).toFixed(1)),
          expenses: Number((d.expenses / 100000).toFixed(1)),
        }));

        setRevenueData(formattedRev);
        setExpenses(exp.data || []);
        setCustGrowth(cust.data || []);
        setQuartComp(quart.data || []);
        setProducts(prod.data || []);
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportData = () => {
    const exportRows = products.map(p => ({
      'Solution Name': p.name,
      'Revenue Generated (₹)': p.revenue,
      'YoY Growth': `+${p.growth}%`,
      'Active Client Units': p.units,
      'Reporting Period': periodFilter,
      'Regional Scope': regionFilter,
    }));
    exportToCSV(exportRows, `Analytics_Dataset_${periodFilter.replace(/\s+/g, '_')}.csv`);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const productCols = [
    {
      key: 'name',
      label: 'Product / Solution',
      sortable: true,
      render: (v) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">{v}</span>
    },
    {
      key: 'revenue',
      label: 'Gross Revenue',
      sortable: true,
      render: (v) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">₹{(v / 100000).toFixed(1)}L</span>
    },
    {
      key: 'growth',
      label: 'Annual Growth',
      sortable: true,
      render: (v) => <span className="text-success font-medium">+{v}%</span>
    },
    {
      key: 'units',
      label: 'Active Enterprise Seats',
      sortable: true,
      render: (v) => <span>{v.toLocaleString('en-IN')} seats</span>
    },
  ];

  return (
    <div className="space-y-6">
      {/* ─── Page Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial & Operational Analytics</h1>
          <p className="page-subtitle">Multi-dimensional business performance and growth analysis.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportData}
          className="flex items-center gap-1.5 flex-shrink-0 self-start sm:self-auto"
        >
          <FiDownload className="w-3.5 h-3.5" />
          <span>Export Analytics</span>
        </Button>
      </div>

      {/* ─── Filter Bar ─── */}
      <div className="filter-bar">
        <div className="flex items-center gap-1.5 text-light-text-muted dark:text-dark-text-muted font-medium pr-3 border-r border-light-border dark:border-dark-border">
          <FiFilter className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs">Filters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <FiCalendar className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
          <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="filter-select">
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Q3 FY26">Q3 FY26</option>
            <option value="Last 12 Months">Last 12 Months</option>
            <option value="FY 2025-26 YTD">FY 2025-26 YTD</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <FiMapPin className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} className="filter-select">
            <option value="All Hubs">All Regions</option>
            <option value="Mumbai Hub">Mumbai & MMR</option>
            <option value="Pune Hub">Pune Belt</option>
            <option value="Bengaluru Hub">Bengaluru Tech Hub</option>
            <option value="Gujarat Belt">Gujarat Industrial Belt</option>
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <FiLayers className="w-3.5 h-3.5 text-light-text-muted dark:text-dark-text-muted" />
          <select value={segmentFilter} onChange={(e) => setSegmentFilter(e.target.value)} className="filter-select">
            <option value="All Segments">All Segments</option>
            <option value="Enterprise B2B">Enterprise B2B</option>
            <option value="SME Pro Tier">SME Pro Tier</option>
            <option value="Retail Accounts">Retail Accounts</option>
          </select>
        </div>
      </div>

      {/* ─── 3. Primary KPI Row (Section 20) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          loading={loading}
          label="Gross Revenue Analyzed"
          value="₹1.42Cr"
          change="+16.8%"
          trend="up"
          period="vs prior year period"
          tooltip="Cumulative invoiced billings across selected regional parameters"
        />
        <StatCard
          loading={loading}
          label="Blended Gross Margin"
          value="26.2%"
          change="+2.4%"
          trend="up"
          period="target: 25.0%"
          tooltip="Average margin after variable cloud compute, freight, and licensing"
        />
        <StatCard
          loading={loading}
          label="Net Client Retention"
          value="94.2%"
          change="+1.8%"
          trend="up"
          period="12-month cohort"
          tooltip="Corporate customer renewals and expansion ARR persistence"
        />
        <StatCard
          loading={loading}
          label="Average Contract ARR"
          value="₹14.8L"
          change="+8.5%"
          trend="up"
          period="per enterprise account"
          tooltip="Annualized contract value across top tier corporate partnerships"
        />
      </div>

      {/* ─── 4. Primary Chart (Section 20: Large Revenue & Net Profit Trend) ─── */}
      <ChartCard
        title="Revenue & Net Profit Velocity"
        subtitle="12-month trajectory showing monthly revenue vs net operating margin (₹ Lakhs)."
        loading={loading}
        badge="Primary Trajectory"
        height={300}
      >
        <AreaChartWidget
          data={revenueData}
          keys={[
            { key: 'revenue', name: 'Revenue (₹L)', color: '#5278A6' },
            { key: 'profit', name: 'Net Profit (₹L)', color: '#5A8065' },
          ]}
          formatter={(v) => `₹${v}L`}
        />
      </ChartCard>

      {/* ─── 5. Secondary Charts with Progressive Disclosure Tabs ─── */}
      <Card padding={true} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-light-border dark:border-dark-border">
          <div>
            <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
              Secondary Analyses
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">
              Operational Sub-dimensions
            </h3>
          </div>

          {/* Progressive Disclosure Tabs */}
          <div className="tab-bar">
            {[
              { id: 'growth', label: 'Client Growth' },
              { id: 'expenses', label: 'Cost Structure' },
              { id: 'variance', label: 'Quarterly Targets' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSecondaryTab(tab.id)}
                className={secondaryTab === tab.id ? 'tab-btn-active' : 'tab-btn'}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content with stable height */}
        <div className="h-[260px] min-h-[260px] animate-fade-in">
          {secondaryTab === 'growth' && (
            <LineChartWidget
              data={custGrowth}
              keys={[{ key: 'newCustomers', name: 'New Clients Onboarded', color: '#5278A6' }]}
            />
          )}
          {secondaryTab === 'expenses' && (
            <DonutChartWidget
              data={expenses}
              centerLabel="Operating Budget"
              centerValue="₹18.4L"
            />
          )}
          {secondaryTab === 'variance' && (
            <BarChartWidget
              data={quartComp}
              keys={[
                { key: 'revenue', name: 'Realized Revenue', color: '#5278A6' },
                { key: 'target', name: 'Quarterly Target', color: '#8A9199' },
              ]}
              formatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`}
            />
          )}
        </div>
      </Card>

      {/* ─── 6. Detailed Table with Progressive Disclosure (Section 20) ─── */}
      <Card padding={true} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-semibold text-light-text-muted dark:text-dark-text-muted uppercase tracking-wider">
              Detailed Breakdown
            </span>
            <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary mt-0.5">
              Solutions & Service Lines Performance
            </h3>
          </div>

          <div className="w-full sm:w-64">
            <SearchBar
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              onClear={() => setTableSearch('')}
              placeholder="Filter solutions..."
            />
          </div>
        </div>

        <Table
          columns={productCols}
          data={filteredProducts}
          loading={loading}
          emptyMessage="No product lines match your search filter."
        />
      </Card>
    </div>
  );
};

export default Analytics;
