import React from "react";
import { Chip } from "@heroui/chip";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";

// Types
export interface TabConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  count?: number | null;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
}

export interface ModernTabsProps {
  tabs: TabConfig[];
  selectedTab: string;
  onTabChange: (tabKey: string) => void;
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "glass" | "solid";
  size?: "sm" | "md" | "lg";
  showCounts?: boolean;
}

// Animation configurations
const ANIMATION_CONFIG = {
  tab: { type: "spring", bounce: 0.2, duration: 0.2 } as const,
  content: { duration: 0.1 } as const,
};

// Style variants
const VARIANTS = {
  default: {
    container: "bg-default-50/50 border-default-200",
    tabContainer: "bg-default-200",
    activeTab: "bg-default-100 shadow-sm text-foreground",
    inactiveTab:
      "text-default-600 hover:text-foreground hover:bg-default-200/50",
  },
  glass: {
    container:
      "bg-gradient-to-br from-white/5 via-white/[0.02] to-transparent backdrop-blur-xl border-divider",
    tabContainer: "bg-default-200/60 backdrop-blur-sm",
    activeTab: "bg-white/20 shadow-sm text-foreground backdrop-blur-sm",
    inactiveTab: "text-default-600 hover:text-foreground hover:bg-white/10",
  },
  solid: {
    container: "bg-default-100 border-default-300",
    tabContainer: "bg-default-300",
    activeTab: "bg-white shadow-md text-foreground",
    inactiveTab: "text-default-700 hover:text-foreground hover:bg-default-200",
  },
} as const;

const SIZE_CONFIG = {
  sm: {
    container: "rounded-xl p-3",
    tabContainer: "rounded-xl gap-0.5 p-0.5",
    tab: "px-2 py-1 rounded-lg text-xs",
    icon: "w-4 h-4",
    iconContainer: "w-5 h-5",
    chip: "text-[9px] min-w-5 h-4",
  },
  md: {
    container: "rounded-2xl p-4",
    tabContainer: "rounded-2xl gap-1 p-1",
    tab: "px-3 py-1.5 rounded-xl text-sm",
    icon: "w-4 h-4",
    iconContainer: "w-6 h-6",
    chip: "text-[10px] min-w-6 h-5",
  },
  lg: {
    container: "rounded-3xl p-6",
    tabContainer: "rounded-2xl gap-1 p-1",
    tab: "px-4 py-2 rounded-xl text-base",
    icon: "w-5 h-5",
    iconContainer: "w-7 h-7",
    chip: "text-xs min-w-7 h-6",
  },
} as const;

/**
 * Professional reusable tabs component with modern design and animations
 *
 * @param tabs - Array of tab configurations
 * @param selectedTab - Currently selected tab key
 * @param onTabChange - Callback when tab is changed
 * @param children - Content to render in the tab panel
 * @param className - Additional CSS classes
 * @param variant - Visual variant of the component
 * @param size - Size variant of the component
 * @param showCounts - Whether to show count badges
 */
const Tabs: React.FC<ModernTabsProps> = ({
  tabs,
  selectedTab,
  onTabChange,
  children,
  className = "",
  variant = "glass",
  size = "md",
  showCounts = true,
}) => {
  // Validate props
  if (!tabs.length) {
    console.warn("ModernTabs: No tabs provided");

    return null;
  }

  const currentTab = tabs.find((tab) => tab.key === selectedTab);

  if (!currentTab) {
    console.warn(
      `ModernTabs: Selected tab "${selectedTab}" not found in tabs array`,
    );
  }

  const styles = VARIANTS[variant];
  const sizeStyles = SIZE_CONFIG[size];

  const handleTabClick = React.useCallback(
    (tabKey: string) => {
      if (tabKey !== selectedTab) {
        onTabChange(tabKey);
      }
    },
    [selectedTab, onTabChange],
  );

  const renderTabButton = React.useCallback(
    (tab: TabConfig) => {
      const isActive = selectedTab === tab.key;
      const IconComponent = tab.icon;

      return (
        <button
          key={tab.key}
          aria-controls={`tabpanel-${tab.key}`}
          aria-selected={isActive}
          className={`relative flex items-center gap-2 px-2 py-1 rounded-xl text-sm font-medium transition-all duration-75 ${
            selectedTab === tab.key
              ? "bg-default-100 shadow-sm text-foreground"
              : "text-default-600 hover:text-foreground hover:bg-default-200/50"
          }`}
          role="tab"
          onClick={() => handleTabClick(tab.key)}
        >
          <div
            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors `}
          >
            <IconComponent aria-hidden="true" className={sizeStyles.icon} />
          </div>

          <span className="text-xs font-semibold">{tab.label}</span>

          {showCounts && tab.count !== null && tab.count !== undefined && (
            <Chip
              className="text-[10px] min-w-6 h-5 bg-danger-500/20"
              color={selectedTab === tab.key ? (tab.color as any) : "default"}
              size="sm"
              variant="flat"
            >
              {tab.count}
            </Chip>
          )}

          {isActive && (
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r from-${tab.color}/5 to-${tab.color}/10 rounded-lg -z-10`}
              layoutId="activeTab"
              transition={{ type: "spring", bounce: 0.2, duration: 0.2 }}
            />
          )}
        </button>
      );
    },
    [selectedTab, showCounts, handleTabClick, styles, sizeStyles],
  );

  return (
    <div
      className={`
        w-full border animate-in fade-in-0 duration-100 slide-in-from-bottom-6
        ${sizeStyles.container}
        ${styles.container}
        ${className}
      `}
    >
      {/* Gradient overlay for glass variant */}
      {variant === "glass" && (
        <div
          className={`
          absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-pink-500/5
          ${sizeStyles.container}
        `}
        />
      )}

      {/* Tab Navigation */}
      <div className="relative z-10">
        <nav
          aria-label="Tab navigation"
          className={`
            flex items-center w-fit
            ${sizeStyles.tabContainer}
            ${styles.tabContainer}
          `}
          role="tablist"
        >
          {tabs.map(renderTabButton)}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="pt-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTab}
            animate={{ opacity: 1, y: 0 }}
            aria-labelledby={`tab-${selectedTab}`}
            exit={{ opacity: 0, y: -20 }}
            id={`tabpanel-${selectedTab}`}
            initial={{ opacity: 0, y: 20 }}
            role="tabpanel"
            transition={ANIMATION_CONFIG.content}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Hook for managing tab state
export const useTabState = (defaultTab: string) => {
  const [selectedTab, setSelectedTab] = React.useState(defaultTab);

  const handleTabChange = React.useCallback((tabKey: string) => {
    setSelectedTab(tabKey);
  }, []);

  return {
    selectedTab,
    onTabChange: handleTabChange,
    setSelectedTab,
  };
};

// Utility function to create tab configurations
export const createTabConfig = (
  key: string,
  label: string,
  icon: LucideIcon,
  options: {
    count?: number | null;
    color?: TabConfig["color"];
  } = {},
): TabConfig => ({
  key,
  label,
  icon,
  count: options.count,
  color: options.color || "primary",
});

export default Tabs;
