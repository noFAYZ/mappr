"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Checkbox } from "@heroui/checkbox";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import {
  User,
  Building2,
  Target,
  Puzzle,
  Rocket,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  BarChart3,
  Wallet,
  Bot,
  Crown,
  Shield,
  Upload,
  Camera,
  Globe,
  TrendingUp,
  FileText,
  Users,
  Settings,
  Bell,
  Mail,
  HelpCircle,
} from "lucide-react";
import { Link } from "@heroui/link";

import { useAuth } from "@/contexts/AuthContext";
import { useUIStore } from "@/stores";
import { supabase } from "@/lib/supabase";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface UserGoal {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface ExtensionOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  isPopular: boolean;
  isNew?: boolean;
  tier: string[];
}

const userGoals: UserGoal[] = [
  {
    id: "track-crypto",
    title: "Track Crypto Portfolio",
    description:
      "Monitor my cryptocurrency investments across multiple wallets",
    icon: <Wallet className="w-6 h-6" />,
    category: "crypto",
  },
  {
    id: "business-analytics",
    title: "Business Analytics",
    description: "Analyze my business performance and financial data",
    icon: <BarChart3 className="w-6 h-6" />,
    category: "business",
  },
  {
    id: "personal-finance",
    title: "Personal Finance",
    description: "Manage my personal banking and financial accounts",
    icon: <Building2 className="w-6 h-6" />,
    category: "finance",
  },
  {
    id: "ai-insights",
    title: "AI-Powered Insights",
    description: "Get intelligent analysis and recommendations",
    icon: <Bot className="w-6 h-6" />,
    category: "ai",
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration",
    description: "Share data and insights with my team",
    icon: <Users className="w-6 h-6" />,
    category: "team",
  },
  {
    id: "data-aggregation",
    title: "Data Aggregation",
    description: "Collect and organize data from multiple sources",
    icon: <Globe className="w-6 h-6" />,
    category: "data",
  },
];

const extensionOptions: ExtensionOption[] = [
  {
    id: "zerion",
    name: "Zerion",
    description: "Connect crypto wallets and DeFi positions",
    icon: <Wallet className="w-5 h-5" />,
    category: "crypto",
    isPopular: true,
    tier: ["free", "pro", "enterprise"],
  },
  {
    id: "plaid",
    name: "Plaid Banking",
    description: "Connect bank accounts and financial data",
    icon: <Building2 className="w-5 h-5" />,
    category: "banking",
    isPopular: true,
    tier: ["pro", "enterprise"],
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "E-commerce store data and analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    category: "ecommerce",
    isPopular: false,
    tier: ["pro", "enterprise"],
  },
  {
    id: "quickbooks",
    name: "QuickBooks",
    description: "Accounting and financial management",
    icon: <FileText className="w-5 h-5" />,
    category: "accounting",
    isPopular: false,
    tier: ["enterprise"],
  },
  {
    id: "binance",
    name: "Binance",
    description: "Cryptocurrency exchange data",
    icon: <Zap className="w-5 h-5" />,
    category: "crypto",
    isPopular: true,
    tier: ["free", "pro", "enterprise"],
  },
  {
    id: "csv",
    name: "CSV Upload",
    description: "Upload and analyze CSV files",
    icon: <Upload className="w-5 h-5" />,
    category: "file",
    isPopular: false,
    isNew: true,
    tier: ["free", "pro", "enterprise"],
  },
];

const companySizes = [
  "Just me",
  "2-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-1000 employees",
  "1000+ employees",
];

const jobRoles = [
  "CEO/Founder",
  "CTO/Technical Lead",
  "Data Analyst",
  "Product Manager",
  "Developer",
  "Marketing Manager",
  "Finance Manager",
  "Operations Manager",
  "Student",
  "Other",
];

