import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiZap, FiShield, FiBarChart2, FiCpu, FiTarget,
  FiUsers, FiArrowRight, FiCheck, FiStar, FiEye, FiCheckCircle, FiTrendingUp,
  FiLayers, FiMenu, FiX, FiSun, FiMoon
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const stats = [
  { value: '50K+', label: 'SMEs Powered' },
  { value: '₹20,000Cr+', label: 'Revenue Analyzed' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '94%', label: 'Prediction Accuracy' },
];

const features = [
  { icon: FiBarChart2, title: 'Real-Time Analytics', description: 'Monitor your business performance with live dashboards, KPI tracking, and automated GST & financial metrics.' },
  { icon: FiCpu, title: 'AI-Powered Insights', description: 'Get predictive analytics, supply chain risk alerts, and actionable recommendations powered by advanced models.' },
  { icon: FiTarget, title: 'Revenue Intelligence', description: 'Forecast quarterly revenue, identify B2B expansion opportunities, and optimize product pricing.' },
  { icon: FiShield, title: 'Risk Management', description: 'Detect inventory anomalies, assess credit risks, and protect operations across all regional hubs.' },
  { icon: FiUsers, title: 'Client Account Intelligence', description: 'Understand your corporate customer base — churn prediction, account ARR lifetime value, and usage analytics.' },
  { icon: FiLayers, title: 'Unified Data Platform', description: 'Consolidate ERP, CRM, and financial accounting data into one decision cockpit.' },
];

const aiCapabilities = [
  'Revenue Forecasting & GST Alignment',
  'Corporate Account Churn Prevention',
  'Logistics & Cloud Cost Optimization',
  'Indian SME Sector Benchmarks',
  'Business Health & Liquidity Scoring',
  'Supply Chain Anomaly Alerts',
  'Natural Language Business Queries',
  'Automated Executive Board Reports',
];

const testimonials = [
  { name: 'Rajesh Verma', role: 'CEO, Vardaan Solutions Pvt. Ltd.', content: 'NexusAI transformed our executive decision-making. Revenue predictions for our West zone are 94% accurate and AI insights saved us ₹34L in operating costs.', rating: 5 },
  { name: 'Ananya Iyer', role: 'CFO, Arvind Textiles Pvt. Ltd.', content: 'The best decision intelligence platform for Indian enterprise SMEs. The AI assistant feels like having a senior financial analyst on call 24/7.', rating: 5 },
  { name: 'Sunil Mehta', role: 'Founder, NovaMart Retail Pvt. Ltd.', content: 'From day one, NexusAI gave us enterprise-grade analytics across all our retail branches. The dashboard is clean and insights are immediately actionable.', rating: 5 },
];

const aboutPillars = [
  {
    num: '01',
    title: 'Clarity',
    desc: 'Turn complex business data into information that is easy to understand.',
    icon: FiEye
  },
  {
    num: '02',
    title: 'Intelligence',
    desc: 'Use AI to identify patterns, risks and opportunities.',
    icon: FiZap
  },
  {
    num: '03',
    title: 'Action',
    desc: 'Turn insights into practical business decisions.',
    icon: FiCheckCircle
  },
  {
    num: '04',
    title: 'Growth',
    desc: 'Help businesses continuously improve performance.',
    icon: FiTrendingUp
  }
];

const pricingPlans = [
  { name: 'Starter Tier', price: '₹3,999', period: '/month', description: 'For small business teams', features: ['5 Team Members', 'Basic Financial Analytics', 'Automated Email Reports', 'Standard Support', '1,000 AI Credits'], popular: false },
  { name: 'Professional', price: '₹11,999', period: '/month', description: 'For growing enterprise SMEs', features: ['25 Team Members', 'Advanced Predictive Analytics', 'AI Insights Portal', 'Priority Helpdesk', '10,000 AI Credits', 'Custom Reports', 'GST & API Integration'], popular: true },
  { name: 'Enterprise Tier', price: 'Custom', period: '', description: 'For large corporate groups', features: ['Unlimited Team Seats', 'Full AI Suite & Custom Models', 'Dedicated Account Director', 'Unlimited AI Credits', 'ERP & Tally Integrations', 'SSO & ISO Security', 'SLA Guarantee'], popular: false },
];

