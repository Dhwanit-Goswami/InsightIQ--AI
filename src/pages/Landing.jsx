import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiArrowRight, FiCheck, FiStar, FiShield,
  FiTrendingUp, FiMenu, FiX, FiSun, FiMoon,
  FiBarChart2, FiDatabase, FiLayers, FiAlertCircle
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { AreaChartWidget } from '../components/charts/Charts';

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

  // Demo chart data for Product Preview (Section 30)
  const previewChartData = [
    { month: 'Apr', revenue: 18.2, profit: 4.8 },
    { month: 'May', revenue: 20.4, profit: 5.3 },
    { month: 'Jun', revenue: 21.8, profit: 5.6 },
    { month: 'Jul', revenue: 22.9, profit: 5.8 },
    { month: 'Aug', revenue: 22.1, profit: 5.9 },
    { month: 'Sep', revenue: 24.8, profit: 6.4 },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text-primary dark:text-dark-text-primary transition-colors duration-200 overflow-x-hidden">
      {/* ─── Top Navigation ─── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-light-card/95 dark:bg-dark-card/95 backdrop-blur-sm border-b border-light-border dark:border-dark-border shadow-sm'
          : 'bg-transparent'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
              IQ
            </div>
            <span className="text-base font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary">
              InsightIQ
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary">
            <a href="#product-preview" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Product</a>
            <a href="#how-it-works" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">How It Works</a>
            <a href="#capabilities" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Capabilities</a>
            <a href="#use-cases" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Use Cases</a>
            <a href="#testimonials" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Testimonials</a>
            <a href="#about" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">About Us</a>
            <a href="#pricing" className="hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface dark:hover:bg-dark-surface transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors cursor-pointer shadow-card"
            >
              Get Started
            </button>
          </div>

          <button
            className="md:hidden p-1.5 text-light-text-secondary dark:text-dark-text-secondary cursor-pointer"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Menu"
          >
            {mobileMenu ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenu && (
          <div className="md:hidden bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border px-4 py-3 space-y-2 text-xs">
            <a href="#product-preview" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">Product</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">How It Works</a>
            <a href="#capabilities" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">Capabilities</a>
            <a href="#use-cases" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">Use Cases</a>
            <a href="#testimonials" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">Testimonials</a>
            <a href="#about" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">About Us</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)} className="block py-1 text-light-text-secondary dark:text-dark-text-secondary">Pricing</a>
            <div className="pt-2 flex gap-2">
              <button onClick={() => navigate('/login')} className="flex-1 py-1.5 rounded-lg border border-light-border dark:border-dark-border text-center">Sign In</button>
              <button onClick={() => navigate('/signup')} className="flex-1 py-1.5 rounded-lg bg-primary text-white text-center">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ─── 29. HERO (Simple, clean, no glowing orbs or robots) ─── */}
      <section className="pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span>Decision Intelligence for Indian SMEs</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary leading-[1.15]">
            Understand your business. Decide with confidence.
          </h1>

          <p className="text-sm sm:text-base text-light-text-secondary dark:text-dark-text-secondary max-w-2xl mx-auto leading-relaxed font-normal">
            Bring your business data together, understand what is changing, and use AI-powered insights to decide what to do next.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-card transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Get Started</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="#product-preview"
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-medium rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary transition-colors flex items-center justify-center cursor-pointer"
            >
              See how it works
            </a>
          </div>

          {/* Social Proof metrics */}
          <div className="pt-8 border-t border-light-border dark:border-dark-border max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">₹24.8L</p>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Average SME Monthly Run</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">94.2%</p>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Forecast Confidence</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">100%</p>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-0.5">GST MCA Compliant</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">24/7</p>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Autonomous Risk Alerts</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 30. PRODUCT PREVIEW (The product itself as hero visual) ─── */}
      <section id="product-preview" className="pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card shadow-card-lg dark:shadow-card-lg-dark overflow-hidden">
            {/* Top Mock Window Bar */}
            <div className="px-4 py-2.5 bg-light-surface/70 dark:bg-dark-surface/70 border-b border-light-border dark:border-dark-border flex items-center justify-between text-xs text-light-text-muted dark:text-dark-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-danger/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-warning/50" />
                <span className="w-2.5 h-2.5 rounded-full bg-success/50" />
                <span className="ml-2 font-mono text-[11px]">app.insightiq.in/dashboard</span>
              </div>
              <span className="text-[10px] font-medium text-primary">Live Cockpit Preview</span>
            </div>

            {/* Realistic Dashboard Preview UI */}
            <div className="p-4 sm:p-6 space-y-5 bg-light-bg dark:bg-dark-bg">
              {/* Header preview */}
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div>
                  <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted">Business overview • September 2026</span>
                  <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">
                    Good morning, Dhwanit
                  </h3>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border font-medium">
                  September 2026
                </span>
              </div>

              {/* 4 KPIs preview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Revenue</span>
                    <span className="text-[10px] text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded-full">+12.4%</span>
                  </div>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mt-1">₹24.8L</p>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">vs last month</p>
                </div>

                <div className="p-3.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Profit</span>
                    <span className="text-[10px] text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded-full">+8.7%</span>
                  </div>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mt-1">₹6.4L</p>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">vs last month</p>
                </div>

                <div className="p-3.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Expenses</span>
                    <span className="text-[10px] text-danger font-semibold bg-danger/10 px-1.5 py-0.5 rounded-full">+3.2%</span>
                  </div>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mt-1">₹18.4L</p>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">vs last month</p>
                </div>

                <div className="p-3.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-light-text-secondary dark:text-dark-text-secondary font-medium">Business Health</span>
                    <span className="text-[10px] text-success font-semibold bg-success/10 px-1.5 py-0.5 rounded-full">+4 pts</span>
                  </div>
                  <p className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary mt-1">82/100</p>
                  <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Grade A • Strong</p>
                </div>
              </div>

              {/* Performance chart preview */}
              <div className="p-4 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">
                      Primary Trajectory: Revenue & Profit Trend
                    </h4>
                    <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted">Monthly trajectory in ₹ Lakhs</p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-primary" /> Revenue
                    </span>
                    <span className="flex items-center gap-1 text-light-text-secondary dark:text-dark-text-secondary">
                      <span className="w-2 h-2 rounded-full bg-success" /> Profit
                    </span>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <AreaChartWidget
                    data={previewChartData}
                    keys={[
                      { key: 'revenue', name: 'Revenue (₹L)', color: '#5278A6' },
                      { key: 'profit', name: 'Net Profit (₹L)', color: '#5A8065' },
                    ]}
                    formatter={(v) => `₹${v}L`}
                    height={200}
                  />
                </div>
              </div>

              {/* AI Insight preview */}
              <div className="p-3.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                    Business Insight
                  </span>
                  <span className="text-[10px] text-light-text-muted dark:text-dark-text-muted">
                    Source: Sales + Inventory data
                  </span>
                </div>
                <p className="font-semibold text-light-text-primary dark:text-dark-text-primary text-xs sm:text-sm">
                  Revenue increased 12.4% this month.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-[11px] text-light-text-secondary dark:text-dark-text-secondary pt-1">
                  <div>
                    <strong className="text-light-text-primary dark:text-dark-text-primary">Why it changed: </strong>
                    Retail orders increased across Mumbai and Pune hubs (+24% order frequency).
                  </div>
                  <div>
                    <strong className="text-light-text-primary dark:text-dark-text-primary">Recommended action: </strong>
                    Review inventory levels for highest-performing category before festive demand.
                  </div>
                </div>
                <div className="pt-2 border-t border-light-border dark:border-dark-border flex justify-between items-center text-[10px] text-light-text-muted dark:text-dark-text-muted">
                  <span>Confidence: 91% • Based on 3,842 records, 12 months historical data</span>
                  <span className="text-primary font-medium">Verified by InsightIQ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              Simple Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              How InsightIQ Works
            </h2>
            <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-1 max-w-lg mx-auto">
              Three clear stages designed for SME leaders who need answers, not complex query builders.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-2">
              <span className="text-xs font-mono font-semibold text-primary">01</span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Connect Business Records
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Connect Tally, ERP, sales orders, bank statements, or CSV journals in minutes. No complex database migrations.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-2">
              <span className="text-xs font-mono font-semibold text-primary">02</span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Continuous Analysis
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Algorithms continuously evaluate gross profit margins, inventory burn rate, receivables lag, and regional variance.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-2">
              <span className="text-xs font-mono font-semibold text-primary">03</span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Decide with Clear Evidence
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Receive plain-language answers explaining what changed, why it changed, and what specific action to execute.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ─── */}
      <section id="capabilities" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              Enterprise Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              Industrial-Grade Tools for SME Growth
            </h2>
            <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-1 max-w-lg mx-auto">
              Everything required to manage financial viability, supply chains, and customer revenue.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: FiBarChart2,
                title: 'Revenue & Margin Intelligence',
                desc: 'Track gross vs net margins, detect product line margin compression, and monitor regional order velocity.',
              },
              {
                icon: FiDatabase,
                title: 'Supply Chain Risk Alerts',
                desc: 'Early warning indicators for inventory stockout risks, vendor lead times, and freight transport delays.',
              },
              {
                icon: FiShield,
                title: 'Working Capital & Cash Flow',
                desc: 'Evaluate 6-month cash runway, model receivables payment cycles, and optimize vendor settlement terms.',
              },
              {
                icon: FiLayers,
                title: 'Account Churn Prediction',
                desc: 'Identify corporate accounts exhibiting usage reduction before contracts expire, protecting ARR.',
              },
              {
                icon: FiTrendingUp,
                title: 'GST & Audit Reconciliation',
                desc: 'Generate audit-ready P&L reports compliant with Indian GST requirements and MCA filing norms.',
              },
              {
                icon: FiAlertCircle,
                title: 'Autonomous Business Copilot',
                desc: 'Ask direct executive questions in natural language and receive structured evidence-backed analysis.',
              },
            ].map((cap, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border flex items-center justify-center text-primary mb-2">
                  <cap.icon className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {cap.title}
                </h3>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  {cap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section id="use-cases" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              Built for Decision Makers
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              Who Uses InsightIQ
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                For Founders & CEOs
              </span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Executive Clarity in Minutes
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Replace fragmented spreadsheets with a single business health cockpit. Know exactly what changed in sales, profit, and risk every morning.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                For CFOs & Finance Teams
              </span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Margin & Cash Flow Control
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Monitor invoice aging, forecast seasonal working capital needs, and generate audit-ready GST filing statements with one click.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card space-y-3">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                For Operations Managers
              </span>
              <h3 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary">
                Supply Chain Resilience
              </h3>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                Track low inventory thresholds across regional warehouses (e.g. Surat, Bhiwandi, Pune) and prevent costly manufacturing stoppages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS (Realistic Indian SME Context) ─── */}
      <section id="testimonials" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              Client Validation
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              Trusted by Indian SME Leaders
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "InsightIQ gave us immediate visibility into retail reorders across Maharashtra. The inventory risk warning saved us from stockouts during our peak festive season.",
                author: "Rajesh Sharma",
                role: "Managing Director, Arvind Textiles Pvt. Ltd.",
              },
              {
                quote: "The AI analyst feels like having a senior financial director on call. It does not just show numbers—it explains why profit changed and what vendor contracts to renegotiate.",
                author: "Sunil Agarwal",
                role: "CFO, NovaMart Retail Pvt. Ltd.",
              },
              {
                quote: "We consolidated our accounting and dispatch logs in one morning. The 82/100 business health score is now our executive team's weekly benchmark.",
                author: "Ananya Iyer",
                role: "Operations Lead, Shreeji Foods Pvt. Ltd.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex gap-0.5 text-warning">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <FiStar key={j} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-light-border dark:border-dark-border">
                  <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">{t.author}</p>
                  <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 31. ABOUT US (Kept after Testimonials, human copy, no corporate buzzwords) ─── */}
      <section id="about" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              About Us
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              Why We Built InsightIQ
            </h2>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
            <p>
              Running an SME in India means making critical decisions every day—pricing wholesale orders, negotiating credit terms, balancing stock across regional warehouses, and managing cash flow.
            </p>
            <p>
              Most businesses have data, but it is trapped across accounting software, dispatch registers, supplier PDFs, and spreadsheets. Business owners end up waiting until the end of the month to discover whether margins contracted or inventory stalled.
            </p>
            <p>
              We built InsightIQ to give growing Indian enterprises the same analytical precision and intelligence that multinational corporations enjoy, without requiring a team of data scientists. We believe business software should be calm, credible, fast, and easy to understand every day.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Who It's For</h4>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-1 leading-relaxed">
                Indian SMEs, manufacturers, distributors, and B2B SaaS companies managing ₹50L to ₹50Cr annual turnover.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Problem We Solve</h4>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-1 leading-relaxed">
                Eliminating delayed decision-making caused by fragmented data and slow manual monthly reconciliations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card">
              <h4 className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">Our Principle</h4>
              <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-1 leading-relaxed">
                Explainable AI: never show a metric without explaining what changed, why it changed, and the verified data source.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
              Transparent Plans
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary mt-1">
              Predictable Pricing for Indian Businesses
            </h2>
            <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-1 max-w-md mx-auto">
              Every tier includes live KPI tracking, GST audit formatting, and explainable AI insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Starter */}
            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Starter Tier</span>
                <div>
                  <span className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">₹3,999</span>
                  <span className="text-xs text-light-text-muted dark:text-dark-text-muted"> / month</span>
                </div>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">For small business teams establishing data tracking.</p>
                <ul className="space-y-2 text-xs text-light-text-secondary dark:text-dark-text-secondary pt-2 border-t border-light-border dark:border-dark-border">
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> 5 Team Seats</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Core Revenue & P&L Cockpit</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> 1,000 Monthly AI Queries</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Automated Monthly Statements</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="mt-6 w-full py-2 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 border border-light-border dark:border-dark-border text-xs font-medium cursor-pointer transition-colors"
              >
                Start Evaluation
              </button>
            </div>

            {/* Professional */}
            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border-2 border-primary shadow-card flex flex-col justify-between relative">
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-semibold uppercase tracking-wider">
                Recommended
              </span>
              <div className="space-y-3">
                <span className="text-xs font-semibold text-primary">Professional Tier</span>
                <div>
                  <span className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">₹11,999</span>
                  <span className="text-xs text-light-text-muted dark:text-dark-text-muted"> / month</span>
                </div>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">For growing enterprises with multi-hub distribution.</p>
                <ul className="space-y-2 text-xs text-light-text-secondary dark:text-dark-text-secondary pt-2 border-t border-light-border dark:border-dark-border">
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-primary" /> 25 Team Seats</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-primary" /> Supply Chain & Inventory Alerts</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-primary" /> Corporate Account Churn Models</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-primary" /> 10,000 Monthly AI Queries</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-primary" /> Custom Audit Exports & GST Sync</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="mt-6 w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-medium cursor-pointer transition-colors shadow-card"
              >
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-5 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border shadow-card flex flex-col justify-between">
              <div className="space-y-3">
                <span className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Enterprise Tier</span>
                <div>
                  <span className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">Custom</span>
                </div>
                <p className="text-xs text-light-text-muted dark:text-dark-text-muted">For large SME groups and conglomerate divisions.</p>
                <ul className="space-y-2 text-xs text-light-text-secondary dark:text-dark-text-secondary pt-2 border-t border-light-border dark:border-dark-border">
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Unlimited Team Seats</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Full ERP & SAP/Tally Connectors</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Custom Machine Learning Models</li>
                  <li className="flex items-center gap-1.5"><FiCheck className="w-3.5 h-3.5 text-success" /> Dedicated Account Director & SLA</li>
                </ul>
              </div>
              <button
                onClick={() => navigate('/signup')}
                className="mt-6 w-full py-2 rounded-lg bg-light-surface dark:bg-dark-surface hover:bg-slate-200/70 dark:hover:bg-dark-border/60 border border-light-border dark:border-dark-border text-xs font-medium cursor-pointer transition-colors"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="py-14 sm:py-20 border-t border-light-border dark:border-dark-border bg-light-surface/40 dark:bg-dark-surface/40">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-light-text-primary dark:text-dark-text-primary">
            Ready to understand your business performance?
          </h2>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted max-w-lg mx-auto">
            Experience our decision intelligence platform with preloaded Indian SME data in 60 seconds.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-card transition-colors cursor-pointer"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium text-light-text-primary dark:text-dark-text-primary transition-colors cursor-pointer"
            >
              View Live Cockpit
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-light-border dark:border-dark-border py-8 text-xs text-light-text-muted dark:text-dark-text-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center font-bold text-[10px]">
              IQ
            </div>
            <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">InsightIQ</span>
            <span>• Decision Intelligence for Indian SMEs</span>
          </div>
          <p className="text-[11px]">Â© 2026 InsightIQ Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
