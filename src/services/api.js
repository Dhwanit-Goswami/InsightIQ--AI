import axios from 'axios';
import { kpiData, aiSummary, aiPrimaryInsight, recentActivity, quickActions } from '../data/mockDashboard';
import { monthlyRevenue, expenseBreakdown, customerGrowth, performanceRadar, quarterlyComparison, salesByChannel, topProducts } from '../data/mockAnalytics';
import { aiInsights, aiRecommendations, businessHealthScores, aiChatHistory, suggestedPrompts } from '../data/mockAI';
import { allReports } from '../data/mockReports';
import { companyData } from '../data/mockCompany';
import { userData, mockCustomers } from '../data/mockUser';

// ─── Axios Instance ───────────────────────────────────
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 5000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Error (using mock fallback):', error.message);
    return Promise.reject(error);
  }
);

// ─── Simulate network latency ─────────────────────────
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Dashboard ────────────────────────────────────────
export const getDashboardKPIs = async () => {
  await delay(250);
  return { data: kpiData };
};

export const getAISummary = async () => {
  await delay(350);
  return { data: aiSummary };
};

export const getAIPrimaryInsight = async () => {
  await delay(200);
  return { data: aiPrimaryInsight };
};

export const getRecentActivity = async () => {
  await delay(200);
  return { data: recentActivity };
};

export const getQuickActions = async () => {
  await delay(150);
  return { data: quickActions };
};

// ─── Analytics ───────────────────────────────────────
export const getMonthlyRevenue = async () => {
  await delay(300);
  return { data: monthlyRevenue };
};

export const getExpenseBreakdown = async () => {
  await delay(250);
  return { data: expenseBreakdown };
};

export const getCustomerGrowth = async () => {
  await delay(300);
  return { data: customerGrowth };
};

export const getPerformanceRadar = async () => {
  await delay(200);
  return { data: performanceRadar };
};

export const getQuarterlyComparison = async () => {
  await delay(250);
  return { data: quarterlyComparison };
};

export const getSalesByChannel = async () => {
  await delay(200);
  return { data: salesByChannel };
};

export const getTopProducts = async () => {
  await delay(250);
  return { data: topProducts };
};

// ─── AI Intelligence ─────────────────────────────────
export const getAIInsights = async () => {
  await delay(350);
  return { data: aiInsights };
};

export const getAIRecommendations = async () => {
  await delay(300);
  return { data: aiRecommendations };
};

export const getBusinessHealthScores = async () => {
  await delay(250);
  return { data: businessHealthScores };
};

export const getAIChatHistory = async () => {
  await delay(200);
  return { data: aiChatHistory };
};

export const getSuggestedPrompts = async () => {
  await delay(150);
  return { data: suggestedPrompts };
};