const Landing = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary transition-colors duration-200 overflow-x-hidden">
      {/* ─── Navbar ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-light-topbar/95 dark:bg-dark-topbar/95 backdrop-blur-xs border-b border-light-border dark:border-dark-border shadow-xs' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-xs">
              <FiZap className="w-4.5 h-4.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary">NexusAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
            <a href="#features" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Features</a>
            <a href="#ai" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">AI Capabilities</a>
            <a href="#testimonials" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Testimonials</a>
            <a href="#about" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">About Us</a>
            <a href="#pricing" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Pricing Tiers</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Sign In</button>
            <button onClick={() => navigate('/signup')} className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-xs transition-all">Get Started</button>
          </div>
          <button className="md:hidden p-2 text-light-text-secondary dark:text-dark-text-secondary" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden bg-light-card dark:bg-dark-card border-t border-light-border dark:border-dark-border p-4 space-y-3 animate-fade-in">
            <a href="#features" className="block py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Features</a>
            <a href="#ai" className="block py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">AI Capabilities</a>
            <a href="#testimonials" className="block py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Testimonials</a>
            <a href="#about" className="block py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">About Us</a>
            <a href="#pricing" className="block py-2 text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Pricing Tiers</a>
            <div className="flex gap-2 pt-2">
              <button onClick={() => navigate('/login')} className="flex-1 py-2 text-xs font-semibold rounded-xl border border-light-border dark:border-dark-border">Sign In</button>
              <button onClick={() => navigate('/signup')} className="flex-1 py-2 text-xs font-semibold rounded-xl bg-primary text-white">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold">
              <FiZap className="w-3.5 h-3.5" /> Decision Intelligence Platform for SMEs
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary leading-tight">
              Make confident, data-driven decisions for your business.
            </h1>
            <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
              NexusAI consolidates your revenue, sales, expenses, and operational data into one intelligent cockpit. Get clear answers and predictive insights in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button onClick={() => navigate('/signup')} className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-xs transition-all flex items-center justify-center gap-2">
                Start 14-Day Free Trial
                <FiArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full sm:w-auto px-6 py-3 text-xs font-bold rounded-xl bg-light-surface dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700 border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary transition-all">
                Explore Live Demo
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 text-center shadow-card dark:shadow-card-dark">
                <p className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">{s.value}</p>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-16 lg:py-24 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Features</span>
            <h2 className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight">
              Enterprise Tools Built for Growth
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted max-w-lg mx-auto font-medium">
              A comprehensive decision intelligence platform designed for CEOs, CFOs, and operational leaders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-card dark:shadow-card-dark hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 text-primary dark:text-white flex items-center justify-center mb-4 border border-primary/20">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary mb-2">{feature.title}</h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI Capabilities ─── */}
      <section id="ai" className="py-16 lg:py-24 bg-light-surface/50 dark:bg-dark-surface/50 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Decision Copilot</span>
              <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
                Your Autonomous AI Business Analyst
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">
                Ask business questions in natural language. Our AI core inspects financial metrics in real-time and delivers instant forecasts, risk flags, and strategic recommendations.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-6">
                {aiCapabilities.map((cap) => (
                  <div key={cap} className="flex items-center gap-2 text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                    <div className="w-4 h-4 rounded-full bg-success-bg dark:bg-success/20 text-success flex items-center justify-center flex-shrink-0">
                      <FiCheck className="w-3 h-3" />
                    </div>
                    {cap}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/signup')} className="mt-6 px-5 py-2.5 text-xs font-semibold rounded-xl bg-primary hover:bg-primary-hover text-white shadow-xs transition-all">
                Try AI Assistant Demo
                <FiArrowRight className="inline ml-2 w-3.5 h-3.5" />
              </button>
            </div>

            {/* AI Chat Preview Card */}
            <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card-md dark:shadow-card-md-dark">
              <div className="flex items-center gap-2.5 mb-4 border-b border-light-border dark:border-dark-border pb-3">
                <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center">
                  <FiZap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">NexusAI Copilot</p>
                  <p className="text-[10px] text-success font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full" /> Online Core
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-end">
                  <div className="bg-primary text-white rounded-2xl rounded-tr-xs px-3.5 py-2 text-xs max-w-xs font-medium">
                    What's my revenue forecast for Q4 FY25?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs text-light-text-primary dark:text-dark-text-primary max-w-sm leading-relaxed font-medium">
                    Based on your sales velocity across West and South zones, I project Q4 revenue between <strong className="text-primary font-bold">₹2.8Cr – ₹3.1Cr</strong>, representing <strong className="text-success font-bold">18–24% YoY growth</strong>. Enterprise tier is the primary driver at +28%.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section id="testimonials" className="py-16 lg:py-24 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Testimonials</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trusted by Indian Business Leaders
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 shadow-card dark:shadow-card-dark flex flex-col justify-between">
                <div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <FiStar key={i} className="w-3.5 h-3.5 text-warning fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-6 font-medium">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center text-xs font-bold shadow-xs">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary">{t.name}</p>
                    <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-medium">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── About Us ─── */}
      <section id="about" className="py-16 lg:py-24 bg-light-surface/40 dark:bg-dark-surface/40 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Column */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">ABOUT US</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary leading-tight">
                Helping businesses make better decisions.
              </h2>
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium pt-1">
                Running a business means making hundreds of decisions every day. We believe those decisions should be backed by information that is clear, relevant and easy to understand.
              </p>
              <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">
                Our platform brings business data together and uses AI to highlight what matters, explain why it matters, and help business owners decide what to do next.
              </p>
            </div>

            {/* Right Column — 4 Clean Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {aboutPillars.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.num} className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-5 shadow-card dark:shadow-card-dark space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-primary">{p.num}</span>
                      <div className="w-7 h-7 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-light-text-primary dark:text-dark-text-primary">{p.title}</h3>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">{p.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-16 lg:py-24 border-t border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Pricing</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Simple Plans for SME Growth
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted max-w-lg mx-auto font-medium">Start with a 14-day trial and scale as your company grows.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`bg-light-card dark:bg-dark-card border rounded-2xl p-6 shadow-card dark:shadow-card-dark relative flex flex-col justify-between ${plan.popular ? 'border-primary' : 'border-light-border dark:border-dark-border'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div>
                  <div className="mb-5">
                    <h3 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary">{plan.name}</h3>
                    <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5 font-medium">{plan.description}</p>
                    <div className="mt-3">
                      <span className="text-3xl font-extrabold text-light-text-primary dark:text-dark-text-primary tracking-tight">{plan.price}</span>
                      <span className="text-light-text-muted dark:text-dark-text-muted text-xs font-medium">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2.5 mb-6 border-t border-light-border dark:border-dark-border pt-4">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
                        <FiCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => navigate('/signup')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    plan.popular
                      ? 'bg-primary hover:bg-primary-hover text-white shadow-xs'
                      : 'bg-light-surface dark:bg-dark-surface hover:bg-slate-200 dark:hover:bg-slate-700 text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border'
                  }`}
                >
                  {plan.name === 'Enterprise Tier' ? 'Contact Sales' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-light-border dark:border-dark-border py-10 bg-light-card dark:bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary text-white flex items-center justify-center">
                <FiZap className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-light-text-primary dark:text-dark-text-primary">NexusAI</span>
            </div>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted font-medium">© 2025 NexusAI Platform. Enterprise Decision Intelligence for Indian SMEs.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
