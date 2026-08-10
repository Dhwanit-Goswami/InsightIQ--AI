import axios from 'axios';
import { kpiData, aiSummary, recentActivity, quickActions } from '../data/mockDashboard';
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

// Intercept all requests and return mock data
api.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.warn('API Error (using mock data):', error.message);
    return Promise.reject(error);
  }
);

// ─── Simulate async delay ─────────────────────────────
const delay = (ms = 600) => new Promise((resolve) => setTimeout(resolve, ms));

// ─── Dashboard ────────────────────────────────────────
export const getDashboardKPIs = async () => {
  await delay(400);
  return { data: kpiData };
};

export const getAISummary = async () => {
  await delay(800);
  return { data: aiSummary };
};

export const getRecentActivity = async () => {
  await delay(300);
  return { data: recentActivity };
};

export const getQuickActions = async () => {
  await delay(200);
  return { data: quickActions };
};

// ─── Analytics ───────────────────────────────────────
export const getMonthlyRevenue = async () => {
  await delay(500);
  return { data: monthlyRevenue };
};

export const getExpenseBreakdown = async () => {
  await delay(400);
  return { data: expenseBreakdown };
};

export const getCustomerGrowth = async () => {
  await delay(450);
  return { data: customerGrowth };
};

export const getPerformanceRadar = async () => {
  await delay(350);
  return { data: performanceRadar };
};

export const getQuarterlyComparison = async () => {
  await delay(400);
  return { data: quarterlyComparison };
};

export const getSalesByChannel = async () => {
  await delay(300);
  return { data: salesByChannel };
};

export const getTopProducts = async () => {
  await delay(350);
  return { data: topProducts };
};

// ─── AI ──────────────────────────────────────────────
export const getAIInsights = async () => {
  await delay(700);
  return { data: aiInsights };
};

export const getAIRecommendations = async () => {
  await delay(600);
  return { data: aiRecommendations };
};

export const getBusinessHealthScores = async () => {
  await delay(500);
  return { data: businessHealthScores };
};

export const getAIChatHistory = async () => {
  await delay(300);
  return { data: aiChatHistory };
};

export const getSuggestedPrompts = async () => {
  await delay(200);
  return { data: suggestedPrompts };
};

export const sendAIMessage = async (message) => {
  await delay(1500 + Math.random() * 1000);
  const responses = [
    `Great question about **"${message}"**. Based on your current business data, I can see several key patterns worth noting. Your recent performance shows a strong upward trajectory across most KPIs. Would you like me to drill deeper into any specific area?`,
    `Analyzing your data for **"${message}"**... \n\nHere are the key insights:\n\n• **Trend Analysis**: Your metrics show consistent improvement over the last 6 months\n• **Opportunity**: There's a clear window to capture 15-20% more market share\n• **Risk**: One area to watch is inventory management in Q4\n\nWould you like a detailed breakdown?`,
    `Based on my analysis of your business data regarding **"${message}"**:\n\n✅ Revenue is trending positively at +18.4% YoY\n✅ Customer satisfaction remains high at 94.2%\n⚠️ One potential risk area has been flagged\n\nI recommend scheduling a strategic review. Want me to prepare a full report?`,
  ];
  return { data: { role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)], timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } };
};

// ─── Reports ─────────────────────────────────────────
export const getReports = async (filters = {}) => {
  await delay(500);
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
  await delay(400);
  return { data: companyData };
};

// ─── Profile ─────────────────────────────────────────
export const getUserProfile = async () => {
  await delay(300);
  return { data: userData };
};

// ─── Customers ───────────────────────────────────────
export const getCustomers = async () => {
  await delay(500);
  return { data: mockCustomers };
};

export default api;
