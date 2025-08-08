"use client";
import React, { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Textarea } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Slider } from "@heroui/slider";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Tabs, Tab } from "@heroui/tabs";
import { Kbd } from "@heroui/kbd";
import { Code } from "@heroui/code";
import { motion } from "framer-motion";
import {
  Zap,
  Crown,
  Wallet,
  Activity,
  Settings,
  Play,
  Pause,
  Trash2,
  ExternalLink,
  Sparkles,
  Info,
  BarChart3,
  Download,
  RefreshCw,
  CodeIcon,
} from "lucide-react";

import ToastDemo, { useToast } from "@/components/ui/Toaster";

// Import your toast system

// Test Categories
const testCategories = {
  basic: {
    title: "Basic Toasts",
    icon: <Info className="w-4 h-4" />,
    color: "primary",
    tests: [
      {
        name: "Success",
        description: "Standard success notification",
        action: (toast: any, counter: number) =>
          toast.success("Operation Successful!", {
            description: `Task completed successfully (#${counter})`,
            duration: 4000,
          }),
      },
      {
        name: "Error",
        description: "Error notification with retry action",
        action: (toast: any, counter: number) =>
          toast.error("Something went wrong", {
            description: `An error occurred during operation (#${counter})`,
            actions: [
              {
                label: "Retry",
                handler: () => console.log("Retry clicked"),
                variant: "primary",
                icon: <RefreshCw className="w-3 h-3" />,
              },
            ],
          }),
      },
      {
        name: "Warning",
        description: "Warning message",
        action: (toast: any, counter: number) =>
          toast.warning("Attention Required", {
            description: `Please review your settings (#${counter})`,
            duration: 6000,
          }),
      },
      {
        name: "Info",
        description: "Information notification",
        action: (toast: any, counter: number) =>
          toast.info("New Information", {
            description: `System update available (#${counter})`,
            actions: [
              {
                label: "Learn More",
                handler: () => console.log("Learn more clicked"),
                variant: "ghost",
                icon: <ExternalLink className="w-3 h-3" />,
              },
            ],
          }),
      },
      {
        name: "Loading",
        description: "Persistent loading toast",
        action: (toast: any, counter: number) => {
          const id = toast.loading("Processing...", {
            description: `Operation in progress (#${counter})`,
            progress: 0,
          });

          // Simulate progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            toast.updateToast(id, { progress });

            if (progress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                toast.updateToast(id, {
                  variant: "success",
                  title: "Complete!",
                  description: "Operation finished successfully",
                  duration: 3000,
                  progress: undefined,
                });
              }, 500);
            }
          }, 200);
        },
      },
    ],
  },

  wallet: {
    title: "Wallet Analytics",
    icon: <Wallet className="w-4 h-4" />,
    color: "success",
    tests: [
      {
        name: "Analytics Update",
        description: "Portfolio data refreshed",
        action: (toast: any) =>
          toast.onAnalyticsUpdate(Math.floor(Math.random() * 10) + 1),
      },
      {
        name: "Wallet Sync Success",
        description: "Successful wallet synchronization",
        action: (toast: any) => {
          const wallets = [
            "MetaMask",
            "Trust Wallet",
            "Coinbase Wallet",
            "WalletConnect",
            "Phantom",
          ];
          const balances = [
            "$12,543.21",
            "$8,907.45",
            "$23,104.87",
            "$5,432.10",
            "$41,209.33",
          ];
          const wallet = wallets[Math.floor(Math.random() * wallets.length)];
          const balance = balances[Math.floor(Math.random() * balances.length)];

          toast.onWalletSyncSuccess(wallet, balance);
        },
      },
      {
        name: "Wallet Sync Error",
        description: "Failed wallet synchronization",
        action: (toast: any) => {
          const wallets = ["MetaMask", "Trust Wallet", "Ledger", "Trezor"];
          const errors = [
            "Network timeout",
            "Invalid signature",
            "Connection lost",
            "Rate limit exceeded",
          ];
          const wallet = wallets[Math.floor(Math.random() * wallets.length)];
          const error = errors[Math.floor(Math.random() * errors.length)];

          toast.onWalletError(wallet, error);
        },
      },
      {
        name: "Portfolio Milestone",
        description: "Achievement notification",
        action: (toast: any) => {
          const achievements = [
            { text: "First Wallet Added!", rarity: "common" },
            { text: "Portfolio Diversified", rarity: "rare" },
            { text: "Diamond Hands 💎", rarity: "rare" },
            { text: "Crypto Millionaire! 🚀", rarity: "legendary" },
          ];
          const achievement =
            achievements[Math.floor(Math.random() * achievements.length)];

          toast.onAchievement(achievement.text, achievement.rarity);
        },
      },
    ],
  },

  premium: {
    title: "Premium Features",
    icon: <Crown className="w-4 h-4" />,
    color: "warning",
    tests: [
      {
        name: "Premium Feature",
        description: "Promote premium features",
        action: (toast: any) => {
          const features = [
            "Advanced Analytics",
            "Unlimited Wallets",
            "Real-time Alerts",
            "Portfolio Insights",
            "Tax Reports",
          ];
          const feature = features[Math.floor(Math.random() * features.length)];

          toast.onPremiumFeature(feature);
        },
      },
      {
        name: "Premium Glow",
        description: "Premium toast with glow effect",
        action: (toast: any) =>
          toast.premium("Upgrade to Pro", {
            description: "Unlock advanced analytics and unlimited wallets",
            animation: "glow",
            actions: [
              {
                label: "Upgrade Now",
                handler: () => console.log("Upgrade clicked"),
                variant: "primary",
                icon: <Crown className="w-3 h-3" />,
              },
              {
                label: "Learn More",
                handler: () => console.log("Learn more clicked"),
                variant: "ghost",
                icon: <ExternalLink className="w-3 h-3" />,
              },
            ],
          }),
      },
      {
        name: "Trial Expiring",
        description: "Trial expiration notice",
        action: (toast: any) =>
          toast.warning("Trial Expiring Soon", {
            description: "Your premium trial expires in 3 days",
            animation: "bounce",
            actions: [
              {
                label: "Upgrade Now",
                handler: () => console.log("Upgrade clicked"),
                variant: "primary",
                icon: <Crown className="w-3 h-3" />,
              },
            ],
          }),
      },
    ],
  },

  advanced: {
    title: "Advanced Features",
    icon: <Settings className="w-4 h-4" />,
    color: "secondary",
    tests: [
      {
        name: "Multiple Actions",
        description: "Toast with multiple action buttons",
        action: (toast: any) =>
          toast.info("New Feature Available", {
            description: "Advanced portfolio analytics is now live!",
            actions: [
              {
                label: "Try Now",
                handler: () => console.log("Try now clicked"),
                variant: "primary",
                icon: <Sparkles className="w-3 h-3" />,
              },
              {
                label: "Watch Demo",
                handler: () => console.log("Demo clicked"),
                variant: "secondary",
                icon: <Play className="w-3 h-3" />,
              },
              {
                label: "Later",
                handler: () => console.log("Later clicked"),
                variant: "ghost",
              },
            ],
          }),
      },
      {
        name: "With Avatar",
        description: "Toast with user avatar",
        action: (toast: any) =>
          toast.success("Welcome back!", {
            description: "Your last login was 2 hours ago",
            avatar: "https://i.pravatar.cc/150?img=1",
            duration: 6000,
          }),
      },
      {
        name: "With Image",
        description: "Toast with preview image",
        action: (toast: any) =>
          toast.info("Portfolio Report Ready", {
            description: "Your monthly portfolio analysis is now available",
            image:
              "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop",
            actions: [
              {
                label: "Download",
                handler: () => console.log("Download clicked"),
                variant: "primary",
                icon: <Download className="w-3 h-3" />,
              },
            ],
          }),
      },
      {
        name: "Different Position",
        description: "Toast in different positions",
        action: (toast: any) => {
          const positions = [
            "top-left",
            "top-center",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ];
          const position =
            positions[Math.floor(Math.random() * positions.length)];

          toast.success(`Toast at ${position}`, {
            description: "Testing different positions",
            position: position,
            duration: 4000,
          });
        },
      },
    ],
  },

  stress: {
    title: "Stress Tests",
    icon: <Activity className="w-4 h-4" />,
    color: "danger",
    tests: [
      {
        name: "Rapid Fire",
        description: "Show 10 toasts rapidly",
        action: (toast: any) => {
          for (let i = 1; i <= 10; i++) {
            setTimeout(() => {
              toast.info(`Rapid Toast #${i}`, {
                description: `Testing rapid toast generation`,
                duration: 3000,
              });
            }, i * 100);
          }
        },
      },
      {
        name: "Long Content",
        description: "Toast with very long content",
        action: (toast: any) =>
          toast.warning("System Maintenance Notice", {
            description:
              "We will be performing scheduled maintenance on our servers from 2:00 AM to 4:00 AM EST. During this time, some features may be temporarily unavailable. We apologize for any inconvenience and appreciate your patience.",
            duration: 10000,
            actions: [
              {
                label: "More Details",
                handler: () => console.log("More details clicked"),
                variant: "ghost",
              },
            ],
          }),
      },
      {
        name: "Persistent Spam",
        description: "Multiple persistent toasts",
        action: (toast: any) => {
          const types = ["success", "error", "warning", "info"];

          types.forEach((type, index) => {
            setTimeout(() => {
              toast[type](`Persistent ${type}`, {
                description: `This is a persistent ${type} toast`,
                persistent: true,
              });
            }, index * 200);
          });
        },
      },
    ],
  },
};

