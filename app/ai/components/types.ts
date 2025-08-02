export interface MessageAttachment {
    id: string;
    name: string;
    type: string;
    url: string;
    size?: number;
  }
  
  export interface MessageMetadata {
    type?: 'text' | 'analysis' | 'insight' | 'recommendation' | 'code' | 'mixed';
    model?: string;
    confidence?: number;
    data?: Record<string, any>;
    wordCount?: number;
    processingTime?: number;
    sources?: string[];
    insights?: string[];
    financialData?: {
      currencies: string[];
      percentages: string[];
      numbers: string[];
    };
    contentStats?: {
      hasCode: boolean;
      hasTable: boolean;
      hasFinancialData: boolean;
      hasMath: boolean;
      estimatedReadTime: number;
      codeLanguages: string[];
      headings: Array<{ level: number; text: string; id: string }>;
    };
  }
  
  export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: string;
    isStreaming?: boolean;
    isError?: boolean;
    attachments?: MessageAttachment[];
    metadata?: MessageMetadata;
  }
  
  export interface ChatMessageProps {
    message: Message;
    onCopy: (content: string) => void;
    onRegenerate?: () => void;
    onEdit?: (id: string, content: string) => void;
    onSpeak?: (content: string) => void;
    isPlaying?: boolean;
    onStopSpeaking?: () => void;
    onFeedback?: (messageId: string, type: 'positive' | 'negative') => void;
    showActions?: boolean;
    className?: string;
  }
  