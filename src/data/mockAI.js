// ─── AI Insights Data (Indian Business Context — ₹ Scale) ──────────────
export const aiInsights = [
  {
    id: 1,
    type: 'prediction',
    title: 'Revenue Forecast Q4 FY25',
    summary: 'Based on current sales velocity across West and South zones, AI projects Q4 revenue between ₹2.8Cr – ₹3.1Cr, representing 18–24% YoY growth.',
    confidence: 91,
    impact: 'high',
    icon: 'FiTrendingUp',
    color: 'green',
    details: [
      'Enterprise tier customer accounts expected to grow 28%',
      'Regional SMB tier showing steady 14% revenue expansion',
      'GST E-Invoicing addon rollout projected to contribute ₹18L–₹24L',
    ],
    actions: ['View Forecast Model', 'Export Projection'],
  },
  {
    id: 2,
    type: 'risk',
    title: 'Supply Chain Disruption Alert (Gujarat Belt)',
    summary: 'AI detected inventory supply risks across 3 raw material SKUs. Recommend pre-ordering inventory buffer before Oct 15.',
    confidence: 84,
    impact: 'medium',
    icon: 'FiAlertTriangle',
    color: 'amber',
    details: [
      'SKU-8821, SKU-4532, SKU-9901 lead times increased by 12-18 days',
      'surat vendor transit delay expected due to monsoon transport schedules',
      'Alternate vendor available at 8% cost premium',
    ],
    actions: ['View Affected SKUs', 'Contact Vendor'],
  },
  {
    id: 3,
    type: 'opportunity',
    title: 'Cost Saving Opportunity — ₹34L',
    summary: 'AI identified ₹34L in potential annual savings through logistics consolidation, cloud hosting optimization, and vendor renegotiations.',
    confidence: 88,
    impact: 'high',
    icon: 'FiDollarSign',
    color: 'slate',
    details: [
      'Logistics vendor renegotiation: ₹12L savings',
      'Cloud & server optimization: ₹9.5L savings',
      'Process automation: ₹12.5L savings',
    ],
    actions: ['View Full Analysis', 'Download Report'],
  },
  {
    id: 4,
    type: 'market',
    title: 'Indian SME Technology Adoption',
    summary: 'Decision intelligence adoption among manufacturing and retail SMEs in India is growing at 43% annually. Early movers secure 2.3x ROI advantages.',
    confidence: 79,
    impact: 'medium',
    icon: 'FiGlobe',
    color: 'slate',
    details: [
      'Competitors increasing software investments by 35%',
      'Customer request for automated compliance tools up 58%',
      'Key growth window: Next 12–18 months',
    ],
    actions: ['Read Market Report', 'Compare Benchmarks'],
  },
  {
    id: 5,
    type: 'growth',
    title: 'Customer Expansion Opportunity',
    summary: 'High-value customer segment analysis reveals 847 corporate accounts ready for upselling to Enterprise tier, projecting ₹62L additional ARR.',
    confidence: 87,
    impact: 'high',
    icon: 'FiUsers',
    color: 'blue',
    details: [
      '847 accounts exhibiting high usage frequency',
      'Average expansion potential: ₹7,320 per account',
      'Recommended outreach window: Next 30 days',
    ],
    actions: ['View Target Accounts', 'Create Campaign'],
  },
  {
    id: 6,
    type: 'health',
    title: 'Business Health Score — 87/100',
    summary: 'Your overall business health score improved by 4 points. Strong working capital ratio, revenue growth, and team performance drive this rating.',
    confidence: 95,
    impact: 'low',
    icon: 'FiActivity',
    color: 'green',
    details: [
      'Financial Stability: 91/100 (+6)',
      'Operational Efficiency: 84/100 (+3)',
      'Team Execution: 89/100 (+2)',
    ],
    actions: ['Full Health Report', 'Set OKRs'],
  },
];

export const aiRecommendations = [
  { id: 1, priority: 'critical', text: 'Pre-order inventory buffer for Q4 to mitigate logistics risk in Gujarat belt', effort: 'Low', impact: 'High' },
  { id: 2, priority: 'high', text: 'Launch B2B upsell campaign targeting 847 growth-ready accounts', effort: 'Medium', impact: 'High' },
  { id: 3, priority: 'high', text: 'Renegotiate vendor contracts before Nov annual renewal date', effort: 'Low', impact: 'High' },
  { id: 4, priority: 'medium', text: 'Optimize cloud infrastructure to reduce monthly operational burn by ₹80,000', effort: 'Medium', impact: 'Medium' },
  { id: 5, priority: 'medium', text: 'Implement customer onboarding automation to improve retention', effort: 'High', impact: 'High' },
  { id: 6, priority: 'low', text: 'Update pricing tiers to feature automated GST and e-invoicing highlights', effort: 'Low', impact: 'Medium' },
];

export const businessHealthScores = [
  { category: 'Revenue Growth', score: 91, change: '+6', status: 'excellent' },
  { category: 'Profitability', score: 84, change: '+4', status: 'good' },
  { category: 'Cash Flow & Liquidity', score: 88, change: '+8', status: 'excellent' },
  { category: 'Client Retention', score: 94, change: '+2', status: 'excellent' },
  { category: 'Operational Efficiency', score: 79, change: '+1', status: 'good' },
  { category: 'Team Performance', score: 89, change: '+3', status: 'excellent' },
  { category: 'Market Position', score: 73, change: '+5', status: 'good' },
  { category: 'Tech & Product Innovation', score: 81, change: '+7', status: 'good' },
];

export const aiChatHistory = [
  {
    id: 1,
    role: 'user',
    content: 'What is my revenue trend for the last 6 months?',
    timestamp: '10:32 AM',
  },
  {
    id: 2,
    role: 'assistant',
    content: 'Your revenue has shown a steady upward trajectory over the last 6 months, growing from **₹47.8L in June** to **₹68.2L in December** — a **42.7% increase**.\n\nKey growth drivers:\n• **Enterprise client onboarding** (+28% MoM)\n• **GST & Compliance module** contributing ₹18L\n• **Conversion efficiency improvement** from 3.2% to 4.8%\n\nBased on these trends, AI models project Q1 revenue at **₹72L–₹76L**. Would you like a breakdown by region or product tier?',
    timestamp: '10:32 AM',
  },
  {
    id: 3,
    role: 'user',
    content: 'Which accounts show high risk of churn?',
    timestamp: '10:35 AM',
  },
  {
    id: 4,
    role: 'assistant',
    content: 'Analyzing user activity models across your client base, **23 accounts have been flagged for churn risk** in the next 90 days:\n\n🔴 **High Risk (8 accounts)**: Inactive >45 days, declining module usage\n🟡 **Medium Risk (15 accounts)**: Ticket resolution delays, reduced active seats\n\nRecommended Action Plan:\n1. Schedule executive outreach with top 5 high-value accounts\n2. Offer dedicated onboarding sessions for medium-risk clients\n3. Share quarterly ROI audit report with accounts using <30% features\n\nTotal ARR at risk: **₹28.4L**. Shall I generate a detailed account audit list?',
    timestamp: '10:35 AM',
  },
];

export const suggestedPrompts = [
  'What is my revenue forecast for next quarter?',
  'Which products have the highest profit margin?',
  'Where can I reduce operational costs?',
  'How is my overall business health trending?',
  'Show me top clients by annual revenue',
  'What are the primary operational risks?',
  'Compare FY24 vs FY25 financial performance',
  'Generate an executive board summary report',
];
