"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Avatar } from "@heroui/avatar";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Divider } from "@heroui/divider";
import NextLink from "next/link";
import clsx from "clsx";
import { 
  LayoutDashboard,
  Puzzle,
  PieChart,
  Bot,
  BarChart3,
  Database,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Crown,
  Shield,
  Star,
  Zap,
  TrendingUp,
  Wallet,
  Building2,
  FileText,
  Activity,
  Users,
  Bell,
  Sparkles,
  Monitor,
  ChevronLeft,
  ChevronUp,
  Home,
  Compass
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useNavigationContext } from "@/contexts/NavigationContext";
import { LogoMappr } from "./icons";
import { RadixIconsDashboard, SiDashboardCustomizeLine } from "./icons/icons";

interface SidebarProps {
  className?: string;
  organizationData?: {
    name: string;
    plan: string;
    status: string;
    usage?: {
      current: number;
      limit: number;
    };
    tier?: string;
  };
  notificationCount?: number;
  showQuickSearch?: boolean;
}

interface MenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  accent?: string;
  submenu?: SubMenuItem[];
  isNew?: boolean;
  isComingSoon?: boolean;
}

interface SubMenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  isNew?: boolean;
}

// Enhanced navigation items with modern design
const navigationItems: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <RadixIconsDashboard className="w-5 h-5" />,
    accent: "from-blue-500 to-cyan-500",
  },
  {
    label: "Extensions",
    href: "/extensions",
    icon: <Puzzle className="w-5 h-5" />,
    badge: "8",
    accent: "from-purple-500 to-pink-500",
    submenu: [
      { 
        label: "Browse All", 
        href: "/extensions", 
        icon: <Compass className="w-4 h-4" /> 
      },
      { 
        label: "Connected", 
        href: "/extensions/connected", 
        icon: <Shield className="w-4 h-4" />,
        badge: "3"
      },
      { 
        label: "Add New", 
        href: "/extensions/add", 
        icon: <Plus className="w-4 h-4" />,
        isNew: true
      },
    ]
  },
  {
    label: "Portfolios",
    href: "/portfolios",
    icon: <PieChart className="w-5 h-5" />,
    accent: "from-emerald-500 to-teal-500",
    submenu: [
      { 
        label: "Overview", 
        href: "/portfolios", 
        icon: <Home className="w-4 h-4" /> 
      },
      { 
        label: "Performance", 
        href: "/portfolios/performance", 
        icon: <TrendingUp className="w-4 h-4" /> 
      },
      { 
        label: "Analytics", 
        href: "/portfolios/analytics", 
        icon: <BarChart3 className="w-4 h-4" /> 
      },
      { 
        label: "Create New", 
        href: "/portfolios/create", 
        icon: <Plus className="w-4 h-4" /> 
      },
    ]
  },
  {
    label: "Data Sources",
    href: "/data",
    icon: <Database className="w-5 h-5" />,
    accent: "from-orange-500 to-red-500",
    submenu: [
      { 
        label: "All Data", 
        href: "/data", 
        icon: <Database className="w-4 h-4" /> 
      },
      { 
        label: "Crypto", 
        href: "/data/crypto", 
        icon: <Wallet className="w-4 h-4" /> 
      },
      { 
        label: "Banking", 
        href: "/data/banking", 
        icon: <Building2 className="w-4 h-4" /> 
      },
      { 
        label: "Business", 
        href: "/data/business", 
        icon: <FileText className="w-4 h-4" /> 
      },
    ]
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: <Bot className="w-5 h-5" />,
    badge: "New",
    accent: "from-violet-500 to-purple-500",
    isNew: true,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <BarChart3 className="w-5 h-5" />,
    accent: "from-amber-500 to-orange-500",
  },
];

const settingsItems: MenuItem[] = [
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5" />,
  },
  {
    label: "Billing",
    href: "/billing",
    icon: <CreditCard className="w-5 h-5" />,
  },
  {
    label: "Help & Support",
    href: "/help",
    icon: <HelpCircle className="w-5 h-5" />,
  },
];

