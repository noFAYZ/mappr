// app/ai/components/ChatMessage.tsx
"use client";

import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Avatar, 
  Button, 
  Card, 
  CardBody, 
  Chip, 
  Dropdown, 
  DropdownTrigger, 
  DropdownMenu, 
  DropdownItem,
  Tooltip,
  Progress
} from '@heroui/react';
import {
  Copy,
  Volume2,
  VolumeX,
  RotateCcw,
  MoreVertical,
  Edit3,
  Share2,
  Download,
  FileText,
  BarChart3,
  Lightbulb,
  Target,
  Clock,
  Eye,
  Bookmark,
  Flag,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  DollarSign,
  Code,
  Table,
  Bot,
  User,
  Zap
} from 'lucide-react';
import clsx from 'clsx';

import { useAuth } from '@/contexts/AuthContext';
import { LogoMappr } from '@/components/icons';
import { PhUser } from '@/components/icons/icons';
import { ContentParserService } from '@/lib/services/contentParser';
import { CHAT_MESSAGE_CONFIG, CONTENT_TYPES, MESSAGE_ROLES } from '@/lib/constants/chatMessage';
import { ErrorBoundary } from './ErrorBoundary';

// ===== TYPE DEFINITIONS =====
interface MessageMetadata {
  type?: 'text' | 'analysis' | 'insight' | 'recommendation' | 'error';
  model?: string;
  confidence?: number;
  processingTime?: number;
  sources?: string[];
  wordCount?: number;
  hasCode?: boolean;
  hasTable?: boolean;
  hasFinancialData?: boolean;
  hasMath?: boolean;
  contentType?: string;
  estimatedReadTime?: number;
  codeLanguages?: string[];
  headings?: Array<{ level: number; text: string; id: string }>;
  complexity?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  isError?: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size?: number;
  }>;
  metadata?: MessageMetadata;
}

interface ChatMessageProps {
  message: Message;
  onCopy: (content: string) => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  onSpeak?: (content: string) => void;
  isPlaying?: boolean;
  onStopSpeaking?: () => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  showActions?: boolean;
  className?: string;
}

