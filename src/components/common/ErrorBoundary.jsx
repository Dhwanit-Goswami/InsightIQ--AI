import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('InsightIQ Application Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoDashboard = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback({
          error: this.state.error,
          resetErrorBoundary: this.handleReset,
        });
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 w-full">
          <div className="max-w-lg w-full bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl p-6 sm:p-8 shadow-card dark:shadow-card-dark text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto ring-8 ring-danger/5">
              <FiAlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary tracking-tight">
                An unexpected view error occurred
              </h2>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary max-w-sm mx-auto leading-relaxed">
                The application encountered an error while rendering this component. The rest of your data and session are secure.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-light-bg dark:bg-dark-bg p-3.5 rounded-xl border border-light-border dark:border-dark-border text-left overflow-x-auto max-h-36">
                <p className="text-xs font-mono text-danger font-semibold break-words">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary text-white hover:bg-primary/90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <FiRefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
              <button
                onClick={this.handleReload}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-light-border dark:border-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleGoDashboard}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-light-border dark:border-dark-border text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary hover:bg-light-hover dark:hover:bg-dark-hover transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FiHome className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
