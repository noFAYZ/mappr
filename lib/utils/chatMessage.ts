"use client";

import { Message } from "@/app/ai/components/types";

/**
 * Utility functions for ChatMessage components
 */
export class ChatMessageUtils {
  /**
   * Format message timestamp with relative time
   */
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 1) return "just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);

      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInDays < 7) return `${diffInDays}d ago`;

      // For older messages, show date
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...(diffInDays > 365 && { year: "numeric" }),
      });
    } catch (error) {
      console.error("Invalid timestamp:", timestamp);

      return "unknown";
    }
  }

  /**
   * Get message display name based on role
   */
  static getDisplayName(message: Message, userName?: string): string {
    switch (message.role) {
      case "user":
        return userName || "You";
      case "assistant":
        return "Mappr AI";
      case "system":
        return "System";
      default:
        return "Unknown";
    }
  }

  /**
   * Determine if message should show actions
   */
  static shouldShowActions(message: Message): boolean {
    return (
      message.role === "assistant" &&
      !message.isStreaming &&
      !message.isError &&
      message.content.trim().length > 0
    );
  }

  /**
   * Extract message preview for notifications/summaries
   */
  static getMessagePreview(content: string, maxLength: number = 150): string {
    // Remove markdown and special characters
    const cleaned = content
      .replace(/[#*`_~\[\]()]/g, "")
      .replace(/\n+/g, " ")
      .trim();

    if (cleaned.length <= maxLength) return cleaned;

    // Try to break at word boundary
    const truncated = cleaned.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(" ");

    if (lastSpaceIndex > maxLength * 0.8) {
      return truncated.substring(0, lastSpaceIndex) + "...";
    }

    return truncated + "...";
  }

  /**
   * Validate message structure
   */
  static validateMessage(message: any): message is Message {
    return (
      typeof message === "object" &&
      message !== null &&
      typeof message.id === "string" &&
      typeof message.role === "string" &&
      ["user", "assistant", "system"].includes(message.role) &&
      typeof message.content === "string" &&
      typeof message.timestamp === "string"
    );
  }

  /**
   * Get message word count
   */
  static getWordCount(content: string): number {
    return content.split(/\s+/).filter((word) => word.length > 0).length;
  }

  /**
   * Estimate reading time in minutes
   */
  static getReadingTime(content: string): number {
    const wordCount = this.getWordCount(content);

    return Math.max(1, Math.ceil(wordCount / 250)); // 250 words per minute average
  }

  /**
   * Check if message contains sensitive information
   */
  static containsSensitiveInfo(content: string): boolean {
    const sensitivePatterns = [
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/, // Phone
    ];

    return sensitivePatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Generate message export data
   */
  static exportMessage(message: Message): string {
    const timestamp = this.formatTimestamp(message.timestamp);
    const role = message.role.charAt(0).toUpperCase() + message.role.slice(1);

    let exportText = `${role} (${timestamp}):\n${message.content}\n`;

    if (message.attachments?.length) {
      exportText += `\nAttachments: ${message.attachments.map((a) => a.name).join(", ")}\n`;
    }

    if (message.metadata?.model) {
      exportText += `\nModel: ${message.metadata.model}\n`;
    }

    return exportText + "\n" + "-".repeat(50) + "\n";
  }
}
