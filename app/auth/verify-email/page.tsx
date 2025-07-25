"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Link } from '@heroui/link';
import NextLink from 'next/link';
import { Mail, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/stores';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addNotification } = useUIStore();
  
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const email = searchParams.get('email') || '';

  // Handle cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const resendVerification = async () => {
    if (!email) {
      addNotification({
        type: 'error',
        title: 'Email Required',
        message: 'No email address provided.',
      });
      return;
    }

    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Resend Failed',
          message: error.message,
        });
        return;
      }

      addNotification({
        type: 'success',
        title: 'Email Sent',
        message: 'A new verification email has been sent.',
      });

      setResendCooldown(60); // 1 minute cooldown
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10">
      <div className="w-full max-w-md">
        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
          <CardBody className="p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary-600" />
            </div>
            
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-default-600 mb-6">
              We've sent a verification link to{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-warning-600 mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-medium text-warning-800 text-sm">Important</h3>
                    <p className="text-warning-700 text-xs mt-1">
                      Please check your spam folder if you don't see the email in your inbox.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                color="primary"
                className="w-full"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={resendVerification}
                isLoading={isResending}
                isDisabled={resendCooldown > 0}
              >
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend verification email'
                }
              </Button>
              
              <Button
                as={NextLink}
                href="/auth/signin"
                variant="flat"
                className="w-full"
              >
                Back to Sign In
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-default-500">
                Need help?{' '}
                <Link href="/support" size="sm" className="text-primary-600">
                  Contact Support
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
