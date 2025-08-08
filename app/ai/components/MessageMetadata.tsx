"use client";

import React from "react";
import { Chip } from "@heroui/react";
import { Cpu, Zap } from "lucide-react";
import clsx from "clsx";

import { type Message } from "./types";

interface MessageMetadataProps {
  message: Message;
  isUser: boolean;
}

export const MessageMetadata: React.FC<MessageMetadataProps> = React.memo(
  ({ message, isUser }) => {
    const formatTimestamp = (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60),
      );

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;

      return date.toLocaleDateString();
    };

    return (
      <div
        className={clsx(
          "flex items-center gap-2 mt-1 text-xs text-default-500",
          isUser ? "justify-end" : "justify-start",
        )}
      >
        <span>{formatTimestamp(message.timestamp)}</span>

        {message.metadata?.model && !isUser && (
          <Chip
            size="sm"
            startContent={<Cpu className="w-3 h-3" />}
            variant="flat"
          >
            {message.metadata.model}
          </Chip>
        )}

        {message.metadata?.processingTime && !isUser && (
          <Chip
            size="sm"
            startContent={<Zap className="w-3 h-3" />}
            variant="flat"
          >
            {message.metadata.processingTime}ms
          </Chip>
        )}

        {message.metadata?.confidence &&
          !isUser &&
          message.metadata.confidence < 0.8 && (
            <Chip color="warning" size="sm" variant="flat">
              Low confidence
            </Chip>
          )}
      </div>
    );
  },
);

MessageMetadata.displayName = "MessageMetadata";
