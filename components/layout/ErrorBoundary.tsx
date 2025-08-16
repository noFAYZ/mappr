"use client";

import React, { Component, ReactNode } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { RefreshCcw } from "lucide-react";

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
    console.error("Layout error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <Card className="max-w-md p-6 border border-divider">
            <CardBody className="text-center">
              <h2 className="text-md font-semibold ">
                Something went wrong
              </h2>
              <p className="text-foreground/70 mb-4 text-xs">
                An error occurred while loading the page.
              </p>
              <div className=" flex w-full justify-center gap-2 ">
                <Button
                  className="rounded-lg text-xs bg-gradient-to-br from-primary-500/90 to-pink-500/90 text-white/90"
                variant="faded"
                  size="sm"
                  onClick={() => this.setState({ hasError: false })}
                >
                  Try again
                </Button>
                <Button
                  className="rounded-lg text-xs"
                  variant="faded"
                  size="sm"
                  onClick={() => window.location.reload()}
                  startContent={<RefreshCcw size={14} />}
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