// ===== OPTIMIZED CONTENT RENDERER =====
const EnhancedContentRenderer = memo(({ 
  content, 
  metadata,
  isError = false 
}: { 
  content: string; 
  metadata?: MessageMetadata;
  isError?: boolean;
}) => {
  const [parsedContent, setParsedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const parsingRef = useRef<AbortController>();

  const parseContent = useCallback(async () => {
    if (content.length > CHAT_MESSAGE_CONFIG.MAX_CONTENT_LENGTH) {
      setError(CHAT_MESSAGE_CONFIG.ERRORS.CONTENT_TOO_LONG);
      setIsLoading(false);
      return;
    }

    // Cancel previous parsing
    if (parsingRef.current) {
      parsingRef.current.abort();
    }

    parsingRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await ContentParserService.parseContent(content);
      
      if (!parsingRef.current.signal.aborted) {
        setParsedContent(parsed);
      }
    } catch (parseError) {
      console.error('Content parsing failed:', parseError);
      setError(CHAT_MESSAGE_CONFIG.ERRORS.PARSE_FAILED);
      
      // Fallback rendering
      setParsedContent({
        html: `<p class="text-sm leading-relaxed text-foreground">${content.replace(/\n/g, '<br>')}</p>`,
        metadata: { 
          contentType: 'text', 
          wordCount: content.split(/\s+/).length, 
          estimatedReadTime: 1,
          complexity: 'low',
          sentiment: 'neutral',
          topics: []
        },
        insights: [],
        financialData: { currencies: [], percentages: [], numbers: [], metrics: [] }
      });
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  useEffect(() => {
    parseContent();
    
    return () => {
      if (parsingRef.current) {
        parsingRef.current.abort();
      }
    };
  }, [parseContent]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-default-500">Processing content...</span>
        </div>
        <div className="animate-pulse space-y-2">
          <div className="h-3 bg-default-200 rounded w-3/4"></div>
          <div className="h-3 bg-default-200 rounded w-1/2"></div>
          <div className="h-3 bg-default-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !parsedContent) {
    return (
      <div className="flex items-start gap-2 p-3 bg-danger-50 dark:bg-danger-950/20 border border-danger-200 dark:border-danger-800 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-danger-700 dark:text-danger-300">
          {error || CHAT_MESSAGE_CONFIG.ERRORS.PARSE_FAILED}
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary fallback={<div className="text-danger-500 text-sm">Content rendering failed</div>}>
      <div className="space-y-3">
        {/* Content */}
        <div 
          className="prose prose-sm max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: parsedContent.html }} 
        />
        
        {/* Content Insights */}
        {parsedContent.insights && parsedContent.insights.length > 0 && (
          <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-950/20 border border-primary-200 dark:border-primary-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-800 dark:text-primary-200">Key Insights</span>
            </div>
            <ul className="space-y-1">
              {parsedContent.insights.map((insight: string, index: number) => (
                <li key={index} className="text-xs text-primary-700 dark:text-primary-300 leading-relaxed">
                  • {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Content Metadata */}
        {parsedContent.metadata && (
          <ContentMetadataBar metadata={parsedContent.metadata} financialData={parsedContent.financialData} />
        )}
      </div>
    </ErrorBoundary>
  );
});

EnhancedContentRenderer.displayName = 'EnhancedContentRenderer';

// ===== CONTENT METADATA BAR =====
const ContentMetadataBar = memo(({ 
  metadata, 
  financialData 
}: { 
  metadata: any; 
  financialData?: any;
}) => {
  const hasMetadata = metadata.hasCode || metadata.hasTable || metadata.hasFinancialData || metadata.hasMath;
  
  if (!hasMetadata) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-3 border-t border-default-200 dark:border-default-700">
      {metadata.hasCode && (
        <Chip 
          size="sm" 
          variant="flat" 
          color="secondary"
          startContent={<Code className="w-3 h-3" />}
          className="h-6 text-xs"
        >
          {metadata.codeLanguages?.length > 0 ? metadata.codeLanguages.join(', ') : 'Code'}
        </Chip>
      )}
      
      {metadata.hasTable && (
        <Chip 
          size="sm" 
          variant="flat" 
          color="success"
          startContent={<Table className="w-3 h-3" />}
          className="h-6 text-xs"
        >
          Table
        </Chip>
      )}
      
      {metadata.hasFinancialData && (
        <Chip 
          size="sm" 
          variant="flat" 
          color="warning"
          startContent={<DollarSign className="w-3 h-3" />}
          className="h-6 text-xs"
        >
          Financial
        </Chip>
      )}
      
      {metadata.hasMath && (
        <Chip 
          size="sm" 
          variant="flat" 
          color="primary"
          startContent={<TrendingUp className="w-3 h-3" />}
          className="h-6 text-xs"
        >
          Math
        </Chip>
      )}
      
      {metadata.estimatedReadTime && (
        <Chip 
          size="sm" 
          variant="flat" 
          color="default"
          startContent={<Clock className="w-3 h-3" />}
          className="h-6 text-xs"
        >
          {metadata.estimatedReadTime}m read
        </Chip>
      )}
      
      {metadata.complexity && metadata.complexity !== 'low' && (
        <Chip 
          size="sm" 
          variant="flat" 
          color={metadata.complexity === 'high' ? 'danger' : 'warning'}
          className="h-6 text-xs"
        >
          {metadata.complexity} complexity
        </Chip>
      )}
      
      {financialData && (financialData.currencies.length > 0 || financialData.percentages.length > 0) && (
        <div className="flex items-center gap-1 text-xs text-default-500">
          <span>•</span>
          <span>
            {financialData.currencies.length + financialData.percentages.length} financial data points
          </span>
        </div>
      )}
    </div>
  );
});

ContentMetadataBar.displayName = 'ContentMetadataBar';

// ===== MESSAGE ACTIONS COMPONENT =====
const MessageActions = memo(({ 
  message, 
  onCopy, 
  onRegenerate, 
  onEdit, 
  onSpeak, 
  onStopSpeaking, 
  onFeedback, 
  isPlaying,
  showActions 
}: {
  message: Message;
  onCopy: (content: string) => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  onSpeak?: (content: string) => void;
  onStopSpeaking?: () => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  isPlaying?: boolean;
  showActions: boolean;
}) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'copied'>('idle');
  
  const handleCopy = useCallback(async () => {
    setCopyStatus('copying');
    try {
      await navigator.clipboard.writeText(message.content);
      onCopy(message.content);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      setCopyStatus('idle');
    }
  }, [message.content, onCopy]);

  const handleSpeak = useCallback(() => {
    if (isPlaying) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(message.content);
    }
  }, [isPlaying, message.content, onSpeak, onStopSpeaking]);

  const handleFeedback = useCallback((type: 'positive' | 'negative') => {
    onFeedback?.(message.id, type);
  }, [message.id, onFeedback]);

  if (!showActions) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex items-center gap-1"
      >
        <Tooltip content={copyStatus === 'copied' ? 'Copied!' : 'Copy message'}>
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleCopy}
            isLoading={copyStatus === 'copying'}
            className="h-8 w-8 min-w-8"
          >
            {copyStatus === 'copied' ? (
              <CheckCircle className="w-4 h-4 text-success-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
        
        {onSpeak && (
          <Tooltip content={isPlaying ? "Stop speaking" : "Speak message"}>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={handleSpeak}
              className="h-8 w-8 min-w-8"
            >
              {isPlaying ? (
                <VolumeX className="w-4 h-4 text-primary-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
          </Tooltip>
        )}
        
        {message.role === 'assistant' && onRegenerate && (
          <Tooltip content="Regenerate response">
            <Button
              isIconOnly
              size="sm"
              variant="light"
              onPress={onRegenerate}
              className="h-8 w-8 min-w-8"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </Tooltip>
        )}
        
        {onFeedback && message.role === 'assistant' && (
          <>
            <Tooltip content="Good response">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleFeedback('positive')}
                className="h-8 w-8 min-w-8"
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Poor response">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => handleFeedback('negative')}
                className="h-8 w-8 min-w-8"
              >
                <ThumbsDown className="w-4 h-4" />
              </Button>
            </Tooltip>
          </>
        )}

        <Dropdown>
          <DropdownTrigger>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="h-8 w-8 min-w-8"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Message actions">
            <DropdownItem key="share" startContent={<Share2 className="w-4 h-4" />}>
              Share
            </DropdownItem>
            <DropdownItem key="bookmark" startContent={<Bookmark className="w-4 h-4" />}>
              Bookmark
            </DropdownItem>
            <DropdownItem key="export" startContent={<Download className="w-4 h-4" />}>
              Export
            </DropdownItem>
            {message.role === 'assistant' && (
              <DropdownItem key="report" startContent={<Flag className="w-4 h-4" />} color="danger">
                Report
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </motion.div>
    </AnimatePresence>
  );
});

MessageActions.displayName = 'MessageActions';

// ===== MESSAGE TYPE INDICATOR =====
const MessageTypeIndicator = memo(({ type, model }: { type?: string; model?: string }) => {
  if (!type || type === 'text') return null;
  
  const typeConfig: Record<string, { icon: React.ComponentType<any>; color: string; bg: string }> = {
    analysis: { icon: BarChart3, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    insight: { icon: Lightbulb, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20' },
    recommendation: { icon: Target, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/20' },
    error: { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/20' }
  };

  const config = typeConfig[type];
  if (!config) return null;

  const IconComponent = config.icon;
  
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color} mb-3`}>
      <IconComponent className="w-3 h-3" />
      <span className="capitalize">{type}</span>
      {model && <span className="opacity-75">• {model}</span>}
    </div>
  );
});

MessageTypeIndicator.displayName = 'MessageTypeIndicator';

// ===== MAIN CHAT MESSAGE COMPONENT =====
const ChatMessage = memo(({ 
  message, 
  onCopy, 
  onRegenerate, 
  onEdit, 
  onSpeak, 
  onStopSpeaking, 
  onFeedback, 
  isPlaying = false, 
  showActions = true,
  className
}: ChatMessageProps) => {
  const { user } = useAuth();
  const [localShowActions, setLocalShowActions] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  const isError = message.isError;

  // Don't render system messages
  if (isSystem) return null;

  const messageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25
      }
    },
    exit: { 
      opacity: 0, 
      y: -20, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };

  const getAvatarIcon = () => {
    if (isError) return <AlertTriangle className="w-4 h-4 text-danger-500" />;
    if (isUser) return <User className="w-4 h-4 text-primary-600" />;
    return <Bot className="w-4 h-4 text-success-600" />;
  };

  const getAvatarColor = () => {
    if (isError) return 'bg-danger-100 border-danger-200';
    if (isUser) return 'bg-primary-100 border-primary-200';
    return 'bg-success-100 border-success-200';
  };

  return (
    <motion.div
      ref={messageRef}
      layout
      variants={messageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={clsx(
        "group flex gap-4 w-full relative transition-colors duration-200",
        isUser ? 'flex-row-reverse' : 'flex-row',
        "hover:bg-default-50/50 dark:hover:bg-default-100/10 rounded-xl p-3",
        isError && "bg-danger-50/30 dark:bg-danger-950/10",
        className
      )}
      onMouseEnter={() => setLocalShowActions(true)}
      onMouseLeave={() => setLocalShowActions(false)}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2 ${getAvatarColor()}`}>
        {isUser ? (
          <Avatar
            src={user?.user_metadata?.avatar_url}
            name={user?.user_metadata?.full_name || 'You'}
            size="sm"
            className="w-7 h-7"
            fallback={<PhUser className="w-4 h-4 text-primary-600" />}
          />
        ) : (
          getAvatarIcon()
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-4xl ${isUser ? 'text-right' : 'text-left'}`}>
        {/* Message Type Indicator */}
        <MessageTypeIndicator type={message.metadata?.type} model={message.metadata?.model} />
        
        {/* Message Bubble */}
        <div className={clsx(
          "relative rounded-2xl p-4 shadow-sm border transition-all duration-200",
          isError 
            ? 'bg-danger-50 dark:bg-danger-950/20 border-danger-200 dark:border-danger-800' 
            : isUser 
              ? 'bg-primary-500 text-white border-primary-600' 
              : 'bg-content1 border-default-200 dark:border-default-700 hover:shadow-md'
        )}>
          {/* Content */}
          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <EnhancedContentRenderer 
              content={message.content} 
              metadata={message.metadata}
              isError={isError}
            />
          )}
          
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-default-200 dark:border-default-700">
              {message.attachments.map((attachment) => (
                <Card key={attachment.id} className="p-2 bg-default-100 dark:bg-default-800">
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-default-600" />
                    <span className="font-medium">{attachment.name}</span>
                    {attachment.size && (
                      <span className="text-xs text-default-500">
                        ({(attachment.size / 1024).toFixed(1)}KB)
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
          
          {/* Streaming Indicator */}
          {message.isStreaming && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-default-200 dark:border-default-700">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-primary-500 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ 
                      duration: 0.6, 
                      repeat: Infinity, 
                      delay: i * 0.1 
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-xs text-default-600">
                <Zap className="w-3 h-3" />
                <span>AI is generating response...</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Message Footer */}
        <div className={clsx(
          "flex items-center justify-between mt-2 px-1",
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          {/* Timestamp and Metadata */}
          <div className="text-xs text-default-500 space-x-2">
            <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            {message.metadata?.processingTime && (
              <span>• {message.metadata.processingTime}ms</span>
            )}
            {message.metadata?.confidence && (
              <span>• {Math.round(message.metadata.confidence * 100)}% confidence</span>
            )}
          </div>
          
          {/* Actions */}
          {!isUser && showActions && (
            <MessageActions
              message={message}
              onCopy={onCopy}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
              onSpeak={onSpeak}
              onStopSpeaking={onStopSpeaking}
              onFeedback={onFeedback}
              isPlaying={isPlaying}
              showActions={localShowActions || message.isStreaming || false}
            />
          )}
        </div>
      </div>
    </motion.div> );
});

ChatMessage.displayName = 'ChatMessage';

// ===== EXPORT =====
export default ChatMessage;