"use client";

import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';


interface UseChatMessageOptions {
  enableSpeech?: boolean;
  enableCopy?: boolean;
  enableFeedback?: boolean;
  onError?: (error: Error) => void;
}

export const useChatMessage = (options: UseChatMessageOptions = {}) => {
  const {
    enableSpeech = true,
    enableCopy = true,
    enableFeedback = true,
    onError
  } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeechId, setCurrentSpeechId] = useState<string | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Copy to clipboard functionality
  const handleCopy = useCallback(async (content: string) => {
    if (!enableCopy) return;

    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
        toast.success('Copied to clipboard');
      } catch (fallbackError) {
        toast.error('Failed to copy to clipboard');
        onError?.(new Error('Copy failed'));
      }
    }
  }, [enableCopy, onError]);

  // Speech synthesis functionality
  const handleSpeak = useCallback((content: string, messageId?: string) => {
    if (!enableSpeech) return;

    try {
      // Stop current speech if playing
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentSpeechId(null);
        return;
      }

      // Clean content for speech
      const cleanContent = content
        .replace(/[#*`_~\[\]()]/g, '') // Remove markdown
        .replace(/https?:\/\/[^\s]+/g, 'link') // Replace URLs
        .replace(/\n+/g, '. ') // Replace line breaks
        .trim();

      if (!cleanContent) {
        toast.error('No content to read');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanContent);
      speechSynthesisRef.current = utterance;

      // Configure speech
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;

      // Set voice preference (use first available English voice)
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setCurrentSpeechId(messageId || null);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setCurrentSpeechId(null);
        speechSynthesisRef.current = null;
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setCurrentSpeechId(null);
        speechSynthesisRef.current = null;
        toast.error('Speech synthesis failed');
        onError?.(new Error('Speech synthesis failed'));
      };

      // Start speaking
      window.speechSynthesis.speak(utterance);
      
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast.error('Speech not supported');
      onError?.(new Error('Speech synthesis not supported'));
    }
  }, [enableSpeech, isPlaying, onError]);

  // Stop speaking
  const handleStopSpeaking = useCallback(() => {
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setCurrentSpeechId(null);
      speechSynthesisRef.current = null;
    }
  }, []);

  // Feedback functionality
  const handleFeedback = useCallback(async (messageId: string, type: 'positive' | 'negative') => {
    if (!enableFeedback) return;

    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, type, timestamp: new Date().toISOString() })
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      toast.success(
        type === 'positive' 
          ? 'Thank you for the positive feedback!' 
          : 'Thank you for the feedback. We\'ll work to improve.'
      );
    } catch (error) {
      console.error('Feedback submission failed:', error);
      toast.error('Failed to submit feedback');
      onError?.(new Error('Feedback submission failed'));
    }
  }, [enableFeedback, onError]);

  // Regenerate message
  const handleRegenerate = useCallback(async (messageId: string, onRegenerate?: () => void) => {
    try {
      if (onRegenerate) {
        onRegenerate();
      } else {
        // Default regeneration logic
        const response = await fetch('/api/ai/regenerate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId })
        });

        if (!response.ok) {
          throw new Error('Failed to regenerate message');
        }

        toast.success('Regenerating response...');
      }
    } catch (error) {
      console.error('Regeneration failed:', error);
      toast.error('Failed to regenerate message');
      onError?.(new Error('Message regeneration failed'));
    }
  }, [onError]);

  // Edit message
  const handleEdit = useCallback((messageId: string, content: string, onEdit?: (id: string, content: string) => void) => {
    try {
      if (onEdit) {
        onEdit(messageId, content);
      } else {
        // Default edit logic - could open a modal or inline editor
        toast.info('Edit functionality not implemented');
      }
    } catch (error) {
      console.error('Edit failed:', error);
      toast.error('Failed to edit message');
      onError?.(new Error('Message edit failed'));
    }
  }, [onError]);

  return {
    // State
    isPlaying,
    currentSpeechId,
    
    // Actions
    handleCopy,
    handleSpeak,
    handleStopSpeaking,
    handleFeedback,
    handleRegenerate,
    handleEdit,
    
    // Utilities
    isCurrentMessagePlaying: (messageId?: string) => isPlaying && currentSpeechId === messageId
  };
};