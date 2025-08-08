"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Chip } from "@heroui/chip";
import NextLink from "next/link";
import clsx from "clsx";
import {
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Plus,
  Crown,
  Shield,
  Star,
  Building2,
  Users,
  Puzzle,
  Bot,
  FileText,
  CreditCard,
  TrendingUp,
  Wallet,
  Upload,
  Download,
  Share2,
  Calculator,
  PieChart,
  LayoutDashboard,
} from "lucide-react";

import ThemeSwitcher from "./shared/theme-switch";
import { SearchInput } from "./shared/search-input";
import {
  HugeiconsAiBrain01,
  SystemUiconsWindowCollapseLeft,
  SystemUiconsWindowCollapseRight,
  SiDashboardCustomizeLine,
  PhUser,
  CuidaNotificationBellOutline,
  LetsIconsLockDuotone,
} from "./icons/icons";
import { LogoMappr } from "./icons";

import { useUIStore } from "@/stores";
import { useNavigationContext } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  className?: string;
}

// All available actions organized by category with enhanced styling info
const actionsByCategory = {
  "Quick Actions": [
    {
      label: "Add Extension",
      href: "/extensions/add",
      icon: <Plus className="w-5 h-5" />,
      description: "Connect new data sources instantly",
      gradient: "from-blue-500 to-cyan-500",
      featured: true,
    },
    {
      label: "Create Portfolio",
      href: "/portfolios/create",
      icon: <SiDashboardCustomizeLine className="w-5 h-5" />,
      description: "Build a new investment portfolio",
      gradient: "from-purple-500 to-pink-500",
      featured: true,
    },
    {
      label: "AI Assistant",
      href: "/ai",
      icon: <HugeiconsAiBrain01 className="w-5 h-5" />,
      description: "Get AI-powered insights",
      gradient: "from-emerald-500 to-teal-500",
      badge: "New",
      featured: true,
    },
  ],
  Extensions: [
    {
      label: "Connect Wallet",
      href: "/extensions/crypto/connect",
      icon: <Wallet className="w-5 h-5" />,
      description: "Link your crypto wallets",
      gradient: "from-orange-500 to-red-500",
    },
    {
      label: "Connect Bank",
      href: "/extensions/banking/connect",
      icon: <Building2 className="w-5 h-5" />,
      description: "Link bank accounts securely",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      label: "Browse Extensions",
      href: "/extensions",
      icon: <Puzzle className="w-5 h-5" />,
      description: "Explore all available integrations",
      gradient: "from-indigo-500 to-purple-500",
    },
  ],
  "Data & Analytics": [
    {
      label: "Import Data",
      href: "/data/import",
      icon: <Upload className="w-5 h-5" />,
      description: "Upload CSV, Excel files",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Export Data",
      href: "/data/export",
      icon: <Download className="w-5 h-5" />,
      description: "Download your data",
      gradient: "from-slate-500 to-gray-500",
    },
    {
      label: "Analytics Dashboard",
      href: "/analytics",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "View detailed analytics",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      label: "Generate Reports",
      href: "/reports",
      icon: <FileText className="w-5 h-5" />,
      description: "Create custom reports",
      gradient: "from-rose-500 to-pink-500",
    },
  ],
  Tools: [
    {
      label: "Calculator",
      href: "/tools/calculator",
      icon: <Calculator className="w-5 h-5" />,
      description: "Financial calculator",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Share Portfolio",
      href: "/portfolios/share",
      icon: <Share2 className="w-5 h-5" />,
      description: "Share with others",
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      label: "Team Settings",
      href: "/team",
      icon: <Users className="w-5 h-5" />,
      description: "Manage team members",
      gradient: "from-blue-500 to-indigo-500",
    },
  ],
};

