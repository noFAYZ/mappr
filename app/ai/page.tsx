"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardBody } from '@heroui/card';
import { Button } from '@heroui/button';
import { Textarea } from '@heroui/input';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { Tooltip } from '@heroui/tooltip';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { Modal, ModalContent, ModalBody } from '@heroui/modal';
import { useDisclosure } from '@heroui/modal';
import { Kbd } from '@heroui/kbd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Plus,
  MoreVertical,
  Copy,
  RotateCcw,
  Trash2,
  Edit3,
  History,
  Sparkles,
  Zap,
  ChevronLeft,
  Settings,
  Paperclip,
  Mic,
  StopCircle,
  X,
  Check,
  ArrowUp,
  Volume2,
  VolumeX,
  Download,
  Share2,
  BookOpen,
  TrendingUp,
  PieChart,
  DollarSign,
  Wallet,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  Target,
  Shield,
  Globe,
  Camera,
  Image,
  FileText,
  Code,
  Database,
  Activity,
  MessageSquare,
  Layers,
  Folder,
  Star,
  Crown,
  Expand,
  Minimize,
  CornerDownLeft,
  Command,
  Upload
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/stores';
import clsx from 'clsx';
import { Switch } from '@heroui/react';
import { LogoMappr } from '@/components/icons';
import { MdiMessageFastOutline, PhUser, UimCommentAltMessage } from '@/components/icons/icons';
import ChatMessage from './components/ChatMessage';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  isError?: boolean;
  attachments?: MessageAttachment[];
  metadata?: {
    type?: 'text' | 'analysis' | 'insight' | 'recommendation' | 'chart' | 'table';
    data?: any;
    tokens?: number;
    processingTime?: number;
    model?: string;
    confidence?: number;
  };
}

interface MessageAttachment {
  id: string;
  type: 'image' | 'file' | 'csv' | 'pdf';
  name: string;
  size: number;
  url?: string;
  preview?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  model?: string;
  tags?: string[];
  is_starred?: boolean;
  summary?: string;
}

interface SuggestionPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: React.ReactNode;
  category: 'analysis' | 'insights' | 'planning' | 'data' | 'general';
  gradient: string;
  isPremium?: boolean;
}

