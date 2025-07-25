"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import NextLink from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useUIStore } from '@/stores';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { addNotification } = useUIStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Reset Failed',
          message: error.message,
        });
        return;
      }

      setIsSubmitted(true);
      addNotification({
        type: 'success',
        title: 'Reset Link Sent',
        message: 'Check your email for password reset instructions.',
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10">
        <div className="w-full max-w-md">
          <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Check your email</h2>
              <p className="text-default-600 mb-6">
                We've sent password reset instructions to{' '}
                <span className="font-medium">{email}</span>
              </p>
              <div className="space-y-3">
                <Button
                  as={NextLink}
                  href="/auth/signin"
                  color="primary"
                  className="w-full"
                >
                  Back to Sign In
                </Button>
                <Button
                  variant="flat"
                  className="w-full"
                  onPress={() => setIsSubmitted(false)}
                >
                  Try different email
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10">
      <div className="w-full max-w-md">
        <Button
          as={NextLink}
          href="/auth/signin"
          variant="flat"
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="mb-6 bg-background/50 backdrop-blur-sm"
        >
          Back to Sign In
        </Button>

        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="text-center w-full">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Reset your password</h1>
              <p className="text-default-500 mt-2">
                Enter your email and we'll send you a reset link
              </p>
            </div>
          </CardHeader>
          
          <CardBody className="px-8 pb-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="Enter your email"
                startContent={<Mail className="w-4 h-4 text-default-400" />}
                variant="bordered"
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                autoFocus
              />

              <Button
                type="submit"
                color="primary"
                className="w-full font-semibold"
                size="lg"
                isLoading={isLoading}
                isDisabled={!isValid}
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-default-600">
                Remember your password?{' '}
                <Link
                  as={NextLink}
                  href="/auth/signin"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}