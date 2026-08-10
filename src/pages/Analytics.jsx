import React, { useState, useEffect } from 'react';
import {
  getMonthlyRevenue, getExpenseBreakdown, getCustomerGrowth,
  getPerformanceRadar, getQuarterlyComparison, getTopProducts
} from '../services/api';
import Card from '../components/ui/Card';
import ChartCard from '../components/ui/ChartCard';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import {
  AreaChartWidget, LineChartWidget, BarChartWidget,
  DonutChartWidget, RadarChartWidget
} from '../components/charts/Charts';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [custGrowth, setCustGrowth] = useState([]);
  const [radar, setRadar] = useState([]);
  const [quartComp, setQuartComp] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rev, exp, cust, rad, quart, prod] = await Promise.all([
          getMonthlyRevenue(),
          getExpenseBreakdown(),
          getCustomerGrowth(),
          getPerformanceRadar(),
          getQuarterlyComparison(),
          getTopProducts()
        ]);
        setRevenueData(rev.data);
        setExpenses(exp.data);
        setCustGrowth(cust.data);
        setRadar(rad.data);
        setQuartComp(quart.data);
        setProducts(prod.data);
      } catch (err) {
        console.error('Error fetching analytics data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productCols = [
    { key: 'name', label: 'Product Name', sortable: true, render: (v) => <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">{v}</span> },
    { key: 'revenue', label: 'Revenue Generated', sortable: true, render: (v) => <span className="font-medium text-light-text-primary dark:text-dark-text-primary">₹{(v / 100000).toFixed(1)}L</span> },
    { key: 'growth', label: 'YoY Growth', sortable: true, render: (v) => <span className="text-success font-semibold">+{v}%</span> },
    { key: 'units', label: 'Units Sold', sortable: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Business Intelligence Analytics</h1>
        <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Multidimensional performance metrics and operational analytics (in ₹).</p>
      </div>

      {/* Row 1: Area Chart & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Revenue & Net Profit Trend"
          subtitle="Monthly financial breakdown (in ₹ Lakhs)."
          loading={loading}
          className="lg:col-span-2"
        >
          <AreaChartWidget
            data={revenueData}
            keys={[
              { key: 'revenue', name: 'Revenue (₹L)', color: '#5278A6' },
              { key: 'profit', name: 'Net Profit (₹L)', color: '#5A8065' }
            ]}
            formatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
          />
        </ChartCard>

        <ChartCard
          title="Target vs Actual Alignment"
          subtitle="Enterprise operational alignment index."
          loading={loading}
        >
          <RadarChartWidget data={radar} />
        </ChartCard>
      </div>

      {/* Row 2: Customer Growth Line & Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Client Account Acquisitions"
          subtitle="Monthly count of new enterprise customer onboardings."
          loading={loading}
          className="lg:col-span-2"
        >
          <LineChartWidget
            data={custGrowth}
            keys={[{ key: 'newCustomers', name: 'New Clients', color: '#8178A2' }]}
          />
        </ChartCard>

        <ChartCard
          title="Operational Expenditure"
          subtitle="Cost distribution across department heads."
          loading={loading}
        >
          <DonutChartWidget
            data={expenses}
            centerLabel="Total Budget"
            centerValue="₹3.58Cr"
          />
        </ChartCard>
      </div>

      {/* Row 3: Quarterly Target Comparison (Bar) & Top Products Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Quarterly Target Variance"
          subtitle="Comparing realized revenue against targets (₹ Cr)."
          loading={loading}
        >
          <BarChartWidget
            data={quartComp}
            keys={[
              { key: 'revenue', name: 'Actual (₹Cr)', color: '#5278A6' },
              { key: 'target', name: 'Target (₹Cr)', color: '#64748B' }
            ]}
            formatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`}
          />
        </ChartCard>

        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Top Performing Solutions</h3>
              <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">Ranked by annual revenue contribution.</p>
            </div>
            <Badge variant="success">Active Suite</Badge>
          </div>
          <Table
            columns={productCols}
            data={products}
            loading={loading}
          />
        </Card>
      </div>
    </div>
  );
};

export default Analytics;
