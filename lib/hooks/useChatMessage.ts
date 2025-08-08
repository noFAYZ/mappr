"use client";

import { useState, useCallback, useRef, useEffect } from "react";

import { CHAT_MESSAGE_CONFIG } from "@/lib/constants/chatMessage";

interface UseChatMessageProps {
  enableSpeech?: boolean;
  enableFeedback?: boolean;
  onError?: (error: Error) => void;
  onCopy?: (content: string) => void;
  onSpeak?: (content: string, messageId: string) => void;
  onFeedback?: (messageId: string, type: "positive" | "negative") => void;
}

interface UseChatMessageReturn {
  isPlaying: boolean;
  currentSpeechId: string | null;
  handleCopy: (content: string, messageId?: string) => Promise<void>;
  handleSpeak: (content: string, messageId: string) => void;
  handleStopSpeaking: () => void;
  handleFeedback: (messageId: string, type: "positive" | "negative") => void;
  handleRegenerate: (messageId: string, callback: () => void) => void;
  handleEdit: (
    messageId: string,
    content: string,
    callback: (id: string, content: string) => void,
  ) => void;
  isCurrentMessagePlaying: (messageId: string) => boolean;
  copyStatus: Map<string, "idle" | "copying" | "copied" | "error">;
  speechSupported: boolean;
  setSpeechRate: (rate: number) => void;
  setSpeechPitch: (pitch: number) => void;
  setSpeechVolume: (volume: number) => void;
}

