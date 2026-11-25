import axios from 'axios';
import { kpiData, aiSummary, aiPrimaryInsight, recentActivity, quickActions } from '../data/mockDashboard';
import { monthlyRevenue, expenseBreakdown, customerGrowth, performanceRadar, quarterlyComparison, salesByChannel, topProducts } from '../data/mockAnalytics';
import { aiInsights, aiRecommendations, businessHealthScores, aiChatHistory, suggestedPrompts } from '../data/mockAI';
import { allReports } from '../data/mockReports';
import { companyData } from '../data/mockCompany';
import { userData } from '../data/mockUser';

// ─── Axios Instance ───────────────────────────────────
const apiBase = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1';

const api = axios.create({
  baseURL: apiBase,
  timeout: 10000,
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
      const requestUrl = error.config?.url || '';
      const isAuthAttempt = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
      if (!isAuthAttempt) {
        localStorage.removeItem('insightiq_token');
        localStorage.removeItem('insightiq_user');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized', {
            detail: { url: requestUrl, status: 401 }
          }));
        }
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helpers ──────────────────────────────────────────
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

// Explicit demo mode only (e.g. for offline mock showcase)
const isDemoMode = typeof window !== 'undefined' && (
  window.localStorage.getItem('insightiq_demo_mode') === 'true' ||
  import.meta.env?.VITE_DEMO_MODE === 'true'
);

