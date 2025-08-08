"use client";

import React from "react";
import { motion } from "framer-motion";
import { Avatar } from "@heroui/react";
import clsx from "clsx";

import { MessageBubble } from "./MessageBubble";
import { MessageActions } from "./MessageActions";
import { MessageMetadata } from "./MessageMetadata";
import { type ChatMessageProps } from "./types";

import { PhUser } from "@/components/icons/icons";
import { LogoMappr } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Main ChatMessage component - handles message display and interactions
 * Optimized for production use with comprehensive error handling
 */
export const ChatMessage: React.FC<ChatMessageProps> = React.memo(
  ({
    message,
    onCopy,
    onRegenerate,
    onEdit,
    onSpeak,
    isPlaying = false,
    onStopSpeaking,
    onFeedback,
    showActions = true,
    className,
    ...props
  }) => {
    const { user } = useAuth();
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const isError = message.isError || false;

    // Animation variants for smooth transitions
    const messageVariants = {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: { duration: 0.2 },
      },
    };

    return (
      <motion.div
        animate="animate"
        className={clsx(
          "group relative flex gap-3 max-w-full",
          isUser ? "flex-row-reverse" : "flex-row",
          isError && "opacity-75",
          className,
        )}
        exit="exit"
        initial="initial"
        variants={messageVariants}
        {...props}
      >
        {/* Avatar */}
        <div
          className={clsx(
            "flex-shrink-0 mt-1",
            isUser ? "order-last" : "order-first",
          )}
        >
          <Avatar
            className={clsx(
              "ring-2 ring-offset-2 ring-offset-background transition-all duration-200",
              isUser
                ? "ring-primary-200 bg-primary-500"
                : "ring-secondary-200 bg-gradient-to-br from-blue-500 to-purple-600",
            )}
            icon={
              isUser ? (
                <PhUser className="w-4 h-4 text-primary-foreground" />
              ) : (
                <LogoMappr className="w-4 h-4 text-white" />
              )
            }
            name={isUser ? user?.user_metadata?.full_name : "Mappr AI"}
            size="sm"
            src={isUser ? user?.user_metadata?.avatar_url : undefined}
          />
        </div>

        {/* Message Content Container */}
        <div
          className={clsx(
            "flex flex-col min-w-0 flex-1 max-w-4xl",
            isUser ? "items-end" : "items-start",
          )}
        >
          {/* Message Bubble */}
          <MessageBubble isError={isError} isUser={isUser} message={message} />

          {/* Message Metadata */}
          <MessageMetadata isUser={isUser} message={message} />

          {/* Message Actions */}
          {showActions && isAssistant && !message.isStreaming && (
            <MessageActions
              isPlaying={isPlaying}
              message={message}
              onCopy={onCopy}
              onEdit={onEdit}
              onFeedback={onFeedback}
              onRegenerate={onRegenerate}
              onSpeak={onSpeak}
              onStopSpeaking={onStopSpeaking}
            />
          )}
        </div>
      </motion.div>
    );
  },
);

ChatMessage.displayName = "ChatMessage";
