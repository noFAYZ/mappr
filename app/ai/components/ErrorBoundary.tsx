"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardBody, Button } from "@heroui/react";
import { AlertTriangle, RefreshCw, Bug } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Log error to monitoring service
    this.logErrorToService(error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you'd send this to your error monitoring service
    console.group(`🚨 Error ${this.state.errorId}`);
    console.error("Error:", error);
    console.error("Component Stack:", errorInfo.componentStack);
    console.error("Error Stack:", error.stack);
    console.groupEnd();
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorId: Math.random().toString(36).substr(2, 9),
    });
  };

  private handleReportError = () => {
    const { error } = this.state;

    if (!error) return;

    // Create error report
    const errorReport = {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      errorId: this.state.errorId,
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2));
    alert("Error report copied to clipboard");
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="m-4 border-danger-200 bg-danger-50 dark:bg-danger-950/20">
          <CardBody className="text-center p-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-danger-100 dark:bg-danger-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-danger-500" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-danger-800 dark:text-danger-200 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-danger-600 dark:text-danger-400 mb-4">
                  We encountered an unexpected error while rendering this
                  content.
                </p>

                {this.state.error && (
                  <details className="text-left bg-danger-100 dark:bg-danger-900/20 p-3 rounded-lg mb-4">
                    <summary className="cursor-pointer text-sm font-medium text-danger-700 dark:text-danger-300">
                      Error Details
                    </summary>
                    <pre className="text-xs text-danger-600 dark:text-danger-400 mt-2 overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </details>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  color="danger"
                  startContent={<RefreshCw className="w-4 h-4" />}
                  variant="solid"
                  onPress={this.handleRetry}
                >
                  Try Again
                </Button>

                <Button
                  color="danger"
                  startContent={<Bug className="w-4 h-4" />}
                  variant="light"
                  onPress={this.handleReportError}
                >
                  Report Error
                </Button>
              </div>

              <p className="text-xs text-danger-500 dark:text-danger-400">
                Error ID: {this.state.errorId}
              </p>
            </div>
          </CardBody>
        </Card>
      );
    }

    return this.props.children;
  }
}
