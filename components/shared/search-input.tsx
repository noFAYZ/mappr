"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import clsx from "clsx";
import {
  Search,
  X,
  Clock,
  TrendingUp,
  Hash,
  User,
  FileText,
  Folder,
  Calculator,
  Settings,
  HelpCircle,
  Zap,
  BarChart3,
  Wallet,
  Bot,
  Database,
  PieChart,
  Building2,
  CreditCard,
  Plus,
  Upload,
  Download,
  Share2,
  Users,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Command
} from "lucide-react";
import { HugeiconsAiBrain01, SiDashboardCustomizeLine, SolarWalletBoldDuotone } from "../icons/icons";



interface SearchResult {
  id: string;
  title: string;
  description?: string;
  href: string;
  category: 'pages' | 'actions' | 'data' | 'help' | 'recent';
  icon: React.ReactNode;
  keywords?: string[];
}

interface QuickAction {
  label: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  gradient: string;
  featured?: boolean;
  badge?: string;
  category: string;
}

interface SearchInputProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onResultSelect?: (result: SearchResult) => void;
}

// Mock search data
const searchData: SearchResult[] = [
  // Pages
  {
    id: "dashboard",
    title: "Dashboard",
    description: "Main overview page",
    href: "/dashboard",
    category: "pages",
    icon: <BarChart3 className="w-5 h-5" />,
    keywords: ["home", "main", "overview"]
  },
  {
    id: "extensions",
    title: "Extensions",
    description: "Manage your integrations",
    href: "/extensions",
    category: "pages",
    icon: <Zap className="w-5 h-5" />,
    keywords: ["integrations", "connections", "plugins"]
  },
  {
    id: "portfolios",
    title: "Portfolios",
    description: "View your portfolios",
    href: "/portfolios",
    category: "pages",
    icon: <PieChart className="w-5 h-5" />,
    keywords: ["investments", "assets", "tracking"]
  },
  {
    id: "ai-assistant",
    title: "AI Assistant",
    description: "Get AI-powered insights",
    href: "/ai",
    category: "pages",
    icon: <Bot className="w-5 h-5" />,
    keywords: ["artificial intelligence", "chat", "analysis"]
  },
  {
    id: "analytics",
    title: "Analytics",
    description: "Advanced data analysis",
    href: "/analytics",
    category: "pages",
    icon: <TrendingUp className="w-5 h-5" />,
    keywords: ["charts", "graphs", "insights", "reports"]
  },
  
  // Actions
  {
    id: "add-extension",
    title: "Add Extension",
    description: "Connect a new data source",
    href: "/extensions/add",
    category: "actions",
    icon: <Plus className="w-5 h-5" />,
    keywords: ["connect", "integrate", "new", "source"]
  },
  {
    id: "create-portfolio",
    title: "Create Portfolio",
    description: "Build a new portfolio",
    href: "/portfolios/create",
    category: "actions",
    icon: <SiDashboardCustomizeLine className="w-5 h-5" />,
    keywords: ["new", "build", "setup"]
  },
  {
    id: "connect-wallet",
    title: "Connect Wallet",
    description: "Link crypto wallets",
    href: "/extensions/crypto/connect",
    category: "actions",
    icon: <Wallet className="w-5 h-5" />,
    keywords: ["crypto", "blockchain", "metamask", "coinbase"]
  },
  {
    id: "connect-bank",
    title: "Connect Bank",
    description: "Link bank accounts",
    href: "/extensions/banking/connect",
    category: "actions",
    icon: <Building2 className="w-5 h-5" />,
    keywords: ["banking", "account", "plaid", "finance"]
  }
];

// Quick actions with enhanced styling
const quickActions: QuickAction[] = [

  {
    label: "Create Portfolio",
    href: "/portfolios/create",
    icon: <SiDashboardCustomizeLine className="w-5 h-5" />,
    description: "Build a new investment portfolio",
    gradient: "from-purple-500 to-pink-500",
    featured: true,
    category: "Portfolios"
  },
  {
    label: "AI Assistant",
    href: "/ai",
    icon: <HugeiconsAiBrain01 className="w-5 h-5" />,
    description: "Get AI-powered insights",
    gradient: "from-emerald-500 to-teal-500",
    badge: "New",
    featured: true,
    category: "AI"
  },
  {
    label: "Connect Wallet",
    href: "/extensions/crypto/connect",
    icon: <SolarWalletBoldDuotone className="w-5 h-5" />,
    description: "Link your crypto wallets",
    gradient: "from-orange-500 to-red-500",
    category: "Extensions"
  },
  {
    label: "Connect Bank",
    href: "/extensions/banking/connect",
    icon: <Building2 className="w-5 h-5" />,
    description: "Link bank accounts securely",
    gradient: "from-green-500 to-emerald-500",
    category: "Extensions"
  },
  {
    label: "Import Data",
    href: "/data/import",
    icon: <Upload className="w-5 h-5" />,
    description: "Upload CSV, Excel files",
    gradient: "from-amber-500 to-orange-500",
    category: "Data"
  },
  {
    label: "Export Data",
    href: "/data/export",
    icon: <Download className="w-5 h-5" />,
    description: "Download your data",
    gradient: "from-slate-500 to-gray-500",
    category: "Data"
  }
];

