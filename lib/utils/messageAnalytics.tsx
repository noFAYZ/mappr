"use client";

import { ChatMessageUtils } from "./chatMessage";

import { Message } from "@/app/ai/components/types";

export interface ConversationStats {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  systemMessages: number;
  totalWords: number;
  averageWordsPerMessage: number;
  longestMessage: {
    id: string;
    wordCount: number;
  };
  shortestMessage: {
    id: string;
    wordCount: number;
  };
  conversationDuration: number; // in minutes
  messagesPerHour: number;
  topKeywords: Array<{ word: string; count: number }>;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

/**
 * Analytics utility for chat message analysis
 */
export class MessageAnalytics {
  /**
   * Generate comprehensive conversation statistics
   */
  static generateStats(messages: Message[]): ConversationStats {
    if (!messages.length) {
      return this.getEmptyStats();
    }

    const userMessages = messages.filter((m) => m.role === "user");
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const systemMessages = messages.filter((m) => m.role === "system");

    // Word counts
    const wordCounts = messages.map((m) =>
      ChatMessageUtils.getWordCount(m.content),
    );
    const totalWords = wordCounts.reduce((sum, count) => sum + count, 0);
    const averageWordsPerMessage = totalWords / messages.length;

    // Longest and shortest messages
    const longestIndex = wordCounts.indexOf(Math.max(...wordCounts));
    const shortestIndex = wordCounts.indexOf(
      Math.min(...wordCounts.filter((c) => c > 0)),
    );

    // Conversation duration
    const firstMessage = new Date(messages[0].timestamp);
    const lastMessage = new Date(messages[messages.length - 1].timestamp);
    const conversationDuration =
      (lastMessage.getTime() - firstMessage.getTime()) / (1000 * 60);

    // Messages per hour
    const messagesPerHour =
      conversationDuration > 0
        ? (messages.length / conversationDuration) * 60
        : 0;

    // Top keywords
    const topKeywords = this.extractKeywords(messages);

    // Sentiment analysis
    const sentiment = this.analyzeSentiment(messages);

    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      systemMessages: systemMessages.length,
      totalWords,
      averageWordsPerMessage: Math.round(averageWordsPerMessage * 100) / 100,
      longestMessage: {
        id: messages[longestIndex].id,
        wordCount: wordCounts[longestIndex],
      },
      shortestMessage: {
        id: messages[shortestIndex]?.id || "",
        wordCount: wordCounts[shortestIndex] || 0,
      },
      conversationDuration: Math.round(conversationDuration * 100) / 100,
      messagesPerHour: Math.round(messagesPerHour * 100) / 100,
      topKeywords,
      sentiment,
    };
  }

  /**
   * Extract top keywords from messages
   */
  private static extractKeywords(
    messages: Message[],
  ): Array<{ word: string; count: number }> {
    const wordCounts = new Map<string, number>();
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "up",
      "about",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "among",
      "under",
      "over",
      "is",
      "am",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "should",
      "could",
      "can",
      "may",
      "might",
      "must",
      "shall",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "me",
      "him",
      "her",
      "us",
      "them",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
    ]);

    messages.forEach((message) => {
      const words = message.content
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 2 && !stopWords.has(word));

      words.forEach((word) => {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      });
    });

    return Array.from(wordCounts.entries())
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  /**
   * Simple sentiment analysis
   */
  private static analyzeSentiment(
    messages: Message[],
  ): ConversationStats["sentiment"] {
    const positiveWords = new Set([
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "awesome",
      "perfect",
      "love",
      "like",
      "enjoy",
      "happy",
      "pleased",
      "satisfied",
      "success",
      "successful",
      "effective",
      "efficient",
      "helpful",
      "useful",
      "valuable",
    ]);

    const negativeWords = new Set([
      "bad",
      "terrible",
      "awful",
      "horrible",
      "hate",
      "dislike",
      "frustrated",
      "angry",
      "disappointed",
      "sad",
      "upset",
      "annoyed",
      "problem",
      "issue",
      "error",
      "fail",
      "failed",
      "wrong",
      "broken",
      "useless",
      "difficult",
    ]);

    let positive = 0;
    let negative = 0;
    let neutral = 0;

    messages.forEach((message) => {
      const words = message.content.toLowerCase().split(/\s+/);
      let positiveCount = 0;
      let negativeCount = 0;

      words.forEach((word) => {
        const cleanWord = word.replace(/[^\w]/g, "");

        if (positiveWords.has(cleanWord)) positiveCount++;
        if (negativeWords.has(cleanWord)) negativeCount++;
      });

      if (positiveCount > negativeCount) {
        positive++;
      } else if (negativeCount > positiveCount) {
        negative++;
      } else {
        neutral++;
      }
    });

    return { positive, neutral, negative };
  }

  /**
   * Get empty stats structure
   */
  private static getEmptyStats(): ConversationStats {
    return {
      totalMessages: 0,
      userMessages: 0,
      assistantMessages: 0,
      systemMessages: 0,
      totalWords: 0,
      averageWordsPerMessage: 0,
      longestMessage: { id: "", wordCount: 0 },
      shortestMessage: { id: "", wordCount: 0 },
      conversationDuration: 0,
      messagesPerHour: 0,
      topKeywords: [],
      sentiment: { positive: 0, neutral: 0, negative: 0 },
    };
  }

  /**
   * Generate usage patterns analysis
   */
  static analyzeUsagePatterns(messages: Message[]): {
    hourlyDistribution: Array<{ hour: number; count: number }>;
    dailyDistribution: Array<{ day: string; count: number }>;
    peakUsageTime: string;
    averageSessionLength: number;
  } {
    const hourlyCount = new Array(24).fill(0);
    const dailyCount = new Map<string, number>();

    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const hour = date.getHours();
      const day = date.toLocaleDateString("en-US", { weekday: "long" });

      hourlyCount[hour]++;
      dailyCount.set(day, (dailyCount.get(day) || 0) + 1);
    });

    // Find peak usage hour
    const peakHour = hourlyCount.indexOf(Math.max(...hourlyCount));
    const peakUsageTime = `${peakHour}:00 - ${peakHour + 1}:00`;

    // Calculate average session length (time between first and last message in conversation)
    const averageSessionLength =
      messages.length > 1
        ? (new Date(messages[messages.length - 1].timestamp).getTime() -
            new Date(messages[0].timestamp).getTime()) /
          (1000 * 60)
        : 0;

    return {
      hourlyDistribution: hourlyCount.map((count, hour) => ({ hour, count })),
      dailyDistribution: Array.from(dailyCount.entries()).map(
        ([day, count]) => ({ day, count }),
      ),
      peakUsageTime,
      averageSessionLength: Math.round(averageSessionLength * 100) / 100,
    };
  }
}
