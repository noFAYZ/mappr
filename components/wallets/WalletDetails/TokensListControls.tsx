// components/WalletAnalytics/TokensListControls.tsx
'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
 
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Switch,
  Badge,
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
  RadioGroup,
  Radio,
  ScrollShadow
} from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
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
  Grid3X3,
  List,
  Sparkles,
  ArrowUpDown,
  Layers,
  Activity,
  RotateCcw,
  MinusCircle,
  Star,
  Zap,
  Globe,
  ListChecks
} from 'lucide-react';
import clsx from 'clsx';
import { IcTwotonePrivacyTip } from '@/components/icons/icons';
import { Input } from '@heroui/input';

// Types
export interface TokensControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMode: 'value' | 'change' | 'quantity' | 'alphabetical' | 'price';
  onSortModeChange: (mode: 'value' | 'change' | 'quantity' | 'alphabetical' | 'price') => void;
  sortAscending: boolean;
  onSortDirectionChange: (ascending: boolean) => void;
  filterMode: 'all' | 'verified' | 'highValue' | 'gainers' | 'losers';
  onFilterModeChange: (mode: 'all' | 'verified' | 'highValue' | 'gainers' | 'losers') => void;
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
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  itemsPerPage?: number;
  onItemsPerPageChange?: (count: number) => void;
}

// Enhanced Constants
const FILTER_OPTIONS = [
  { 
    key: 'all', 
    label: 'All Tokens', 
    shortLabel: 'All',
    icon: Layers, 
    color: 'default',
    description: 'Show all tokens'
  },
  { 
    key: 'verified', 
    label: 'Verified Only', 
    shortLabel: 'Verified',
    icon: CheckCircle2, 
    color: 'success',
    description: 'Only verified tokens'
  },
  { 
    key: 'highValue', 
    label: 'High Value ($1k+)', 
    shortLabel: 'High Value',
    icon: Crown, 
    color: 'warning',
    description: 'Tokens worth $1,000+'
  },
  { 
    key: 'gainers', 
    label: '24h Gainers', 
    shortLabel: 'Gainers',
    icon: TrendingUp, 
    color: 'success',
    description: 'Positive 24h change'
  },
  { 
    key: 'losers', 
    label: '24h Losers', 
    shortLabel: 'Losers',
    icon: TrendingDown, 
    color: 'danger',
    description: 'Negative 24h change'
  }
];

const SORT_OPTIONS = [
  { 
    key: 'value', 
    label: 'Portfolio Value', 
    shortLabel: 'Value',
    icon: DollarSign,
    description: 'Sort by USD value'
  },
  { 
    key: 'change', 
    label: '24h Change', 
    shortLabel: 'Change',
    icon: BarChart3,
    description: 'Sort by price change'
  },
  { 
    key: 'quantity', 
    label: 'Token Amount', 
    shortLabel: 'Amount',
    icon: Hash,
    description: 'Sort by quantity held'
  },
  { 
    key: 'price', 
    label: 'Unit Price', 
    shortLabel: 'Price',
    icon: Target,
    description: 'Sort by token price'
  },
  { 
    key: 'alphabetical', 
    label: 'Alphabetical', 
    shortLabel: 'Name',
    icon: Award,
    description: 'Sort by token name'
  }
];

