export const userData = {
  id: 'usr_01J2KX3M',
  firstName: 'Rajesh',
  lastName: 'Verma',
  fullName: 'Rajesh Verma',
  email: 'rajesh.verma@vardaanintel.in',
  phone: '+91 98250 44001',
  role: 'Chief Executive Officer',
  department: 'Executive Leadership',
  avatar: null,
  initials: 'RV',
  company: 'Vardaan Intelligence Solutions Pvt. Ltd.',
  location: 'Mumbai, Maharashtra',
  timezone: 'Asia/Kolkata (IST)',
  language: 'English (India)',
  joinedDate: 'March 14, 2019',
  lastLogin: 'Today at 9:24 AM IST',
  plan: 'Enterprise Tier',
  notifications: {
    email: {
      weeklyDigest: true,
      aiInsights: true,
      revenueAlerts: true,
      teamUpdates: false,
      productUpdates: true,
    },
    push: {
      criticalAlerts: true,
      aiRecommendations: true,
      reportReady: true,
      teamMentions: false,
    },
    slack: {
      connected: true,
      channel: '#executive-alerts',
    },
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: '45 days ago',
    activeSessions: 2,
    loginHistory: [
      { device: 'MacBook Pro — Chrome', location: 'Mumbai, Maharashtra', time: 'Today, 9:24 AM', current: true },
      { device: 'iPhone 15 — Safari', location: 'Mumbai, Maharashtra', time: 'Yesterday, 6:42 PM', current: false },
    ],
  },
};

export const mockCustomers = [
  { id: 1, name: 'Arvind Textiles Pvt. Ltd.', industry: 'Textiles & Garments', revenue: '₹1.24Cr', plan: 'Enterprise', status: 'Active', since: 'Jan 2023', contacts: 4 },
  { id: 2, name: 'NovaMart Retail Pvt. Ltd.', industry: 'Retail & FMCG', revenue: '₹98.2L', plan: 'Enterprise', status: 'Active', since: 'Mar 2022', contacts: 6 },
  { id: 3, name: 'Shreeji Foods Pvt. Ltd.', industry: 'Food Processing', revenue: '₹76.8L', plan: 'Pro Tier', status: 'Active', since: 'Jun 2023', contacts: 3 },
  { id: 4, name: 'BluePeak Logistics Pvt. Ltd.', industry: 'Logistics', revenue: '₹34.2L', plan: 'Starter', status: 'Active', since: 'Sep 2024', contacts: 2 },
  { id: 5, name: 'Kesar Healthcare Solutions', industry: 'Healthcare', revenue: '₹1.12Cr', plan: 'Enterprise', status: 'Active', since: 'Feb 2022', contacts: 8 },
  { id: 6, name: 'UrbanNest Retail Pvt. Ltd.', industry: 'Consumer Goods', revenue: '₹67.3L', plan: 'Pro Tier', status: 'At Risk', since: 'Aug 2023', contacts: 3 },
  { id: 7, name: 'Zenith Engineering Pvt. Ltd.', industry: 'Manufacturing', revenue: '₹88.9L', plan: 'Pro Tier', status: 'Active', since: 'Nov 2022', contacts: 5 },
  { id: 8, name: 'GreenLeaf Agro Industries', industry: 'Agriculture', revenue: '₹54.6L', plan: 'Pro Tier', status: 'Active', since: 'Apr 2024', contacts: 2 },
];
