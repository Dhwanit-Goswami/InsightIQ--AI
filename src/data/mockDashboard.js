// ─── Dashboard KPIs (Indian Business Context — ₹ Scale per Section 15 & 40) ────
export const kpiData = {
  revenue: {
    value: '₹24.8L',
    change: '+12.4%',
    trend: 'up',
    label: 'Revenue',
    period: 'vs last month',
    tooltip: 'Total gross revenue collected across Indian regional hubs this month'
  },
  profit: {
    value: '₹6.4L',
    change: '+8.7%',
    trend: 'up',
    label: 'Profit',
    period: 'vs last month',
    tooltip: 'Net operating profit after variable costs and GST deductions'
  },
  expenses: {
    value: '₹18.4L',
    change: '+3.2%',
    trend: 'down',
    label: 'Expenses',
    period: 'vs last month',
    tooltip: 'Operating expenses including infrastructure, logistics, and payroll'
  },
  businessHealth: {
    value: '82/100',
    change: '+4 pts',
    trend: 'up',
    label: 'Business Health',
    period: 'composite score',
    tooltip: 'Operational stability, margin resilience, and cash flow health rating'
  },

  // Supporting metrics for secondary views
  customers: { value: '1,420', change: '+8.9%', trend: 'up', label: 'Active Clients', period: 'vs last month' },
  orders: { value: '3,842', change: '+15.3%', trend: 'up', label: 'Orders Processed', period: 'this month' },
  inventory: { value: '98,240', change: '-2.1%', trend: 'down', label: 'Units in Stock', period: 'vs last week' },
};

export const quickActions = [
  { id: 'report', label: 'Generate Report', icon: 'FiFileText' },
  { id: 'ai', label: 'Ask AI Analyst', icon: 'FiCpu' },
  { id: 'forecast', label: 'Revenue Forecast', icon: 'FiTrendingUp' },
  { id: 'export', label: 'Export Data', icon: 'FiDownload' },
];

export const aiPrimaryInsight = {
  headline: 'Revenue increased 12.4% this month.',
  whyChanged: 'Retail orders increased across Mumbai and Pune hubs (+24% order frequency). B2B wholesale demand also remained steady.',
  recommendedAction: 'Review inventory levels for the highest-performing category before festive demand to avoid stockouts in Gujarat and Maharashtra belts.',
  confidence: 91,
  confidenceBasis: '3,842 sales records, 12 months of historical data',
  sources: 'Sales + Inventory data',
  category: 'Revenue & Inventory',
};

export const aiSummary = {
  headline: 'Revenue increased 12.4% this month across Indian operations.',
  body: 'Your business is demonstrating sustained operating performance. Revenue expanded to ₹24.8L with net margin holding at 25.8%. B2B client reorder rates in Western zones accelerated by 18%, while operational expenses were held within 3.2% of target budget.',
  highlights: [
    { text: 'Revenue up 12.4% MoM', type: 'positive' },
    { text: 'Client retention solid at 94.2%', type: 'positive' },
    { text: 'Operating expenses stable (+3.2%)', type: 'positive' },
    { text: 'SKU-8821 inventory buffer low in Surat', type: 'warning' },
  ],
  generatedAt: '10 minutes ago',
};

export const recentActivity = [
  { id: 1, type: 'order', message: 'New wholesale order confirmed by Arvind Textiles Pvt. Ltd.', amount: '₹4.8L', time: '12 min ago', status: 'success' },
  { id: 2, type: 'alert', message: 'Stock buffer threshold reached for SKU-8821 (Surat Hub)', amount: null, time: '34 min ago', status: 'warning' },
  { id: 3, type: 'payment', message: 'Invoice settlement received from NovaMart Retail Pvt. Ltd.', amount: '₹2.4L', time: '1 hr ago', status: 'success' },
  { id: 4, type: 'customer', message: 'Corporate account agreement initiated: Shreeji Foods Pvt. Ltd.', amount: null, time: '2 hr ago', status: 'info' },
  { id: 5, type: 'report', message: 'Monthly GST filing & P&L audit statement compiled', amount: null, time: '3 hr ago', status: 'info' },
  { id: 6, type: 'alert', message: 'Dispatch schedule adjusted for BluePeak Logistics transit', amount: null, time: '4 hr ago', status: 'info' },
];