const ITEMS_PER_PAGE_OPTIONS = [
  { value: 10, label: '10' },
  { value: 25, label: '25' },
  { value: 50, label: '50' },
  { value: 100, label: '100' }
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
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        onClear();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, onClear]);

  return (
    <Input
      ref={inputRef}
      placeholder="Search tokens by name, symbol..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      startContent={
        <Search className={clsx(
          "w-4 h-4 ",
          isFocused ? "text-primary scale-110" : "text-default-400"
        )} />
      }
      endContent={
        <div className="flex items-center gap-1">
          {value && (
            <Button
              isIconOnly
              size="sm"
              variant="faded"
              onPress={onClear}
              className="w-5 h-5 min-w-5 text-default-400 hover:text-danger transition-colors"
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
      classNames={{
        base: "w-full",
      }}
      radius="lg"
      variant="faded"
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
  const activeFilter = FILTER_OPTIONS.find(f => f.key === filterMode) || FILTER_OPTIONS[0];
  const ActiveIcon = activeFilter.icon;
  const hasFilter = filteredCount !== totalCount;

  return (
    <Dropdown 
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      classNames={{
        content: "p-1 border border-default-200 shadow-xl bg-background/95 backdrop-blur-md"
      }}
    >
      <DropdownTrigger>
        <Button
          variant="faded"
          size="sm"
          startContent={<ActiveIcon className="w-4 h-4" />}
          endContent={
            <div className="flex items-center gap-1">
              {hasFilter && (
                <Chip 
                 
                  size="sm" 
                  variant='flat'
                  className="text-[11px] font-medium px-0 h-5 rounded-full bg-primary-500/25 text-primary-700 border-primary-700"
               
                  >{filteredCount}</Chip>
               
              )}
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            </div>
          }
          className={clsx(
            "h-8 min-w-24 justify-between ",
           
          )}
          radius="none"
        >
          <span className="font-medium text-xs text-default-500">{activeFilter.shortLabel}</span>
        </Button>
      </DropdownTrigger>
      
      <DropdownMenu
        aria-label="Filter options"
        variant="flat"
        closeOnSelect={true}
        selectedKeys={new Set([filterMode])}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string;
          if (selectedKey) {
            onFilterModeChange(selectedKey);
          }
        }}
        className="w-48"
        itemClasses={{
          base: " data-[hover=true]:bg-default-100 data-[selected=true]:bg-primary-500/10"
        }}
      >
        {FILTER_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = filterMode === option.key;
          
          return (
            <DropdownItem
              key={option.key}
              startContent={
                <Icon className={clsx(
                  "w-4 h-4",
                  isSelected ? "text-primary" : "text-default-500"
                )} />
              }
            
              className={clsx(
                "",
                isSelected && "bg-primary-500/10"
              )}
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
  const activeSort = SORT_OPTIONS.find(s => s.key === sortMode) || SORT_OPTIONS[0];
  const ActiveIcon = activeSort.icon;

  return (
    <ButtonGroup variant="faded" size="sm" className="shadow-sm" radius='none'>
      <Dropdown 
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        
        classNames={{
          base: "relative text-xs",
          content: " border border-divider shadow-xl backdrop-blur-md"
        }}
      >
        <DropdownTrigger>
          <Button
            startContent={<ActiveIcon className="w-4 h-4" />}
            endContent={
              <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </motion.div>
            }
            className="h-8 min-w-20    "
       
           
          >
            <span className="hidden sm:inline font-medium text-xs">{activeSort.shortLabel}</span>
          </Button>
        </DropdownTrigger>
        
        <DropdownMenu
          aria-label="Sort options"
          variant="flat"
          closeOnSelect={true}
          selectedKeys={new Set([sortMode])}
          selectionMode="single"
          onSelectionChange={(keys) => {
            const selectedKey = Array.from(keys)[0] as string;
            if (selectedKey) {
              onSortModeChange(selectedKey);
            }
          }}
          className="w-52"
          itemClasses={{
            base: "rounded-lg data-[hover=true]:bg-default-100 data-[selected=true]:bg-primary/10"
          }}
        >
          {SORT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = sortMode === option.key;
            
            return (
              <DropdownItem
                key={option.key}
                startContent={
                  <Icon className={clsx(
                    "w-4 h-4",
                    isSelected ? "text-primary" : "text-default-500"
                  )} />
                }
                endContent={
                  isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )
                }
                className={clsx(
                  "transition-all duration-150",
                  isSelected && "bg-primary/10"
                )}
              >
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-default-500">{option.description}</div>
                </div>
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      </Dropdown>

      <Tooltip 
        content={`Sort ${sortAscending ? 'Descending' : 'Ascending'}`}
        delay={200}
      >
        <Button
          isIconOnly
          
          onPress={() => onSortDirectionChange(!sortAscending)}
          className={clsx(
            "h-8 w-8  ",
            sortAscending ? "text-primary-700 bg-primary-500/5" : "text-default-500"
          )}
         
        >
          <motion.div
            animate={{ 
              rotate: sortAscending ? 0 : 180,
              scale: sortAscending ? 1.1 : 1
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
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
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
  onItemsPerPageChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dustThreshold, setDustThreshold] = useState(1);

  const hasActiveSettings = hideZeroValues || hideDustTokens || !showBalance;

  return (
    <Popover 
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-end"
      classNames={{
        content: "p-0 bg-background backdrop-blur-md border border-divider "
      }}
    >
      <PopoverTrigger>
        <Button
          isIconOnly
          variant="faded"
          size="sm"
          className={clsx(
            "h-8 w-8 relative overflow-visible",
      
          )}
          radius="full"
        >
          <motion.div
            animate={{ 
              rotate: isOpen ? 90 : 0,
              scale: isOpen ? 1.1 : 1
            }}
            transition={{ duration: 0.2 }}
          >
            <Settings className="w-4 h-4" />
          </motion.div>
          {hasActiveSettings && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border border-background"
            />
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-auto">
        <Card shadow="none" className="border-none bg-transparent">
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
                size="sm"
                variant="light"
                onPress={() => setIsOpen(false)}
                className="text-default-400 hover:text-default-600"
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
                    size="sm"
                    variant='faded'
                    selectedKeys={new Set([itemsPerPage.toString()])}
                    onSelectionChange={(keys) => {
                      const value = Array.from(keys)[0] as string;
                      if (value && onItemsPerPageChange) {
                        onItemsPerPageChange(parseInt(value));
                      }
                    }}
                    className="w-20"
                    classNames={{
                      trigger: "h-8 min-h-8 bg-default-100",
                      value: "text-xs font-medium"
                    }}
                    radius="sm"
                  >
                    {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                      <SelectItem key={option.value.toString()} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

          

            

            {/* Privacy & Filters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <IcTwotonePrivacyTip className="w-4 h-4 text-default-500" />
                <h5 className="font-medium text-xs text-default-700">Privacy & Filters</h5>
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
                    size="sm"
                    isSelected={showBalance}
                    onValueChange={onShowBalanceChange}
                    color="primary"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-primary"
                    }}
                  />
                </div>

                {/* Hide Zero Values */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-default-50 hover:bg-default-100 ">
                  <div className="flex items-center gap-3">
                    <MinusCircle className="w-4 h-4 text-warning" />
                    <div>
                      <span className="text-xs font-medium">Hide zero values</span>
                     
                    </div>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={hideZeroValues}
                    onValueChange={onHideZeroValuesChange}
                    color="warning"
                    classNames={{
                    
                      wrapper: "group-data-[selected=true]:bg-warning"
                    }}
                  />
                </div>

                {/* Hide Dust Tokens */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-default-50 hover:bg-default-100 ">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-secondary" />
                    <div>
                      <span className="text-sm font-medium">Hide dust tokens</span>
                    
                    </div>
                  </div>
                  <Switch
                    size="sm"
                    isSelected={hideDustTokens}
                    onValueChange={onHideDustTokensChange}
                    color="secondary"
                    classNames={{
                      wrapper: "group-data-[selected=true]:bg-secondary"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Dust Threshold */}
            <AnimatePresence>
              {hideDustTokens && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.1 }}
                >
              
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-default-500" />
                        Dust threshold
                      </span>
                      <Chip 
                        size="sm" 
                        variant="flat" 
                        color="secondary"
                        className="font-semibold"
                      >
                        ${dustThreshold.toFixed(2)}
                      </Chip>
                    </div>
                    <div className="px-4">
                      <Slider
                        size="sm"
                        step={0.1}
                        minValue={0.01}
                        maxValue={10}
                        value={dustThreshold}
                        onChange={(value) => setDustThreshold(Array.isArray(value) ? value[0] : value)}
                        className="max-w-full"
                        classNames={{
                          track: "bg-default-200",
                          thumb: "bg-secondary border-2 border-background shadow-lg",
                          filler: "bg-gradient-to-r from-secondary/60 to-secondary"
                        }}
                      />
                    </div>
                    <p className="text-xs text-default-500 text-center">
                      Tokens worth less than ${dustThreshold.toFixed(2)} will be hidden
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Divider className="bg-default-200" />

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="flat"
                color="warning"
                startContent={<RotateCcw className="w-3 h-3" />}
                onPress={() => {
                  onHideZeroValuesChange(false);
                  onHideDustTokensChange(false);
                  onShowBalanceChange(true);
                  setDustThreshold(1);
                }}
                className="flex-1 "
              >
                Reset All
              </Button>
              <Button
                size="sm"
                variant="faded"
                onPress={() => setIsOpen(false)}
                className="flex-1 "
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
      initial={{ opacity: 0, height: 0, y: -10 }}
      animate={{ opacity: 1, height: 'auto', y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
      className="relative overflow-hidden"
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              size="sm"
              variant="flat"
              color="warning"
              startContent={<RotateCcw className="w-3 h-3" />}
              onPress={onClearFilters}
              className="text-[11px]"
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
  onShowBalanceChange
}) => {
  const quickFilters = [
    {
      key: 'verified',
      label: 'Verified',
      icon: CheckCircle2,
      isActive: filterMode === 'verified',
      color: 'success' as const,
      onToggle: () => onFilterModeChange(filterMode === 'verified' ? 'all' : 'verified')
    },
    {
      key: 'gainers',
      label: 'Gainers',
      icon: TrendingUp,
      isActive: filterMode === 'gainers',
      color: 'success' as const,
      onToggle: () => onFilterModeChange(filterMode === 'gainers' ? 'all' : 'gainers')
    },
    {
      key: 'hideZero',
      label: 'Hide Zero',
      icon: MinusCircle,
      isActive: hideZeroValues,
      color: 'warning' as const,
      onToggle: () => onHideZeroValuesChange(!hideZeroValues)
    },
    {
      key: 'hideDust',
      label: 'Hide Dust',
      icon: Sparkles,
      isActive: hideDustTokens,
      color: 'secondary' as const,
      onToggle: () => onHideDustTokensChange(!hideDustTokens)
    },
    {
      key: 'showBalance',
      label: showBalance ? 'Hide Values' : 'Show Values',
      icon: showBalance ? EyeOff : Eye,
      isActive: !showBalance,
      color: 'primary' as const,
      onToggle: () => onShowBalanceChange(!showBalance)
    }
  ];

  return (
    <ScrollShadow 
      orientation="horizontal" 
      className="flex items-center gap-2 pb-2"
      hideScrollBar
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
              size="sm"
              variant={filter.isActive ? "solid" : "bordered"}
              color={filter.isActive ? filter.color : "default"}
              startContent={<Icon className="w-3 h-3" />}
              onPress={filter.onToggle}
              className={clsx(
                "whitespace-nowrap transition-all duration-200",
                filter.isActive && "shadow-lg"
              )}
              radius="full"
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
  viewMode = 'list',
  onViewModeChange,
  itemsPerPage = 25,
  onItemsPerPageChange
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if user is typing in an input
      if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
      
      const isCmd = e.metaKey || e.ctrlKey;
      
      // Filter shortcuts with Cmd/Ctrl
      if (isCmd) {
        switch (e.key.toLowerCase()) {
          case 'a':
            e.preventDefault();
            onFilterModeChange('all');
            break;
          case 'v':
            e.preventDefault();
            onFilterModeChange('verified');
            break;
          case 'h':
            e.preventDefault();
            onFilterModeChange('highValue');
            break;
          case 'g':
            e.preventDefault();
            onFilterModeChange('gainers');
            break;
          case 'l':
            e.preventDefault();
            onFilterModeChange('losers');
            break;
          case 'r':
            e.preventDefault();
            if (onRefresh) onRefresh();
            break;
        }
      }

      // Sort shortcuts (number keys without modifiers)
      if (!isCmd && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            onSortModeChange('value');
            break;
          case '2':
            e.preventDefault();
            onSortModeChange('change');
            break;
          case '3':
            e.preventDefault();
            onSortModeChange('quantity');
            break;
          case '4':
            e.preventDefault();
            onSortModeChange('price');
            break;
          case '5':
            e.preventDefault();
            onSortModeChange('alphabetical');
            break;
        }
      }

      // Toggle sort direction with Space (when not in input)
      if (e.key === ' ' && !isCmd) {
        e.preventDefault();
        onSortDirectionChange(!sortAscending);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    onFilterModeChange, 
    onSortModeChange, 
    onSortDirectionChange, 
    onRefresh, 
    sortAscending
  ]);

  // Active filters calculation
  const hasActiveFilters = useMemo(() => {
    return (
      filterMode !== 'all' || 
      hideZeroValues || 
      hideDustTokens || 
      searchQuery.length > 0 ||
      !showBalance
    );
  }, [filterMode, hideZeroValues, hideDustTokens, searchQuery, showBalance]);

  // Clear all filters handler
  const handleClearAllFilters = useCallback(() => {
    onSearchChange('');
    onFilterModeChange('all');
    onHideZeroValuesChange(false);
    onHideDustTokensChange(false);
    onShowBalanceChange(true);
  }, [
    onSearchChange, 
    onFilterModeChange, 
    onHideZeroValuesChange, 
    onHideDustTokensChange,
    onShowBalanceChange
  ]);

  return (
    <div className="space-y-3">
      {/* Main Controls Bar */}
      <motion.div 
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        
        {/* Search Input - Flexible width */}
        <div className="flex-1 min-w-0 max-w-md">
          <EnhancedSearchInput
            value={searchQuery}
            onChange={onSearchChange}
            onClear={() => onSearchChange('')}
          />
        </div>

        {/* Filter Dropdown */}
        <SmartFilterDropdown
          filterMode={filterMode}
          onFilterModeChange={onFilterModeChange}
          filteredCount={filteredTokens}
          totalCount={totalTokens}
        />

        {/* Sort Controls */}
        <EnhancedSortControls
          sortMode={sortMode}
          sortAscending={sortAscending}
          onSortModeChange={onSortModeChange}
          onSortDirectionChange={onSortDirectionChange}
        />

        {/* Refresh Button */}
        {onRefresh && (
          <Tooltip content="Refresh tokens (⌘R)" className='text-xs font-medium rounded-sm border border-default h-5'showArrow>
            <Button
              isIconOnly
              variant="faded"
              size="sm"
              onPress={onRefresh}
              isLoading={isRefreshing}
              className={clsx(
                "h-8 w-8  ",
                isRefreshing && "animate-pulse"
              )}
              radius="full"
            >
              <motion.div
                animate={{ 
                  rotate: isRefreshing ? 360 : 0,
                  scale: isRefreshing ? 0.9 : 1
                }}
                transition={{ 
                  duration: 1, 
                  repeat: isRefreshing ? Infinity : 0,
                  ease: "linear"
                }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.div>
            </Button>
          </Tooltip>
        )}

        {/* Settings Panel */}
        <PremiumSettingsPanel
          hideZeroValues={hideZeroValues}
          hideDustTokens={hideDustTokens}
          showBalance={showBalance}
          onHideZeroValuesChange={onHideZeroValuesChange}
          onHideDustTokensChange={onHideDustTokensChange}
          onShowBalanceChange={onShowBalanceChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      

     
      {isMobile && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickFilterPills
            filterMode={filterMode}
            hideZeroValues={hideZeroValues}
            hideDustTokens={hideDustTokens}
            showBalance={showBalance}
            onFilterModeChange={onFilterModeChange}
            onHideZeroValuesChange={onHideZeroValuesChange}
            onHideDustTokensChange={onHideDustTokensChange}
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