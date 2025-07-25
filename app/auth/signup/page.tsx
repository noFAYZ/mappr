"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Link } from '@heroui/link';
import { Divider } from '@heroui/divider';
import { Checkbox } from '@heroui/checkbox';
import { Progress } from '@heroui/progress';
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
  User,
  Chrome,
  Github,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sparkles
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/stores';

// Password strength checker
const getPasswordStrength = (password: string) => {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;
  
  return {
    score,
    checks,
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
    percentage: (score / 5) * 100,
  };
};

// Form validation schema
const signUpSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  company: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  marketingEmails: z.boolean().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { addNotification } = useUIStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const redirectTo = searchParams.get('redirect') || '/onboarding';
  const inviteCode = searchParams.get('invite');
  const planType = searchParams.get('plan') || 'free';

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    trigger
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      company: '',
      agreeToTerms: false,
      marketingEmails: true,
    }
  });

  const password = watch('password');
  const passwordStrength = password ? getPasswordStrength(password) : null;

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    
    try {
      // First, create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            company: data.company || null,
            marketing_emails: data.marketingEmails,
            invite_code: inviteCode,
            plan_type: planType,
          },
        },
      });

      if (authError) {
        addNotification({
          type: 'error',
          title: 'Sign Up Failed',
          message: authError.message,
        });
        return;
      }

      // If email confirmation is required
      if (authData.user && !authData.session) {
        addNotification({
          type: 'success',
          title: 'Account Created!',
          message: 'Please check your email to confirm your account.',
        });
        router.push('/auth/verify-email?email=' + encodeURIComponent(data.email));
        return;
      }

      // If user is immediately signed in
      if (authData.session) {
        addNotification({
          type: 'success',
          title: 'Welcome to DataAggregator!',
          message: 'Your account has been created successfully.',
        });
        router.push(redirectTo);
      }
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
          queryParams: {
            invite: inviteCode || '',
            plan: planType,
          },
        },
      });

      if (error) {
        addNotification({
          type: 'error',
          title: 'Social Sign Up Failed',
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

  const nextStep = async () => {
    const fieldsToValidate = currentStep === 1 
      ? ['fullName', 'email', 'company'] 
      : ['password', 'confirmPassword', 'agreeToTerms'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(1, currentStep - 1));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-default-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4  relative">
      

      <div className="w-full max-w-lg relative">
        
        {/* Back Button */}
        <Button
          as={NextLink}
          href="/"
          variant="flat"
          startContent={<ArrowLeft className="w-4 h-4" />}
          className="mb-6 bg-background/50 backdrop-blur-sm"
        >
          Back to Home
        </Button>

        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-2xl">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="text-center w-full">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <span className="text-white font-bold text-xl relative z-10">DA</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Join DataAggregator
              </h1>
              <p className="text-default-500 mt-2">
                Create your account and start aggregating data
              </p>

              {/* Plan Info */}
              {planType !== 'free' && (
                <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
                  <p className="text-sm text-primary-700 font-medium">
                    🎉 You're signing up for the {planType.charAt(0).toUpperCase() + planType.slice(1)} plan
                  </p>
                </div>
              )}

              {/* Invite Info */}
              {inviteCode && (
                <div className="mt-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                  <p className="text-sm text-success-700 font-medium">
                    ✨ You've been invited to join DataAggregator
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardBody className="px-8 pb-8">
            
            {/* Progress Indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-default-600">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-default-500">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <Progress 
                value={(currentStep / totalSteps) * 100} 
                color="primary"
                className="h-2"
              />
            </div>

            {currentStep === 1 && (
              <>
                {/* Social Sign Up */}
                <div className="space-y-3 mb-6">
                  <Button
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
                    startContent={<Chrome className="w-4 h-4" />}
                    isLoading={socialLoading === 'google'}
                    onPress={() => handleSocialAuth('google')}
                  >
                    Continue with Google
                  </Button>
                  
                  <Button
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                    startContent={<Github className="w-4 h-4" />}
                    isLoading={socialLoading === 'github'}
                    onPress={() => handleSocialAuth('github')}
                  >
                    Continue with GitHub
                  </Button>
                </div>

                <div className="relative my-6">
                  <Divider />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-sm text-default-500">
                    or continue with email
                  </span>
                </div>

                {/* Step 1: Basic Info */}
                <div className="space-y-4">
                  <Input
                    {...register('fullName')}
                    label="Full Name"
                    placeholder="Enter your full name"
                    startContent={<User className="w-4 h-4 text-default-400" />}
                    variant="bordered"
                    isInvalid={!!errors.fullName}
                    errorMessage={errors.fullName?.message}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                    }}
                  />

                  <Input
                    {...register('email')}
                    type="email"
                    label="Email Address"
                    placeholder="Enter your email"
                    startContent={<Mail className="w-4 h-4 text-default-400" />}
                    variant="bordered"
                    isInvalid={!!errors.email}
                    errorMessage={errors.email?.message}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                    }}
                  />

                  <Input
                    {...register('company')}
                    label="Company (Optional)"
                    placeholder="Enter your company name"
                    startContent={<Building2 className="w-4 h-4 text-default-400" />}
                    variant="bordered"
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                    }}
                  />

                  <Button
                    color="primary"
                    className="w-full font-semibold"
                    size="lg"
                    onPress={nextStep}
                  >
                    Continue
                  </Button>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Step 2: Security */}
                <div className="space-y-4">
                  <div>
                    <Input
                      {...register('password')}
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      placeholder="Create a strong password"
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
                      variant="bordered"
                      isInvalid={!!errors.password}
                      errorMessage={errors.password?.message}
                      classNames={{
                        input: "text-sm",
                        inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                      }}
                    />
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-default-600">Password strength</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength.strength === 'weak' ? 'text-danger' :
                            passwordStrength.strength === 'medium' ? 'text-warning' : 'text-success'
                          }`}>
                            {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                          </span>
                        </div>
                        <Progress 
                          value={passwordStrength.percentage}
                          color={
                            passwordStrength.strength === 'weak' ? 'danger' :
                            passwordStrength.strength === 'medium' ? 'warning' : 'success'
                          }
                          className="h-1"
                        />
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(passwordStrength.checks).map(([key, passed]) => (
                            <div key={key} className={`flex items-center gap-1 ${passed ? 'text-success' : 'text-default-400'}`}>
                              <CheckCircle2 className={`w-3 h-3 ${passed ? 'text-success' : 'text-default-300'}`} />
                              {key === 'length' && '8+ characters'}
                              {key === 'lowercase' && 'Lowercase'}
                              {key === 'uppercase' && 'Uppercase'}
                              {key === 'numbers' && 'Numbers'}
                              {key === 'symbols' && 'Symbols'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    startContent={<Lock className="w-4 h-4 text-default-400" />}
                    endContent={
                      <Button
                        isIconOnly
                        variant="flat"
                        size="sm"
                        className="w-6 h-6 min-w-6"
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    }
                    variant="bordered"
                    isInvalid={!!errors.confirmPassword}
                    errorMessage={errors.confirmPassword?.message}
                    classNames={{
                      input: "text-sm",
                      inputWrapper: "border-default-200 hover:border-default-300 group-data-[focused=true]:border-primary-500"
                    }}
                  />

                  {/* Terms and Marketing */}
                  <div className="space-y-3">
                    <Checkbox
                      {...register('agreeToTerms')}
                      size="sm"
                      isInvalid={!!errors.agreeToTerms}
                      classNames={{
                        label: "text-sm text-default-600"
                      }}
                    >
                      I agree to the{' '}
                      <Link href="/terms" size="sm" className="text-primary-600">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link href="/privacy" size="sm" className="text-primary-600">
                        Privacy Policy
                      </Link>
                    </Checkbox>
                    {errors.agreeToTerms && (
                      <p className="text-danger text-xs">{errors.agreeToTerms.message}</p>
                    )}

                    <Checkbox
                      {...register('marketingEmails')}
                      size="sm"
                      defaultSelected
                      classNames={{
                        label: "text-sm text-default-600"
                      }}
                    >
                      Send me product updates and marketing emails
                    </Checkbox>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="flat"
                      className="flex-1"
                      onPress={prevStep}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      className="flex-1 font-semibold"
                      isLoading={isLoading}
                      isDisabled={!isValid}
                    >
                      Create Account
                    </Button>
                  </div>
                </div>
              </form>
            )}

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-default-600">
                Already have an account?{' '}
                <Link
                  as={NextLink}
                  href={`/auth/signin${redirectTo !== '/onboarding' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3 bg-default-50 border border-default-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-default-600">
                  <strong>Your data is secure:</strong> We use enterprise-grade encryption 
                  and never share your personal information with third parties.
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}