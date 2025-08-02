"use client";

import React from 'react';
import { Card } from '@heroui/react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChatMessage Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Card className="p-4 bg-danger-50 dark:bg-danger-900/20 border-danger-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-danger-500 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-danger-700 dark:text-danger-300">
                Message Rendering Error
              </h4>
              <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">
                {this.state.error?.message || 'An unexpected error occurred while rendering this message.'}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-danger-100 hover:bg-danger-200 text-danger-700 rounded transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}