export function Sidebar({ 
  className, 
  organizationData,
  notificationCount = 0,
  showQuickSearch = true 
}: SidebarProps) {
  const pathname = usePathname();
  const { user, profile, signOut } = useAuth();
  const { 
    isSidebarVisible, 
    isSidebarCollapsed, 
    toggleSidebar,
    setSidebarCollapsed 
  } = useNavigationContext();
  
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile && isSidebarVisible) {
        // Auto-collapse on mobile
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarVisible]);

  // Auto-expand menu if current path is in submenu
  useEffect(() => {
    const newExpanded = new Set<string>();
    navigationItems.forEach(item => {
      if (item.submenu?.some(sub => pathname === sub.href || pathname.startsWith(sub.href + '/'))) {
        newExpanded.add(item.href);
      }
    });
    setExpandedMenus(newExpanded);
  }, [pathname]);

  const toggleMenu = useCallback((href: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(href)) {
        newSet.delete(href);
      } else {
        newSet.add(href);
      }
      return newSet;
    });
  }, []);

  const isActive = useCallback((href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname === href || pathname.startsWith(href + '/');
  }, [pathname]);

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

  const getUsageColor = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  if (!isSidebarVisible && !isMobile) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isSidebarVisible && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed md:sticky top-0 h-screen z-50 flex flex-col transition-all duration-200 bg-content1 backdrop-blur-xl border-r border-default-200/50",
        isMobile ? [
          "fixed inset-y-0 left-0 shadow-2xl",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full"
        ] : [
          "relative",
          isSidebarCollapsed ? "w-16" : "w-52"
        ],
        className
      )}>
        
        {/* Header Section */}
        <header className={clsx(
          "flex items-center justify-between h-16 px-4 ",
          isSidebarCollapsed && !isMobile && "px-2"
        )}>
          {!isSidebarCollapsed || isMobile ? (
            <NextLink href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-9 h-9  flex items-center justify-center">
                  <LogoMappr />
                </div>
                <div className="absolute inset-0 bg-primary-500/20 blur-md rounded-xl opacity-0 group-hover:opacity-60 transition-opacity" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  MoneyMappr
                </span>
                {organizationData && (
                  <div className="flex items-center gap-1 -mt-1">
                    <span className="text-xs text-default-500">{organizationData.name}</span>
                    {getTierBadge(organizationData.tier || organizationData.plan)}
                  </div>
                )}
              </div>
            </NextLink>
          ) : (
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              className="w-9 h-9 bg-transparent"
              as={NextLink}
              href="/dashboard"
            >
                 
                  <LogoMappr />
             
            </Button>
          )}

 

          {/* Close Button - Mobile */}
          {isMobile && (
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={() => setSidebarCollapsed(true)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        </header>

        {/* Quick Search 
        {showQuickSearch && (!isSidebarCollapsed || isMobile) && (
          <div className="p-3 border-b border-default-200/50">
            <Input
              ref={searchInputRef}
              placeholder="Quick search..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="w-4 h-4 text-default-400" />}
              classNames={{
                input: "text-sm",
                inputWrapper: "h-9 bg-default-100/50 hover:bg-default-100 transition-colors"
              }}
              variant="flat"
              size="sm"
            />
          </div>
        )}*/}

        {/* Usage Stats (when not collapsed) */}
        {organizationData?.usage && (!isSidebarCollapsed || isMobile) && (
          <div className="p-3 border-b border-default-200/50">
            <div className="text-xs text-default-500 mb-2">Usage this month</div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">
                {organizationData.usage.current.toLocaleString()}
              </span>
              <span className="text-xs text-default-400">
                / {organizationData.usage.limit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-default-200 rounded-full h-1.5">
              <div 
                className={clsx(
                  "h-1.5 rounded-full transition-all",
                  getUsageColor(organizationData.usage.current, organizationData.usage.limit) === 'danger' 
                    ? "bg-danger" 
                    : getUsageColor(organizationData.usage.current, organizationData.usage.limit) === 'warning'
                    ? "bg-warning"
                    : "bg-success"
                )}
                style={{ 
                  width: `${Math.min((organizationData.usage.current / organizationData.usage.limit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4  scrollbar-none">
          <div className="space-y-6">
            
            {/* Main Navigation */}
            <div>
              {(!isSidebarCollapsed || isMobile) && (
                <div className="text-xs font-semibold text-default-500 uppercase tracking-wider mb-3 px-2">
                  Main
                </div>
              )}
              <div className="space-y-1.5">
                {navigationItems.map((item) => (
                  <div key={item.href}>
                    {/* Main Menu Item */}
                    <div 
                      className="relative"
                      onMouseEnter={() => isSidebarCollapsed && !isMobile && setHoveredItem(item.href)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {/* Tooltip for collapsed mode */}
                      {isSidebarCollapsed && !isMobile && hoveredItem === item.href && (
                        <div className="absolute left-full top-0 ml-3 z-50 px-2 py-2 bg-background border border-default-200 shadow-lg rounded-lg text-sm font-medium whitespace-nowrap">
                          {item.label}
                          {item.submenu && (
                            <div className="mt-2 pt-2 border-t border-default-200">
                              {item.submenu.map(sub => (
                                <div key={sub.href} className="py-1 text-xs text-default-600">
                                  {sub.label}
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="absolute right-full top-2 border-4 border-transparent border-r-background" />
                        </div>
                      )}

                      {item.submenu && (!isSidebarCollapsed || isMobile) ? (
                        <Button
                          variant="flat"
                     
                          className={clsx(
                            "w-full justify-start  p-2 h-auto bg-transparent group",
                            isActive(item.href)
                            
                            ? " text-primary-600 border-primary-500/20 shadow-sm"
                            : " hover:border-primary-500/20 hover:text-primary-600 "
                          )}
                          onPress={() => toggleMenu(item.href)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <span className={clsx(
                              "transition-colors",
                              isActive(item.href) ? "text-primary-600 hover:text-primary-600" : " hover:text-primary-600"
                            )}>
                              {item.icon}
                            </span>
                            <span className="text-xs font-medium">{item.label}</span>
                            {item.badge && (
                              <Chip size="sm" color="primary" variant="flat" className="text-[10px] h-5 bg-primary-500/20 rounded-md px-0.5">
                                {item.badge}
                              </Chip>
                            )}
                           
                          </div>
                          <ChevronDown 
                            className={clsx(
                              "w-4 h-4 transition-transform",
                              expandedMenus.has(item.href) ? "rotate-180" : ""
                            )}
                          />
                        </Button>
                      ) : (
                        <Button
                          as={NextLink}
                          href={item.href}
                          size="sm"
                          isIconOnly={isSidebarCollapsed && !isMobile}
                          variant="flat"
                          radius="md"
                          className={clsx(
                            "w-full h-auto transition-all duration-100 group nav-item bg-transparent  ",
                            isSidebarCollapsed && !isMobile ? "justify-center p-2" : "justify-start p-2",
                            isActive(item.href)
                              ? " text-primary-600 border-primary-500/20 shadow-sm"
                              : " hover:border-primary-500/20 hover:text-primary-600 "
                          )}
                        >
                          <div className={clsx(
                            "flex items-center gap-3",
                            isSidebarCollapsed && !isMobile ? "justify-center" : "flex-1"
                          )}>
                            <span className={clsx(
                              "transition-colors",
                              isActive(item.href) ? "text-primary-600" : "text-default-500 group-hover:text-primary-600"
                            )}>
                              {item.icon}
                            </span>
                            {(!isSidebarCollapsed || isMobile) && (
                              <>
                                <span className="text-xs font-medium">{item.label}</span>
                                <div className="flex items-center gap-2 ml-auto">
                                  {item.badge && (
                                    <Chip size="sm" color="primary" variant="flat" className="text-[10px] h-5 bg-primary-500/20 rounded-md px-0.5">
                                      {item.badge}
                                    </Chip>
                                  )}
                                 
                                </div>
                              </>
                            )}
                          </div>
                        </Button>
                      )}
                    </div>

                    {/* Submenu */}
                    {item.submenu && expandedMenus.has(item.href) && (!isSidebarCollapsed || isMobile) && (
                      <div className="ml-4 mt-1 space-y-1 border-l border-default-200/50 pl-4">
                        {item.submenu.map((subItem) => (
                          <Button
                            key={subItem.href}
                            as={NextLink}
                            href={subItem.href}
                            variant="light"
                            size="sm"
                            className={clsx(
                              "w-full justify-start p-2 h-auto transition-all duration-200",
                              pathname === subItem.href
                                ? "bg-primary-500/10 text-primary-600"
                                : "hover:bg-default-100/30 text-default-500"
                            )}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {subItem.icon}
                              <span className="text-xs">{subItem.label}</span>
                              <div className="flex items-center gap-1 ml-auto">
                                {subItem.badge && (
                                  <Chip size="sm" color="primary" variant="flat" className="text-[10px] h-5 bg-primary-500/20 rounded-md px-0.5">
                                    {subItem.badge}
                                  </Chip>
                                )}
                                {subItem.isNew && (
                                  <Chip size="sm" color="success" variant="flat" className="text-[10px] h-5 bg-lime-500/25 rounded-md px-0.5">
                                    New
                                  </Chip>
                                )}
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Settings Navigation
            <div>
              {(!isSidebarCollapsed || isMobile) && (
                <div className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-3 px-2">
                  Settings
                </div>
              )}
              <div className="space-y-1">
                {settingsItems.map((item) => (
                  <div 
                    key={item.href}
                    className="relative"
                    onMouseEnter={() => isSidebarCollapsed && !isMobile && setHoveredItem(item.href)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                
                    {isSidebarCollapsed && !isMobile && hoveredItem === item.href && (
                      <div className="absolute left-full top-0 ml-3 z-50 px-3 py-2 bg-background border border-default-200 shadow-lg rounded-lg text-sm font-medium whitespace-nowrap">
                        {item.label}
                        <div className="absolute right-full top-2 border-4 border-transparent border-r-background" />
                      </div>
                    )}

                    <Button
                      as={NextLink}
                      href={item.href}
                      variant="light"
                      size="sm"
                      isIconOnly={isSidebarCollapsed && !isMobile}
                      radius="md"
                      className={clsx(
                        "w-full h-auto transition-all text-xs duration-200 nav-item",
                        isSidebarCollapsed && !isMobile ? "justify-center p-2" : "justify-start p-2",
                        isActive(item.href)
                          ? "bg-primary-500/10 text-primary-600 shadow-sm"
                          : "hover:bg-primary-500/50 text-default-600"
                      )}
                    >
                      <div className={clsx(
                        "flex items-center gap-3",
                        isSidebarCollapsed && !isMobile ? "justify-center" : "flex-1"
                      )}>
                        <span className={clsx(
                          "transition-colors",
                          isActive(item.href) ? "text-primary-600" : "text-default-500"
                        )}>
                          {item.icon}
                        </span>
                        {(!isSidebarCollapsed || isMobile) && (
                          <span className="text-xs font-medium">{item.label}</span>
                        )}
                      </div>
                    </Button>
                  </div>
                ))}
              </div>
            </div> */}

          </div>
        </nav>

        {/* User Profile Section */}
        {user && profile && (
          <footer className=" p-2">
            <Dropdown placement="top-start">
              <DropdownTrigger>
                <Button
                  variant="light"
                  isIconOnly={isSidebarCollapsed && !isMobile}
                  className={clsx(
                    " hover:bg-default-100/50 transition-colors",
                    isSidebarCollapsed && !isMobile ? "justify-center w-8 h-8 rounded-full" : "justify-start w-full h-auto p-2 rounded-2xl"
                  )}
                >
                  {isSidebarCollapsed && !isMobile ? (
                    <Avatar
                      src={profile.avatar_url || undefined}
                      name={profile.full_name || profile.email}
                      size="sm"
                      className="w-8 h-8"
                    />
                  ) : (
                    <div className="flex items-center gap-3 w-full">
                      <Avatar
                        src={profile.avatar_url || undefined}
                        name={profile.full_name || profile.email}
                        size="sm"
                        className="w-8 h-8"
                      />
                      <div className="flex-1 text-left">
                        <div className="text-sm font-medium flex items-center gap-2">
                          {profile.full_name || 'User'}
                          {getTierBadge(profile.tier)}
                          {notificationCount > 0 && (
                            <Badge content={notificationCount} color="danger" size="sm" />
                          )}
                        </div>
                        <div className="text-xs text-default-500 capitalize">
                          {profile.tier} Plan
                        </div>
                      </div>
                      <ChevronUp className="w-4 h-4 text-default-400" />
                    </div>
                  )}
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
                  key="notifications" 
                  href="/notifications"
                  startContent={<Bell className="w-4 h-4" />}
                  endContent={notificationCount > 0 && (
                    <Badge content={notificationCount} color="danger" size="sm" />
                  )}
                >
                  Notifications
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
          </footer>
        )}

      </aside>
    </>
  );
}