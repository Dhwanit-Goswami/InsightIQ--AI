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
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightiq_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('insightiq_token');
      localStorage.removeItem('insightiq_user');
    }
    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

const withFallback = async (apiFn, fallback) => {
  try {
    const result = await apiFn();
    return result;
  } catch (err) {
    console.warn('[InsightIQ] API unavailable, using mock data:', err.message);
    return { data: typeof fallback === 'function' ? fallback() : fallback };
  }
};

// ─── Format helpers ───────────────────────────────────
const formatINR = (value) => {
  if (value === null || value === undefined) return '₹0';
  const num = Number(value);
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

const formatKPI = (overview) => {
  if (!overview || !overview.kpis) return kpiData;
  const { kpis } = overview;
  const rev    = kpis.revenue    || {};
  const exp    = kpis.expenses   || {};
  const profit = kpis.net_profit || {};
  return {
    revenue: {
      value:  rev.formatted_value    || formatINR(rev.value)    || kpiData.revenue.value,
      change: rev.change_pct != null ? `${rev.change_pct > 0 ? '+' : ''}${rev.change_pct.toFixed(1)}%` : kpiData.revenue.change,
      trend:  rev.trend              || kpiData.revenue.trend,
      label:  'Revenue',
      period: 'vs last 30 days',
    },
    profit: {
      value:  profit.formatted_value || formatINR(profit.value) || kpiData.profit.value,
      change: profit.change_pct != null ? `${profit.change_pct > 0 ? '+' : ''}${profit.change_pct.toFixed(1)}%` : kpiData.profit.change,
      trend:  profit.trend           || kpiData.profit.trend,
      label:  'Net Profit',
      period: 'vs last 30 days',
    },
    expenses: {
      value:  exp.formatted_value    || formatINR(exp.value)    || kpiData.expenses.value,
      change: exp.change_pct != null ? `${exp.change_pct > 0 ? '+' : ''}${exp.change_pct.toFixed(1)}%` : kpiData.expenses.change,
      trend:  exp.trend              || kpiData.expenses.trend,
      label:  'Expenses',
      period: 'vs last 30 days',
    },
    businessHealth: kpiData.businessHealth,
    customers:      kpiData.customers,
    orders: {
      value:  String(kpis.orders?.value ?? kpiData.orders.value),
      change: kpiData.orders.change,
      trend:  kpiData.orders.trend,
      label:  'Orders',
      period: 'this period',
    },
    inventory: kpiData.inventory,
  };
};

const formatMonthlyTrend = (trend) => {
  if (!trend || !trend.length) return monthlyRevenue;
  return trend.map(d => ({
    month:    d.month || d.period || '',
    revenue:  d.revenue  || 0,
    profit:   d.profit   || 0,
    expenses: d.expenses || 0,
  }));
};

const formatExpenseBreakdown = (breakdown) => {
  if (!breakdown || !breakdown.length) return expenseBreakdown;
  const colors = ['#5278A6', '#5A8065', '#B07040', '#7A5EA6', '#A65278', '#408065'];
  return breakdown.slice(0, 6).map((b, i) => ({
    name:  b.category || b.name || `Category ${i+1}`,
    value: Number(b.amount || b.total || 0),
    color: colors[i % colors.length],
  }));
};

// ─── Auth ─────────────────────────────────────────────
export const loginUser = async (email, password) => {
  return api.post('/auth/login', { email, password });
};

export const getAuthMe = async () => {
  return api.get('/auth/me');
};

// ─── Dashboard ────────────────────────────────────────
export const getDashboardKPIs = async () => {
  return withFallback(async () => {
    const res = await api.get('/dashboard/overview');
    const formatted = formatKPI(res.data);
    return { data: formatted };
  }, kpiData);
};

export const getAISummary = async () => {
  await delay(350);
  return { data: aiSummary };
};

export const getAIPrimaryInsight = async () => {
  return withFallback(async () => {
    // Use first insight from AI engine as the primary insight card
    const res = await api.get('/insights');
    const ins = res.data?.[0];
    if (!ins) return { data: aiPrimaryInsight };
    return {
      data: {
        headline:          ins.title,
        whyChanged:        ins.description,
        recommendedAction: ins.recommendations?.[0]?.action || 'Review this insight in the AI section.',
        confidence:        Math.round((ins.confidence_score || 0.85) * 100),
        confidenceBasis:   'Real-time transactional data analysis',
        sources:           `${ins.category} data`,
        category:          ins.category,
      }
    };
  }, aiPrimaryInsight);
};

export const getRecentActivity = async () => {
  return withFallback(async () => {
    // Use recent sales as activity
    const res = await api.get('/sales?limit=6');
    const items = res.data?.items || res.data || [];
    if (!items.length) return { data: recentActivity };
    const formatted = items.map((s, i) => ({
      id:      s.id || i,
      type:    'order',
      message: `Sale to ${s.customer_name || s.customer_id || 'Customer'} — ${s.product_name || 'Product'}`,
      amount:  formatINR(s.total_amount),
      time:    s.sale_date ? new Date(s.sale_date).toLocaleDateString('en-IN') : 'Recent',
      status:  s.payment_status === 'paid' ? 'success' : s.payment_status === 'pending' ? 'warning' : 'info',
    }));
    return { data: formatted };
  }, recentActivity);
};

export const getQuickActions = async () => {
  await delay(150);
  return { data: quickActions };
};

// ─── Analytics ───────────────────────────────────────
export const getMonthlyRevenue = async () => {
  return withFallback(async () => {
    const res = await api.get('/dashboard/overview');
    const trend = res.data?.monthly_trend || [];
    return { data: formatMonthlyTrend(trend) };
  }, monthlyRevenue);
};

export const getExpenseBreakdown = async () => {
  return withFallback(async () => {
    const res = await api.get('/dashboard/overview');
    const breakdown = res.data?.expense_breakdown || [];
    return { data: formatExpenseBreakdown(breakdown) };
  }, expenseBreakdown);
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
  return withFallback(async () => {
    const res = await api.get('/analytics/products');
    const products = res.data?.top_products || [];
    if (!products.length) return { data: topProducts };
    return { data: products.slice(0, 6).map(p => ({
      name:    p.name,
      revenue: Number(p.total_revenue || 0),
      units:   Number(p.units_sold || 0),
    })) };
  }, topProducts);
};

// ─── AI Intelligence ─────────────────────────────────
export const getAIInsights = async () => {
  return withFallback(async () => {
    // First try to generate fresh ones, then fetch
    try { await api.post('/insights/generate'); } catch (_) {}
    const res = await api.get('/insights');
    const items = Array.isArray(res.data) ? res.data : [];
    if (!items.length) return { data: aiInsights };
    return {
      data: items.map(ins => ({
        id:          ins.id,
        title:       ins.title,
        description: ins.description,
        category:    ins.category,
        severity:    ins.severity || 'medium',
        confidence:  Math.round((ins.confidence_score || 0.85) * 100),
        is_read:     ins.is_read || false,
        recommendations: (ins.recommendations || []).map(r => ({
          action:   r.action,
          priority: r.priority || 'medium',
          status:   r.status   || 'pending',
        })),
        created_at: ins.created_at,
      }))
    };
  }, aiInsights);
};

export const getAIRecommendations = async () => {
  return withFallback(async () => {
    const res = await api.get('/insights/recommendations/all');
    const items = Array.isArray(res.data) ? res.data : [];
    if (!items.length) return { data: aiRecommendations };
    return { data: items };
  }, aiRecommendations);
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

// ─── AI Chat (deterministic structured response) ─────
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
  return withFallback(async () => {
    const res = await api.get('/reports');
    let items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    if (!items.length) return { data: allReports };
    if (filters.type && filters.type !== 'All') {
      items = items.filter(r => r.report_type === filters.type || r.type === filters.type);
    }
    if (filters.search) {
      items = items.filter(r => (r.name || r.title || '').toLowerCase().includes(filters.search.toLowerCase()));
    }
    return { data: items };
  }, () => {
    let filtered = [...allReports];
    if (filters.type && filters.type !== 'All') filtered = filtered.filter(r => r.type === filters.type);
    if (filters.search) filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    return filtered;
  });
};

// ─── Company ─────────────────────────────────────────
export const getCompanyData = async () => {
  return withFallback(async () => {
    const res = await api.get('/auth/me');
    const user = res.data;
    if (!user?.company_id) return { data: companyData };
    const compRes = await api.get(`/companies/${user.company_id}`);
    return { data: compRes.data };
  }, companyData);
};

// ─── Profile ─────────────────────────────────────────
export const getUserProfile = async () => {
  return withFallback(async () => {
    const res = await api.get('/auth/me');
    return { data: res.data };
  }, userData);
};

// ─── Customers ───────────────────────────────────────
export const getCustomers = async () => {
  return withFallback(async () => {
    const res = await api.get('/customers');
    const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    if (!items.length) return { data: mockCustomers };
    return { data: items };
  }, mockCustomers);
};

// ─── Sales ───────────────────────────────────────────
export const getSales = async (params = {}) => {
  return withFallback(async () => {
    const res = await api.get('/sales', { params });
    const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    return { data: items };
  }, []);
};

// ─── Inventory ───────────────────────────────────────
export const getInventory = async (params = {}) => {
  return withFallback(async () => {
    const res = await api.get('/inventory', { params });
    const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    return { data: items };
  }, []);
};

// ─── Expenses ────────────────────────────────────────
export const getExpenses = async (params = {}) => {
  return withFallback(async () => {
    const res = await api.get('/expenses', { params });
    const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
    return { data: items };
  }, []);
};

// ─── Register ────────────────────────────────────────
export const registerUser = async ({ name, email, password, company_name, industry }) => {
  return api.post('/auth/register', { name, email, password, company_name, industry });
};

export default api;
