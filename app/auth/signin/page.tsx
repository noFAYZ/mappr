"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import { Divider } from '@heroui/divider';
import { Checkbox } from '@heroui/checkbox';
import NextLink from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Chrome,
  Github,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  LockIcon,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/stores';
import { LogoLoader, LogoMappr } from '@/components/icons';

// Form validation schema
const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { addNotification } = useUIStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const message = searchParams.get('message');
  const error = searchParams.get('error');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  // Display messages from URL params
  useEffect(() => {
    if (message) {
      addNotification({
        type: 'info',
        title: 'Info',
        message: decodeURIComponent(message),
      });
    }
    if (error) {
      addNotification({
        type: 'error',
        title: 'Authentication Error',
        message: decodeURIComponent(error),
      });
    }
  }, [message, error, addNotification]);

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Sign In Failed',
          message: error.message,
        });
        return;
      }

      addNotification({
        type: 'success',
        title: 'Welcome back!',
        message: 'You have been signed in successfully.',
      });

      router.push(redirectTo);
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

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setSocialLoading(provider);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Social Sign In Failed',
          message: error.message,
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setSocialLoading(null);
    }
  };

  const handleMagicLink = async () => {
    const email = watch('email');
    if (!email) {
      addNotification({
        type: 'warning',
        title: 'Email Required',
        message: 'Please enter your email address first.',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Magic Link Failed',
          message: error.message,
        });
        return;
      }

      addNotification({
        type: 'success',
        title: 'Magic Link Sent!',
        message: 'Check your email for a sign-in link.',
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

  if (authLoading) {
    return (
      <div className="flex flex-col gap-3 items-center justify-center min-h-screen">
        <Card className='flex flex-col  items-center justify-center  p-8 md:px-10 border border-divider rounded-2xl'>
        <LogoLoader className='w-12 h-12 mb-6' />

        <h1 className='text-medium leading-tight font-semibold'>Authenticating..</h1>
        <p className='text-sm text-default-600'>Please wait while log you in.</p>
       </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center  bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10 relative">
      


      <div className="w-full max-w-md relative">
        
        {/* Back Button */}
        <Button
          as={NextLink}
          href="/"
          variant="faded"
          startContent={<ArrowLeft className="w-4 h-4" />}
          size='sm'
          className="mb-4  backdrop-blur-sm shadow-md"
          disableRipple
        >
          Back 
        </Button>

        <Card className=" backdrop-blur-xl border border-divider shadow-2xl rounded-xl">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="text-center w-full">
              <div className="flex items-center justify-center mb-4">
               <LogoMappr className='w-12 h-12' />
              </div>
         
              <h1 className="text-default-600 text-sm">
                Sign in to your MoneyMappr account
              </h1>
            </div>
          </CardHeader>
          
          <CardBody className="px-8 pb-8">
            
            {/* Social Sign In */}
            <div className="flex gap-4 mb-6">
              <Button
                className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 text-xs shadow-md"
                startContent={<Chrome className="w-4 h-4" />}
                isLoading={socialLoading === 'google'}
                onPress={() => handleSocialAuth('google')}
                disableRipple
              >
                Signin with Google
              </Button>
              
              <Button
                className="w-full shadow-md bg-gray-900 text-xs hover:bg-gray-800 text-white"
                startContent={<Github className="w-4 h-4" />}
                isLoading={socialLoading === 'github'}
                onPress={() => handleSocialAuth('github')}
                disableRipple
              >
                Signin with GitHub
              </Button>
            </div>

            <div className="relative my-6">
              <Divider />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-default-500">
                or continue with email
              </span>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
              <div>
                <Input
                  {...register('email')}
                  type="email"
           
                  placeholder="Enter your email"
                  startContent={<Mail className="w-4 h-4 text-default-400" />}
                  variant="faded"
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  labelPlacement='outside'
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                  }}
                />
              </div>

              <div className='mt-8'>
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
            
                  placeholder="Enter your password"
         
                  startContent={<Lock className="w-4 h-4 text-default-400" />}
                  endContent={
                    <Button
                      isIconOnly
                      variant="flat"
                      size="sm"
                      className="w-6 h-6 min-w-6"
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  }
                  variant="faded"
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  classNames={{
                    input: "text-sm",
                    inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Checkbox
                  {...register('rememberMe')}
                  size="sm"
                  classNames={{
                    label: "text-sm text-default-600"
                  }}
                >
                  Remember me
                </Checkbox>
                <Link
                  as={NextLink}
                  href="/auth/forgot-password"
                  size="sm"
                  className="text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                variant='faded'
                className='w-full'
                startContent={<LockIcon className="w-4 h-4" />}
            
               
                size="md"
                isLoading={isLoading}
                isDisabled={!isValid}
              >
                Sign In
              </Button>
            </form>

            {/* Magic Link Option */}
            <div className="mt-4">
              <Button
                variant="flat"
                className="w-full"
                startContent={<Sparkles className="w-4 h-4" />}
                onPress={handleMagicLink}
                isLoading={isLoading}
              >
                Send Magic Link
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-default-600">
                Don't have an account?{' '}
                <Link
                  as={NextLink}
                  href={`/auth/signup${redirectTo !== '/dashboard' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up for free
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 py-2 px-3 bg-success-50 border border-success-50 rounded-lg">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-success-700 flex-shrink-0" />
                <div className="text-xs text-success-700">
                  <strong>Secure Sign In:</strong> Your data is protected with bank-level encryption. 
                  We never store your passwords in plain text.
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mt-4 text-center">
              <p className="text-xs text-default-400">
                By signing in, you agree to our{' '}
                <Link href="/terms" size="sm" className="text-primary-600 text-xs">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" size="sm" className="text-primary-600 text-xs">Privacy Policy</Link>
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}