// ─── Format helpers ───────────────────────────────────
export const formatINR = (value) => {
  if (value === null || value === undefined) return '₹0';
  const num = Number(value);
  if (isNaN(num)) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000)   return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000)     return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toFixed(0)}`;
};

export const formatKPI = (overview, days = 90) => {
  const periodText = `vs prior ${days} days`;
  if (!overview || !overview.kpis) {
    return {
      revenue: { value: '₹0', change: '0.0%', trend: 'neutral', label: 'Revenue', period: periodText },
      profit: { value: '₹0', change: '0.0%', trend: 'neutral', label: 'Net Profit', period: periodText },
      expenses: { value: '₹0', change: '0.0%', trend: 'neutral', label: 'Expenses', period: periodText },
      businessHealth: { value: '82/100', change: '+4 pts', trend: 'up', label: 'Business Health', period: 'composite score' },
      customers: { value: '0', change: '0.0%', trend: 'neutral', label: 'Customers', period: 'active base' },
      orders: { value: '0', change: '0.0%', trend: 'neutral', label: 'Orders', period: `last ${days} days` },
      inventory: { value: '0 SKUs', change: '0 alerts', trend: 'neutral', label: 'Inventory', period: 'valuation' },
    };
  }
  const { kpis, inventory_summary } = overview;
  const rev    = kpis.revenue    || {};
  const exp    = kpis.expenses   || {};
  const profit = kpis.net_profit || kpis.profit || {};

  return {
    revenue: {
      value:  rev.formatted_value    || formatINR(rev.value)    || '₹0',
      change: rev.change_pct != null ? `${rev.change_pct > 0 ? '+' : ''}${rev.change_pct.toFixed(1)}%` : '0.0%',
      trend:  rev.trend              || 'neutral',
      label:  'Revenue',
      period: periodText,
    },
    profit: {
      value:  profit.formatted_value || formatINR(profit.value) || '₹0',
      change: profit.change_pct != null ? `${profit.change_pct > 0 ? '+' : ''}${profit.change_pct.toFixed(1)}%` : '0.0%',
      trend:  profit.trend           || 'neutral',
      label:  'Net Profit',
      period: periodText,
    },
    expenses: {
      value:  exp.formatted_value    || formatINR(exp.value)    || '₹0',
      change: exp.change_pct != null ? `${exp.change_pct > 0 ? '+' : ''}${exp.change_pct.toFixed(1)}%` : '0.0%',
      trend:  exp.trend              || 'neutral',
      label:  'Expenses',
      period: periodText,
    },
    businessHealth: {
      value: '82/100',
      change: '+4 pts',
      trend: 'up',
      label: 'Business Health',
      period: 'composite score',
    },
    customers: {
      value: String(kpis.customers?.value ?? 0),
      change: kpis.customers?.change_pct != null ? `${kpis.customers.change_pct > 0 ? '+' : ''}${kpis.customers.change_pct}%` : '0.0%',
      trend: kpis.customers?.trend || 'neutral',
      label: 'Customers',
      period: 'active base',
    },
    orders: {
      value:  String(kpis.orders?.value ?? 0),
      change: kpis.orders?.change_pct != null ? `${kpis.orders.change_pct > 0 ? '+' : ''}${kpis.orders.change_pct}%` : '0.0%',
      trend:  kpis.orders?.trend || 'neutral',
      label:  'Orders',
      period: `last ${days} days`,
    },
    inventory: {
      value: inventory_summary ? `${inventory_summary.total_skus || 0} SKUs` : '0 SKUs',
      change: inventory_summary ? `${inventory_summary.low_stock_count || 0} alerts` : '0 alerts',
      trend: (inventory_summary?.low_stock_count || 0) > 0 ? 'down' : 'up',
      label: 'Inventory',
      period: inventory_summary?.inventory_valuation_formatted || '₹0',
    },
  };
};

export const formatMonthlyTrend = (trend) => {
  if (!trend || !trend.length) return [];
  return trend.map(d => ({
    month:    d.month || d.period || '',
    revenue:  Number(d.revenue ?? 0),
    profit:   Number(d.profit ?? d.net_profit ?? 0),
    expenses: Number(d.expenses ?? 0),
  }));
};

export const formatExpenseBreakdown = (breakdown) => {
  if (!breakdown || !breakdown.length) return [];
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
export const getDashboardKPIs = async (days = 90) => {
  if (isDemoMode) {
    return { data: kpiData };
  }
  const res = await api.get('/dashboard/overview', { params: { days } });
  const formatted = formatKPI(res.data, days);
  return { data: formatted };
};

export const getAISummary = async () => {
  await delay(350);
  return { data: aiSummary };
};

export const getAIPrimaryInsight = async () => {
  if (isDemoMode) {
    return { data: aiPrimaryInsight };
  }
  try {
    const res = await api.get('/insights');
    const ins = res.data?.[0];
    if (!ins) return { data: null };
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
  } catch (err) {
    if (err.response?.status === 401) throw err;
    console.warn('[InsightIQ] Failed to load primary insight:', err.message);
    return { data: null };
  }
};

export const getRecentActivity = async () => {
  if (isDemoMode) {
    return { data: recentActivity };
  }
  const res = await api.get('/sales?limit=6');
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  if (!items.length) return { data: [] };
  const statusMap = {
    completed: 'success',
    pending: 'warning',
    cancelled: 'danger',
    refunded: 'info'
  };
  const formatted = items.map((s, i) => {
    const customerName = s.customer?.name || s.customer_name || 'Walk-in Customer';
    const productNames = Array.isArray(s.items) && s.items.length > 0
      ? s.items.map(it => it.product?.name || it.product_name).filter(Boolean).join(', ')
      : (s.product_name || 'Sale Order');
    const status = statusMap[s.status] || (s.payment_status === 'paid' ? 'success' : 'info');

    return {
      id:      s.id || String(i),
      type:    'order',
      message: `Sale to ${customerName} — ${productNames}`,
      amount:  formatINR(s.total_amount),
      time:    s.sale_date ? new Date(s.sale_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      status:  status,
      invoice_number: s.invoice_number,
    };
  });
  return { data: formatted };
};

export const getQuickActions = async () => {
  await delay(150);
  return { data: quickActions };
};

// ─── Analytics ───────────────────────────────────────
export const getAnalyticsOverview = async (days = 90) => {
  if (isDemoMode) {
    return {
      data: {
        period_days: days,
        kpis: {
          revenue: { value: 14200000, formatted_value: '₹1.42 Cr', change_pct: 16.8, trend: 'up', is_positive: true },
          profit_margin: { value: 26.2, formatted_value: '26.2%', change_pct: 2.4, trend: 'up', is_positive: true },
          net_profit: { value: 3720000, formatted_value: '₹37.2 L', change_pct: 14.1, trend: 'up', is_positive: true },
          average_order_value: { value: 36500, formatted_value: '₹36.5 K', change_pct: 5.2, trend: 'up', is_positive: true },
        },
        monthly_trend: monthlyRevenue,
        expense_breakdown: expenseBreakdown,
      }
    };
  }
  const res = await api.get('/analytics/overview', { params: { days } });
  return { data: res.data };
};

export const getMonthlyRevenue = async (days = 90) => {
  if (isDemoMode) {
    return { data: monthlyRevenue };
  }
  const res = await api.get('/dashboard/overview', { params: { days } });
  const trend = res.data?.monthly_trend || [];
  return { data: formatMonthlyTrend(trend) };
};

export const getExpenseBreakdown = async (days = 90) => {
  if (isDemoMode) {
    return { data: expenseBreakdown };
  }
  const res = await api.get('/dashboard/overview', { params: { days } });
  const breakdown = res.data?.expense_breakdown || [];
  return { data: formatExpenseBreakdown(breakdown) };
};

export const getCustomerGrowth = async (months = 12) => {
  if (isDemoMode) {
    return { data: customerGrowth };
  }
  try {
    const res = await api.get('/analytics/customer-growth', { params: { months } });
    const rows = res.data?.data || [];
    return {
      data: rows.map(r => ({
        month: r.month,
        newCustomers: r.new_customers ?? r.newCustomers ?? 0,
        totalCustomers: r.total_customers ?? r.totalCustomers ?? 0,
      }))
    };
  } catch {
    return { data: [] };
  }
};

export const getPerformanceRadar = async () => {
  await delay(200);
  return { data: performanceRadar };
};

export const getQuarterlyComparison = async (years = 2) => {
  if (isDemoMode) {
    return { data: quarterlyComparison };
  }
  try {
    const res = await api.get('/analytics/quarterly', { params: { years } });
    return { data: res.data?.data || [] };
  } catch {
    return { data: [] };
  }
};

export const getSalesByChannel = async () => {
  await delay(200);
  return { data: salesByChannel };
};

export const getTopProducts = async (days = 90) => {
  if (isDemoMode) {
    return { data: topProducts };
  }
  const res = await api.get('/analytics/products', { params: { days } });
  const products = res.data?.top_products || [];
  return {
    data: products.slice(0, 6).map(p => ({
      id:      p.id,
      sku:     p.sku,
      name:    p.name,
      revenue: Number(p.revenue ?? p.total_revenue ?? 0),
      units:   Number(p.units_sold ?? p.units ?? 0),
      growth:  p.growth != null ? p.growth : null,
    }))
  };
};

// ─── AI Intelligence ─────────────────────────────────
export const getAIInsights = async () => {
  if (isDemoMode) {
    return { data: aiInsights };
  }
  try {
    await api.post('/insights/generate');
  } catch {
    // Generate is optional if already exists
  }
  const res = await api.get('/insights');
  const items = Array.isArray(res.data) ? res.data : [];
  return {
    data: items.map(ins => {
      const actions = (ins.recommendations || []).map(r => r.action).filter(Boolean);
      return {
        id:          ins.id,
        title:       ins.title,
        summary:     ins.description,
        description: ins.description,
        category:    ins.category,
        severity:    ins.severity || 'medium',
        confidence:  Math.round((ins.confidence_score || 0.85) * 100),
        is_read:     ins.is_read || false,
        details:     actions.length ? actions : ['Review telemetry and transactional ledger'],
        actions:     actions.length ? actions : ['Review Details'],
        recommendations: (ins.recommendations || []).map(r => ({
          action:   r.action,
          priority: r.priority || 'medium',
          status:   r.status   || 'pending',
        })),
        created_at: ins.created_at,
      };
    })
  };
};

export const getAIRecommendations = async () => {
  if (isDemoMode) {
    return { data: aiRecommendations };
  }
  const res = await api.get('/insights/recommendations/all');
  const items = Array.isArray(res.data) ? res.data : [];
  return { data: items };
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

// ─── AI Chat via LLM backend ──────────────────────────
export const sendAIMessage = async (message) => {
  try {
    const res = await api.post('/insights/chat', { message });
    const data = res.data;
    // If LLM or fallback returned a plain `response` string, format into structured for UI
    if (data.response && !data.structured) {
      return {
        data: {
          role: 'assistant',
          structured: {
            answer: data.response,
            evidence: '',
            explanation: '',
            recommendation: '',
            sources: data.powered_by_llm ? 'Google Gemini 1.5 Flash — Live KPI Context' : 'InsightIQ Deterministic Engine',
            confidence: data.powered_by_llm ? '95% • AI-powered analysis' : '90% • Rule-based analysis',
          },
          powered_by_llm: data.powered_by_llm,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      };
    }
    return { data };
  } catch {
    // Graceful degradation: return an error message formatted for the chat UI
    return {
      data: {
        role: 'assistant',
        structured: {
          answer: 'I encountered a temporary issue connecting to the AI service. Please try again.',
          evidence: '',
          explanation: '',
          recommendation: 'Check your internet connection or try refreshing the page.',
          sources: 'System',
          confidence: 'N/A',
        },
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    };
  }
};

// ─── Reports ─────────────────────────────────────────
export const getReports = async (filters = {}) => {
  if (isDemoMode) {
    let filtered = [...allReports];
    if (filters.type && filters.type !== 'All') filtered = filtered.filter(r => r.type === filters.type);
    if (filters.search) filtered = filtered.filter(r => r.name.toLowerCase().includes(filters.search.toLowerCase()));
    return { data: filtered };
  }
  const res = await api.get('/reports');
  let items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  items = items.map(r => ({
    ...r,
    type: r.type || (r.report_type ? r.report_type.charAt(0).toUpperCase() + r.report_type.slice(1) : 'Financial'),
    status: r.status === 'completed' ? 'Ready' : (r.status ? r.status.charAt(0).toUpperCase() + r.status.slice(1) : 'Ready'),
    lastUpdated: r.completed_at
      ? new Date(r.completed_at).toLocaleDateString('en-IN')
      : (r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : 'Recent'),
    pages: r.pages || '12 Pages',
    size: r.size || '1.6 MB',
    summary: r.description || r.summary || `Audit report compiled for ${r.name || r.title || 'company'}.`,
    period: r.parameters?.period || r.period || 'Q3 FY26',
  }));
  if (filters.type && filters.type !== 'All') {
    items = items.filter(r => (r.type || '').toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.search) {
    items = items.filter(r => (r.name || r.title || '').toLowerCase().includes(filters.search.toLowerCase()));
  }
  return { data: items };
};

export const createReport = async ({ name, report_type, description, period }) => {
  const res = await api.post('/reports', {
    name,
    report_type: report_type || 'financial',
    description: description || `${report_type || 'Financial'} report for ${period || 'current period'}.`,
    parameters: { period: period || 'Q3 FY26' },
  });
  const r = res.data;
  return {
    data: {
      ...r,
      type: r.type || (r.report_type ? r.report_type.charAt(0).toUpperCase() + r.report_type.slice(1) : 'Financial'),
      status: r.status === 'completed' ? 'Ready' : (r.status || 'Ready'),
      lastUpdated: r.completed_at
        ? new Date(r.completed_at).toLocaleDateString('en-IN')
        : new Date().toLocaleDateString('en-IN'),
      pages: r.pages || '12 Pages',
      size: r.size || '1.6 MB',
      summary: r.description || `${r.report_type || 'Financial'} report compiled for ${period}.`,
      period: r.parameters?.period || period || 'Q3 FY26',
    }
  };
};

// ─── Company ─────────────────────────────────────────
export const getCompanyData = async () => {
  if (isDemoMode) {
    return { data: companyData };
  }
  const res = await api.get('/auth/me');
  const user = res.data;
  if (!user?.company_id) return { data: companyData };
  const compRes = await api.get(`/companies/${user.company_id}`);
  const comp = compRes.data;

  // Retrieve actual employee count and annual overview if available
  let employeeCount = 0;
  let departmentList = [];
  try {
    const empRes = await api.get('/employees');
    const emps = Array.isArray(empRes.data) ? empRes.data : [];
    employeeCount = emps.length;
    if (emps.length > 0) {
      const deptMap = {};
      emps.forEach(e => {
        const d = e.department || 'Operations';
        deptMap[d] = (deptMap[d] || 0) + 1;
      });
      departmentList = Object.entries(deptMap).map(([name, count]) => ({
        name,
        headcount: `${count} Member${count > 1 ? 's' : ''}`,
        lead: 'Department Head',
        budget: 'Allocated'
      }));
    }
  } catch {
    // Non-blocking fallback
  }

  let annualRevenueFormatted = '₹0';
  try {
    const ovRes = await api.get('/dashboard/overview', { params: { days: 365 } });
    if (ovRes.data?.kpis?.revenue?.formatted_value) {
      annualRevenueFormatted = ovRes.data.kpis.revenue.formatted_value;
    }
  } catch {
    // Non-blocking
  }

  const hq = [comp.address, comp.city, comp.state].filter(Boolean).join(', ');
  return {
    data: {
      ...comp,
      tier: comp.tier || 'Enterprise',
      tagline: comp.tagline || `${comp.industry || 'Business'} Intelligence Platform`,
      description: comp.description || `Registered corporate entity in ${comp.city || 'India'}, operating under jurisdiction ${comp.country || 'India'}.`,
      headquarters: hq || `${comp.city || 'HQ'}, ${comp.country || 'India'}`,
      employees: employeeCount,
      annualRevenue: annualRevenueFormatted,
      departments: departmentList.length > 0 ? departmentList : (comp.departments || []),
      goals: comp.goals || [
        { id: 1, title: 'Revenue Growth & Scale', progress: 75, deadline: 'Q4 FY26', status: 'in-progress' },
        { id: 2, title: 'Margin Optimization & Cost Control', progress: 85, deadline: 'Q3 FY26', status: 'in-progress' }
      ],
    }
  };
};

// ─── Profile ─────────────────────────────────────────
export const getUserProfile = async () => {
  if (isDemoMode) {
    return { data: userData };
  }
  const res = await api.get('/auth/me');
  const user = res.data;
  const names = (user.name || '').trim().split(' ');
  const firstName = names[0] || '';
  const lastName = names.slice(1).join(' ') || '';
  const initials = ((firstName[0] || '') + (lastName[0] || firstName[1] || 'U')).toUpperCase();
  const joinedDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'March 14, 2021';
  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Recent';

  return {
    data: {
      ...userData,
      ...user,
      fullName: user.name || userData.fullName,
      firstName: firstName || userData.firstName,
      lastName: lastName || userData.lastName,
      initials: initials || userData.initials,
      email: user.email || userData.email,
      role: user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : userData.role,
      joinedDate,
      lastLogin,
      timezone: 'Asia/Kolkata (IST)',
      security: userData.security,
    }
  };
};

export const updateUserProfile = async (profileData) => {
  return api.put('/users/me', profileData);
};

// ─── Customers ───────────────────────────────────────
export const getCustomers = async (params = {}) => {
  if (isDemoMode) return { data: [] };
  const res = await api.get('/customers', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return { data: items };
};

export const createCustomer = async (customerData) => {
  return api.post('/customers', customerData);
};

export const updateCustomer = async (customerId, customerData) => {
  return api.put(`/customers/${customerId}`, customerData);
};

export const deleteCustomer = async (customerId) => {
  return api.delete(`/customers/${customerId}`);
};

// ─── Products & Inventory ────────────────────────────
export const getProducts = async (params = {}) => {
  if (isDemoMode) return { data: [] };
  const res = await api.get('/products', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return { data: items };
};

export const createProduct = async (productData, options = {}) => {
  return api.post('/products', productData, { params: options });
};

export const getInventory = async (params = {}) => {
  if (isDemoMode) return { data: [] };
  const res = await api.get('/inventory', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return { data: items };
};

export const updateStock = async (inventoryId, updateData) => {
  return api.put(`/inventory/${inventoryId}`, updateData);
};

// ─── Sales ───────────────────────────────────────────
export const getSales = async (params = {}) => {
  if (isDemoMode) return { data: [] };
  const res = await api.get('/sales', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return { data: items };
};

export const createSale = async (saleData) => {
  return api.post('/sales', saleData);
};

// ─── Expenses ────────────────────────────────────────
export const getExpenses = async (params = {}) => {
  if (isDemoMode) return { data: [] };
  const res = await api.get('/expenses', { params });
  const items = Array.isArray(res.data?.items) ? res.data.items : (Array.isArray(res.data) ? res.data : []);
  return { data: items };
};

export const createExpense = async (expenseData) => {
  return api.post('/expenses', expenseData);
};

export const deleteExpense = async (expenseId) => {
  return api.delete(`/expenses/${expenseId}`);
};

// ─── Register ────────────────────────────────────────
export const registerUser = async ({ name, email, password, company_name, industry }) => {
  return api.post('/auth/register', { name, email, password, company_name, industry });
};

// ─── CSV Data Import ─────────────────────────────────
export const getImportCategories = async () => {
  return api.get('/import/categories');
};

export const downloadImportTemplate = async (category) => {
  const response = await api.get(`/import/template/${category}`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insightiq_${category}_template.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const validateImportFile = async (file, category) => {
  const text = await file.text();
  return api.post('/import/validate', {
    category,
    csv_content: text,
    filename: file.name,
  }, {
    timeout: 30000,
  });
};

export const commitImportData = async (category, validRecords, mode = 'all_or_nothing') => {
  return api.post('/import/commit', {
    category,
    valid_records: validRecords,
    mode,
  }, {
    timeout: 60000,
  });
};

export const downloadErrorCSV = async (headers, errors) => {
  const response = await api.post('/import/error-csv', { headers, errors }, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `insightiq_import_errors_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