export const useChatMessage = ({
  enableSpeech = true,
  enableFeedback = true,
  onError,
  onCopy,
  onSpeak,
  onFeedback,
}: UseChatMessageProps = {}): UseChatMessageReturn => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeechId, setCurrentSpeechId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<
    Map<string, "idle" | "copying" | "copied" | "error">
  >(new Map());
  const [speechRate, setSpeechRate] = useState(CHAT_MESSAGE_CONFIG.SPEECH_RATE);
  const [speechPitch, setSpeechPitch] = useState(
    CHAT_MESSAGE_CONFIG.SPEECH_PITCH,
  );
  const [speechVolume, setSpeechVolume] = useState(
    CHAT_MESSAGE_CONFIG.SPEECH_VOLUME,
  );

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechSupported && speechRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  // Enhanced copy handler with error handling and status tracking
  const handleCopy = useCallback(
    async (content: string, messageId?: string): Promise<void> => {
      const id = messageId || "default";

      try {
        setCopyStatus((prev) => new Map(prev.set(id, "copying")));

        if (!navigator.clipboard) {
          throw new Error("Clipboard API not supported");
        }

        // Sanitize content for copying
        const sanitizedContent = content
          .replace(/<[^>]*>/g, "") // Remove HTML tags
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"')
          .trim();

        await navigator.clipboard.writeText(sanitizedContent);

        setCopyStatus((prev) => new Map(prev.set(id, "copied")));
        onCopy?.(sanitizedContent);

        // Reset status after delay
        setTimeout(() => {
          setCopyStatus((prev) => new Map(prev.set(id, "idle")));
        }, 2000);
      } catch (error) {
        console.error("Copy failed:", error);
        setCopyStatus((prev) => new Map(prev.set(id, "error")));
        onError?.(error as Error);

        // Fallback: try legacy method
        try {
          const textArea = document.createElement("textarea");

          textArea.value = content;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand("copy");
          document.body.removeChild(textArea);

          setCopyStatus((prev) => new Map(prev.set(id, "copied")));
          setTimeout(() => {
            setCopyStatus((prev) => new Map(prev.set(id, "idle")));
          }, 2000);
        } catch (fallbackError) {
          console.error("Fallback copy failed:", fallbackError);
          setTimeout(() => {
            setCopyStatus((prev) => new Map(prev.set(id, "idle")));
          }, 2000);
        }
      }
    },
    [onCopy, onError],
  );

  // Enhanced speech handler with configuration options
  const handleSpeak = useCallback(
    (content: string, messageId: string): void => {
      if (!enableSpeech || !speechSupported) {
        onError?.(new Error("Speech synthesis not supported"));

        return;
      }

      try {
        // Stop any current speech
        window.speechSynthesis.cancel();

        // Limit content length for speech
        const textToSpeak =
          content.length > CHAT_MESSAGE_CONFIG.MAX_SPEECH_LENGTH
            ? content.substring(0, CHAT_MESSAGE_CONFIG.MAX_SPEECH_LENGTH) +
              "... content truncated for speech"
            : content;

        // Clean content for speech
        const cleanedContent = textToSpeak
          .replace(/<[^>]*>/g, "") // Remove HTML
          .replace(/```[\s\S]*?```/g, "code block") // Replace code blocks
          .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
          .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
          .replace(/`(.*?)`/g, "$1") // Remove inline code
          .replace(/#{1,6}\s/g, "") // Remove heading markers
          .replace(/\n+/g, ". ") // Replace line breaks with periods
          .replace(/\s+/g, " ") // Normalize whitespace
          .trim();

        const utterance = new SpeechSynthesisUtterance(cleanedContent);

        utterance.rate = speechRate;
        utterance.pitch = speechPitch;
        utterance.volume = speechVolume;

        utterance.onstart = () => {
          setIsPlaying(true);
          setCurrentSpeechId(messageId);
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setCurrentSpeechId(null);
        };

        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsPlaying(false);
          setCurrentSpeechId(null);
          onError?.(new Error(`Speech synthesis failed: ${event.error}`));
        };

        speechRef.current = utterance;
        window.speechSynthesis.speak(utterance);
        onSpeak?.(content, messageId);
      } catch (error) {
        console.error("Speech synthesis failed:", error);
        onError?.(error as Error);
      }
    },
    [
      enableSpeech,
      speechSupported,
      speechRate,
      speechPitch,
      speechVolume,
      onError,
      onSpeak,
    ],
  );

  const handleStopSpeaking = useCallback((): void => {
    if (speechSupported) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeechId(null);
    }
  }, [speechSupported]);

  const handleFeedback = useCallback(
    (messageId: string, type: "positive" | "negative"): void => {
      if (!enableFeedback) return;

      try {
        onFeedback?.(messageId, type);

        // Store feedback locally for analytics
        const feedbackData = {
          messageId,
          type,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        };

        // Store in localStorage for persistence
        const existingFeedback = JSON.parse(
          localStorage.getItem("chat_feedback") || "[]",
        );

        existingFeedback.push(feedbackData);

        // Keep only last 100 feedback entries
        if (existingFeedback.length > 100) {
          existingFeedback.splice(0, existingFeedback.length - 100);
        }

        localStorage.setItem("chat_feedback", JSON.stringify(existingFeedback));
      } catch (error) {
        console.error("Feedback submission failed:", error);
        onError?.(error as Error);
      }
    },
    [enableFeedback, onFeedback, onError],
  );

  const handleRegenerate = useCallback(
    (messageId: string, callback: () => void): void => {
      try {
        callback();
      } catch (error) {
        console.error("Message regeneration failed:", error);
        onError?.(error as Error);
      }
    },
    [onError],
  );

  const handleEdit = useCallback(
    (
      messageId: string,
      content: string,
      callback: (id: string, content: string) => void,
    ): void => {
      try {
        callback(messageId, content);
      } catch (error) {
        console.error("Message editing failed:", error);
        onError?.(error as Error);
      }
    },
    [onError],
  );

  const isCurrentMessagePlaying = useCallback(
    (messageId: string): boolean => {
      return isPlaying && currentSpeechId === messageId;
    },
    [isPlaying, currentSpeechId],
  );

  return {
    isPlaying,
    currentSpeechId,
    handleCopy,
    handleSpeak,
    handleStopSpeaking,
    handleFeedback,
    handleRegenerate,
    handleEdit,
    isCurrentMessagePlaying,
    copyStatus,
    speechSupported,
    setSpeechRate,
    setSpeechPitch,
    setSpeechVolume,
  };
};