// API Service
class AIService {
  static async sendMessage(message: string, conversationId?: string, attachments?: MessageAttachment[]) {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message, 
        conversationId,
        attachments,
        context: {
          timestamp: new Date().toISOString()
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  static async getConversations() {
    const response = await fetch('/api/ai/conversations');
    if (!response.ok) {
      throw new Error(`Failed to fetch conversations: ${response.statusText}`);
    }
    const result = await response.json();
    return result.data || [];
  }

  static async createConversation(title: string = 'New Conversation') {
    const response = await fetch('/api/ai/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    
    if (!response.ok) throw new Error('Failed to create conversation');
    return response.json();
  }

  static async deleteConversation(conversationId: string) {
    const response = await fetch(`/api/ai/conversations/${conversationId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) throw new Error('Failed to delete conversation');
  }

  static async starConversation(conversationId: string) {
    const response = await fetch(`/api/ai/conversations/${conversationId}/star`, {
      method: 'PATCH'
    });
    
    if (!response.ok) throw new Error('Failed to star conversation');
    return response.json();
  }
}


// Conversation Sidebar Component
const ConversationSidebar = ({ 
  conversations, 
  selectedId, 
  onSelect, 
  onNew, 
  onDelete,
  onStar,
  isLoading,
  isOpen,
  onClose,
  onSettingsOpen
}: {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onStar: (id: string) => void;
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSettingsOpen: () => void;
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm  lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        initial={{ x: isOpen ? 0 : "-100%" }}
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 z-20 w-72 bg-background/80 border border-divider rounded-3xl h-full flex flex-col"
      >
        {/* Header */}
        <div className="p-3 border-b border-default-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <UimCommentAltMessage className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-sm">Conversations</h3>
            </div>
            <div className="flex items-center gap-1">
              <Button
                isIconOnly
                variant="flat"
                size="sm"
                onPress={onSettingsOpen}
                className="hover:bg-default-200"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={onNew}
                className="w-7 h-7 min-w-7"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onPress={onClose}
                className="w-7 h-7 min-w-7 lg:hidden"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Conversations List */}
        <ScrollShadow className="flex-1 px-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-3 bg-default-100 rounded-lg animate-pulse">
                  <div className="h-3 bg-default-200 rounded mb-2" />
                  <div className="h-2 bg-default-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-default-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1 py-2">
              {conversations.map((conversation) => (
                <motion.div
                  key={conversation.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={clsx(
                    "group relative px-3 py-2 rounded-xl cursor-pointer border border-divider",
                    "hover:bg-default-50",
                    selectedId === conversation.id 
                      ? "border border-divider" 
                      : "border border-transparent"
                  )}
                  onClick={() => {
                    onSelect(conversation.id);
                    onClose();
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1 mb-1">
                        <h4 className="font-medium text-xs truncate">
                          {conversation.title}
                        </h4>
                        {conversation.is_starred && (
                          <Star className="w-2.5 h-2.5 text-warning-500 fill-current" />
                        )}
                      </div>
                      
                      {conversation.summary && (
                        <p className="text-xs text-default-600 mb-1 line-clamp-2">
                          {conversation.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-default-500">
                        <span>{conversation.messages?.length || 0} msgs</span>
                        <span>{new Date(conversation.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="flat"
                          className="opacity-0 group-hover:opacity-100 w-6 h-6 min-w-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-3 h-3" />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu>
                        <DropdownItem 
                          key="star" 
                          startContent={<Star className="w-3 h-3" />}
                          onPress={() => onStar(conversation.id)}
                        >
                          {conversation.is_starred ? 'Unstar' : 'Star'}
                        </DropdownItem>
                        <DropdownItem 
                          key="delete" 
                          color="danger"
                          startContent={<Trash2 className="w-3 h-3" />}
                          onPress={() => onDelete(conversation.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollShadow>
      </motion.div>
    </>
  );
};

// Welcome Screen Component
const WelcomeScreen = ({ onPromptSelect }: { onPromptSelect: (prompt: string) => void }) => {
  const { profile } = useAuth();
  
  const suggestions: SuggestionPrompt[] = [
    {
      id: '1',
      title: "Portfolio Analysis",
      description: "Deep dive into your investment performance and risk distribution",
      prompt: "Analyze my complete portfolio performance including asset allocation, risk metrics, sector distribution, and provide specific recommendations for optimization based on my investment goals and risk tolerance.",
      icon: <PieChart className="w-5 h-5" />,
      category: 'analysis',
      gradient: "from-violet-500 to-purple-600"
    },
    {
      id: '2',
      title: "Market Intelligence",
      description: "Current market trends and their impact on your investments",
      prompt: "Provide comprehensive market analysis including current trends, economic indicators, sector performance, and how these factors specifically affect my portfolio. Include actionable insights for the next quarter.",
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'insights',
      gradient: "from-blue-500 to-cyan-600"
    },
    {
      id: '3',
      title: "Financial Health Check",
      description: "Complete overview of your financial position and goals",
      prompt: "Give me a comprehensive financial health assessment covering all my accounts, cash flow analysis, debt-to-income ratios, emergency fund status, and progress toward my financial goals with specific actionable recommendations.",
      icon: <Shield className="w-5 h-5" />,
      category: 'planning',
      gradient: "from-emerald-500 to-teal-600"
    },
    {
      id: '4',
      title: "Investment Opportunities",
      description: "Personalized investment recommendations based on your profile",
      prompt: "Based on my current portfolio, risk profile, investment timeline, and market conditions, suggest specific investment opportunities including stocks, bonds, ETFs, or alternative investments that align with my strategy.",
      icon: <Target className="w-5 h-5" />,
      category: 'planning',
      gradient: "from-orange-500 to-red-500",
      isPremium: true
    },
    {
      id: '5',
      title: "Tax Optimization",
      description: "Strategies to minimize tax impact and maximize returns",
      prompt: "Analyze my portfolio for tax optimization opportunities including tax-loss harvesting, asset location strategies, Roth conversions, and other tax-efficient investment approaches for the current tax year.",
      icon: <DollarSign className="w-5 h-5" />,
      category: 'planning',
      gradient: "from-amber-500 to-yellow-600",
      isPremium: true
    },
    {
      id: '6',
      title: "Risk Assessment",
      description: "Comprehensive risk analysis and mitigation strategies",
      prompt: "Conduct a thorough risk assessment of my entire financial portfolio including market risk, concentration risk, liquidity risk, and provide specific recommendations for risk mitigation and diversification.",
      icon: <AlertTriangle className="w-5 h-5" />,
      category: 'analysis',
      gradient: "from-rose-500 to-pink-600"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full text-center"
      >
        {/* Welcome Header */}
        <div className="mb-6">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto mb-3 rounded-full flex items-center justify-center relative overflow-hidden"
          >
            <LogoMappr className="w-12 h-12 text-white relative z-10" />
          
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg lg:text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-600 to-amber-500 bg-clip-text text-transparent">
              Mappr AI
            </motion.h1>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xs lg:text-sm text-default-600 leading-relaxed max-w-2xl mx-auto"
          >
            Welcome back, <span className="font-semibold text-foreground">{profile?.full_name?.split(' ')[0] || 'there'}</span>! 
            I'm your personal financial AI assistant, ready to analyze your data, provide insights, and help you make informed investment decisions.
          </motion.p>
        </div>

        {/* Enhanced Suggestion Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 mb-4 overflow-visible"
        >
          {suggestions.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Card
                isPressable
                className={clsx(
                  "h-full cursor-pointer border-1 border-default-200/50 rounded-2xl lg:rounded-3xl overflow-visible",
                  "hover:border-primary-300 hover:shadow-lg transition-all duration-300"
                )}
                onPress={() => onPromptSelect(item.prompt)}
              >
                <CardBody className="p-3 relative">
                  
                  {/* Premium badge */}
                  {item.isPremium && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute bottom-3 right-3 z-10"
                    >
                      <Chip 
                        size="sm" 
                        color="warning" 
                        variant="faded"
                        startContent={<Crown className="w-3 h-3" />}
                        className="text-xs font-semibold bg-warning-100 rounded-md h-5 border border-warning-200/50 text-warning-700"
                      >
                        Pro
                      </Chip>
                    </motion.div>
                  )}

                  {/* Main content container */}
                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3 sm:gap-4 lg:gap-3 xl:gap-4 items-start">
                    
                    {/* Icon container */}
                    <div className={clsx(
                      "sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                      "group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 text-white shadow-lg",
                      "group-hover:shadow-xl relative overflow-hidden",
                      item.gradient
                    )}>
                      {item.icon}
                    </div>
                    
                    {/* Text content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={clsx(
                        "font-bold text-sm mb-1",
                        "group-hover:text-primary-600 transition-colors duration-200",
                        "line-clamp-1 lg:line-clamp-2"
                      )}>
                        {item.title}
                      </h3>
                      <p className={clsx(
                        "text-xs text-default-600 leading-relaxed",
                        "line-clamp-2 sm:line-clamp-3 lg:line-clamp-2 xl:line-clamp-3",
                        "group-hover:text-default-700 transition-colors duration-200"
                      )}>
                        {item.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Bottom section */}
                  <div className="flex items-center justify-between mt-4 sm:mt-5 lg:mt-4">
                    {/* Category badge */}
                    <Chip 
                      size="sm" 
                      variant="faded" 
                      className={clsx(
                        "text-xs capitalize font-medium h-6",
                        "bg-default-100/80 dark:bg-default-200/10",
                        "group-hover:bg-primary-100/80 dark:group-hover:bg-primary-900/20",
                        "group-hover:text-primary-700 dark:group-hover:text-primary-300",
                        "transition-all duration-200"
                      )}
                    >
                      {item.category}
                    </Chip>
                    
                    {/* Arrow indicator */}
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      whileHover={{ x: 2 }}
                    >
                      <ArrowUp className="w-4 h-4 text-primary-500 rotate-45" />
                    </motion.div>
                  </div>

                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Capabilities Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-br from-default-50 to-default-100 dark:from-default-100/10 dark:to-default-200/10 rounded-3xl p-4 border border-default-200/50"
        >
          <h3 className="font-bold text-md mb-6 text-center">What I can help you with</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { icon: <BarChart3 className="w-4 h-4" />, text: "Portfolio performance analysis" },
              { icon: <Shield className="w-4 h-4" />, text: "Risk assessment & management" },
              { icon: <Target className="w-4 h-4" />, text: "Investment recommendations" },
              { icon: <TrendingUp className="w-4 h-4" />, text: "Market trend analysis" },
              { icon: <DollarSign className="w-4 h-4" />, text: "Tax optimization strategies" },
              { icon: <Wallet className="w-4 h-4" />, text: "Budgeting & cash flow" },
              { icon: <Globe className="w-4 h-4" />, text: "International markets" },
              { icon: <Lightbulb className="w-4 h-4" />, text: "Financial education" }
            ].map((capability, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.05 }}
                className="flex items-center gap-3 p-2 rounded-xl bg-content3 border border-default-200/30"
              >
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-600">
                  {capability.icon}
                </div>
                <span className="font-medium">{capability.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

// Message Input Component
const MessageInput = ({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  disabled,
  onAttach,
  attachments = [],
  onRemoveAttachment 
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  disabled?: boolean;
  onAttach?: (files: FileList) => void;
  attachments?: MessageAttachment[];
  onRemoveAttachment?: (id: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { profile } = useAuth();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      onSend();
    }
  };

  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, isExpanded ? 400 : 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [isExpanded]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [value, adjustTextareaHeight]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (onAttach && e.dataTransfer.files.length > 0) {
      onAttach(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onAttach && e.target.files) {
      onAttach(e.target.files);
    }
  };

  const canSend = value.trim().length > 0 && !isLoading && !disabled;
  const characterCount = value.length;
  const maxCharacters = 4000;
  const isNearLimit = characterCount > maxCharacters * 0.8;

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Attachments Preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-2 bg-default-100 rounded-lg p-2 pr-1"
                >
                  <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center">
                    {attachment.type === 'image' ? (
                      <Image className="w-4 h-4 text-primary-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-default-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                  </div>
                  {onRemoveAttachment && (
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      className="w-6 h-6 min-w-6"
                      onPress={() => onRemoveAttachment(attachment.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className={clsx(
        "relative rounded-2xl border border-divider",
        isDragging 
          ? "border-primary-500/20 bg-primary-50 dark:bg-primary-950/20" 
          : "border-default-300 hover:border-default focus-within:border-default",
        "bg-default-50 dark:bg-default-100/10"
      )}>
        
        {/* Drag overlay */}
        <AnimatePresence>
          {isDragging && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-dashed border-primary-500"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                <p className="text-sm font-medium text-primary-600">Drop files here to attach</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          placeholder="Message Assistant... (⌘ + Enter to send)"
          value={value}
          onValueChange={onChange}
          onKeyDown={handleKeyDown}
          variant="flat"
          minRows={1}
          maxRows={isExpanded ? 20 : 8}
          className="resize-none"
          classNames={{
            base: "w-full",
            input: "resize-none text-sm leading-relaxed",
            inputWrapper: "!bg-transparent border-none shadow-none group-data-[focus=true]:bg-transparent px-4 py-3"
          }}
          disabled={disabled}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        />
        
        {/* Bottom toolbar */}
        <div className="flex items-center justify-between px-4 pb-3">
          {/* Left actions */}
          <div className="flex items-center gap-1">
            {/* Attach button */}
            {onAttach && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.csv,.xlsx,.txt,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Tooltip content="Attach files">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="w-8 h-8 min-w-8 hover:bg-default-200"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </Tooltip>
              </>
            )}
            
            {/* Voice recording */}
            <Tooltip content={isRecording ? "Stop recording" : "Voice message"}>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className={clsx(
                  "w-8 h-8 min-w-8 transition-colors",
                  isRecording ? "bg-danger-100 text-danger-600" : "hover:bg-default-200"
                )}
                onPress={() => setIsRecording(!isRecording)}
              >
                {isRecording ? <StopCircle className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            </Tooltip>

            {/* Expand toggle */}
            <Tooltip content={isExpanded ? "Collapse" : "Expand"}>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-8 h-8 min-w-8 hover:bg-default-200"
                onPress={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <Minimize className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </Button>
            </Tooltip>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Character count */}
            <Chip 
              size="sm" 
              variant="flat" 
              color={isNearLimit ? "warning" : "default"}
              className="text-xs h-6"
            >
              {characterCount}/{maxCharacters}
            </Chip>

            {/* Send button */}
            <Button
              color="primary"
              size="sm"
              isDisabled={!canSend}
              isLoading={isLoading}
              onPress={onSend}
              className={clsx(
                "px-4 h-8 min-w-16 font-medium transition-all duration-200",
                canSend 
                  ? "bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-primary-500/25" 
                  : "opacity-50"
              )}
              endContent={!isLoading && <ArrowUp className="w-4 h-4" />}
            >
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between mt-3 text-xs text-default-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center text-xs gap-1">
            <Kbd keys={["command"]}>⌘</Kbd> + <Kbd>Enter</Kbd> to send
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for new line
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>Model: GPT-4 Turbo</span>
          {profile?.tier && (
            <Chip size="sm" variant="flat" color="primary" className="bg-primary-500/20 rounded-md px-0 h-5 capitalize">
              {profile.tier} Plan
            </Chip>
          )}
        </div>
      </div>
    </div>
  );
};

// Main AI Page Component
export default function AIPage() {
  const { user, profile } = useAuth();
  const { addNotification } = useUIStore();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isOpen: isSettingsOpen, onOpen: onSettingsOpen, onClose: onSettingsClose } = useDisclosure();

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations, error: conversationsError } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: AIService.getConversations,
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  const currentConversation = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)
    : null;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ message, conversationId, attachments }: { 
      message: string; 
      conversationId?: string;
      attachments?: MessageAttachment[];
    }) => AIService.sendMessage(message, conversationId, attachments),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (data.conversationId && !selectedConversation) {
        setSelectedConversation(data.conversationId);
      }
      setAttachments([]);
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Message Failed',
        message: error.message || 'Failed to send message. Please try again.'
      });
    }
  });

  // Create conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: AIService.createConversation,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setSelectedConversation(data.data.id);
      setIsSidebarOpen(false);
    }
  });

  // Delete conversation mutation
  const deleteConversationMutation = useMutation({
    mutationFn: AIService.deleteConversation,
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (selectedConversation === deletedId) {
        setSelectedConversation(null);
      }
      addNotification({
        type: 'success',
        title: 'Conversation Deleted',
        message: 'The conversation has been successfully deleted.'
      });
    }
  });

  // Star conversation mutation
  const starConversationMutation = useMutation({
    mutationFn: AIService.starConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    }
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'end'
    });
  }, [currentConversation?.messages]);

  // Handle file attachments
  const handleAttachFiles = useCallback((files: FileList) => {
    const newAttachments: MessageAttachment[] = Array.from(files).map(file => ({
      id: crypto.randomUUID(),
      type: file.type.startsWith('image/') ? 'image' : 'file',
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file)
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.url) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  // Handle sending messages
  const handleSendMessage = useCallback(async () => {
    if (!currentMessage.trim() || sendMessageMutation.isPending) return;

    const message = currentMessage.trim();
    setCurrentMessage('');

    try {
      await sendMessageMutation.mutateAsync({
        message,
        conversationId: selectedConversation || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });
    } catch (error) {
      console.error('Send message error:', error);
    }
  }, [currentMessage, selectedConversation, attachments, sendMessageMutation]);

  const handlePromptSelect = useCallback((prompt: string) => {
    setCurrentMessage(prompt);
    setIsSidebarOpen(false);
  }, []);

  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard.writeText(content);
    addNotification({
      type: 'success',
      title: 'Copied',
      message: 'Message copied to clipboard'
    });
  }, [addNotification]);

  const handleRegenerateMessage = useCallback(async () => {
    if (!currentConversation?.messages.length) return;
    
    const lastUserMessage = currentConversation.messages
      .filter(m => m.role === 'user')
      .pop();
    
    if (lastUserMessage) {
      try {
        await sendMessageMutation.mutateAsync({
          message: lastUserMessage.content,
          conversationId: selectedConversation || undefined
        });
      } catch (error) {
        console.error('Regenerate message error:', error);
      }
    }
  }, [currentConversation, selectedConversation, sendMessageMutation]);

  const handleSpeakMessage = useCallback((content: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      speechSynthesis.speak(utterance);
    }
  }, []);

  const handleStopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, []);

  // Handle conversation errors
  useEffect(() => {
    if (conversationsError) {
      addNotification({
        type: 'error',
        title: 'Failed to Load Conversations',
        message: 'Unable to fetch your conversation history. Please refresh the page.'
      });
    }
  }, [conversationsError, addNotification]);

  return (
    <div className='flex'>
      
      <ConversationSidebar
        conversations={conversations}
        selectedId={selectedConversation}
        onSelect={setSelectedConversation}
        onNew={() => createConversationMutation.mutate()}
        onDelete={(id) => deleteConversationMutation.mutate(id)}
        onStar={(id) => starConversationMutation.mutate(id)}
        isLoading={loadingConversations}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSettingsOpen={onSettingsOpen}
      />

      {/* Main Chat Interface */}
      <div className="flex-1 flex-col min-w-0 relative">
        
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-default-200/50 flex items-center justify-between bg-background/80 backdrop-blur-xl">
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={() => setIsSidebarOpen(true)}
            className="hover:bg-default-200"
          >
            <History className="w-4 h-4" />
          </Button>
          
          <Button
            isIconOnly
            variant="flat"
            size="sm"
            onPress={onSettingsOpen}
            className="hover:bg-default-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-hidden relative ">
          {!currentConversation ? (
            <WelcomeScreen onPromptSelect={handlePromptSelect} />
          ) : (
            <ScrollShadow className="h-full">
              <div className="max-w-4xl mx-auto py-6 px-4">
                <AnimatePresence mode="popLayout">
                  {currentConversation.messages?.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onCopy={handleCopyMessage}
                      onRegenerate={
                        index === currentConversation.messages.length - 1 && message.role === 'assistant' 
                          ? handleRegenerateMessage 
                          : undefined
                      }
                      onSpeak={handleSpeakMessage}
                      isPlaying={isPlaying}
                      onStopSpeaking={handleStopSpeaking}
                    />
                  ))}
                </AnimatePresence>
                
                {/* Streaming indicator */}
                <AnimatePresence>
                  {sendMessageMutation.isPending && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="flex gap-4 w-full p-4"
                    >
                      <Avatar
                        size="md"
                        className="flex-shrink-0 mt-1"
                        fallback={
                          <div className="w-full h-full  flex items-center justify-center relative overflow-hidden">
                            <LogoMappr className="w-7 h-7 text-white relative z-10" />
                          
                          </div>
                        }
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-semibold text-foreground">Assistant</span>
                          <Chip size="sm" variant="flat" color="primary" className="text-xs h-5">
                            Analyzing...
                          </Chip>
                        </div>
                        <div className="bg-white dark:bg-default-50/10 border border-default-200 dark:border-default-700 rounded-2xl p-4 shadow-sm">
                          <div className="flexitems-center gap-3 text-default-500">
                            <div className="flex gap-1">
                              <motion.div 
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                              />
                              <motion.div 
                                className="w-2 h-2 bg-current rounded-full"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                              />
                            </div>
                            <span className="text-sm font-medium">
                              Processing your request and analyzing data...
                            </span>
                          </div>
                          
                          {/* Progress indicators */}
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center gap-2 text-xs text-default-500">
                              <motion.div 
                                className="w-1 h-1 bg-primary-500 rounded-full"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                              <span>Accessing your financial data</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-default-500">
                              <motion.div 
                                className="w-1 h-1 bg-primary-500 rounded-full"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                              />
                              <span>Running analysis algorithms</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-default-500">
                              <motion.div 
                                className="w-1 h-1 bg-primary-500 rounded-full"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                              />
                              <span>Generating insights and recommendations</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollShadow>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-default-200/50">
          <MessageInput
            value={currentMessage}
            onChange={setCurrentMessage}
            onSend={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
            disabled={sendMessageMutation.isPending}
            onAttach={handleAttachFiles}
            attachments={attachments}
            onRemoveAttachment={handleRemoveAttachment}
          />
        </div>
      </div>

      {/* Settings Modal */}
      <Modal 
        isOpen={isSettingsOpen} 
        onClose={onSettingsClose}
        size="2xl"
        backdrop="blur"
        classNames={{
          backdrop: "bg-gradient-to-t from-zinc-900/50 to-zinc-900/10 backdrop-opacity-20"
        }}
      >
        <ModalContent>
          <ModalBody className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold mb-2">AI Assistant Settings</h3>
                <p className="text-default-600">Customize your AI experience</p>
              </div>

              {/* Model Selection */}
              <Card>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-3">AI Model</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      {
                        name: "GPT-4 Turbo",
                        description: "Most capable model with advanced reasoning",
                        speed: "Moderate",
                        cost: "Higher",
                        recommended: true
                      },
                      {
                        name: "GPT-4",
                        description: "Balanced performance and reliability",
                        speed: "Moderate", 
                        cost: "Medium"
                      },
                      {
                        name: "GPT-3.5 Turbo",
                        description: "Fast responses for simpler queries",
                        speed: "Fast",
                        cost: "Lower"
                      }
                    ].map((model) => (
                      <Card 
                        key={model.name}
                        isPressable
                        className={clsx(
                          "border-2 transition-all",
                          model.recommended 
                            ? "border-primary-200 bg-primary-50/50" 
                            : "border-default-200 hover:border-default-300"
                        )}
                      >
                        <CardBody className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h5 className="font-semibold">{model.name}</h5>
                                {model.recommended && (
                                  <Chip size="sm" color="primary" variant="flat">
                                    Recommended
                                  </Chip>
                                )}
                              </div>
                              <p className="text-sm text-default-600 mb-2">{model.description}</p>
                              <div className="flex gap-4 text-xs">
                                <span>Speed: <strong>{model.speed}</strong></span>
                                <span>Cost: <strong>{model.cost}</strong></span>
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </CardBody>
              </Card>

              {/* Response Settings */}
              <Card>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-4">Response Preferences</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Detailed Explanations</p>
                        <p className="text-sm text-default-600">Get comprehensive analysis with step-by-step reasoning</p>
                      </div>
                      <Switch defaultSelected />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Data Citations</p>
                        <p className="text-sm text-default-600">Include sources and data references in responses</p>
                      </div>
                      <Switch defaultSelected />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Proactive Suggestions</p>
                        <p className="text-sm text-default-600">Receive additional insights and recommendations</p>
                      </div>
                      <Switch defaultSelected />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Privacy & Data */}
              <Card>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-4">Privacy & Data</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Conversation History</p>
                        <p className="text-sm text-default-600">Save conversations for future reference</p>
                      </div>
                      <Switch defaultSelected />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Analytics Sharing</p>
                        <p className="text-sm text-default-600">Help improve AI responses through usage analytics</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Rate Limits Info */}
              <Card>
                <CardBody className="p-4">
                  <h4 className="font-semibold mb-4">Usage & Limits</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Plan</span>
                      <Chip 
                        size="sm" 
                        color="primary" 
                        variant="flat"
                        className="capitalize"
                      >
                        {profile?.tier || 'Free'}
                      </Chip>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Monthly Queries</span>
                      <span className="text-sm font-medium">
                        {profile?.tier === 'free' ? '50' : 
                         profile?.tier === 'pro' ? '500' : 'Unlimited'}
                      </span>
                    </div>
                    <div className="text-xs text-default-500">
                      Rate limits reset on the 1st of each month. 
                      {profile?.tier === 'free' && (
                        <span className="text-primary-600"> Upgrade to Pro for higher limits.</span>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  color="primary" 
                  className="flex-1"
                  onPress={onSettingsClose}
                >
                  Save Settings
                </Button>
                <Button 
                  variant="flat" 
                  onPress={onSettingsClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}