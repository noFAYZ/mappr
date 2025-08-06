"use client";

import React, { Component, ReactNode } from 'react';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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
    console.error('Layout error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardBody className="text-center">
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-foreground/70 mb-4">
                An error occurred while loading the page.
              </p>
              <div className="space-y-2">
                <Button 
                  color="primary" 
                  onClick={() => this.setState({ hasError: false })}
                  className="w-full"
                >
                  Try again
                </Button>
                <Button 
                  variant="light" 
                  onClick={() => window.location.reload()}
                  className="w-full"
                >
                  Reload page
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}