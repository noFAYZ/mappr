"use client";

import { Message } from "@/app/ai/components/types";

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWords?: boolean;
  includeMetadata?: boolean;
  roles?: Array<"user" | "assistant" | "system">;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  message: Message;
  matches: Array<{
    text: string;
    index: number;
    length: number;
  }>;
  score: number;
}

/**
 * Utility class for searching through chat messages
 */
export class MessageSearch {
  /**
   * Search messages with advanced options
   */
  static search(
    messages: Message[],
    query: string,
    options: SearchOptions = {},
  ): SearchResult[] {
    if (!query.trim()) return [];

    const {
      caseSensitive = false,
      wholeWords = false,
      includeMetadata = false,
      roles,
      dateRange,
    } = options;

    // Filter messages by criteria
    let filteredMessages = messages;

    if (roles?.length) {
      filteredMessages = filteredMessages.filter((msg) =>
        roles.includes(msg.role),
      );
    }

    if (dateRange) {
      filteredMessages = filteredMessages.filter((msg) => {
        const msgDate = new Date(msg.timestamp);

        return msgDate >= dateRange.start && msgDate <= dateRange.end;
      });
    }

    // Prepare search query
    const searchQuery = caseSensitive ? query : query.toLowerCase();
    const regex = wholeWords
      ? new RegExp(
          `\\b${this.escapeRegex(searchQuery)}\\b`,
          caseSensitive ? "g" : "gi",
        )
      : new RegExp(this.escapeRegex(searchQuery), caseSensitive ? "g" : "gi");

    // Search through messages
    const results: SearchResult[] = [];

    filteredMessages.forEach((message) => {
      const matches: Array<{ text: string; index: number; length: number }> =
        [];
      let score = 0;

      // Search in content
      const content = caseSensitive
        ? message.content
        : message.content.toLowerCase();
      let match;

      regex.lastIndex = 0;

      while ((match = regex.exec(content)) !== null) {
        matches.push({
          text: match[0],
          index: match.index,
          length: match[0].length,
        });
        score += 1;
      }

      // Search in metadata if enabled
      if (includeMetadata && message.metadata) {
        const metadataStr = JSON.stringify(message.metadata);
        const metadataContent = caseSensitive
          ? metadataStr
          : metadataStr.toLowerCase();

        regex.lastIndex = 0;
        while ((match = regex.exec(metadataContent)) !== null) {
          matches.push({
            text: match[0],
            index: match.index + message.content.length, // Offset for metadata
            length: match[0].length,
          });
          score += 0.5; // Lower score for metadata matches
        }
      }

      // Calculate relevance score
      if (matches.length > 0) {
        // Boost score for exact matches
        if (content.includes(searchQuery)) {
          score += 2;
        }

        // Boost score for matches at beginning of content
        if (content.startsWith(searchQuery)) {
          score += 1;
        }

        // Boost score for assistant messages (usually more informative)
        if (message.role === "assistant") {
          score += 0.5;
        }

        results.push({
          message,
          matches,
          score,
        });
      }
    });

    // Sort by relevance score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Highlight search matches in text
   */
  static highlightMatches(
    text: string,
    matches: Array<{ index: number; length: number }>,
    className: string = "bg-yellow-200 dark:bg-yellow-800",
  ): string {
    if (!matches.length) return text;

    // Sort matches by index (descending) to process from end to start
    const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

    let result = text;

    sortedMatches.forEach((match) => {
      const before = result.slice(0, match.index);
      const matchText = result.slice(match.index, match.index + match.length);
      const after = result.slice(match.index + match.length);

      result =
        before + `<mark class="${className}">${matchText}</mark>` + after;
    });

    return result;
  }

  /**
   * Get search suggestions based on message content
   */
  static getSuggestions(messages: Message[], partialQuery: string): string[] {
    if (!partialQuery.trim() || partialQuery.length < 2) return [];

    const suggestions = new Set<string>();
    const query = partialQuery.toLowerCase();

    messages.forEach((message) => {
      const words = message.content.toLowerCase().split(/\s+/);

      words.forEach((word) => {
        // Clean word (remove punctuation)
        const cleanWord = word.replace(/[^\w]/g, "");

        if (cleanWord.length >= 3 && cleanWord.startsWith(query)) {
          suggestions.add(cleanWord);
        }
      });
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Escape special regex characters
   */
  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\    return");
  }
}