// Custom Toast Configuration Panel
const CustomToastPanel: React.FC<{ toast: any }> = ({ toast }) => {
  const [title, setTitle] = useState("Custom Toast Title");
  const [description, setDescription] = useState(
    "This is a custom toast description",
  );
  const [variant, setVariant] = useState("success");
  const [position, setPosition] = useState("top-right");
  const [duration, setDuration] = useState(5000);
  const [dismissible, setDismissible] = useState(true);
  const [persistent, setPersistent] = useState(false);
  const [animation, setAnimation] = useState("slide");
  const [hasAction, setHasAction] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const showCustomToast = () => {
    const options: any = {
      description,
      position,
      duration: persistent ? 0 : duration,
      dismissible,
      persistent,
      animation,
    };

    if (showProgress) {
      options.progress = progress;
    }

    if (hasAction) {
      options.actions = [
        {
          label: "Custom Action",
          handler: () => console.log("Custom action clicked"),
          variant: "primary",
          icon: <Zap className="w-3 h-3" />,
        },
      ];
    }

    toast[variant](title, options);
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Custom Toast Builder</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <Input
          label="Title"
          placeholder="Enter toast title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Description"
          placeholder="Enter toast description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Variant"
            selectedKeys={[variant]}
            onSelectionChange={(keys) =>
              setVariant(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="success">Success</SelectItem>
            <SelectItem key="error">Error</SelectItem>
            <SelectItem key="warning">Warning</SelectItem>
            <SelectItem key="info">Info</SelectItem>
            <SelectItem key="loading">Loading</SelectItem>
            <SelectItem key="premium">Premium</SelectItem>
          </Select>

          <Select
            label="Position"
            selectedKeys={[position]}
            onSelectionChange={(keys) =>
              setPosition(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="top-left">Top Left</SelectItem>
            <SelectItem key="top-center">Top Center</SelectItem>
            <SelectItem key="top-right">Top Right</SelectItem>
            <SelectItem key="bottom-left">Bottom Left</SelectItem>
            <SelectItem key="bottom-center">Bottom Center</SelectItem>
            <SelectItem key="bottom-right">Bottom Right</SelectItem>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Animation"
            selectedKeys={[animation]}
            onSelectionChange={(keys) =>
              setAnimation(Array.from(keys)[0] as string)
            }
          >
            <SelectItem key="slide">Slide</SelectItem>
            <SelectItem key="fade">Fade</SelectItem>
            <SelectItem key="bounce">Bounce</SelectItem>
            <SelectItem key="glow">Glow</SelectItem>
          </Select>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (ms)</label>
            <Slider
              className="w-full"
              isDisabled={persistent}
              max={10000}
              min={1000}
              step={500}
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
            />
            <div className="text-xs text-default-500">{duration}ms</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Switch isSelected={dismissible} onValueChange={setDismissible}>
            Dismissible
          </Switch>

          <Switch isSelected={persistent} onValueChange={setPersistent}>
            Persistent
          </Switch>

          <Switch isSelected={hasAction} onValueChange={setHasAction}>
            Add Action
          </Switch>

          <Switch isSelected={showProgress} onValueChange={setShowProgress}>
            Show Progress
          </Switch>
        </div>

        {showProgress && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Progress</label>
            <Slider
              className="w-full"
              max={100}
              min={0}
              step={5}
              value={[progress]}
              onValueChange={(value) => setProgress(value[0])}
            />
            <div className="text-xs text-default-500">{progress}%</div>
          </div>
        )}

        <Button
          className="w-full"
          color="primary"
          startContent={<Play className="w-4 h-4" />}
          onPress={showCustomToast}
        >
          Show Custom Toast
        </Button>
      </CardBody>
    </Card>
  );
};

// Statistics Panel
const StatsPanel: React.FC<{ toast: any; totalTests: number }> = ({
  toast,
  totalTests,
}) => {
  const activeCount = toast.toasts.length;
  const successCount = toast.toasts.filter(
    (t: any) => t.variant === "success",
  ).length;
  const errorCount = toast.toasts.filter(
    (t: any) => t.variant === "error",
  ).length;
  const warningCount = toast.toasts.filter(
    (t: any) => t.variant === "warning",
  ).length;
  const premiumCount = toast.toasts.filter(
    (t: any) => t.variant === "premium",
  ).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Toast Statistics</h3>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-default-600">
              {activeCount}
            </div>
            <div className="text-xs text-default-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-500">
              {successCount}
            </div>
            <div className="text-xs text-default-500">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-500">
              {errorCount}
            </div>
            <div className="text-xs text-default-500">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-500">
              {warningCount}
            </div>
            <div className="text-xs text-default-500">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-500">
              {premiumCount}
            </div>
            <div className="text-xs text-default-500">Premium</div>
          </div>
        </div>

        <Divider className="my-4" />

        <div className="text-center">
          <div className="text-sm text-default-600 mb-2">
            Total Tests Run: {totalTests}
          </div>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              startContent={<Pause className="w-3 h-3" />}
              variant="flat"
              onPress={toast.dismissAll}
            >
              Dismiss All
            </Button>
            <Button
              color="danger"
              size="sm"
              startContent={<Trash2 className="w-3 h-3" />}
              variant="flat"
              onPress={toast.clearAll}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

// Main Test Page Component
const ToastTestPage: React.FC = () => {
  const toast = useToast();
  const [totalTests, setTotalTests] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("basic");

  const runTest = (testAction: Function) => {
    setTotalTests((prev) => prev + 1);
    testAction(toast, totalTests + 1);
  };

  const runAllTests = () => {
    Object.values(testCategories).forEach((category) => {
      category.tests.forEach((test, index) => {
        setTimeout(() => {
          runTest(test.action);
        }, index * 300);
      });
    });
  };

  const runCategoryTests = (categoryKey: string) => {
    const category = testCategories[categoryKey];

    category.tests.forEach((test, index) => {
      setTimeout(() => {
        runTest(test.action);
      }, index * 200);
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🧪 Toast Testing Suite
            </h1>
            <p className="text-default-600 text-lg">
              Comprehensive testing interface for the HeroUI toast system
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <Chip color="primary" variant="flat">
                HeroUI Integration
              </Chip>
              <Chip color="success" variant="flat">
                Professional Grade
              </Chip>
              <Chip color="warning" variant="flat">
                Zero Errors
              </Chip>
            </div>
          </motion.div>
        </div>

        {/* Statistics Panel */}
        <StatsPanel toast={toast} totalTests={totalTests} />

        {/* Quick Actions */}
        <Card>
          <CardBody>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                className="font-medium"
                color="primary"
                startContent={<Sparkles className="w-4 h-4" />}
                variant="solid"
                onPress={runAllTests}
              >
                Run All Tests
              </Button>

              {Object.entries(testCategories).map(([key, category]) => (
                <Button
                  key={key}
                  color={category.color as any}
                  startContent={category.icon}
                  variant="flat"
                  onPress={() => runCategoryTests(key)}
                >
                  {category.title}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Test Categories */}
          <div className="xl:col-span-3">
            <Tabs
              className="w-full"
              selectedKey={selectedCategory}
              onSelectionChange={(key) => setSelectedCategory(key as string)}
            >
              {Object.entries(testCategories).map(([key, category]) => (
                <Tab
                  key={key}
                  title={
                    <div className="flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {category.tests.map((test, index) => (
                      <motion.div
                        key={test.name}
                        animate={{ opacity: 1, y: 0 }}
                        initial={{ opacity: 0, y: 20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-shadow">
                          <CardBody className="p-4">
                            <h4 className="font-semibold text-foreground mb-2">
                              {test.name}
                            </h4>
                            <p className="text-sm text-default-600 mb-4 flex-grow">
                              {test.description}
                            </p>
                            <Button
                              className="w-full"
                              color={category.color as any}
                              size="sm"
                              startContent={<Play className="w-3 h-3" />}
                              variant="flat"
                              onPress={() => runTest(test.action)}
                            >
                              Test
                            </Button>
                          </CardBody>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </Tab>
              ))}
            </Tabs>
          </div>

          {/* Custom Toast Builder */}
          <div className="xl:col-span-1">
            <CustomToastPanel toast={toast} />
          </div>
        </div>

        {/* Usage Examples */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CodeIcon className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Usage Examples</h3>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-default-600 mb-2">Basic Usage:</p>
                <Code className="text-xs">
                  {`const toast = useToast();
toast.success('Success!', { description: 'Operation completed' });`}
                </Code>
              </div>

              <div>
                <p className="text-sm text-default-600 mb-2">
                  Wallet Analytics:
                </p>
                <Code className="text-xs">
                  {`toast.onWalletSyncSuccess('MetaMask', '$12,543.21');
toast.onAnalyticsUpdate(3);`}
                </Code>
              </div>

              <div>
                <p className="text-sm text-default-600 mb-2">
                  Premium Features:
                </p>
                <Code className="text-xs">
                  {`toast.onPremiumFeature('Advanced Analytics');
toast.onAchievement('First Million!', 'legendary');`}
                </Code>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Keyboard Shortcuts */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Kbd keys={["cmd", "enter"]}>⌘ Enter</Kbd>
                <span className="text-default-600">Show Success</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd keys={["cmd", "e"]}>⌘ E</Kbd>
                <span className="text-default-600">Show Error</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd keys={["cmd", "w"]}>⌘ W</Kbd>
                <span className="text-default-600">Show Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <Kbd keys={["esc"]}>ESC</Kbd>
                <span className="text-default-600">Clear All</span>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <ToastDemo />
    </div>
  );
};

export default ToastTestPage;
