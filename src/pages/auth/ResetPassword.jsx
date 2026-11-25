import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '../../services/api';
import { FiLock, FiEye, FiEyeOff, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid or expired token. Please request a new reset link.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">IQ</span>
            </div>
            <span className="text-xl font-bold text-white">InsightIQ</span>
          </div>
          <p className="text-dark-text-muted text-sm">AI-Powered Decision Intelligence</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          {success ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <FiCheckCircle className="w-16 h-16 text-success" />
              </div>
              <h2 className="text-xl font-bold text-dark-text-primary">Password Updated!</h2>
              <p className="text-dark-text-muted text-sm">
                Your password has been reset successfully. Redirecting to login…
              </p>
              <Link to="/login" className="text-primary text-sm hover:underline">
                Go to Login Now
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-dark-text-primary">Set New Password</h2>
                <p className="text-dark-text-muted text-sm mt-1">
                  Enter your new password below.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-danger/15 border border-danger/30 rounded-xl flex items-start gap-2 text-danger text-xs">
                  <FiAlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!error || token ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-dark-text-secondary mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted w-4 h-4" />
                      <input
                        type={showPw ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        required
                        className="w-full pl-9 pr-10 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-text-muted hover:text-dark-text-secondary"
                      >
                        {showPw ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dark-text-secondary mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-muted w-4 h-4" />
                      <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Repeat new password"
                        required
                        className="w-full pl-9 pr-3 py-2.5 bg-dark-bg border border-dark-border rounded-xl text-sm text-dark-text-primary placeholder-dark-text-muted focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating…' : 'Set New Password'}
                  </button>
                </form>
              ) : null}

              <p className="text-center text-xs text-dark-text-muted mt-5">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Back to Login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
