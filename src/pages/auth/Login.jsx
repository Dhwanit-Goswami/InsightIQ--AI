import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail]               = useState('demo@insightiq.ai');
  const [password, setPassword]         = useState('Password@123');
  const [rememberMe, setRememberMe]     = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Invalid email or password. Please try again.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
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

      {/* Main Login Card */}
      <div className="w-full max-w-sm bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 shadow-card dark:shadow-card-dark">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
            Sign in to your workspace
          </h1>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
            Enter your credentials to access business intelligence.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

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

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={FiLock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showPasswordToggle
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            required
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-light-border dark:border-dark-border text-primary accent-primary"
              />
              <span className="text-light-text-secondary dark:text-dark-text-secondary">Keep me signed in</span>
            </label>
            <Link to="/forgot-password" className="text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" fullWidth loading={loading} className="mt-1">
            Sign In
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
          <p className="font-semibold mb-0.5">Demo credentials pre-filled</p>
          <p>Email: demo@insightiq.ai  •  Password: Password@123</p>
        </div>

        <div className="pt-5 mt-5 border-t border-light-border dark:border-dark-border text-center">
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            Don't have an enterprise account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle security footer note */}
      <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-6 text-center">
        Secured with TLS 1.3 encryption &amp; ISO 27001 compliant standards.
      </p>
    </div>
  );
};

export default Login;
