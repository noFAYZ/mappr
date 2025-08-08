// components/WalletAnalytics/TokensListControls.tsx
"use client";

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Chip,
  Tooltip,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Card,
  CardBody,
  Slider,
  Divider,
  Select,
  SelectItem,
  ScrollShadow,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Settings,
  ChevronDown,
  X,
  CheckCircle2,
  Crown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Hash,
  Target,
  Award,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  ArrowUpDown,
  Layers,
  Activity,
  RotateCcw,
  MinusCircle,
  ListChecks,
} from "lucide-react";
import clsx from "clsx";
import { Input } from "@heroui/input";

import { IcTwotonePrivacyTip } from "@/components/icons/icons";

// Types
export interface TokensControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMode: "value" | "change" | "quantity" | "alphabetical" | "price";
  onSortModeChange: (
    mode: "value" | "change" | "quantity" | "alphabetical" | "price",
  ) => void;
  sortAscending: boolean;
  onSortDirectionChange: (ascending: boolean) => void;
  filterMode: "all" | "verified" | "highValue" | "gainers" | "losers";
  onFilterModeChange: (
    mode: "all" | "verified" | "highValue" | "gainers" | "losers",
  ) => void;
  hideZeroValues: boolean;
  onHideZeroValuesChange: (hide: boolean) => void;
  hideDustTokens: boolean;
  onHideDustTokensChange: (hide: boolean) => void;
  showBalance: boolean;
  onShowBalanceChange: (show: boolean) => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  totalTokens: number;
  filteredTokens: number;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

// Enhanced Constants
const FILTER_OPTIONS = [
  {
    key: "all",
    label: "All Tokens",
    shortLabel: "All",
    icon: Layers,
    color: "default",
    description: "Show all tokens",
  },
  {
    key: "verified",
    label: "Verified Only",
    shortLabel: "Verified",
    icon: CheckCircle2,
    color: "success",
    description: "Only verified tokens",
  },
  {
    key: "highValue",
    label: "High Value ($1k+)",
    shortLabel: "High Value",
    icon: Crown,
    color: "warning",
    description: "Tokens worth $1,000+",
  },
  {
    key: "gainers",
    label: "24h Gainers",
    shortLabel: "Gainers",
    icon: TrendingUp,
    color: "success",
    description: "Positive 24h change",
  },
  {
    key: "losers",
    label: "24h Losers",
    shortLabel: "Losers",
    icon: TrendingDown,
    color: "danger",
    description: "Negative 24h change",
  },
];