// ─── Workspace Settings (persistent) ─────────────────
export const getWorkspaceSettings = async () => {
  const res = await api.get('/settings');
  return { data: res.data };
};

export const updateWorkspaceSettings = async (payload) => {
  const res = await api.put('/settings', payload);
  return { data: res.data };
};

// ─── Forgot Password / Reset Password ─────────────────
export const forgotPassword = async (email) => {
  return api.post('/auth/forgot-password', { email });
};

export const resetPassword = async (token, newPassword) => {
  return api.post('/auth/reset-password', { token, new_password: newPassword });
};

// ─── Sessions (server-side device revocation) ─────────
export const getSessions = async () => {
  const res = await api.get('/auth/sessions');
  return { data: res.data };
};

export const revokeSession = async (sessionId) => {
  return api.delete(`/auth/sessions/${sessionId}`);
};

// ─── Report Content Preview ───────────────────────────
export const getReportPreview = async (reportId) => {
  const res = await api.get(`/reports/${reportId}/preview`);
  return { data: res.data };
};

// ─── ML Sales Forecast ────────────────────────────────
export const getSalesForecast = async (months = 6) => {
  try {
    const res = await api.get('/analytics/forecast', { params: { months } });
    return { data: res.data };
  } catch {
    return { data: { data_available: false, historical: [], forecast: [], metrics: { rmse: 0, mae: 0 } } };
  }
};

export default api;
