import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 mb-6">
        <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-card">
          IQ
        </div>
        <span className="text-base font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
          InsightIQ
        </span>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 shadow-card dark:shadow-card-dark">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
            Reset account password
          </h1>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
            Enter your work email address to receive password recovery steps.
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-lg bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-success">
              <FiCheck className="w-4 h-4" />
              <span>Recovery link dispatched</span>
            </div>
            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
              If an account is associated with <strong className="text-light-text-primary dark:text-dark-text-primary">{email}</strong>, a secure password reset link has been sent.
            </p>
            <div className="pt-2">
              <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                <FiArrowLeft className="w-3 h-3" /> Return to sign in
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              placeholder="name@company.in"
              icon={FiMail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button type="submit" fullWidth loading={loading}>
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link to="/login" className="inline-flex items-center gap-1 text-xs text-light-text-muted dark:text-dark-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors font-medium">
                <FiArrowLeft className="w-3 h-3" /> Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
