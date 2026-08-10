import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiZap, FiArrowLeft } from 'react-icons/fi';
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
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-stretch text-light-text-primary dark:text-dark-text-primary transition-colors duration-200">
      {/* Form Left Side */}
      <div className="flex-1 flex flex-col justify-center py-12 px-6 sm:px-16 lg:px-24 xl:px-32 z-10 relative">
        <div className="mx-auto w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-xs">
              <FiZap className="w-4 h-4" />
            </div>
            <span className="text-xl font-bold tracking-tight">NexusAI</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Reset Password</h2>
          
          {success ? (
            <div className="bg-success-bg dark:bg-success/20 border border-success/30 p-5 rounded-2xl mb-6 space-y-3">
              <p className="text-xs font-bold text-success flex items-center gap-1.5 uppercase tracking-wider">
                ✓ Verification Email Sent
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary leading-relaxed font-medium">
                If the email address exists in our corporate directory, you will receive password reset instructions shortly.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline font-semibold text-xs pt-1">
                <FiArrowLeft className="w-3.5 h-3.5" /> Return to Sign In
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mb-8">
                Enter your work email address to receive password reset instructions.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  Send Reset Instructions
                </Button>
              </form>

              <p className="mt-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
                Remember your password?{' '}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Decorative Right Side Panel */}
      <div className="hidden lg:flex flex-1 relative bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-card">
            <FiZap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Enterprise Security Standards</h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed font-medium">
            Securing corporate databases with TLS 1.3 protocol encryption, AES-256 data security, and optional SAML 2.0 Single Sign-On (SSO).
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