const categoryIcons = {
  pages: <Folder className="w-4 h-4" />,
  actions: <Zap className="w-4 h-4" />,
  data: <Database className="w-4 h-4" />,
  help: <HelpCircle className="w-4 h-4" />,
  recent: <Clock className="w-4 h-4" />
};

export function SearchInput({
  className,
  placeholder = "Search everything...",
  onSearch,
  onResultSelect
}: SearchInputProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search logic
  const searchResults = query.trim().length > 0 ? searchData.filter(item => {
    const searchTerms = query.toLowerCase().split(' ');
    return searchTerms.every(term => 
      item.title.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.keywords?.some(keyword => keyword.toLowerCase().includes(term))
    );
  }).slice(0, 6) : [];

  // Filter actions based on search
  const filteredActions = query.trim().length > 0 
    ? quickActions.filter(action => 
        action.label.toLowerCase().includes(query.toLowerCase()) ||
        action.description.toLowerCase().includes(query.toLowerCase()) ||
        action.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6)
    : quickActions;

  // Group results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isModalOpen) return;

    const totalItems = searchResults.length + filteredActions.length;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < searchResults.length) {
            handleResultSelect(searchResults[selectedIndex]);
          } else {
            const actionIndex = selectedIndex - searchResults.length;
            handleActionClick(filteredActions[actionIndex].href);
          }
        } else if (query.trim()) {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsModalOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [isModalOpen, selectedIndex, searchResults, filteredActions, query]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Global search shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsModalOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;

    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent-searches', JSON.stringify(newRecent));

    // Trigger search callback
    onSearch?.(query);
    
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query)}`);
    closeModal();
  };

  const handleResultSelect = (result: SearchResult) => {
    // Add to recent searches
    const newRecent = [result.title, ...recentSearches.filter(s => s !== result.title)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recent-searches', JSON.stringify(newRecent));

    onResultSelect?.(result);
    router.push(result.href);
    closeModal();
  };

  const handleActionClick = (href: string) => {
    router.push(href);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <>
      {/* Search Input Trigger */}
      <div className={clsx("w-full", className)}>
        <button
          className="w-full justify-start h-9 px-3 bg-default-100 hover:bg-default-200 transition-all duration-100 border border-transparent hover:border-default-200 rounded-xl"
          onClick={openModal}
        >
          <div className="flex items-center gap-2 w-full">
            <Search className="w-4 h-4 text-default-400 flex-shrink-0" />
            <span className="text-xs text-default-500 flex-1 text-left">
              {placeholder}
            </span>
            <Kbd className="hidden lg:inline-flex bg-default-200/50 text-xs" keys={["command"]}>
              K
            </Kbd>
          </div>
        </button>
      </div>

      {/* Unified Search & Actions Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal}
        size="3xl"
        backdrop="opaque"
        classNames={{
          backdrop: "bg-gradient-to-br from-background/40 via-background/60 to-background/40 backdrop-blur-md",
          base: "border border-default-200/50 shadow-2xl bg-background/95 backdrop-blur-xl",
          header: "border-b border-default-200/50 bg-gradient-to-r from-default-50/50 to-default-100/30",
          body: "p-0 max-h-[70vh] overflow-hidden"
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.2,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              scale: 0.95,
              transition: {
                duration: 0.1,
                ease: "easeIn",
              },
            },
          }
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-4 pt-6 pb-4 px-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Search & Actions
                </h2>
                <p className="text-xs text-default-500 ">
                  Find anything or perform quick actions
                </p>
              </div>
    
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Input
                ref={inputRef}
                placeholder="Search pages, actions, and more..."
                value={query}
                onValueChange={setQuery}
                startContent={<Search className="w-4 h-4 text-default-400" />}
                endContent={
                  query && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      className="w-5 h-5 min-w-5"
                      onPress={() => setQuery("")}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )
                }
                variant="bordered"
                size="lg"
                className="border-default-200/50"
                classNames={{
                  base:'h-10 border-divider ',
                  inputWrapper: "border-divider bg-default-100  backdrop-blur-sm",
                  input: "text-xs border-default-200/50 "
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (selectedIndex >= 0) {
                      if (selectedIndex < searchResults.length) {
                        handleResultSelect(searchResults[selectedIndex]);
                      } else {
                        const actionIndex = selectedIndex - searchResults.length;
                        handleActionClick(filteredActions[actionIndex].href);
                      }
                    } else {
                      handleSearch();
                    }
                  }
                }}
              />
            </div>
          </ModalHeader>
          
          <ModalBody className="overflow-y-auto">
            <div className="p-4 pb-6 space-y-4">
              
              {/* Search Results */}
              {query.length > 0 && searchResults.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-default-700 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary-500" />
                    Search Results
                  </h3>
                  
                  <div className="space-y-2">
                    {Object.entries(groupedResults).map(([category, results]) => (
                      <div key={category} className="space-y-2">
                        {results.map((result, index) => {
                          const globalIndex = searchResults.findIndex(r => r.id === result.id);
                          return (
                            <Button
                              key={result.id}
                              variant="flat"
                              className={clsx(
                                "w-full justify-start h-auto p-2 rounded-xl text-left group",
                                selectedIndex === globalIndex
                                  ? "bg-primary-500/10 text-primary-600 border-primary-200"
                                  : "hover:bg-default-100"
                              )}
                              onPress={() => handleResultSelect(result)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className="flex items-center gap-3 w-full">
                                <div className="text-default-500 group-hover:text-primary-500 transition-colors">
                                  {result.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{result.title}</div>
                                  {result.description && (
                                    <div className="text-xs text-default-500 truncate">
                                      {result.description}
                                    </div>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-default-400 group-hover:text-primary-500 transition-all duration-200 group-hover:translate-x-1" />
                              </div>
                            </Button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-default-700 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-500" />
                  {query.length > 0 ? 'Matching Actions' : 'Quick Actions'}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredActions.map((action, index) => {
                    const globalIndex = searchResults.length + index;
                    return (
                      <Button
                        key={action.href}
                        variant="flat"
                   
                        className={clsx(
                          "h-auto p-2 justify-start text-left group relative overflow-hidden transition-all duration-100 rounded-2xl",
                          selectedIndex === globalIndex
                            ? "bg-primary-500/10 text-primary-600 border-primary-200"
                            : action.featured 
                            ? "  hover:shadow-lg" 
                            : "hover:bg-default-100"
                        )}
                        onPress={() => handleActionClick(action.href)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div className="flex items-start gap-3 w-full">
                          <div className={clsx(
                            "p-2.5 rounded-xl transition-all duration-100 group-hover:scale-105",
                            action.featured 
                              ? `bg-gradient-to-br ${action.gradient} text-white shadow-lg` 
                              : "bg-default-200 text-default-600 group-hover:bg-default-200"
                          )}>
                            {action.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 ">
                              <h4 className="font-medium text-sm group-hover:text-primary-600 transition-colors">
                                {action.label}
                              </h4>
                              {action.badge && (
                                <Chip size="sm" color="success" variant="flat" className="text-xs">
                                  {action.badge}
                                </Chip>
                              )}
                            </div>
                            <p className="text-xs text-default-500 leading-relaxed">
                              {action.description}
                            </p>
                          </div>
                          
                          <ArrowRight className="w-4 h-4 text-default-400 group-hover:text-primary-500 transition-all duration-300 group-hover:translate-x-1" />
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* No Results */}
              {query.length > 0 && searchResults.length === 0 && filteredActions.length === 0 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-default-300 mx-auto mb-3" />
                  <p className="text-default-500 mb-2">No results found for "{query}"</p>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={handleSearch}
                    startContent={<TrendingUp className="w-4 h-4" />}
                  >
                    Search everywhere
                  </Button>
                </div>
              )}

              {/* Recent Searches */}
              {query.length === 0 && recentSearches.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-default-700 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    Recent Searches
                  </h3>
                  
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((recent, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant="flat"
                        className="text-xs bg-default-100 hover:bg-default-200 text-default-700"
                        startContent={<Clock className="w-3 h-3" />}
                        onPress={() => {
                          setQuery(recent);
                          setTimeout(() => inputRef.current?.focus(), 100);
                        }}
                      >
                        {recent}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {query.length === 0 && (
                <div className="bg-gradient-to-r from-default-50 to-primary-50/30 rounded-lg p-4 border border-default-200/50">
                  <h4 className="text-sm font-medium text-default-800 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary-500" />
                    Pro Tips
                  </h4>
                  <div className="text-xs text-default-600 space-y-1">
                    <p>• Use <Kbd className="bg-default-200 text-xs mx-1" keys={["command"]}>K</Kbd> to quickly open this modal</p>
                    <p>• Try searching for "portfolio", "wallet", "analytics"</p>
                    <p>• Use arrow keys to navigate and Enter to select</p>
                  </div>
                </div>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}