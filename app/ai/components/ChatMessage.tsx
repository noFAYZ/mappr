
  
  import React, { useState, useCallback, useRef, useEffect } from 'react';
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
    Textarea, 
    Tooltip 
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
    ThumbsDown
  } from 'lucide-react';
  import clsx from 'clsx';
  
  import { useAuth } from '@/contexts/AuthContext';
  import {  LogoMappr } from '@/components/icons';
import { PhUser } from '@/components/icons/icons';
import { ContentParserService } from '@/lib/services/contentParser';
  
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
    }>;
    metadata?: {
      type?: 'text' | 'analysis' | 'insight' | 'recommendation';
      model?: string;
      confidence?: number;
      data?: Record<string, any>;
      wordCount?: number;
      processingTime?: number;
      sources?: string[];
    };
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
  }
  
  const ContentRenderer = ({ content, metadata }: { content: string; metadata?: Message['metadata'] }) => {
    const [parsedContent, setParsedContent] = useState<{
      html: string;
      metadata: any;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      try {
        setIsLoading(true);
        setError(null);
        
        const parsed = ContentParserService.parseContent(content);
        setParsedContent(parsed);
      } catch (err) {
        console.error('Content parsing failed:', err);
        setError('Failed to parse content');
        
        // Fallback to simple rendering
        setParsedContent({
          html: `<p class=" leading-snug my-2 text-sm">${content.replace(/\n/g, '<br>')}</p>`,
          metadata: {
            hasCode: false,
            hasTable: false,
            hasFinancialData: false,
            hasMath: false,
            estimatedReadTime: 1,
            contentType: 'text',
            wordCount: content.split(/\s+/)?.length,
            headings: [],
            codeLanguages: []
          }
        });
      } finally {
        setIsLoading(false);
      }
    }, [content]);
  
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-default-200 rounded w-3/4"></div>
          <div className="h-4 bg-default-200 rounded w-1/2"></div>
          <div className="h-4 bg-default-200 rounded w-5/6"></div>
        </div>
      );
    }
  
    if (error || !parsedContent) {
      return (
        <div className="text-danger-500 text-sm">
          {error || 'Failed to parse content. Please try again.'}
        </div>
      );
    }

    console.log(content)
  
    const insights = ContentParserService.extractInsights(content);
    const readingTime = ContentParserService.getReadingTime(parsedContent?.metadata?.wordCount || 0);
    const contentStats = ContentParserService.getContentStats(content, parsedContent.metadata);
  
    return (
      <div className="space-y-3">
        {/* Content Metadata Bar */}
        {parsedContent.metadata?.contentType && parsedContent.metadata.contentType !== 'text' && (
          <div className="flex items-center gap-2 text-xs  pb-1.5 border-b border-default-100">
            <Chip size="sm" variant="flat" color="primary" className="h-5">
              {parsedContent.metadata.contentType}
            </Chip>
            {parsedContent.metadata.hasCode && (
              <Chip size="sm" variant="flat" color="secondary" startContent={<FileText className="w-3 h-3" />} className="h-5">
                {parsedContent.metadata.codeLanguages?.length > 0 ? parsedContent.metadata.codeLanguages.join(', ') : 'Code'}
              </Chip>
            )}
            {parsedContent.metadata.hasFinancialData && (
              <Chip size="sm" variant="flat" color="success" startContent={<BarChart3 className="w-3 h-3" />} className="h-5">
                Financial
              </Chip>
            )}
            {parsedContent.metadata.hasTable && (
              <Chip size="sm" variant="flat" color="warning" className="h-5">
                Table
              </Chip>
            )}
            {parsedContent.metadata.hasMath && (
              <Chip size="sm" variant="flat" color="secondary" className="h-5">
                Math
              </Chip>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />
              <span>{readingTime}</span>
              <span className="text-default-400">•</span>
             
            </div>
          </div>
        )}
  
        {/* Table of Contents for long content */}
        {parsedContent.metadata?.headings?.length > 2 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Contents</span>
            </div>
            <div className="space-y-1">
              {parsedContent.metadata.headings.map((heading, index) => (
                <a
                  key={index}
                  href={`#${heading.id}`}
                  className={clsx(
                    "block text-xs text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 transition-colors",
                    heading.level === 1 && "font-semibold",
                    heading.level === 2 && "ml-2",
                    heading.level === 3 && "ml-4",
                    heading.level >= 4 && "ml-6"
                  )}
                >
                  {heading.text}
                </a>
              ))}
            </div>
          </div>
        )}
  
        {/* Main Content */}
        <div 
          className="prose prose-sm max-w-none [&_*]:max-w-none content-renderer text-sm"
          dangerouslySetInnerHTML={{ __html: parsedContent.html }}
        />
  
        {/* Content Statistics for complex content */}
        {contentStats.contentComplexity !== 'simple' && (
          <div className="text-xs text-default-500 flex items-center gap-4 pt-2 border-t border-default-100">
            <span>Complexity: {contentStats.contentComplexity}</span>
            {contentStats.hasFinancialData && <span>• Financial analysis</span>}
            {contentStats.codeBlockCount > 0 && <span>• {contentStats.codeBlockCount} code block{contentStats.codeBlockCount !== 1 ? 's' : ''}</span>}
            {contentStats.headingCount > 0 && <span>• {contentStats.headingCount} section{contentStats.headingCount !== 1 ? 's' : ''}</span>}
          </div>
        )}
  
        {/* Key Insights */}
        {insights.length > 0 && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Key Insights</span>
            </div>
            <div className="space-y-1.5">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-blue-700 dark:text-blue-300 text-xs leading-snug">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Metadata Cards */}
        {metadata?.type === 'analysis' && metadata.data && (
          <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              Analysis Summary
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(metadata.data).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-300 font-medium text-xs uppercase tracking-wide">{key}:</span>
                  <span className="font-bold text-emerald-900 dark:text-emerald-100 text-xs">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {metadata?.type === 'recommendation' && (
          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">AI Recommendation</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const MessageActions = ({ 
    message, 
    onCopy, 
    onSpeak, 
    onStopSpeaking, 
    onRegenerate, 
    onEdit, 
    onFeedback,
    isPlaying,
    showActions 
  }: {
    message: Message;
    onCopy: (content: string) => void;
    onSpeak?: (content: string) => void;
    onStopSpeaking?: () => void;
    onRegenerate?: () => void;
    onEdit?: (id: string, content: string) => void;
    onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
    isPlaying?: boolean;
    showActions: boolean;
  }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [copied, setCopied] = useState(false);
  
    const handleCopy = useCallback(() => {
      onCopy(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [message.content, onCopy]);
  
    const handleSave = useCallback(() => {
      if (onEdit && editContent !== message.content) {
        onEdit(message.id, editContent);
      }
      setIsEditing(false);
    }, [onEdit, message.id, editContent, message.content]);
  
    if (isEditing) {
      return (
        <div className="mt-3 space-y-3">
          <Textarea
            value={editContent}
            onValueChange={setEditContent}
            variant="bordered"
            minRows={3}
            placeholder="Edit your message..."
          />
          <div className="flex gap-2">
            <Button size="sm" color="primary" onPress={handleSave}>
              Save Changes
            </Button>
            <Button size="sm" variant="flat" onPress={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }
  
    return (
      <AnimatePresence>
        {showActions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-1 mt-3"
          >
            <Tooltip content={copied ? "Copied!" : "Copy message"}>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
                onPress={handleCopy}
              >
                <Copy className={clsx("w-3.5 h-3.5", copied && "text-success-500")} />
              </Button>
            </Tooltip>
            
            {onSpeak && (
              <Tooltip content={isPlaying ? "Stop speaking" : "Read aloud"}>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
                  onPress={() => isPlaying ? onStopSpeaking?.() : onSpeak(message.content)}
                >
                  {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </Button>
              </Tooltip>
            )}
            
            {onRegenerate && (
              <Tooltip content="Regenerate response">
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
                  onPress={onRegenerate}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </Button>
              </Tooltip>
            )}
  
            {onFeedback && (
              <>
                <Tooltip content="Good response">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="w-8 h-8 min-w-8 hover:bg-success-100 hover:text-success-600 transition-colors"
                    onPress={() => onFeedback(message.id, 'positive')}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
                
                <Tooltip content="Poor response">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    className="w-8 h-8 min-w-8 hover:bg-danger-100 hover:text-danger-600 transition-colors"
                    onPress={() => onFeedback(message.id, 'negative')}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </Button>
                </Tooltip>
              </>
            )}
            
            <Dropdown>
              <DropdownTrigger>
                <Button
                  isIconOnly
                  size="sm"
                  variant="flat"
                  className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                {onEdit && (
                  <DropdownItem 
                    key="edit" 
                    startContent={<Edit3 className="w-4 h-4" />}
                    onPress={() => setIsEditing(true)}
                  >
                    Edit message
                  </DropdownItem>
                )}
                <DropdownItem 
                  key="bookmark" 
                  startContent={<Bookmark className="w-4 h-4" />}
                >
                  Bookmark
                </DropdownItem>
                <DropdownItem 
                  key="share" 
                  startContent={<Share2 className="w-4 h-4" />}
                >
                  Share
                </DropdownItem>
                <DropdownItem 
                  key="export" 
                  startContent={<Download className="w-4 h-4" />}
                >
                  Export
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };
  
  const ChatMessage: React.FC<ChatMessageProps> = ({ 
    message, 
    onCopy, 
    onRegenerate, 
    onEdit,
    onSpeak,
    isPlaying,
    onStopSpeaking,
    onFeedback,
    showActions = true
  }) => {
    const { profile } = useAuth();
    const [localShowActions, setLocalShowActions] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
  
    const messageVariants = {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { 
        opacity: 1, 
        y: 0, 
        scale: 1,
        transition: { 
          type: "spring",
          stiffness: 400,
          damping: 25,
          duration: 0.3
        }
      },
      exit: { 
        opacity: 0, 
        y: -20, 
        scale: 0.95,
        transition: { duration: 0.2 }
      }
    };
  
    // Don't render system messages
    if (isSystem) return null;
  
    return (
      <motion.div 
        ref={messageRef}
        variants={messageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={clsx(
          "group flex gap-3 w-full relative ",
          isUser ? "flex-row-reverse" : "flex-row",
          "hover:bg-default-50/50 dark:hover:bg-default-100/10 rounded-2xl p-3",
          message.isError && "bg-danger-50/50 dark:bg-danger-950/20 border border-danger-200/50"
        )}
        onMouseEnter={() => setLocalShowActions(true)}
        onMouseLeave={() => setLocalShowActions(false)}
      >
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-2">
          <Avatar
            src={isUser ? (profile?.avatar_url || undefined) : undefined}
            name={isUser ? profile?.full_name || 'You' : 'Assistant'}
            size="sm"
            
            className={clsx(
              "flex-shrink-0 bg-default-200",
              isUser 
                ? "border border-divider" 
                : "border border-divider"
            )}
         
            fallback={
              isUser ? (
                <PhUser className="w-5 h-5" />
              ) : (
                <LogoMappr className="w-6 h-6 relative z-10" />
              )
            }
          />
          
          {/* Metadata indicators for AI messages */}
          {!isUser && message.metadata && (
            <div className="flex flex-col gap-1 items-center">
              {message.metadata.model && (
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="text-xs h-5"
                  color="secondary"
                >
                  {message.metadata.model}
                </Chip>
              )}
              {message.metadata.confidence && (
                <Chip 
                  size="sm" 
                  variant="flat" 
                  className="text-xs h-5"
                  color={message.metadata.confidence > 0.8 ? "success" : "warning"}
                >
                  {Math.round(message.metadata.confidence * 100)}%
                </Chip>
              )}
              {message.metadata.processingTime && (
                <Tooltip content={`Processing time: ${message.metadata.processingTime}ms`}>
                  <div className="flex items-center gap-1 text-xs text-default-500">
                    <Clock className="w-3 h-3" />
                    <span>{message.metadata.processingTime}ms</span>
                  </div>
                </Tooltip>
              )}
            </div>
          )}
        </div>
        
        {/* Message Content Section */}
        <div className={clsx("flex flex-col min-w-0 flex-1", isUser ? "items-end" : "items-start")}>
          {/* Message Bubble */}
          <div className={clsx(
            "relative max-w-4xl transition-all duration-200",
            isUser 
              ? "bg-primary-500 text-primary-foreground rounded-2xl rounded-tr-md px-3 py-2.5 shadow-lg" 
              : "bg-content1 border border-divider rounded-2xl rounded-tl-md px-3 py-2.5 shadow-md hover:shadow-lg"
          )}>
            {/* Content Renderer */}
            {isUser ? (
              <div className="text-sm leading-snug whitespace-pre-wrap">
                {message.content}
              </div>
            ) : (
              <ContentRenderer content={message.content} metadata={message.metadata} />
            )}
            
            {/* Attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {message.attachments.map((attachment) => (
                  <Card key={attachment.id} className="p-1.5 bg-default-100/50">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3 h-3" />
                      <span className="text-xs font-medium">{attachment.name}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            
            {/* Streaming indicator */}
            {message.isStreaming && (
              <div className="flex items-center gap-2 mt-2 text-default-500">
                <div className="flex gap-1">
                  <motion.div 
                    className="w-1 h-1 bg-current rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1 h-1 bg-current rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.div 
                    className="w-1 h-1 bg-current rounded-full"
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
                <span className="text-xs font-medium">AI is thinking...</span>
              </div>
            )}
          </div>
          
          {/* Message timestamp */}
          <div className={clsx(
            "text-xs text-default-500 mt-1 px-1",
            isUser ? "text-right" : "text-left"
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
            {message.metadata?.sources && (
              <span className="ml-2">
                • {message.metadata.sources.length} source{message.metadata.sources.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {/* Message Actions */}
          {!isUser && showActions && (
            <MessageActions
              message={message}
              onCopy={onCopy}
              onSpeak={onSpeak}
              onStopSpeaking={onStopSpeaking}
              onRegenerate={onRegenerate}
              onEdit={onEdit}
              onFeedback={onFeedback}
              isPlaying={isPlaying}
              showActions={localShowActions || message.isStreaming || false}
            />
          )}
        </div>
      </motion.div>
    );
  };
  
  export default ChatMessage;