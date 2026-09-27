import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useTheme } from '../context/ThemeContext';
import { FiSun, FiMoon, FiBell, FiEye, FiGlobe, FiCheckCircle } from 'react-icons/fi';

const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
      checked ? 'bg-primary' : 'bg-light-border dark:bg-dark-border'
    }`}
  >
    <span
      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0.5'
      }`}
    />
  </button>
);

const Settings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Workspace configuration toggles
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [aiInsights, setAiInsights] = useState(true);
  const [revenueAlerts, setRevenueAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Workspace Configuration</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Configure theme aesthetics, notification broadcasts, and regional standards.</p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} loading={saving}>
          Save Preferences
        </Button>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="p-3 bg-success/15 border border-success/30 text-success text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-down">
          <FiCheckCircle className="w-4 h-4" />
          Workspace preferences saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Options */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appearance Card */}
          <Card className="space-y-5">
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider flex items-center gap-2">
              <FiEye className="text-primary w-4 h-4" />
              Theme Mode Preferences
            </h3>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed -mt-2">
              Select your preferred visual system. Dark Mode optimizes data visualization clarity during extended analysis sessions.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => { if (!isDark) toggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                  isDark
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                }`}
              >
                <FiMoon className="w-4 h-4" /> Dark Mode
              </button>
              <button
                onClick={() => { if (isDark) toggleTheme(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold transition-all ${
                  !isDark
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                }`}
              >
                <FiSun className="w-4 h-4" /> Light Mode
              </button>
            </div>
          </Card>

          {/* Email Notifications Card — now uses toggle switches */}
          <Card className="space-y-5">
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider flex items-center gap-2">
              <FiBell className="text-primary w-4 h-4" />
              Intelligence Broadcast Rules
            </h3>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed -mt-2">
              Decide when InsightIQ broadcasts automated alerts and reports to external channels.
            </p>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {[
                { label: 'Weekly Performance Digest', desc: 'Summary of quarterly revenue & operational metrics.', state: weeklyDigest, setter: setWeeklyDigest },
                { label: 'AI Anomaly & Forecasting Alerts', desc: 'Instant notification when risk vectors exceed normal thresholds.', state: aiInsights, setter: setAiInsights },
                { label: 'Critical Sales Inflow Notifications', desc: 'Alerts on major revenue changes exceeding ₹1,00,000.', state: revenueAlerts, setter: setRevenueAlerts },
                { label: 'Push Notifications', desc: 'Browser and mobile reminders for critical updates.', state: pushAlerts, setter: setPushAlerts },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-xs font-semibold text-light-text-primary dark:text-dark-text-primary">{item.label}</p>
                    <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">{item.desc}</p>
                  </div>
                  <Toggle checked={item.state} onChange={item.setter} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Workspace Details Sidebar */}
        <Card className="space-y-5 self-start">
          <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider flex items-center gap-2">
            <FiGlobe className="text-primary w-4 h-4" />
            Regional Specifications
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase">Standard Currency</label>
              <select className="input-field py-2 text-xs">
                <option value="INR">INR (₹) Indian Rupee</option>
                <option value="USD">USD ($) US Dollar</option>
                <option value="EUR">EUR (€) Euro</option>
                <option value="GBP">GBP (Â£) British Pound</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase">System Timezone</label>
              <select className="input-field py-2 text-xs">
                <option value="IST">Asia/Kolkata (IST +5:30)</option>
                <option value="PST">America/Los_Angeles (PST)</option>
                <option value="EST">America/New_York (EST)</option>
                <option value="GMT">Europe/London (GMT)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase">Fiscal Year Start</label>
              <select className="input-field py-2 text-xs">
                <option value="april">April 1 (India Standard)</option>
                <option value="jan">January 1 (Calendar Year)</option>
              </select>
            </div>
          </div>
          <div className="pt-3 border-t border-light-border dark:border-dark-border">
            <p className="text-[10px] font-bold text-light-text-muted dark:text-dark-text-muted uppercase mb-2">Platform Version</p>
            <p className="text-xs text-light-text-primary dark:text-dark-text-primary font-semibold">InsightIQ Enterprise v1.0.0</p>
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted mt-0.5">Last system update: September 2026</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
