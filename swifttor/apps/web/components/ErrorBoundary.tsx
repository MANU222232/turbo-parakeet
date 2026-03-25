'use client';

import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ✅ AGENT: Error Boundary component to catch React errors and prevent full app crash
 * Usage: Wrap around routes or page sections
 * Example: <ErrorBoundary><YourComponent /></ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to console for debugging (in production, send to error tracking service like Sentry)
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-[100dvh] bg-background text-foreground flex flex-col items-center justify-center p-4 font-sans">
          {/* Error Icon */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-warning/10 mb-6">
            <AlertTriangle className="h-10 w-10 text-warning" />
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-black tracking-tight mb-3 text-center">
            Something Went Wrong
          </h1>

          {/* Error Message */}
          <p className="text-sm text-neutral-400 text-center mb-2 max-w-md">
            We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
          </p>

          {/* Error Details (Dev Only) */}
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="w-full max-w-2xl mt-6 p-4 bg-surface rounded-lg border border-white/5 text-xs font-mono text-neutral-500 overflow-auto max-h-32">
              <div className="font-bold text-warning mb-2">Error Details:</div>
              <div className="text-left">{this.state.error.toString()}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={this.reset}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 active:scale-95 transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-surface border border-white/10 text-white rounded-lg font-bold text-sm hover:bg-surface/80 active:scale-95 transition-all"
            >
              Go Home
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}
