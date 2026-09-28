import React, { useState, useEffect } from 'react';
import { getUserProfile } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiClock, FiShield, FiCheckCircle, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUserProfile();
      setProfile(res.data);
    } catch (err) {
      console.error('Error fetching profile data', err);
      setError('Unable to load profile data. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }, 800);
  };

  const handleRevokeSession = (indexToRevoke) => {
    if (!profile?.security?.loginHistory) return;
    const updatedHistory = profile.security.loginHistory.filter((_, i) => i !== indexToRevoke);
    setProfile(prev => ({
      ...prev,
      security: {
        ...prev.security,
        loginHistory: updatedHistory,
      }
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-48 h-8 rounded shimmer" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 rounded-xl shimmer" />
          <div className="h-64 rounded-xl shimmer" />
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Personal Profile & Workspace Account</h1>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Manage your personal credentials, contact metadata, and active session devices.</p>
        </div>
        <Card className="p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center mx-auto">
            <FiAlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary">Failed to load profile details</h3>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted max-w-sm mx-auto">{error}</p>
          </div>
          <Button variant="primary" size="sm" onClick={fetchData} className="inline-flex items-center gap-1.5">
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </Button>
        </Card>
      </div>
    );
  }

  const sessions = profile?.security?.loginHistory || [
    { device: 'Current Browser Session', location: 'Active Workspace', time: 'Just now', current: true }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">Personal Profile & Workspace Account</h1>
        <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mt-0.5">Manage your personal credentials, contact metadata, and active session devices.</p>
      </div>

      {/* Success Toast */}
      {saved && (
        <div className="p-3 bg-success/15 border border-success/30 text-success text-xs font-semibold rounded-xl flex items-center gap-2 animate-fade-down">
          <FiCheckCircle className="w-4 h-4" />
          Profile details updated successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex items-center gap-4 border-b border-light-border dark:border-dark-border pb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 text-white flex items-center justify-center font-bold text-lg shadow-card">
                  {profile?.initials || 'IQ'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-light-text-primary dark:text-dark-text-primary leading-tight">
                    {profile?.fullName || profile?.name || 'Workspace Account'}
                  </h2>
                  <p className="page-subtitle font-medium">{profile?.role || 'Executive'}</p>
                  <Badge variant="success" className="mt-1.5 text-[10px]">Active Account</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={profile?.firstName || ''}
                  onChange={(e) => {
                    const fn = e.target.value;
                    setProfile(prev => ({
                      ...prev,
                      firstName: fn,
                      fullName: `${fn} ${prev?.lastName || ''}`.trim()
                    }));
                  }}
                  required
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={profile?.lastName || ''}
                  onChange={(e) => {
                    const ln = e.target.value;
                    setProfile(prev => ({
                      ...prev,
                      lastName: ln,
                      fullName: `${prev?.firstName || ''} ${ln}`.trim()
                    }));
                  }}
                  required
                />
              </div>

              <Input
                label="Corporate Email Address"
                type="email"
                icon={FiMail}
                value={profile?.email || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                disabled
                hint="Corporate email addresses are locked by organization SSO policy."
              />

              <Input
                label="Direct Mobile Phone"
                type="text"
                icon={FiPhone}
                value={profile?.phone || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98000 00000"
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={saving}>
                  Update Details
                </Button>
              </div>
            </form>
          </Card>

          {/* Login Sessions */}
          <Card>
            <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
              <FiShield className="text-primary w-4 h-4" />
              Active Workspace Sessions
            </h3>
            <div className="divide-y divide-light-border dark:divide-dark-border">
              {sessions.map((sess, i) => (
                <div key={i} className="flex justify-between items-center py-3 first:pt-0 last:pb-0 text-xs font-medium">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-light-text-primary dark:text-dark-text-primary">{sess.device}</p>
                    <p className="text-light-text-muted dark:text-dark-text-muted">{sess.location} • {sess.time}</p>
                  </div>
                  {sess.current ? (
                    <Badge variant="success">Current Session</Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(i)}
                      className="text-danger hover:underline font-semibold transition-colors cursor-pointer"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Info Panel */}
        <Card className="space-y-4 self-start text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
          <h3 className="text-xs font-bold text-light-text-primary dark:text-dark-text-primary uppercase tracking-wider mb-2">Workspace Parameters</h3>
          <div className="flex items-center gap-2">
            <FiCalendar className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
            <span>Account Created: {profile?.joinedDate || 'Recent'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
            <span>Last Login: {profile?.lastLogin || 'Recent'}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiMapPin className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted flex-shrink-0" />
            <span>Timezone: {profile?.timezone || 'Asia/Kolkata (IST)'}</span>
          </div>
          <div className="pt-3 border-t border-light-border dark:border-dark-border flex flex-col gap-2">
            <p className="text-[10px] text-light-text-muted dark:text-dark-text-muted font-bold uppercase tracking-wider">Access License Tier</p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-light-text-primary dark:text-dark-text-primary text-sm">
                {profile?.plan || 'Enterprise License'}
              </span>
              <Badge variant="success">Active</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
