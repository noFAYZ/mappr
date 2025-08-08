"use client";

import React, { useMemo } from "react";
import { FixedSizeList as List, ListChildComponentProps } from "react-window";

import { type Message } from "./types";

import { ChatMessage } from "./index";

interface MessageVirtualizerProps {
  messages: Message[];
  height: number;
  itemHeight?: number;
  onCopy: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onFeedback?: (messageId: string, type: "positive" | "negative") => void;
  className?: string;
}

/**
 * Virtualized message list for handling large numbers of messages efficiently
 * Uses react-window for performance optimization
 */
export const MessageVirtualizer: React.FC<MessageVirtualizerProps> = ({
  messages,
  height,
  itemHeight = 150,
  onCopy,
  onRegenerate,
  onEdit,
  onFeedback,
  className,
}) => {
  const MessageItem = useMemo(() => {
    return ({ index, style }: ListChildComponentProps) => {
      const message = messages[index];

      if (!message) return null;

      return (
        <div className="px-4 py-2" style={style}>
          <ChatMessage
            message={message}
            showActions={true}
            onCopy={onCopy}
            onEdit={onEdit}
            onFeedback={onFeedback}
            onRegenerate={
              onRegenerate ? () => onRegenerate(message.id) : undefined
            }
          />
        </div>
      );
    };
  }, [messages, onCopy, onRegenerate, onEdit, onFeedback]);

  return (
    <div className={className}>
      <List
        height={height}
        itemCount={messages.length}
        itemSize={itemHeight}
        overscanCount={5}
        width="100%"
      >
        {MessageItem}
      </List>
    </div>
  );
};
