"use client";

import React from 'react';
import { Card, Avatar, Skeleton } from '@heroui/react';

interface MessageSkeletonProps {
  isUser?: boolean;
  showAvatar?: boolean;
  lines?: number;
}

/**
 * Skeleton loader for ChatMessage components
 */
export const MessageSkeleton: React.FC<MessageSkeletonProps> = ({
  isUser = false,
  showAvatar = true,
  lines = 3
}) => {
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Skeleton */}
      {showAvatar && (
        <div className="flex-shrink-0 mt-1">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      )}

      {/* Message Content Skeleton */}
      <div className={`flex flex-col min-w-0 flex-1 max-w-2xl ${isUser ? 'items-end' : 'items-start'}`}>
        <Card className="w-full p-4">
          <div className="space-y-2">
            {Array.from({ length: lines }).map((_, index) => (
              <Skeleton
                key={index}
                className={`h-4 rounded ${
                  index === lines - 1 ? 'w-3/4' : 'w-full'
                }`}
              />
            ))}
          </div>
        </Card>
        
        {/* Metadata Skeleton */}
        <div className={`flex items-center gap-2 mt-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <Skeleton className="h-3 w-16 rounded" />
          {!isUser && <Skeleton className="h-5 w-20 rounded-full" />}
        </div>
      </div>
    </div>
  );
};