// Section 19: Professional Business Analyst Structured Response
export const sendAIMessage = async (message) => {
  await delay(900);
  const q = message.toLowerCase();

  let structuredResponse = {
    answer: '',
    evidence: '',
    explanation: '',
    recommendation: '',
    sources: 'Tally / ERP Connector + Sales Orders Registry + 12 Months Historical Data',
    confidence: '92% • Sample of 3,842 verified transactions'
  };

  if (q.includes('revenue') && (q.includes('change') || q.includes('month') || q.includes('why'))) {
    structuredResponse = {
      answer: 'Monthly revenue grew 12.4% (to ₹24.8L), driven primarily by retail reorders in Mumbai and Pune hubs.',
      evidence: '• Mumbai hub sales: +18.2% (₹9.8L)\n• Pune hub sales: +14.1% (₹6.4L)\n• Average Order Value (AOV): Increased from ₹58,200 to ₹64,500\n• Top SKU: Enterprise Analytics Suite contributed ₹8.4L',
      explanation: 'Retail demand accelerated ahead of the festive inventory cycle. Reorder frequency among established SMEs increased from 1.2 to 1.8 orders per month, with minimal customer acquisition cost increase.',
      recommendation: 'Pre-allocate 15% additional warehouse inventory in Bhiwandi (Mumbai) and verify logistics lead times with BluePeak Logistics to protect margins.',
      sources: 'Sales Ledger, GST E-Invoicing records, Regional Distribution manifests',
      confidence: '94% • Based on 3,842 invoices across FY25'
    };
  } else if (q.includes('product') || q.includes('underperform')) {
    structuredResponse = {
      answer: 'Two hardware node appliance SKUs are experiencing margin compression and inventory turnover lag.',
      evidence: '• SKU-9901 (Database Mirroring Appliance): Days-Sales-of-Inventory (DSI) reached 68 days (target: 35 days)\n• Gross margin declined 4.2% due to imported component tariffs\n• Return on Capital Employed (ROCE) for hardware tier dropped to 11.4%',
      explanation: 'Clients are increasingly adopting cloud-hosted virtual licenses rather than physical appliances, reducing on-premise hardware renewal rates.',
      recommendation: 'Transition legacy hardware clients to the cloud virtual token tier with an upgrade credit of ₹15,000, phasing out SKU-9901 buffer inventory by Q4.',
      sources: 'Inventory ERP, SKU Margin Analysis, Client Licensing Ledger',
      confidence: '89% • Based on 180-day inventory movement'
    };
  } else if (q.includes('expense') || q.includes('cost')) {
    structuredResponse = {
      answer: 'Total expenses stand at ₹18.4L (+3.2% MoM), with cloud infrastructure and multi-zone logistics representing the largest variance.',
      evidence: '• Cloud & Hosting: ₹8.2L (44.5% of total operating spend)\n• Logistics & Freight: ₹4.8L (26.1%)\n• Sales & Marketing: ₹3.4L (18.5%)\n• General & Admin: ₹2.0L (10.9%)',
      explanation: 'Unreserved cloud instances in AWS Mumbai led to a 14% compute overage. Freight surcharges across Gujarat transport corridors also increased by 8% during seasonal rains.',
      recommendation: 'Switch 60% of persistent database workloads to 1-year Reserved Instances to yield ₹1.8L monthly savings, and consolidate Gujarat freight dispatches bi-weekly.',
      sources: 'Accounting Ledger, AWS CloudWatch Billing, Vendor Invoices',
      confidence: '96% • Verified against bank and cloud audit receipts'
    };
  } else if (q.includes('risk')) {
    structuredResponse = {
      answer: 'Operational risk profile is Low (23/100), but supply chain buffer lag in Western regions requires immediate attention.',
      evidence: '• SKU-8821 stock buffer in Surat is at 8 units (safety stock threshold: 25 units)\n• 3 enterprise clients in textiles sector exhibit payment cycles extending from 30 to 48 days (₹18.4L receivables)\n• Vendor price escalation notice received for packaging raw materials (+6%)',
      explanation: 'Monsoon transport schedules delayed regional freight corridors into Surat. Delayed receivables reflect seasonal working capital cycles in local textile manufacturing.',
      recommendation: 'Trigger expedited transfer of 30 buffer units from Bhiwandi hub and send automated payment reminder with early-settlement 1.5% discount.',
      sources: 'Accounts Receivable Aging Table, Supply Chain Logistics Logs',
      confidence: '91% • Based on 24 months of payment history'
    };
  } else {
    structuredResponse = {
      answer: `Analysis completed for: "${message}". Business metrics indicate healthy operating stability with high customer retention.`,
      evidence: '• Operating margin: 25.8% (Healthy benchmark for Indian SME SaaS)\n• Active client retention: 94.2%\n• Cash runway: 14.8 months at current burn rate',
      explanation: 'Revenue consistency across primary corporate accounts provides predictable cash flow while working capital requirements remain stable.',
      recommendation: 'Focus management attention on Q4 capacity planning and review quarterly audit reports before board review.',
      sources: 'Vardaan Management Database, Consolidated Financial Statements',
      confidence: '90% • Real-time synthesis'
    };
  }

  return {
    data: {
      role: 'assistant',
      structured: structuredResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  };
};

// ─── Reports ─────────────────────────────────────────
export const getReports = async (filters = {}) => {
  await delay(250);
  let filtered = [...allReports];
  if (filters.type && filters.type !== 'All') {
    filtered = filtered.filter(r => r.type === filters.type);
  }
  if (filters.search) {
    filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
  }
  return { data: filtered };
};

// ─── Company ─────────────────────────────────────────
export const getCompanyData = async () => {
  await delay(200);
  return { data: companyData };
};

// ─── Profile ─────────────────────────────────────────
export const getUserProfile = async () => {
  await delay(150);
  return { data: userData };
};

// ─── Customers ───────────────────────────────────────
export const getCustomers = async () => {
  await delay(250);
  return { data: mockCustomers };
};

export default api;
