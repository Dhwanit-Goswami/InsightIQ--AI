import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiZap, FiGithub } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
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

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mb-8">
            Enter your credentials to access your enterprise decision cockpit.
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

            <div className="flex items-center justify-between text-xs font-medium">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-light-border dark:border-dark-border text-primary focus:ring-primary/20 accent-primary"
                />
                <span className="text-light-text-secondary dark:text-dark-text-secondary">Remember session</span>
              </label>
              <Link to="/forgot-password" className="text-primary hover:underline font-semibold">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" fullWidth loading={loading}>
              Sign In to Workspace
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-light-border dark:border-dark-border"></div></div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider"><span className="bg-light-bg dark:bg-dark-bg px-3 text-light-text-muted dark:text-dark-text-muted">Or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <FcGoogle className="w-4 h-4" />
              <span>Google</span>
            </button>
            <button className="flex items-center justify-center gap-2.5 py-2 px-4 rounded-xl bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border text-xs font-semibold hover:border-slate-300 dark:hover:border-slate-700 transition-all">
              <FiGithub className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-semibold">
              Sign up for workspace
            </Link>
          </p>
        </div>
      </div>

      {/* Decorative Right Side Panel */}
      <div className="hidden lg:flex flex-1 relative bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border items-center justify-center p-12">
        <div className="relative z-10 text-center max-w-md space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto shadow-card">
            <FiZap className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold tracking-tight">Enterprise Decision Engine</h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed font-medium">
            NexusAI integrates with your ERP, CRM, and financial accounting systems to deliver predictive revenue models, supply chain alerts, and decision recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
