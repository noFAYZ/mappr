"use client";

import React from 'react';
import { Button, Tooltip, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { 
  Copy, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { type Message } from './types';

interface MessageActionsProps {
  message: Message;
  onCopy: (content: string) => void;
  onSpeak?: (content: string) => void;
  onStopSpeaking?: () => void;
  onRegenerate?: () => void;
  onEdit?: (id: string, content: string) => void;
  onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
  isPlaying?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = React.memo(({
  message,
  onCopy,
  onSpeak,
  onStopSpeaking,
  onRegenerate,
  onEdit,
  onFeedback,
  isPlaying = false
}) => {
  const handleCopy = () => {
    onCopy(message.content);
  };

  const handleSpeak = () => {
    if (isPlaying) {
      onStopSpeaking?.();
    } else {
      onSpeak?.(message.content);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
      >
        {/* Copy Button */}
        <Tooltip content="Copy message">
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
            onPress={handleCopy}
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>
        </Tooltip>

        {/* Speak Button */}
        {onSpeak && (
          <Tooltip content={isPlaying ? "Stop speaking" : "Read aloud"}>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              className="w-8 h-8 min-w-8 hover:bg-default-200 transition-colors"
              onPress={handleSpeak}
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </Button>
          </Tooltip>
        )}

        {/* Regenerate Button */}
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

        {/* Feedback Buttons */}
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

        {/* More Actions Dropdown */}
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
          <DropdownMenu aria-label="Message actions">
            <DropdownItem
              key="share"
              startContent={<Share2 className="w-4 h-4" />}
              onPress={() => {
                if (navigator.share) {
                  navigator.share({ text: message.content });
                }
              }}
            >
              Share
            </DropdownItem>
            <DropdownItem
              key="download"
              startContent={<Download className="w-4 h-4" />}
              onPress={() => {
                const blob = new Blob([message.content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `message-${message.id}.txt`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </DropdownItem>
            {onEdit ? (
              <DropdownItem
                key="edit"
                startContent={<Edit3 className="w-4 h-4" />}
                onPress={() => onEdit(message.id, message.content)}
              >
                Edit
              </DropdownItem>
            ) : null}
          </DropdownMenu>
        </Dropdown>
      </motion.div>
    </AnimatePresence>
  );
});

MessageActions.displayName = 'MessageActions';