import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiBriefcase, FiAlertCircle } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [fullName, setFullName]         = useState('');
  const [companyName, setCompanyName]   = useState('');
  const [businessType, setBusinessType] = useState('manufacturing');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register({
        name:         fullName,
        email,
        password,
        company_name: companyName,
        industry:     businessType,
      });
      navigate('/dashboard');
    } catch (err) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string' ? detail
          : Array.isArray(detail)  ? detail.map(d => d.msg).join('; ')
          : 'Registration failed. Please check your details and try again.'
      );
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

      {/* Main Signup Card */}
      <div className="w-full max-w-md bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl p-6 shadow-card dark:shadow-card-dark">
        <div className="mb-5">
          <h1 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary tracking-tight">
            Create an enterprise workspace
          </h1>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted mt-0.5">
            Start your 14-day evaluation with live decision intelligence.
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
            <FiAlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <Input
            label="Full Name"
            type="text"
            placeholder="Dhwanit Goswami"
            icon={FiUser}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Company Name"
              type="text"
              placeholder="Vardaan Electronics Pvt. Ltd."
              icon={FiBriefcase}
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                Sector
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="input-field py-2 text-xs font-medium cursor-pointer"
                required
              >
                <option value="manufacturing">Manufacturing</option>
                <option value="retail">Retail & FMCG</option>
                <option value="saas">IT Services & SaaS</option>
                <option value="textiles">Textiles & Garments</option>
                <option value="logistics">Logistics & Supply Chain</option>
                <option value="other">Other Services</option>
              </select>
            </div>
          </div>

          <Input
            label="Work Email Address"
            type="email"
            placeholder="dhwanit@company.in"
            icon={FiMail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Create Password"
            type="password"
            placeholder="Minimum 8 characters"
            icon={FiLock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="pt-1">
            <Button type="submit" fullWidth loading={loading}>
              Create Workspace
            </Button>
          </div>
        </form>

        <div className="pt-5 mt-5 border-t border-light-border dark:border-dark-border text-center">
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            Already have an active account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      <p className="text-[11px] text-light-text-muted dark:text-dark-text-muted mt-6 text-center">
        By continuing, you agree to our Terms of Service & Privacy Policy.
      </p>
    </div>
  );
};

export default Signup;
