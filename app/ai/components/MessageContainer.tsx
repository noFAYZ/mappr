"use client";

import React, {
  memo,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Card } from "@heroui/react";
import { RotateCcw, Trash2, Download, Share2 } from "lucide-react";

import EnterpriseMessage from "./ChatMessage";
import { type Message } from "./types";

import { useChatMessage } from "@/lib/hooks/useChatMessage";
import { ContentParserService } from "@/lib/services/contentParser";

interface MessageContainerProps {
  messages: Message[];
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onClearAll?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  enableSpeech?: boolean;
  enableFeedback?: boolean;
  enableVirtualization?: boolean;
  className?: string;
  maxMessages?: number;
}

interface VirtualizedItemProps {
  message: Message;
  index: number;
  isVisible: boolean;
  onCopy: (content: string) => void;
  onSpeak: (content: string, messageId: string) => void;
  onStopSpeaking: () => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onFeedback?: (messageId: string, type: "positive" | "negative") => void;
  isPlaying: (messageId: string) => boolean;
}

// ===== VIRTUALIZED MESSAGE ITEM =====
const VirtualizedMessageItem = memo(
  ({
    message,
    index,
    isVisible,
    onCopy,
    onSpeak,
    onStopSpeaking,
    onRegenerate,
    onEdit,
    onFeedback,
    isPlaying,
  }: VirtualizedItemProps) => {
    const [hasRendered, setHasRendered] = useState(false);

    useEffect(() => {
      if (isVisible && !hasRendered) {
        setHasRendered(true);
      }
    }, [isVisible, hasRendered]);

    if (!isVisible && !hasRendered) {
      // Placeholder for unrendered items
      return (
        <div
          className="h-20 w-full bg-default-50 dark:bg-default-900/20 rounded-lg animate-pulse"
          data-message-id={message.id}
        />
      );
    }

    return (
      <EnterpriseMessage
        key={message.id}
        isPlaying={isPlaying(message.id)}
        message={message}
        showActions={true}
        onCopy={onCopy}
        onEdit={onEdit ? (id, content) => onEdit(id, content) : undefined}
        onFeedback={onFeedback}
        onRegenerate={onRegenerate ? () => onRegenerate(message.id) : undefined}
        onSpeak={(content) => onSpeak(content, message.id)}
        onStopSpeaking={onStopSpeaking}
      />
    );
  },
);

VirtualizedMessageItem.displayName = "VirtualizedMessageItem";

// ===== CONVERSATION STATS =====
const ConversationStats = memo(({ messages }: { messages: Message[] }) => {
  const stats = useMemo(() => {
    const totalMessages = messages.length;
    const userMessages = messages.filter((m) => m.role === "user").length;
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant",
    ).length;
    const totalWords = messages.reduce(
      (acc, m) =>
        acc + (m.metadata?.wordCount || m.content.split(/\s+/).length),
      0,
    );
    const avgReadTime = messages.reduce(
      (acc, m) => acc + (m.metadata?.estimatedReadTime || 1),
      0,
    );
    const hasCode = messages.some((m) => m.metadata?.hasCode);
    const hasFinancial = messages.some((m) => m.metadata?.hasFinancialData);

    return {
      totalMessages,
      userMessages,
      assistantMessages,
      totalWords,
      avgReadTime,
      hasCode,
      hasFinancial,
    };
  }, [messages]);

  if (stats.totalMessages === 0) return null;

  return (
    <Card className="p-3 mb-4 bg-default-50 dark:bg-default-900/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="text-center">
          <div className="font-semibold text-lg text-primary-600">
            {stats.totalMessages}
          </div>
          <div className="text-default-500">Messages</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-success-600">
            {stats.totalWords}
          </div>
          <div className="text-default-500">Words</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-lg text-warning-600">
            {stats.avgReadTime}m
          </div>
          <div className="text-default-500">Read Time</div>
        </div>
        <div className="text-center">
          <div className="flex justify-center gap-1">
            {stats.hasCode && (
              <span className="px-1 py-0.5 bg-blue-100 text-blue-600 rounded text-xs">
                Code
              </span>
            )}
            {stats.hasFinancial && (
              <span className="px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs">
                Finance
              </span>
            )}
          </div>
          <div className="text-default-500">Content</div>
        </div>
      </div>
    </Card>
  );
});

ConversationStats.displayName = "ConversationStats";

