import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-center text-slate-600 mb-6">
              We encountered an unexpected error. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <div className="bg-slate-50 rounded-lg p-4 mb-4 overflow-auto max-h-32">
                <p className="text-xs font-mono text-slate-700">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