const SORT_OPTIONS = [
  {
    key: "value",
    label: "Portfolio Value",
    shortLabel: "Value",
    icon: DollarSign,
    description: "Sort by USD value",
  },
  {
    key: "change",
    label: "24h Change",
    shortLabel: "Change",
    icon: BarChart3,
    description: "Sort by price change",
  },
  {
    key: "quantity",
    label: "Token Amount",
    shortLabel: "Amount",
    icon: Hash,
    description: "Sort by quantity held",
  },
  {
    key: "price",
    label: "Unit Price",
    shortLabel: "Price",
    icon: Target,
    description: "Sort by token price",
  },
  {
    key: "alphabetical",
    label: "Alphabetical",
    shortLabel: "Name",
    icon: Award,
    description: "Sort by token name",
  },
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

// Enhanced Search Input
const EnhancedSearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}> = ({ value, onChange, onClear }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isFocused) {
        inputRef.current?.blur();
        onClear();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, onClear]);

  return (
    <Input
      ref={inputRef}
      classNames={{
        base: "w-full",
      }}
      endContent={
        <div className="flex items-center gap-1">
          {value && (
            <Button
              isIconOnly
              className="w-5 h-5 min-w-5 text-default-400 hover:text-danger transition-colors"
              size="sm"
              variant="faded"
              onPress={onClear}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          {!isFocused && (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-default px-1.5 font-mono text-[10px] font-medium text-default-500">
              ⌘K
            </kbd>
          )}
        </div>
      }
      placeholder="Search tokens by name, symbol..."
      radius="lg"
      startContent={
        <Search
          className={clsx(
            "w-4 h-4 ",
            isFocused ? "text-primary scale-110" : "text-default-400",
          )}
        />
      }
      value={value}
      variant="faded"
      onBlur={() => setIsFocused(false)}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
    />
  );
};

// Smart Filter Dropdown
const SmartFilterDropdown: React.FC<{
  filterMode: string;
  onFilterModeChange: (mode: string) => void;
  filteredCount: number;
  totalCount: number;
}> = ({ filterMode, onFilterModeChange, filteredCount, totalCount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilter =
    FILTER_OPTIONS.find((f) => f.key === filterMode) || FILTER_OPTIONS[0];
  const ActiveIcon = activeFilter.icon;
  const hasFilter = filteredCount !== totalCount;

  return (
    <Dropdown
      classNames={{
        content:
          "p-1 border border-default-200 shadow-xl bg-background/95 backdrop-blur-md",
      }}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    >
      <DropdownTrigger>
        <Button
          className={clsx("h-8 min-w-24 justify-between ")}
          endContent={
            <div className="flex items-center gap-1">
              {hasFilter && (
                <Chip
                  className="text-[11px] font-medium px-0 h-5 rounded-full bg-primary-500/25 text-primary-700 border-primary-700"
                  size="sm"
                  variant="flat"
                >
                  {filteredCount}
                </Chip>
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          }
          radius="none"
          size="sm"
          startContent={<ActiveIcon className="w-4 h-4" />}
          variant="faded"
        >
          <span className="font-medium text-xs text-default-500">
            {activeFilter.shortLabel}
          </span>
        </Button>
      </DropdownTrigger>

      <DropdownMenu
        aria-label="Filter options"
        className="w-48"
        closeOnSelect={true}
        itemClasses={{
          base: " data-[hover=true]:bg-default-100 data-[selected=true]:bg-primary-500/10",
        }}
        selectedKeys={new Set([filterMode])}
        selectionMode="single"
        variant="flat"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;

          if (selectedKey) {
            onFilterModeChange(selectedKey);
          }
        }}
      >
        {FILTER_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = filterMode === option.key;

          return (
            <DropdownItem
              key={option.key}
              className={clsx("", isSelected && "bg-primary-500/10")}
              startContent={
                <Icon
                  className={clsx(
                    "w-4 h-4",
                    isSelected ? "text-primary" : "text-default-500",
                  )}
                />
              }
            >
              <div>
                <div className="font-medium text-xs">{option.label}</div>
              </div>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </Dropdown>
  );
};

// Enhanced Sort Controls
const EnhancedSortControls: React.FC<{
  sortMode: string;
  sortAscending: boolean;
  onSortModeChange: (mode: string) => void;
  onSortDirectionChange: (ascending: boolean) => void;
}> = ({ sortMode, sortAscending, onSortModeChange, onSortDirectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeSort =
    SORT_OPTIONS.find((s) => s.key === sortMode) || SORT_OPTIONS[0];
  const ActiveIcon = activeSort.icon;

  return (
    <ButtonGroup className="shadow-sm" radius="none" size="sm" variant="faded">
      <Dropdown
        classNames={{
          base: "relative text-xs",
          content: " border border-divider shadow-xl backdrop-blur-md",
        }}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      >
        <DropdownTrigger>
          <Button
            className="h-8 min-w-20    "
            endContent={
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            }
            startContent={<ActiveIcon className="w-4 h-4" />}
          >
            <span className="hidden sm:inline font-medium text-xs">
              {activeSort.shortLabel}
            </span>
          </Button>
        </DropdownTrigger>

        <DropdownMenu
          aria-label="Sort options"
          className="w-52"
          closeOnSelect={true}
          itemClasses={{
            base: "rounded-lg data-[hover=true]:bg-default-100 data-[selected=true]:bg-primary/10",
          }}
          selectedKeys={new Set([sortMode])}
          selectionMode="single"
          variant="flat"
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;

            if (selectedKey) {
              onSortModeChange(selectedKey);
            }
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = sortMode === option.key;

            return (
              <DropdownItem
                key={option.key}
                className={clsx(
                  "transition-all duration-150",
                  isSelected && "bg-primary/10",
                )}
                endContent={
                  isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )
                }
                startContent={
                  <Icon
                    className={clsx(
                      "w-4 h-4",
                      isSelected ? "text-primary" : "text-default-500",
                    )}
                  />
                }
              >
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-default-500">
                    {option.description}
                  </div>
                </div>
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>

      <Tooltip
        content={`Sort ${sortAscending ? "Descending" : "Ascending"}`}
        delay={200}
      >
        <Button
          isIconOnly
          className={clsx(
            "h-8 w-8  ",
            sortAscending
              ? "text-primary-700 bg-primary-500/5"
              : "text-default-500",
          )}
          onPress={() => onSortDirectionChange(!sortAscending)}
        >
          <motion.div
            animate={{
              rotate: sortAscending ? 0 : 180,
              scale: sortAscending ? 1.1 : 1,
            }}
            transition={{ duration: 0.1, type: "spring", stiffness: 200 }}
          >
            <ArrowUpDown className="w-4 h-4" />
          </motion.div>
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

// Premium Settings Panel
const PremiumSettingsPanel: React.FC<{
  hideZeroValues: boolean;
  hideDustTokens: boolean;
  showBalance: boolean;
  onHideZeroValuesChange: (hide: boolean) => void;
  onHideDustTokensChange: (hide: boolean) => void;
  onShowBalanceChange: (show: boolean) => void;
  viewMode?: "list" | "grid";
  onViewModeChange?: (mode: "list" | "grid") => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}> = ({
  hideZeroValues,
  hideDustTokens,
  showBalance,
  onHideZeroValuesChange,
  onHideDustTokensChange,
  onShowBalanceChange,
  viewMode,
  onViewModeChange,
  itemsPerPage = 25,
  onItemsPerPageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dustThreshold, setDustThreshold] = useState(1);

  const hasActiveSettings = hideZeroValues || hideDustTokens || !showBalance;

  return (
    <Popover
      classNames={{
        content: "p-0 bg-background backdrop-blur-md border border-divider ",
      }}
      isOpen={isOpen}
      placement="bottom-end"
      onOpenChange={setIsOpen}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          className={clsx("h-8 w-8 relative overflow-visible")}
          radius="full"
          size="sm"
          variant="faded"
        >
          <motion.div
            animate={{
              rotate: isOpen ? 90 : 0,
              scale: isOpen ? 1.1 : 1,
            }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-4 h-4" />
          </motion.div>
          {hasActiveSettings && (
            <motion.div
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border border-background"
              initial={{ scale: 0 }}
            />
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto">
        <Card className="border-none bg-transparent" shadow="none">
          <CardBody className="p-3 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500/20 to-pink-500/20 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-primary-800" />
                </div>
                <h4 className="font-semibold text-xs">Display Settings</h4>
              </div>
              <Button
                isIconOnly
                className="text-default-400 hover:text-default-600"
                size="sm"
                variant="light"
                onPress={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Divider className="bg-divider" />

            {/* Display Options */}

            {/* Items Per Page */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-default-500" />
                <span className="text-xs font-medium">Items per page</span>
              </div>
              <Select
                className="w-20"
                classNames={{
                  trigger: "h-8 min-h-8 bg-default-100",
                  value: "text-xs font-medium",
                }}
                radius="sm"
                selectedKeys={new Set([itemsPerPage.toString()])}
                size="sm"
                variant="faded"
                onSelectionChange={(keys) => {
                  const value = Array.from(keys)[0] as string;

                  if (value && onItemsPerPageChange) {
                    onItemsPerPageChange(parseInt(value));
                  }
                }}
              >
                {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                  <SelectItem
                    key={option.value.toString()}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </Select>
            </div>

            {/* Privacy & Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <IcTwotonePrivacyTip className="w-4 h-4 text-default-500" />
                <h5 className="font-medium text-xs text-default-700">
                  Privacy & Filters
                </h5>
              </div>

              <div className="space-y-3">
                {/* Show Balances */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-default-50 hover:bg-default-100 ">
                  <div className="flex items-center gap-3">
                    {showBalance ? (
                      <Eye className="w-4 h-4 text-default-500" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-warning" />
                    )}
                    <div>
                      <span className="text-xs font-medium">Show balances</span>
                    </div>
                  </div>
                  <Switch
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-primary",
                    }}
                    color="primary"
                    isSelected={showBalance}
                    size="sm"
                    onValueChange={onShowBalanceChange}
                  />
                </div>

                {/* Hide Zero Values */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-default-50 hover:bg-default-100 ">
                  <div className="flex items-center gap-3">
                    <MinusCircle className="w-4 h-4 text-warning" />
                    <div>
                      <span className="text-xs font-medium">
                        Hide zero values
                      </span>
                    </div>
                  </div>
                  <Switch
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-warning",
                    }}
                    color="warning"
                    isSelected={hideZeroValues}
                    size="sm"
                    onValueChange={onHideZeroValuesChange}
                  />
                </div>

                {/* Hide Dust Tokens */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-default-50 hover:bg-default-100 ">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <div>
                      <span className="text-sm font-medium">
                        Hide dust tokens
                      </span>
                    </div>
                  </div>
                  <Switch
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-secondary",
                    }}
                    color="secondary"
                    isSelected={hideDustTokens}
                    size="sm"
                    onValueChange={onHideDustTokensChange}
                  />
                </div>
              </div>
            </div>

            {/* Dust Threshold */}
            <AnimatePresence>
              {hideDustTokens && (
                <motion.div
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  initial={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-default-500" />
                        Dust threshold
                      </span>
                      <Chip
                        className="font-semibold"
                        color="secondary"
                        size="sm"
                        variant="flat"
                      >
                        ${dustThreshold.toFixed(2)}
                      </Chip>
                    </div>
                    <div className="px-4">
                      <Slider
                        className="max-w-full"
                        classNames={{
                          track: "bg-default-200",
                          thumb:
                            "bg-secondary border-2 border-background shadow-lg",
                          filler:
                            "bg-gradient-to-r from-secondary/60 to-secondary",
                        }}
                        maxValue={10}
                        minValue={0.01}
                        size="sm"
                        step={0.1}
                        value={dustThreshold}
                        onChange={(value) =>
                          setDustThreshold(
                            Array.isArray(value) ? value[0] : value,
                          )
                        }
                      />
                    </div>
                    <p className="text-xs text-default-500 text-center">
                      Tokens worth less than ${dustThreshold.toFixed(2)} will be
                      hidden
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider className="bg-default-200" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                className="flex-1 "
                color="warning"
                size="sm"
                startContent={<RotateCcw className="w-3 h-3" />}
                variant="flat"
                onPress={() => {
                  onHideZeroValuesChange(false);
                  onHideDustTokensChange(false);
                  onShowBalanceChange(true);
                  setDustThreshold(1);
                }}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 "
                size="sm"
                variant="faded"
                onPress={() => setIsOpen(false)}
              >
                Apply Changes
              </Button>
            </div>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

// Smart Results Summary
const SmartResultsSummary: React.FC<{
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}> = ({ filteredCount, totalCount, hasActiveFilters, onClearFilters }) => {
  const isFiltered = filteredCount !== totalCount;
  const visibilityPercentage = Math.round((filteredCount / totalCount) * 100);

  if (!isFiltered && !hasActiveFilters) return null;

  return (
    <motion.div
      animate={{ opacity: 1, height: "auto", y: 0 }}
      className="relative overflow-hidden"
      exit={{ opacity: 0, height: 0, y: -10 }}
      initial={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
    >
      <div className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border border-divider rounded-2xl backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>

            <div className="flex flex-col">
              <span className="font-semibold text-lg text-primary">
                {filteredCount.toLocaleString()}
              </span>
              <span className="text-xs text-default-500 font-medium">
                of {totalCount.toLocaleString()} tokens
              </span>
            </div>
          </div>

          {isFiltered && (
            <>
              <div className="h-8 w-px bg-default-200" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-lg text-secondary">
                    {visibilityPercentage}%
                  </span>
                  <span className="text-xs text-default-500 font-medium">
                    portfolio visible
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {(isFiltered || hasActiveFilters) && (
          <motion.div
            animate={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              className="text-[11px]"
              color="warning"
              size="sm"
              startContent={<RotateCcw className="w-3 h-3" />}
              variant="flat"
              onPress={onClearFilters}
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50 pointer-events-none" />
    </motion.div>
  );
};

// Quick Filter Pills (Mobile)
const QuickFilterPills: React.FC<{
  filterMode: string;
  hideZeroValues: boolean;
  hideDustTokens: boolean;
  showBalance: boolean;
  onFilterModeChange: (mode: string) => void;
  onHideZeroValuesChange: (hide: boolean) => void;
  onHideDustTokensChange: (hide: boolean) => void;
  onShowBalanceChange: (show: boolean) => void;
}> = ({
  filterMode,
  hideZeroValues,
  hideDustTokens,
  showBalance,
  onFilterModeChange,
  onHideZeroValuesChange,
  onHideDustTokensChange,
  onShowBalanceChange,
}) => {
  const quickFilters = [
    {
      key: "verified",
      label: "Verified",
      icon: CheckCircle2,
      isActive: filterMode === "verified",
      color: "success" as const,
      onToggle: () =>
        onFilterModeChange(filterMode === "verified" ? "all" : "verified"),
    },
    {
      key: "gainers",
      label: "Gainers",
      icon: TrendingUp,
      isActive: filterMode === "gainers",
      color: "success" as const,
      onToggle: () =>
        onFilterModeChange(filterMode === "gainers" ? "all" : "gainers"),
    },
    {
      key: "hideZero",
      label: "Hide Zero",
      icon: MinusCircle,
      isActive: hideZeroValues,
      color: "warning" as const,
      onToggle: () => onHideZeroValuesChange(!hideZeroValues),
    },
    {
      key: "hideDust",
      label: "Hide Dust",
      icon: Sparkles,
      isActive: hideDustTokens,
      color: "secondary" as const,
      onToggle: () => onHideDustTokensChange(!hideDustTokens),
    },
    {
      key: "showBalance",
      label: showBalance ? "Hide Values" : "Show Values",
      icon: showBalance ? EyeOff : Eye,
      isActive: !showBalance,
      color: "primary" as const,
      onToggle: () => onShowBalanceChange(!showBalance),
    },
  ];

  return (
    <ScrollShadow
      hideScrollBar
      className="flex items-center gap-2 pb-2"
      orientation="horizontal"
    >
      {quickFilters.map((filter) => {
        const Icon = filter.icon;

        return (
          <motion.div
            key={filter.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              className={clsx(
                "whitespace-nowrap transition-all duration-200",
                filter.isActive && "shadow-lg",
              )}
              color={filter.isActive ? filter.color : "default"}
              radius="full"
              size="sm"
              startContent={<Icon className="w-3 h-3" />}
              variant={filter.isActive ? "solid" : "bordered"}
              onPress={filter.onToggle}
            >
              {filter.label}
            </Button>
          </motion.div>
        );
      })}
    </ScrollShadow>
  );
};

// Main Component
export const TokensListControls: React.FC<TokensControlsProps> = ({
  searchQuery,
  onSearchChange,
  sortMode,
  onSortModeChange,
  sortAscending,
  onSortDirectionChange,
  filterMode,
  onFilterModeChange,
  hideZeroValues,
  onHideZeroValuesChange,
  hideDustTokens,
  onHideDustTokensChange,
  showBalance,
  onShowBalanceChange,
  isRefreshing = false,
  onRefresh,
  totalTokens,
  filteredTokens,
  viewMode = "list",
  onViewModeChange,
  itemsPerPage = 25,
  onItemsPerPageChange,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target && (e.target as HTMLElement).tagName === "INPUT") return;

      const isCmd = e.metaKey || e.ctrlKey;

      // Filter shortcuts with Cmd/Ctrl
      if (isCmd) {
        switch (e.key.toLowerCase()) {
          case "a":
            e.preventDefault();
            onFilterModeChange("all");
            break;
          case "v":
            e.preventDefault();
            onFilterModeChange("verified");
            break;
          case "h":
            e.preventDefault();
            onFilterModeChange("highValue");
            break;
          case "g":
            e.preventDefault();
            onFilterModeChange("gainers");
            break;
          case "l":
            e.preventDefault();
            onFilterModeChange("losers");
            break;
          case "r":
            e.preventDefault();
            if (onRefresh) onRefresh();
            break;
        }
      }

      // Sort shortcuts (number keys without modifiers)
      if (!isCmd && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "1":
            e.preventDefault();
            onSortModeChange("value");
            break;
          case "2":
            e.preventDefault();
            onSortModeChange("change");
            break;
          case "3":
            e.preventDefault();
            onSortModeChange("quantity");
            break;
          case "4":
            e.preventDefault();
            onSortModeChange("price");
            break;
          case "5":
            e.preventDefault();
            onSortModeChange("alphabetical");
            break;
        }
      }

      // Toggle sort direction with Space (when not in input)
      if (e.key === " " && !isCmd) {
        e.preventDefault();
        onSortDirectionChange(!sortAscending);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    onFilterModeChange,
    onSortModeChange,
    onSortDirectionChange,
    onRefresh,
    sortAscending,
  ]);

  // Active filters calculation
  const hasActiveFilters = useMemo(() => {
    return (
      filterMode !== "all" ||
      hideZeroValues ||
      hideDustTokens ||
      searchQuery.length > 0 ||
      !showBalance
    );
  }, [filterMode, hideZeroValues, hideDustTokens, searchQuery, showBalance]);

  // Clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    onSearchChange("");
    onFilterModeChange("all");
    onHideZeroValuesChange(false);
    onHideDustTokensChange(false);
    onShowBalanceChange(true);
  }, [
    onSearchChange,
    onFilterModeChange,
    onHideZeroValuesChange,
    onHideDustTokensChange,
    onShowBalanceChange,
  ]);

  return (
    <div className="space-y-3">
      {/* Main Controls Bar */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Search Input - Flexible width */}
        <div className="flex-1 min-w-0 max-w-md">
          <EnhancedSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange("")}
          />
        </div>

        {/* Filter Dropdown */}
        <SmartFilterDropdown
          filterMode={filterMode}
          filteredCount={filteredTokens}
          totalCount={totalTokens}
          onFilterModeChange={onFilterModeChange}
        />

        {/* Sort Controls */}
        <EnhancedSortControls
          sortAscending={sortAscending}
          sortMode={sortMode}
          onSortDirectionChange={onSortDirectionChange}
          onSortModeChange={onSortModeChange}
        />

        {/* Refresh Button */}
        {onRefresh && (
          <Tooltip
            showArrow
            className="text-xs font-medium rounded-sm border border-default h-5"
            content="Refresh tokens (⌘R)"
          >
            <Button
              isIconOnly
              className={clsx("h-8 w-8  ", isRefreshing && "animate-pulse")}
              isLoading={isRefreshing}
              radius="full"
              size="sm"
              variant="faded"
              onPress={onRefresh}
            >
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : 0,
                  scale: isRefreshing ? 0.9 : 1,
                }}
                transition={{
                  duration: 1,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: "linear",
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </Tooltip>
        )}

        {/* Settings Panel */}
        <PremiumSettingsPanel
          hideDustTokens={hideDustTokens}
          hideZeroValues={hideZeroValues}
          itemsPerPage={itemsPerPage}
          showBalance={showBalance}
          viewMode={viewMode}
          onHideDustTokensChange={onHideDustTokensChange}
          onHideZeroValuesChange={onHideZeroValuesChange}
          onItemsPerPageChange={onItemsPerPageChange}
          onShowBalanceChange={onShowBalanceChange}
          onViewModeChange={onViewModeChange}
        />

        {isMobile && (
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -20 }}
            transition={{ delay: 0.1 }}
          >
            <QuickFilterPills
              filterMode={filterMode}
              hideDustTokens={hideDustTokens}
              hideZeroValues={hideZeroValues}
              showBalance={showBalance}
              onFilterModeChange={onFilterModeChange}
              onHideDustTokensChange={onHideDustTokensChange}
              onHideZeroValuesChange={onHideZeroValuesChange}
              onShowBalanceChange={onShowBalanceChange}
            />
          </motion.div>
        )}
      </motion.div>
      {/* Results Summary
      <AnimatePresence mode="wait">
        <SmartResultsSummary
          filteredCount={filteredTokens}
          totalCount={totalTokens}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearAllFilters}
        />
      </AnimatePresence> */}
    </div>
  );
};

export default TokensListControls;
