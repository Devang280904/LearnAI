import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-danger/10 rounded-2xl">
                <AlertTriangle className="w-12 h-12 text-danger" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">
                Something went wrong
              </h2>
              <p className="text-text-secondary max-w-md">
                An unexpected error occurred. Please try refreshing the page or contact support if the issue persists.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-text-secondary hover:text-text-primary rounded-xl font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
            {this.state.error && (
              <details className="text-left mt-4 p-4 bg-bg-secondary rounded-xl border border-border">
                <summary className="text-sm text-text-muted cursor-pointer">
                  Error Details
                </summary>
                <pre className="mt-2 text-xs text-danger overflow-x-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
