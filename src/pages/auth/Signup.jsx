import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiZap, FiUser, FiBriefcase } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Signup = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Create Workspace Account</h2>
          <p className="text-xs sm:text-sm text-light-text-muted dark:text-dark-text-muted mb-8">
            Start your 14-day evaluation of the AI decision intelligence platform for Indian SMEs.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Rajesh Verma"
              icon={FiUser}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name"
                type="text"
                placeholder="Vardaan Solutions Pvt. Ltd."
                icon={FiBriefcase}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">Sector</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="input-field py-2 text-xs"
                  required
                >
                  <option value="" disabled>Select sector...</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="retail">Retail & FMCG</option>
                  <option value="saas">IT Services & B2B SaaS</option>
                  <option value="textiles">Textiles & Garments</option>
                  <option value="logistics">Logistics & Supply Chain</option>
                  <option value="other">Other Services</option>
                </select>
              </div>
            </div>
            <Input
              label="Work Email"
              type="email"
              placeholder="rajesh@company.in"
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
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth loading={loading} className="mt-2">
              Create Enterprise Account
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-light-text-muted dark:text-dark-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-semibold">
              Sign In
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
          <h3 className="text-xl font-bold tracking-tight">Accelerate Enterprise Growth</h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted leading-relaxed font-medium">
            Gain immediate operational visibility across profit margins, inventory levels, expense breakdowns, and customer account health.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