export function Navbar({ className }: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { isSidebarVisible, toggleSidebar, pageTitle, isSidebarCollapsed } =
    useNavigationContext();
  const { notifications, removeNotification } = useUIStore();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Global shortcut for actions modal (Cmd/Ctrl + J)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "j") {
        e.preventDefault();
        setIsActionsModalOpen(true);
      }
      if (e.key === "Escape" && isActionsModalOpen) {
        setIsActionsModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isActionsModalOpen]);

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case "enterprise":
        return <Crown className="w-3 h-3 text-amber-500" />;
      case "pro":
      case "premium":
        return <Shield className="w-3 h-3 text-purple-500" />;
      default:
        return <Star className="w-3 h-3 text-blue-500" />;
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Filter actions based on search
  const filteredActions = Object.entries(actionsByCategory).reduce(
    (acc, [category, actions]) => {
      const filtered = actions.filter(
        (action) =>
          action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          action.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filtered.length > 0) {
        acc[category] = filtered;
      }

      return acc;
    },
    {} as typeof actionsByCategory,
  );

  const handleActionClick = (href: string) => {
    setIsActionsModalOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <HeroUINavbar
        className={clsx(
          " border-b z-50",
          isScrolled ? " border-default-200/50 " : " border-transparent",
          className,
        )}
        height="4rem"
        isMenuOpen={isMenuOpen}
        maxWidth="full"
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Left Content */}
        <NavbarContent className="gap-4 flex-1" justify="start">
          {/* Sidebar Toggle & Logo */}
          <NavbarItem className="flex items-center gap-3">
            <Button
              isIconOnly
              className="hidden sm:flex bg-transparent hover:bg-default-100 transition-colors"
              size="sm"
              variant="light"
              onPress={toggleSidebar}
            >
              {isSidebarCollapsed ? (
                <SystemUiconsWindowCollapseRight className="w-6 h-6 text-default-500 " />
              ) : (
                <SystemUiconsWindowCollapseLeft className="w-6 h-6 text-default-500" />
              )}
            </Button>

            {/* Logo (when sidebar is hidden) */}
            {!isSidebarVisible && (
              <NextLink
                className="flex items-center gap-2 group"
                href="/dashboard"
              >
                <div className="relative">
                  <div className="h-9 flex items-center  gap-1 font-semibold text-sm justify-center">
                    <LogoMappr /> MoneyMappr
                  </div>
                  <div className="absolute inset-0 bg-primary-500/20 blur-md rounded-lg opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MoneyMappr
                </span>
              </NextLink>
            )}
          </NavbarItem>

          {/* Search Bar - Desktop */}
          <NavbarItem className="hidden lg:flex flex-1 max-w-md ml-8">
            <SearchInput className="w-full" />
          </NavbarItem>
        </NavbarContent>

        {/* Right Content */}
        <NavbarContent
          className="gap-2 flex items-center text-center"
          justify="end"
        >
          {/* Theme Switcher */}
          <NavbarItem className="flex items-center">
            <ThemeSwitcher />
          </NavbarItem>

          {/* Desktop User Area */}
          <NavbarItem className="flex">
            {user ? (
              <div className="flex items-center gap-1 p-1 border border-divider rounded-full">
                {/* Notifications */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      aria-label="Notifications"
                      className="h-9 w-9 rounded-full relative overflow-visible"
                      size="sm"
                      variant="solid"
                    >
                      <CuidaNotificationBellOutline className="w-4 h-4 text-default-600" />
                      {unreadNotifications > 0 && (
                        <Chip
                          className="absolute -top-1 p-0 text-[10px] -right-1 "
                          color="danger"
                          size="sm"
                        >
                          {unreadNotifications.toString()}
                        </Chip>
                      )}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Notifications"
                    className="w-80"
                    closeOnSelect={false}
                  >
                    {notifications.length === 0 ? (
                      <DropdownItem
                        key="empty"
                        className="text-center text-default-500"
                      >
                        <div className="py-4">
                          <Bell className="w-8 h-8 mx-auto mb-2 text-default-300" />
                          <p>No notifications</p>
                        </div>
                      </DropdownItem>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <DropdownItem
                          key={notification.id}
                          className="p-3"
                          textValue={notification.title}
                          onPress={() => removeNotification(notification.id)}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {notification.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-default-400">
                                  {new Date(
                                    notification.timestamp,
                                  ).toLocaleTimeString()}
                                </span>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                )}
                              </div>
                            </div>
                            {notification.message && (
                              <span className="text-xs text-default-600">
                                {notification.message}
                              </span>
                            )}
                          </div>
                        </DropdownItem>
                      ))
                    )}
                    {notifications.length > 0 && (
                      <DropdownItem
                        key="view-all"
                        className="text-center"
                        textValue="View all notifications"
                      >
                        <Button
                          as={NextLink}
                          className="w-full"
                          href="/notifications"
                          size="sm"
                          variant="flat"
                        >
                          View All Notifications
                        </Button>
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>

                <span className="text-xs text-default-600 inline-block max-w-[100px] truncate">
                  {user.user_metadata?.full_name?.split(" ")?.[0] || "User"}
                </span>

                {/* User Menu */}
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <Button
                      isIconOnly
                      className="h-9 w-9 rounded-full p-0"
                      size="sm"
                      variant="light"
                    >
                      <Avatar
                        className="w-9 h-9"
                        fallback={
                          <div className="bg-primary text-primary-foreground flex items-center justify-center w-full h-full rounded-full text-xs font-medium">
                            {user.email?.[0]?.toUpperCase() || "U"}
                          </div>
                        }
                        size="sm"
                        src={user.user_metadata?.avatar_url}
                      />
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="User menu">
                    <DropdownItem
                      key="profile-info"
                      className="h-14 gap-2 opacity-100"
                    >
                      <div className="flex flex-col">
                        <p className="font-semibold text-sm">
                          {user.user_metadata?.full_name || "User"}
                        </p>
                        <p className="text-xs text-default-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </DropdownItem>
                    <DropdownItem
                      key="profile"
                      as={NextLink}
                      href="/profile"
                      startContent={<PhUser className="w-4 h-4" />}
                    >
                      Profile
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      as={NextLink}
                      href="/settings"
                      startContent={<Settings size={16} />}
                    >
                      Settings
                    </DropdownItem>
                    <DropdownItem
                      key="help"
                      as={NextLink}
                      href="/help"
                      startContent={<HelpCircle size={16} />}
                    >
                      Help & Support
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      startContent={<LogOut className="w-4 h-4" />}
                      onPress={signOut}
                    >
                      Sign Out
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ) : (
              <Button
                as={NextLink}
                className="rounded-xl bg-primary-500/25 text-primary-600 font-medium"
                href="/auth/signin"
                size="sm"
                startContent={<LetsIconsLockDuotone className="w-5 h-5" />}
                variant="solid"
              >
                Sign In
              </Button>
            )}
          </NavbarItem>

          {/* Mobile Menu Toggle */}
          <NavbarMenuToggle className="sm:hidden" />
        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6 bg-background/95 backdrop-blur-xl border-r border-default-200/50">
          {/* Mobile Search */}
          <NavbarMenuItem>
            <SearchInput className="w-full mb-4" placeholder="Search..." />
          </NavbarMenuItem>

          {/* Mobile Navigation Items */}
          <NavbarMenuItem>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-3">
                Navigation
              </div>

              <Button
                as={NextLink}
                className="justify-start h-auto p-3 w-full"
                href="/dashboard"
                startContent={<LayoutDashboard className="w-4 h-4" />}
                variant="flat"
                onPress={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Button>

              <Button
                as={NextLink}
                className="justify-start h-auto p-3 w-full"
                href="/extensions"
                startContent={<Puzzle className="w-4 h-4" />}
                variant="flat"
                onPress={() => setIsMenuOpen(false)}
              >
                Extensions
              </Button>

              <Button
                as={NextLink}
                className="justify-start h-auto p-3 w-full"
                href="/portfolios"
                startContent={<PieChart className="w-4 h-4" />}
                variant="flat"
                onPress={() => setIsMenuOpen(false)}
              >
                Portfolios
              </Button>

              <Button
                as={NextLink}
                className="justify-start h-auto p-3 w-full"
                endContent={
                  <Chip color="success" size="sm" variant="flat">
                    New
                  </Chip>
                }
                href="/ai"
                startContent={<Bot className="w-4 h-4" />}
                variant="flat"
                onPress={() => setIsMenuOpen(false)}
              >
                AI Assistant
              </Button>
            </div>
          </NavbarMenuItem>

          {user && (
            <>
              <div className="my-4 border-t border-default-200" />

              <NavbarMenuItem>
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-3">
                    Account
                  </div>

                  <Button
                    as={NextLink}
                    className="justify-start h-auto p-3 w-full"
                    href="/settings"
                    startContent={<Settings className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Button>

                  <Button
                    as={NextLink}
                    className="justify-start h-auto p-3 w-full"
                    href="/billing"
                    startContent={<CreditCard className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Billing
                  </Button>

                  <Button
                    className="justify-start h-auto p-3 w-full text-danger"
                    startContent={<LogOut className="w-4 h-4" />}
                    variant="flat"
                    onPress={() => {
                      setIsMenuOpen(false);
                      signOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </div>
              </NavbarMenuItem>
            </>
          )}
        </NavbarMenu>
      </HeroUINavbar>
    </>
  );
}
