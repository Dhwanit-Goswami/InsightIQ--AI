// ─── Dashboard KPIs (Indian Business Context — ₹ Scale) ────────────────
export const kpiData = {
  revenue: { value: '₹4.82Cr', change: '+18.4%', trend: 'up', label: 'Total Revenue', period: 'vs last quarter' },
  profit: { value: '₹1.24Cr', change: '+12.7%', trend: 'up', label: 'Net Profit', period: 'vs last quarter' },
  expenses: { value: '₹3.58Cr', change: '-4.2%', trend: 'down', label: 'Total Expenses', period: 'vs last quarter' },
  cashFlow: { value: '₹89.0L', change: '+22.1%', trend: 'up', label: 'Cash Flow', period: 'vs last quarter' },
  customers: { value: '12,847', change: '+8.9%', trend: 'up', label: 'Active Clients', period: 'vs last month' },
  orders: { value: '3,421', change: '+15.3%', trend: 'up', label: 'Total Orders', period: 'this month' },
  inventory: { value: '98,240', change: '-2.1%', trend: 'down', label: 'Inventory Units', period: 'vs last week' },
  employees: { value: '247', change: '+3', trend: 'up', label: 'Employees', period: 'this month' },
  growth: { value: '18.4%', change: '+5.2%', trend: 'up', label: 'YoY Growth', period: 'year over year' },
  businessHealth: { value: 87, label: 'Business Health Score', grade: 'A', description: 'Strong operational efficiency across regional hubs' },
  aiConfidence: { value: 94, label: 'AI Confidence Score', description: 'High probability in Q4 forecasting models' },
  riskScore: { value: 23, label: 'Risk Score', grade: 'Low', description: 'Low operational & financial risk' },
};

export const quickActions = [
  { id: 'report', label: 'Generate Report', icon: 'FiFileText', color: 'primary' },
  { id: 'ai', label: 'Ask AI', icon: 'FiZap', color: 'slate' },
  { id: 'forecast', label: 'Revenue Forecast', icon: 'FiTrendingUp', color: 'green' },
  { id: 'export', label: 'Export Data', icon: 'FiDownload', color: 'amber' },
];

export const aiSummary = {
  headline: 'Strong Q3 Performance — Revenue up 18.4% across Indian Operations',
  body: 'Your enterprise is performing strongly this quarter. Total revenue reached ₹4.82Cr, driven primarily by a 23% expansion in B2B tier customer acquisitions in Mumbai and Bengaluru hubs. Client retention remains solid at 94.2%. AI models project Q4 revenue between ₹5.2Cr – ₹5.8Cr if current operational momentum is maintained.',
  highlights: [
    { text: 'Revenue up 18.4% QoQ', type: 'positive' },
    { text: 'Client retention at 94.2%', type: 'positive' },
    { text: 'Operating expenses reduced by 4.2%', type: 'positive' },
    { text: 'Surat hub inventory slightly below target', type: 'warning' },
  ],
  generatedAt: '2 minutes ago',
};

export const recentActivity = [
  { id: 1, type: 'order', message: 'New B2B contract with Arvind Textiles Pvt. Ltd.', amount: '₹24.5L', time: '5 min ago', status: 'success' },
  { id: 2, type: 'alert', message: 'Inventory buffer low for SKU-8821 (Pune Hub)', amount: null, time: '18 min ago', status: 'warning' },
  { id: 3, type: 'payment', message: 'Invoice payment received from NovaMart Retail', amount: '₹12.8L', time: '34 min ago', status: 'success' },
  { id: 4, type: 'customer', message: 'New corporate account onboarded: Shreeji Foods', amount: null, time: '1 hr ago', status: 'info' },
  { id: 5, type: 'report', message: 'GST & Monthly financial audit report generated', amount: null, time: '2 hr ago', status: 'info' },
  { id: 6, type: 'alert', message: 'Working capital projections updated by AI', amount: null, time: '3 hr ago', status: 'info' },
];
