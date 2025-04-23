import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Show a toast notification about the error
    try {
      toast.error("An error occurred. We've encountered an unexpected error. Please try again.", {
        duration: 5000,
        closeButton: true,
        icon: <AlertTriangle className="h-5 w-5" />
      });
    } catch (e) {
      // If toast fails, we still want to show the error UI
      console.error("Failed to show toast:", e);
    }
    // In a production app, you would log this to an error reporting service
    // logErrorToService(error, errorInfo);
  }
  
  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
          <p className="mb-6 text-gray-600 max-w-md">
            We're sorry, but there was an error loading this content. Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-4">
            <Button onClick={this.handleReset} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline">
              Go to Homepage
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
