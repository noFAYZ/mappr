"use client";

import React from "react";
import { Card } from "@heroui/react";
import clsx from "clsx";

import { ContentRenderer } from "./ContentRenderer";
import { StreamingIndicator } from "./StreamingIndicator";
import { AttachmentsDisplay } from "./AttachmentsDisplay";
import { type Message } from "./types";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  isError: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, isUser, isError }) => {
    return (
      <Card
        className={clsx(
          "relative transition-all duration-200 hover:shadow-md",
          isUser
            ? "bg-primary-500 text-primary-foreground border-primary-200"
            : "bg-content1 border-divider",
          isError && "border-danger-200 bg-danger-50",
          "max-w-full",
        )}
      >
        <div
          className={clsx(
            "px-4 py-3 rounded-lg",
            isUser ? "rounded-tr-sm" : "rounded-tl-sm",
          )}
        >
          {/* Content */}
          {isUser ? (
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
          ) : (
            <ContentRenderer
              content={message.content}
              isError={isError}
              metadata={message.metadata}
            />
          )}

          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentsDisplay attachments={message.attachments} />
          )}

          {/* Streaming Indicator */}
          {message.isStreaming && <StreamingIndicator />}
        </div>
      </Card>
    );
  },
);

MessageBubble.displayName = "MessageBubble";
