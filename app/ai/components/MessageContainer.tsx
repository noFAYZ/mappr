"use client";

import React from 'react';
import { AnimatePresence } from 'framer-motion';

import { ChatMessage } from './index';
import { useChatMessage } from '@/lib/hooks/useChatMessage';
import { type Message } from './types';

interface MessageContainerProps {
  messages: Message[];
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  enableSpeech?: boolean;
  enableFeedback?: boolean;
  className?: string;
}

/**
 * Container component for managing multiple ChatMessage components
 * Handles shared state and interactions between messages
 */
export const MessageContainer: React.FC<MessageContainerProps> = ({
  messages,
  onRegenerate,
  onEdit,
  enableSpeech = true,
  enableFeedback = true,
  className
}) => {
  const {
    isPlaying,
    currentSpeechId,
    handleCopy,
    handleSpeak,
    handleStopSpeaking,
    handleFeedback,
    handleRegenerate,
    handleEdit,
    isCurrentMessagePlaying
  } = useChatMessage({
    enableSpeech,
    enableFeedback,
    onError: (error) => {
      console.error('ChatMessage error:', error);
    }
  });

  return (
    <div className={`space-y-6 ${className || ''}`}>
      <AnimatePresence mode="popLayout">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            onCopy={handleCopy}
            onSpeak={(content) => handleSpeak(content, message.id)}
            onStopSpeaking={handleStopSpeaking}
            onRegenerate={onRegenerate ? () => handleRegenerate(message.id, () => onRegenerate(message.id)) : undefined}
            onEdit={onEdit ? (id, content) => handleEdit(id, content, onEdit) : undefined}
            onFeedback={enableFeedback ? handleFeedback : undefined}
            isPlaying={isCurrentMessagePlaying(message.id)}
            showActions={true}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};