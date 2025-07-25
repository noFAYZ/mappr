"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Kbd } from "@heroui/kbd";
import { Chip } from "@heroui/chip";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import NextLink from "next/link";
import { useTheme } from "next-themes";
import clsx from "clsx";
import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  Plus,
  Zap,
  Crown,
  Shield,
  Star,
  Menu,
  X,
  Command,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Globe,
  Home,
  Building2,
  Users,
  BarChart3,
  Sparkles,
  Compass,
  Puzzle
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigationContext } from "@/contexts/NavigationContext";
import { useUIStore } from "@/stores";
import ThemeSwitcher from "./shared/theme-switch";

interface NavbarProps {
  className?: string;
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
}

const SearchIcon = ({ className }: { className?: string }) => (
  <Search className={clsx("w-4 h-4", className)} />
);

const quickActions = [
  {
    label: "Add Extension",
    href: "/extensions/add",
    icon: <Plus className="w-3 h-3" />,
    color: "primary" as const,
  },
  {
    label: "Create Portfolio",
    href: "/portfolios/create",
    icon: <BarChart3 className="w-3 h-3" />,
    color: "secondary" as const,
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: <Sparkles className="w-3 h-3" />,
    color: "success" as const,
    badge: "New",
  },
];

export function Navbar({ 
  className, 
  showBreadcrumbs = true,
  showQuickActions = true 
}: NavbarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { 
    isSidebarVisible, 
    toggleSidebar,
    breadcrumbs,
    pageTitle 
  } = useNavigationContext();
  const { notifications, removeNotification, addNotification } = useUIStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global search shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    addNotification({
      type: 'success',
      title: 'Theme Changed',
      message: `Switched to ${newTheme} theme`,
    });
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'enterprise':
        return <Crown className="w-3 h-3 text-amber-500" />;
      case 'pro':
      case 'premium':
        return <Shield className="w-3 h-3 text-purple-500" />;
      default:
        return <Star className="w-3 h-3 text-blue-500" />;
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />;
      case 'dark':
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleSearchFocus = () => setSearchFocused(true);
  const handleSearchBlur = () => setSearchFocused(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results or trigger search
      console.log('Search query:', searchQuery);
      // You can implement global search functionality here
    }
  };

  const SearchInput = ({ 
    className, 
    placeholder = "Search everything...", 
    variant = "full" 
  }: { 
    className?: string;
    placeholder?: string;
    variant?: "full" | "compact";
  }) => (
    <form onSubmit={handleSearchSubmit} className="w-full">
      <Input
        ref={variant === "full" ? searchInputRef : undefined}
        aria-label="Global search"
        className={clsx("transition-all duration-300", className)}
        classNames={{
          inputWrapper: clsx(
            "backdrop-blur-md border-0 transition-all duration-300 group",
            searchFocused 
              ? "bg-background/90 shadow-lg ring-2 ring-primary-500/20" 
              : "bg-background/60 hover:bg-background/80"
          ),
          input: "text-sm placeholder:text-default-500",
        }}
        placeholder={placeholder}
        size="sm"
        value={searchQuery}
        onValueChange={setSearchQuery}
        startContent={<SearchIcon className="text-default-400 flex-shrink-0" />}
        endContent={
          variant === "full" && (
            <div className="flex items-center gap-1">
              {searchQuery && (
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-6 h-6 min-w-6"
                  onPress={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Kbd className="hidden lg:inline-flex bg-default-200/50 text-xs" keys={["command"]}>
                K
              </Kbd>
            </div>
          )
        }
        type="search"
        variant="flat"
        onFocus={handleSearchFocus}
        onBlur={handleSearchBlur}
      />
    </form>
  );

  return (
    <>
      <HeroUINavbar 
        maxWidth="full"
        className={clsx(
          "transition-all duration-300 backdrop-blur-xl border-b",
          isScrolled 
            ? "bg-background/95 border-default-200/50 shadow-sm" 
            : "bg-background/80 border-transparent",
          className
        )}
        height="4rem"
        isMenuOpen={isMenuOpen}
        onMenuOpenChange={setIsMenuOpen}
      >
        {/* Left Content */}
        <NavbarContent justify="start" className="gap-4 flex-1">
          
          {/* Sidebar Toggle & Logo */}
          <NavbarItem className="flex items-center gap-3">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              className="hidden sm:flex bg-transparent hover:bg-default-100 transition-colors"
              onPress={toggleSidebar}
            >
              <Menu className="w-4 h-4" />
            </Button>

            {/* Logo (when sidebar is hidden) */}
            {!isSidebarVisible && (
              <NextLink href="/dashboard" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">MM</span>
                  </div>
                  <div className="absolute inset-0 bg-primary-500/20 blur-md rounded-lg opacity-0 group-hover:opacity-60 transition-opacity" />
                </div>
                <span className="font-bold text-lg tracking-tight hidden sm:inline-block bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MoneyMappr
                </span>
              </NextLink>
            )}
          </NavbarItem>

          {/* Breadcrumbs */}
          {showBreadcrumbs && breadcrumbs.length > 0 && (
            <NavbarItem className="hidden md:flex">
              <Breadcrumbs
                separator="/"
                classNames={{
                  list: "gap-2",
                  separator: "text-default-400 mx-1"
                }}
              >
                {breadcrumbs.map((breadcrumb, index) => (
                  <BreadcrumbItem 
                    key={index}
                    href={breadcrumb.href}
                    className={clsx(
                      "text-sm transition-colors",
                      index === breadcrumbs.length - 1 
                        ? "text-foreground font-medium" 
                        : "text-default-500 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {breadcrumb.icon}
                      {breadcrumb.label}
                    </div>
                  </BreadcrumbItem>
                ))}
              </Breadcrumbs>
            </NavbarItem>
          )}

          {/* Page Title (mobile) */}
          <NavbarItem className="md:hidden">
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </NavbarItem>

          {/* Search Bar - Desktop */}
          <NavbarItem className="hidden lg:flex flex-1 max-w-md ml-auto">
            <SearchInput className="w-full" />
          </NavbarItem>

        </NavbarContent>

        {/* Right Content */}
        <NavbarContent justify="end" className="gap-2">
          
          {/* Quick Actions */}
          {showQuickActions && (
            <NavbarItem className="hidden xl:flex">
              <div className="flex items-center gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.href}
                    as={NextLink}
                    href={action.href}
                    size="sm"
                    color={action.color}
                    variant="flat"
                    startContent={action.icon}
                    endContent={action.badge && (
                      <Chip size="sm" color="success" variant="flat">
                        {action.badge}
                      </Chip>
                    )}
                    className="bg-opacity-10 hover:bg-opacity-20"
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </NavbarItem>
          )}

          {/* Activity Indicator */}
          <NavbarItem className="hidden sm:flex">
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              className="relative bg-transparent hover:bg-default-100"
              as={NextLink}
              href="/activity"
            >
              <Activity className="w-4 h-4" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-success rounded-full animate-pulse" />
            </Button>
          </NavbarItem>

          {/* Notifications */}
          <NavbarItem>
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Button
                  isIconOnly
                  variant="flat"
                  size="sm"
                  className="relative bg-transparent hover:bg-default-100"
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <Badge
                      content={unreadNotifications}
                      color="danger"
                      size="sm"
                      className="absolute -top-1 -right-1"
                    />
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu 
                aria-label="Notifications" 
                className="w-80"
                closeOnSelect={false}
              >
                {notifications.length === 0 ? (
                  <DropdownItem key="empty" className="text-center text-default-500">
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
                      onPress={() => removeNotification(notification.id)}
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{notification.title}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-default-400">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </span>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full" />
                            )}
                          </div>
                        </div>
                        {notification.message && (
                          <span className="text-xs text-default-600">{notification.message}</span>
                        )}
                      </div>
                    </DropdownItem>
                  ))
                )}
                {notifications.length > 0 && (
                  <DropdownItem key="view-all" className="text-center">
                    <Button
                      as={NextLink}
                      href="/notifications"
                      variant="flat"
                      size="sm"
                      className="w-full"
                    >
                      View All Notifications
                    </Button>
                  </DropdownItem>
                )}
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>

          {/* Theme Switcher */}
          <NavbarItem>
            <ThemeSwitcher />
           
          </NavbarItem>

          {/* User Menu */}
          {user && profile ? (
            <NavbarItem>
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    variant="flat"
                    className="p-2 h-auto bg-transparent hover:bg-default-100 gap-2"
                  >
                    <Avatar
                      src={profile.avatar_url || undefined}
                      name={profile.full_name || profile.email}
                      size="sm"
                      className="w-7 h-7"
                    />
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-xs font-medium flex items-center gap-1">
                        {profile.full_name || 'User'}
                        {getTierBadge(profile.tier)}
                      </span>
                      <span className="text-xs text-default-500 capitalize">
                        {profile.tier} Plan
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-default-400" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="User menu">
                  <DropdownItem
                    key="profile"
                    href="/profile"
                    startContent={<Settings className="w-4 h-4" />}
                  >
                    Profile Settings
                  </DropdownItem>
                  <DropdownItem
                    key="billing"
                    href="/billing"
                    startContent={getTierBadge(profile.tier)}
                  >
                    Billing & Usage
                  </DropdownItem>
                  <DropdownItem
                    key="organization"
                    href="/organization"
                    startContent={<Building2 className="w-4 h-4" />}
                  >
                    Organization
                  </DropdownItem>
                  <DropdownItem
                    key="help"
                    href="/help"
                    startContent={<HelpCircle className="w-4 h-4" />}
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
            </NavbarItem>
          ) : (
            <NavbarItem>
              <Button
                as={NextLink}
                href="/auth/login"
                color="primary"
                size="sm"
                variant="flat"
              >
                Sign In
              </Button>
            </NavbarItem>
          )}

          {/* Mobile Menu Toggle */}
          <NavbarMenuToggle className="sm:hidden" />

        </NavbarContent>

        {/* Mobile Menu */}
        <NavbarMenu className="pt-6 bg-background/95 backdrop-blur-xl border-r border-default-200/50">
          
          {/* Mobile Search */}
          <NavbarMenuItem>
            <SearchInput placeholder="Search..." variant="compact" className="w-full mb-4" />
          </NavbarMenuItem>

          {/* Mobile Quick Actions */}
          <NavbarMenuItem>
            <div className="mb-4">
              <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-2">
                Quick Actions
              </div>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.href}
                    as={NextLink}
                    href={action.href}
                    variant="flat"
                    className="justify-start h-auto p-3"
                    startContent={action.icon}
                    endContent={action.badge && (
                      <Chip size="sm" color="success" variant="flat">
                        {action.badge}
                      </Chip>
                    )}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
          </NavbarMenuItem>

          {/* Mobile Navigation Items */}
          <NavbarMenuItem>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-2">
                Navigation
              </div>
              
              <Button
                as={NextLink}
                href="/dashboard"
                variant="flat"
                className="justify-start h-auto p-3 w-full"
                startContent={<Home className="w-4 h-4" />}
                onPress={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Button>

              <Button
                as={NextLink}
                href="/extensions"
                variant="flat"
                className="justify-start h-auto p-3 w-full"
                startContent={<Puzzle className="w-4 h-4" />}
                onPress={() => setIsMenuOpen(false)}
              >
                Extensions
              </Button>

              <Button
                as={NextLink}
                href="/portfolios"
                variant="flat"
                className="justify-start h-auto p-3 w-full"
                startContent={<BarChart3 className="w-4 h-4" />}
                onPress={() => setIsMenuOpen(false)}
              >
                Portfolios
              </Button>

              <Button
                as={NextLink}
                href="/ai"
                variant="flat"
                className="justify-start h-auto p-3 w-full"
                startContent={<Sparkles className="w-4 h-4" />}
                endContent={<Chip size="sm" color="success" variant="flat">New</Chip>}
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
                  <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-2">
                    Account
                  </div>
                  
                  <Button
                    as={NextLink}
                    href="/settings"
                    variant="flat"
                    className="justify-start h-auto p-3 w-full"
                    startContent={<Settings className="w-4 h-4" />}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </Button>

                  <Button
                    as={NextLink}
                    href="/billing"
                    variant="flat"
                    className="justify-start h-auto p-3 w-full"
                    startContent={<Crown className="w-4 h-4" />}
                    onPress={() => setIsMenuOpen(false)}
                  >
                    Billing
                  </Button>

                  <Button
                    variant="flat"
                    className="justify-start h-auto p-3 w-full text-danger"
                    startContent={<LogOut className="w-4 h-4" />}
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