// ===== ENHANCED MESSAGE CONTAINER =====
export const MessageContainer: React.FC<MessageContainerProps> = memo(
  ({
    messages,
    onRegenerate,
    onEdit,
    onClearAll,
    onExport,
    onShare,
    enableSpeech = true,
    enableFeedback = true,
    enableVirtualization = false,
    className,
    maxMessages = 1000,
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [performanceMode, setPerformanceMode] = useState(false);

    const {
      isPlaying,
      currentSpeechId,
      handleCopy,
      handleSpeak,
      handleStopSpeaking,
      handleFeedback,
      handleRegenerate,
      handleEdit,
      isCurrentMessagePlaying,
    } = useChatMessage({
      enableSpeech,
      enableFeedback,
      onError: (error) => {
        console.error("ChatMessage error:", error);
      },
    });

    // Performance optimization: limit messages if too many
    const displayMessages = useMemo(() => {
      if (messages.length > maxMessages) {
        setPerformanceMode(true);

        return messages.slice(-maxMessages);
      }
      setPerformanceMode(false);

      return messages;
    }, [messages, maxMessages]);

    // Virtualization logic
    const updateVisibleRange = useCallback(() => {
      if (!enableVirtualization || !containerRef.current) return;

      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const itemHeight = 150; // Estimated average message height

      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - 5);
      const end = Math.min(
        displayMessages.length,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + 5,
      );

      setVisibleRange({ start, end });
    }, [enableVirtualization, displayMessages.length]);

    // Scroll handling
    const handleScroll = useCallback(() => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;

      setIsAtBottom(isNearBottom);

      if (enableVirtualization) {
        updateVisibleRange();
      }
    }, [enableVirtualization, updateVisibleRange]);

    // Auto-scroll to bottom for new messages
    useEffect(() => {
      if (isAtBottom && containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, [messages.length, isAtBottom]);

    // Cleanup parser cache when component unmounts
    useEffect(() => {
      return () => {
        ContentParserService.clearCache();
      };
    }, []);

    const scrollToBottom = useCallback(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, []);

    const renderMessages = () => {
      if (enableVirtualization) {
        return displayMessages.map((message, index) => {
          const isVisible =
            index >= visibleRange.start && index <= visibleRange.end;

          return (
            <VirtualizedMessageItem
              key={message.id}
              index={index}
              isPlaying={isCurrentMessagePlaying}
              isVisible={isVisible}
              message={message}
              onCopy={handleCopy}
              onEdit={onEdit ? handleEdit : undefined}
              onFeedback={enableFeedback ? handleFeedback : undefined}
              onRegenerate={onRegenerate ? handleRegenerate : undefined}
              onSpeak={handleSpeak}
              onStopSpeaking={handleStopSpeaking}
            />
          );
        });
      }

      return displayMessages.map((message) => (
        <EnterpriseMessage
          key={message.id}
          isPlaying={isCurrentMessagePlaying(message.id)}
          message={message}
          showActions={true}
          onCopy={handleCopy}
          onEdit={
            onEdit
              ? (id, content) => handleEdit(id, content, onEdit)
              : undefined
          }
          onFeedback={enableFeedback ? handleFeedback : undefined}
          onRegenerate={
            onRegenerate
              ? () =>
                  handleRegenerate(message.id, () => onRegenerate(message.id))
              : undefined
          }
          onSpeak={(content) => handleSpeak(content, message.id)}
          onStopSpeaking={handleStopSpeaking}
        />
      ));
    };

    return (
      <div className={`flex flex-col h-full ${className || ""}`}>
        {/* Conversation Header */}
        {displayMessages.length > 0 && (
          <div className="flex-shrink-0 pb-4">
            <ConversationStats messages={displayMessages} />

            {/* Action Bar */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {performanceMode && (
                  <div className="text-xs text-warning-600 bg-warning-50 dark:bg-warning-950/20 px-2 py-1 rounded-full">
                    Performance mode: Showing last {maxMessages} messages
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {onShare && (
                  <Button
                    size="sm"
                    startContent={<Share2 className="w-4 h-4" />}
                    variant="light"
                    onPress={onShare}
                  >
                    Share
                  </Button>
                )}

                {onExport && (
                  <Button
                    size="sm"
                    startContent={<Download className="w-4 h-4" />}
                    variant="light"
                    onPress={onExport}
                  >
                    Export
                  </Button>
                )}

                {onClearAll && (
                  <Button
                    color="danger"
                    size="sm"
                    startContent={<Trash2 className="w-4 h-4" />}
                    variant="light"
                    onPress={onClearAll}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages Container */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-default-300 scrollbar-track-transparent"
          style={{
            height: enableVirtualization
              ? displayMessages.length * 150
              : "auto",
          }}
          onScroll={handleScroll}
        >
          <div className="space-y-6 p-4">
            <AnimatePresence mode="popLayout">
              {renderMessages()}
            </AnimatePresence>
          </div>
        </div>

        {/* Scroll to Bottom Button */}
        <AnimatePresence>
          {!isAtBottom && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 right-4"
              exit={{ opacity: 0, y: 20 }}
              initial={{ opacity: 0, y: 20 }}
            >
              <Button
                isIconOnly
                className="w-10 h-10"
                color="primary"
                variant="shadow"
                onPress={scrollToBottom}
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  },
);

MessageContainer.displayName = "MessageContainer";