export default function OnboardingPage() {
  const { user, profile, updateProfile } = useAuth();
  const { addNotification } = useUIStore();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Profile completion
    fullName: profile?.full_name || user?.user_metadata?.full_name || "",
    jobTitle: "",
    company: user?.user_metadata?.company || "",
    companySize: "",
    bio: "",
    avatar: null as File | null,

    // Goals and interests
    selectedGoals: [] as string[],
    useCase: "",

    // Extensions
    selectedExtensions: [] as string[],

    // Preferences
    notifications: true,
    newsletter: true,
    dataSharing: false,
    theme: "system",
  });

  const totalSteps = 4;

  // Step 1: Profile Completion
  const ProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Your Profile</h2>
        <p className="text-default-600">
          Let's get to know you better to personalize your experience
        </p>
      </div>

      <div className="space-y-4">
        {/* Avatar Upload */}
        <div className="flex justify-center">
          <div className="relative group">
            <Avatar
              className="w-24 h-24"
              name={formData.fullName || user?.email}
              src={
                formData.avatar
                  ? URL.createObjectURL(formData.avatar)
                  : profile?.avatar_url || ""
              }
            />
            <Button
              isIconOnly
              className="absolute bottom-0 right-0 shadow-lg"
              color="primary"
              size="sm"
              onPress={() => document.getElementById("avatar-upload")?.click()}
            >
              <Camera className="w-4 h-4" />
            </Button>
            <input
              accept="image/*"
              className="hidden"
              id="avatar-upload"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) {
                  setFormData((prev) => ({ ...prev, avatar: file }));
                }
              }}
            />
          </div>
        </div>

        <Input
          isRequired
          label="Full Name"
          placeholder="Enter your full name"
          startContent={<User className="w-4 h-4" />}
          value={formData.fullName}
          variant="bordered"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Job Role"
            placeholder="Select your role"
            selectedKeys={formData.jobTitle ? [formData.jobTitle] : []}
            variant="bordered"
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;

              setFormData((prev) => ({ ...prev, jobTitle: value }));
            }}
          >
            {jobRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </Select>

          <Input
            label="Company"
            placeholder="Your company name"
            startContent={<Building2 className="w-4 h-4" />}
            value={formData.company}
            variant="bordered"
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, company: e.target.value }))
            }
          />
        </div>

        <Select
          label="Company Size"
          placeholder="Select company size"
          selectedKeys={formData.companySize ? [formData.companySize] : []}
          variant="bordered"
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string;

            setFormData((prev) => ({ ...prev, companySize: value }));
          }}
        >
          {companySizes.map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </Select>

        <Textarea
          label="Bio (Optional)"
          maxRows={5}
          minRows={3}
          placeholder="Tell us a bit about yourself and your work"
          value={formData.bio}
          variant="bordered"
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, bio: e.target.value }))
          }
        />
      </div>
    </div>
  );

  // Step 2: Goals Selection
  const GoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">What are your goals?</h2>
        <p className="text-default-600 text-sm">
          Select all that apply to personalize your experience
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userGoals.map((goal) => (
          <Card
            key={goal.id}
            isPressable
            className={`cursor-pointer border transition-all group-hover rounded-3xl ${
              formData.selectedGoals.includes(goal.id)
                ? "border-primary-800/20 bg-primary-500/10 shadow-md"
                : "border-default-200 hover:border-default-300"
            }`}
            onPress={() => {
              setFormData((prev) => ({
                ...prev,
                selectedGoals: prev.selectedGoals.includes(goal.id)
                  ? prev.selectedGoals.filter((id) => id !== goal.id)
                  : [...prev.selectedGoals, goal.id],
              }));
            }}
          >
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-2xl transition-all ${
                    formData.selectedGoals.includes(goal.id)
                      ? "bg-primary-500 text-white"
                      : "bg-default-100 text-default-600"
                  }`}
                >
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{goal.title}</h3>
                  <p className="text-xs text-default-600 mt-1">
                    {goal.description}
                  </p>
                </div>
                {formData.selectedGoals.includes(goal.id) && (
                  <CheckCircle2 className="w-5 h-5 text-primary-500" />
                )}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Textarea
        label="Tell us more about your use case"
        maxRows={5}
        minRows={3}
        placeholder="How do you plan to use DataAggregator? What specific challenges are you trying to solve?"
        value={formData.useCase}
        variant="flat"
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, useCase: e.target.value }))
        }
      />
    </div>
  );

  // Step 3: Extensions Selection
  const ExtensionsStep = () => {
    const userTier = profile?.tier || "free";

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Puzzle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Connect Your Data Sources</h2>
          <p className="text-default-600">
            Choose the extensions you'd like to set up (you can add more later)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {extensionOptions.map((extension) => {
            const canUse = extension.tier.includes(userTier);

            return (
              <Card
                key={extension.id}
                className={`cursor-pointer transition-all ${
                  canUse
                    ? "hover:scale-[1.02]"
                    : "opacity-60 cursor-not-allowed"
                } ${
                  formData.selectedExtensions.includes(extension.id)
                    ? "border-primary-500 bg-primary-50 shadow-md"
                    : "border-default-200 hover:border-default-300"
                }`}
                isPressable={canUse}
                onPress={() => {
                  if (!canUse) return;
                  setFormData((prev) => ({
                    ...prev,
                    selectedExtensions: prev.selectedExtensions.includes(
                      extension.id,
                    )
                      ? prev.selectedExtensions.filter(
                          (id) => id !== extension.id,
                        )
                      : [...prev.selectedExtensions, extension.id],
                  }));
                }}
              >
                <CardBody className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-3 rounded-xl transition-all ${
                        formData.selectedExtensions.includes(extension.id)
                          ? "bg-primary-500 text-white"
                          : "bg-default-100 text-default-600"
                      }`}
                    >
                      {extension.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">
                          {extension.name}
                        </h3>
                        {extension.isPopular && (
                          <Badge color="warning" size="sm" variant="flat">
                            Popular
                          </Badge>
                        )}
                        {extension.isNew && (
                          <Badge color="success" size="sm" variant="flat">
                            New
                          </Badge>
                        )}
                        {!canUse && (
                          <Badge color="default" size="sm" variant="flat">
                            Upgrade Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-default-600">
                        {extension.description}
                      </p>
                    </div>
                    {formData.selectedExtensions.includes(extension.id) && (
                      <CheckCircle2 className="w-5 h-5 text-primary-500" />
                    )}
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        {/* Tier Upgrade Prompt */}
        {userTier === "free" && (
          <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-3">
                <Crown className="w-6 h-6 text-primary-600" />
                <div className="flex-1">
                  <h3 className="font-semibold text-sm text-primary-900">
                    Unlock More Extensions
                  </h3>
                  <p className="text-xs text-primary-700">
                    Upgrade to Pro or Enterprise to access banking, e-commerce,
                    and accounting integrations.
                  </p>
                </div>
                <Button color="primary" size="sm" variant="flat">
                  Upgrade
                </Button>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  // Step 4: Preferences
  const PreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Set Your Preferences</h2>
        <p className="text-default-600">
          Customize your experience and notification settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Notification Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary-600" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Push Notifications</p>
                <p className="text-xs text-default-600">
                  Get notified about important updates
                </p>
              </div>
              <Checkbox
                isSelected={formData.notifications}
                onValueChange={(checked) =>
                  setFormData((prev) => ({ ...prev, notifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Email Newsletter</p>
                <p className="text-xs text-default-600">
                  Weekly insights and product updates
                </p>
              </div>
              <Checkbox
                isSelected={formData.newsletter}
                onValueChange={(checked) =>
                  setFormData((prev) => ({ ...prev, newsletter: checked }))
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Privacy Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-success-600" />
              <h3 className="font-semibold">Privacy</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Anonymous Usage Analytics</p>
                <p className="text-xs text-default-600">
                  Help us improve the product (no personal data)
                </p>
              </div>
              <Checkbox
                isSelected={formData.dataSharing}
                onValueChange={(checked) =>
                  setFormData((prev) => ({ ...prev, dataSharing: checked }))
                }
              />
            </div>
          </CardBody>
        </Card>

        {/* Theme Preference */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-secondary-600" />
              <h3 className="font-semibold">Appearance</h3>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <Select
              label="Theme Preference"
              placeholder="Choose your theme"
              selectedKeys={[formData.theme]}
              variant="bordered"
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as string;

                setFormData((prev) => ({ ...prev, theme: value }));
              }}
            >
              <SelectItem key="light">Light Mode</SelectItem>
              <SelectItem key="dark">Dark Mode</SelectItem>
              <SelectItem key="system">System Default</SelectItem>
            </Select>
          </CardBody>
        </Card>
      </div>
    </div>
  );

  const steps = [
    {
      id: "profile",
      title: "Profile",
      description: "Complete your profile",
      icon: <User className="w-5 h-5" />,
      component: <ProfileStep />,
    },
    {
      id: "goals",
      title: "Goals",
      description: "Set your objectives",
      icon: <Target className="w-5 h-5" />,
      component: <GoalsStep />,
    },
    {
      id: "extensions",
      title: "Extensions",
      description: "Connect data sources",
      icon: <Puzzle className="w-5 h-5" />,
      component: <ExtensionsStep />,
    },
    {
      id: "preferences",
      title: "Preferences",
      description: "Customize settings",
      icon: <Settings className="w-5 h-5" />,
      component: <PreferencesStep />,
    },
  ];

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsLoading(true);

    try {
      // Update profile with onboarding data
      const profileUpdates = {
        full_name: formData.fullName,
        company: formData.company,
        job_title: formData.jobTitle,
        bio: formData.bio,
        onboarding_completed: true,
        onboarding_step: totalSteps,
        preferences: {
          company_size: formData.companySize,
          goals: formData.selectedGoals,
          use_case: formData.useCase,
          extensions: formData.selectedExtensions,
          notifications: formData.notifications,
          newsletter: formData.newsletter,
          data_sharing: formData.dataSharing,
          theme: formData.theme,
        },
      };

      await updateProfile(profileUpdates);

      // Upload avatar if provided
      if (formData.avatar && user) {
        const fileExt = formData.avatar.name.split(".").pop();
        const fileName = `${user.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, formData.avatar, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(fileName);

          await updateProfile({ avatar_url: urlData.publicUrl });
        }
      }

      addNotification({
        type: "success",
        title: "Welcome to DataAggregator!",
        message:
          "Your account setup is complete. Let's start aggregating your data!",
      });

      router.push("/dashboard");
    } catch (error) {
      addNotification({
        type: "error",
        title: "Setup Failed",
        message: "There was an error completing your setup. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const skipOnboarding = () => {
    router.push("/dashboard");
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Profile
        return formData.fullName.trim().length > 0;
      case 1: // Goals
        return formData.selectedGoals.length > 0;
      case 2: // Extensions
        return true; // Optional step
      case 3: // Preferences
        return true; // Optional step
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen  relative">
      <div className="relative z-10 max-w-4xl mx-auto p-6">
        {/* Header
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16  flex items-center  rotate-6 justify-center">
             <LogoMappr />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            Welcome to MoneyMappr
          </h1>
          <p className="text-default-600 text-xs">
            Let's set up your account in just a few steps
          </p>
        </div> */}

        {/* Progress Indicator */}
        <div className="mb-4 ">
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 ${
                  index <= currentStep ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    index < currentStep
                      ? "dark:bg-lime-700 bg-lime-700 text-white"
                      : index === currentStep
                        ? "bg-primary "
                        : "bg-default-200 text-default-500"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="  border border-default-200/50 shadow mb-8">
          <CardBody className="p-8">{steps[currentStep].component}</CardBody>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                startContent={<ArrowLeft className="w-4 h-4" />}
                variant="flat"
                onPress={prevStep}
              >
                Back
              </Button>
            )}
            <Button color="default" variant="flat" onPress={skipOnboarding}>
              Skip for now
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {currentStep < totalSteps - 1 ? (
              <Button
                color="primary"
                endContent={<ArrowRight className="w-4 h-4" />}
                isDisabled={!canProceed()}
                onPress={nextStep}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold"
                color="primary"
                endContent={<Rocket className="w-4 h-4" />}
                isLoading={isLoading}
                onPress={completeOnboarding}
              >
                Complete Setup
              </Button>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-default-500">
            Need help? Check out our{" "}
            <Link
              className="text-primary-600 hover:text-primary-700"
              href="/help"
            >
              setup guide
            </Link>{" "}
            or{" "}
            <Link
              className="text-primary-600 hover:text-primary-700"
              href="/support"
            >
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Success Page Component for completed onboarding
export function OnboardingSuccessPage() {
  const router = useRouter();
  const { profile } = useAuth();

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const handleSetupExtensions = () => {
    router.push("/extensions");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-success-500/5 via-transparent to-primary-500/5">
      <div className="max-w-2xl mx-auto text-center">
        {/* Success Animation */}
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-success-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <CheckCircle2 className="w-16 h-16 text-white" />
          </div>

          {/* Celebration Effects */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-4 border-success-200 rounded-full animate-ping opacity-30" />
          </div>
        </div>

        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-success-600 to-primary-600 bg-clip-text text-transparent mb-4">
            Welcome to DataAggregator!
          </h1>
          <p className="text-xl text-default-600 mb-2">
            🎉 Congratulations, {profile?.full_name || "there"}!
          </p>
          <p className="text-default-500">
            Your account is all set up and ready to go. Let's start aggregating
            your data!
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-primary-50 border-primary-200">
            <CardBody className="p-4 text-center">
              <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-primary-900">
                Ready to Launch
              </h3>
              <p className="text-xs text-primary-700">
                Your dashboard is configured
              </p>
            </CardBody>
          </Card>

          <Card className="bg-success-50 border-success-200">
            <CardBody className="p-4 text-center">
              <div className="w-12 h-12 bg-success-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-success-900">
                Secure & Private
              </h3>
              <p className="text-xs text-success-700">Your data is protected</p>
            </CardBody>
          </Card>

          <Card className="bg-warning-50 border-warning-200">
            <CardBody className="p-4 text-center">
              <div className="w-12 h-12 bg-warning-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-warning-900">AI-Powered</h3>
              <p className="text-xs text-warning-700">Smart insights await</p>
            </CardBody>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="bg-background/80 backdrop-blur-xl border-default-200/50 shadow-xl mb-8">
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">What's Next?</h2>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h3 className="font-semibold text-primary-900">
                    Explore Your Dashboard
                  </h3>
                </div>
                <p className="text-sm text-primary-700 mb-3">
                  Get familiar with your personalized dashboard and see how your
                  data comes together.
                </p>
                <Button
                  className="w-full"
                  color="primary"
                  size="sm"
                  onPress={handleGetStarted}
                >
                  Go to Dashboard
                </Button>
              </div>

              <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h3 className="font-semibold text-secondary-900">
                    Connect More Sources
                  </h3>
                </div>
                <p className="text-sm text-secondary-700 mb-3">
                  Add more data sources to get a complete picture of your
                  digital assets.
                </p>
                <Button
                  className="w-full"
                  color="secondary"
                  size="sm"
                  variant="flat"
                  onPress={handleSetupExtensions}
                >
                  Setup Extensions
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Quick Tips */}
        <Card className="bg-gradient-to-r from-default-50 to-primary-50 border-default-200">
          <CardBody className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Pro Tips to Get Started
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-default-700">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Use the search bar (Cmd+K) to quickly find anything</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Set up notifications to stay updated on your data</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Try the AI assistant for insights and analysis</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                <span>Create multiple portfolios for different use cases</span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Support Links */}
        <div className="mt-8 flex items-center justify-center gap-6 text-sm">
          <Link
            className="flex items-center gap-2 text-default-600 hover:text-primary-600 transition-colors"
            href="/help"
          >
            <HelpCircle className="w-4 h-4" />
            Help Center
          </Link>
          <Link
            className="flex items-center gap-2 text-default-600 hover:text-primary-600 transition-colors"
            href="/docs"
          >
            <FileText className="w-4 h-4" />
            Documentation
          </Link>
          <Link
            className="flex items-center gap-2 text-default-600 hover:text-primary-600 transition-colors"
            href="/support"
          >
            <Mail className="w-4 h-4" />
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
