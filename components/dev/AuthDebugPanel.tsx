"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Divider } from '@heroui/divider';
import { useAuthWithDebug } from '@/lib/hooks/auth/useAuthWithDebug';
import { authDebugger } from '@/lib/utils/auth/auth-debug';
import { authMonitor } from '@/lib/utils/auth/auth-monitor';
import { AuthRecovery } from '@/lib/hooks/auth/auth-recovery';


export function AuthDebugPanel() {
  const auth = useAuthWithDebug();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const updateDebugInfo = async () => {
      const info = await authDebugger.getCurrentAuthInfo();
      setDebugInfo(info);
      setLogs(authDebugger.getLogs().slice(0, 10));
      setMetrics(authMonitor.getAllMetrics());
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 2000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-fit overflow-auto z-50">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Auth Debug Panel</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          {/* Current Status */}
          <div>
            <h4 className="font-medium mb-2">Current Status</h4>
            <div className="text-sm space-y-1">
              <div className={`flex items-center gap-2 ${auth.isLoading ? 'text-warning' : 'text-success'}`}>
                <div className={`w-2 h-2 rounded-full ${auth.isLoading ? 'bg-warning' : 'bg-success'}`} />
                {auth.isLoading ? 'Loading...' : 'Ready'}
              </div>
              <div className={`flex items-center gap-2 ${auth.user ? 'text-success' : 'text-danger'}`}>
                <div className={`w-2 h-2 rounded-full ${auth.user ? 'bg-success' : 'bg-danger'}`} />
                {auth.user ? 'Authenticated' : 'Not authenticated'}
              </div>
              {auth.user && (
                <div className="text-xs text-foreground/60">
                  User: {auth.user.email}
                </div>
              )}
            </div>
          </div>

          <Divider />

          {/* Debug Info */}
          {debugInfo && (
            <div>
              <h4 className="font-medium mb-2">Session Info</h4>
              <div className="text-xs space-y-1">
                <div>Session: {debugInfo.sessionExists ? '✅' : '❌'}</div>
                <div>User: {debugInfo.userExists ? '✅' : '❌'}</div>
                {debugInfo.sessionExpiry && (
                  <div>Expires: {new Date(debugInfo.sessionExpiry).toLocaleString()}</div>
                )}
                {debugInfo.errors && (
                  <div className="text-danger">
                    Errors: {debugInfo.errors.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            <Button
              size="sm"
              variant="flat"
              onClick={() => authDebugger.clearLogs()}
              className="w-full"
            >
              Clear Logs
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="warning"
              onClick={() => AuthRecovery.attemptRecovery()}
              className="w-full"
            >
              Attempt Recovery
            </Button>
            <Button
              size="sm"
              variant="flat"
              color="danger"
              onClick={() => AuthRecovery.resetToCleanState()}
              className="w-full"
            >
              Reset Auth State
            </Button>
          </div>

          {/* Performance Metrics */}
          {metrics && Object.keys(metrics).length > 0 && (
            <>
              <Divider />
              <div>
                <h4 className="font-medium mb-2">Performance</h4>
                <div className="text-xs space-y-1">
                  {Object.entries(metrics).map(([op, data]: [string, any]) => (
                    <div key={op}>
                      {op}: {data?.average?.toFixed(2)}ms avg
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}