// ─── Reports Data (Indian Business Context) ─────────────────────
export const financialReports = [
  { id: 1, name: 'Q3 FY25 Financial Audit Summary', type: 'Financial', date: 'Oct 1, 2025', size: '2.4 MB', status: 'Ready', pages: 24 },
  { id: 2, name: 'Monthly P&L & GST Filing — Sep 2025', type: 'Financial', date: 'Sep 30, 2025', size: '1.8 MB', status: 'Ready', pages: 18 },
  { id: 3, name: 'Annual Financial Audit Report FY24', type: 'Financial', date: 'Jan 15, 2025', size: '5.2 MB', status: 'Ready', pages: 48 },
  { id: 4, name: 'Working Capital & Cash Flow Q2 FY25', type: 'Financial', date: 'Jul 5, 2025', size: '1.6 MB', status: 'Ready', pages: 16 },
  { id: 5, name: 'Budget vs Actuals Audit H1 FY25', type: 'Financial', date: 'Jul 1, 2025', size: '2.1 MB', status: 'Ready', pages: 22 },
];

export const performanceReports = [
  { id: 6, name: 'Regional Hub Performance Q3 FY25', type: 'Performance', date: 'Sep 28, 2025', size: '1.2 MB', status: 'Ready', pages: 14 },
  { id: 7, name: 'Enterprise Sales Team KPI Audit', type: 'Performance', date: 'Sep 25, 2025', size: '980 KB', status: 'Ready', pages: 10 },
  { id: 8, name: 'Client Satisfaction Index Survey', type: 'Performance', date: 'Sep 20, 2025', size: '1.4 MB', status: 'Processing', pages: 16 },
  { id: 9, name: 'Supply Chain Operational Efficiency', type: 'Performance', date: 'Sep 15, 2025', size: '1.7 MB', status: 'Ready', pages: 20 },
];

export const growthReports = [
  { id: 10, name: 'Tier-2 Cities Market Expansion Analysis', type: 'Growth', date: 'Oct 3, 2025', size: '3.1 MB', status: 'Ready', pages: 32 },
  { id: 11, name: 'Corporate Account Acquisition Trends', type: 'Growth', date: 'Sep 22, 2025', size: '2.3 MB', status: 'Ready', pages: 24 },
  { id: 12, name: 'Product Growth & Compliance Roadmap', type: 'Growth', date: 'Sep 10, 2025', size: '4.2 MB', status: 'Ready', pages: 40 },
  { id: 13, name: 'AI Decision Engine Usage Metrics', type: 'Growth', date: 'Aug 30, 2025', size: '2.8 MB', status: 'Ready', pages: 28 },
];

export const allReports = [...financialReports, ...performanceReports, ...growthReports];
