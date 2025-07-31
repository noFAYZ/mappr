"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Textarea } from '@heroui/input';
import { Avatar } from '@heroui/avatar';
import { Chip } from '@heroui/chip';
import { Divider } from '@heroui/divider';
import { ScrollShadow } from '@heroui/scroll-shadow';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Sparkles,
  BarChart3,
  TrendingUp,
  DollarSign,
  Wallet,
  AlertTriangle,
  Lightbulb,
  FileText
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useUIStore } from '@/stores';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    type?: 'text' | 'analysis' | 'insight' | 'recommendation';
    data?: any;
  };
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

const SuggestedPrompts = ({ onPromptSelect }) => {
  const prompts = [
    {
      icon: <BarChart3 className="w-4 h-4" />,
      title: "Portfolio Analysis",
      text: "Analyze my portfolio performance and suggest optimizations",
      category: "analysis"
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Market Insights",
      text: "What are the current market trends affecting my investments?",
      category: "insights"
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      title: "Financial Summary",
      text: "Give me a summary of my financial position across all accounts",
      category: "summary"
    },
    {
      icon: <Wallet className="w-4 h-4" />,
      title: "Crypto Analysis",
      text: "Analyze my crypto holdings and suggest rebalancing strategies",
      category: "crypto"
    },
    {
      icon: <AlertTriangle className="w-4 h-4" />,
      title: "Risk Assessment",
      text: "Assess the risk profile of my current portfolio",
      category: "risk"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Investment Ideas",
      text: "Based on my data, suggest new investment opportunities",
      category: "recommendations"
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-500" />
        Suggested Prompts
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {prompts.map((prompt, index) => (
          <Card 
            key={index}
            isPressable
            className="hover:scale-[1.02] transition-transform cursor-pointer"
            onPress={() => onPromptSelect(prompt.text)}
          >
            <CardBody className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg text-primary-600">
                  {prompt.icon}
                </div>
                <div>
                  <h4 className="font-medium text-sm">{prompt.title}</h4>
                  <p className="text-xs text-default-600 mt-1">{prompt.text}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MessageComponent = ({ message, onCopy, onFeedback }) => {
  const { profile } = useAuth();
  const isUser = message.role === 'user';

  const formatContent = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-default-100 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar
        src={isUser ? profile?.avatar_url : undefined}
        name={isUser ? profile?.full_name || 'You' : 'AI Assistant'}
        size="sm"
        className="flex-shrink-0"
        fallback={isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      />
      
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block p-4 rounded-2xl ${
          isUser 
            ? 'bg-primary-500 text-white' 
            : 'bg-default-100 text-foreground border'
        }`}>
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          
          {message.metadata?.type === 'analysis' && message.metadata.data && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(message.metadata.data).map(([key, value]) => (
                  <div key={key}>
                    <span className="opacity-75">{key}:</span>
                    <span className="ml-1 font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 mt-2 text-xs text-default-500 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          {!isUser && (
            <>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-6 h-6 min-w-6"
                onPress={() => onCopy(message.content)}
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-6 h-6 min-w-6"
                onPress={() => onFeedback(message.id, 'positive')}
              >
                <ThumbsUp className="w-3 h-3" />
              </Button>
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                className="w-6 h-6 min-w-6"
                onPress={() => onFeedback(message.id, 'negative')}
              >
                <ThumbsDown className="w-3 h-3" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AIPage() {
  const { user, profile } = useAuth();
  const { addNotification } = useUIStore();
  const queryClient = useQueryClient();
  
  const [currentMessage, setCurrentMessage] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const response = await fetch('/api/ai/conversations');
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const result = await response.json();
      return result.data;
    }
  });

  // Get current conversation
  const currentConversation = selectedConversation 
    ? conversations.find(c => c.id === selectedConversation)
    : null;

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, conversationId }: { message: string; conversationId?: string }) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message, 
          conversationId,
          context: {
            userId: user?.id,
            profileTier: profile?.tier,
            // Add more context as needed
          }
        })
      });
      
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      if (data.conversationId && !selectedConversation) {
        setSelectedConversation(data.conversationId);
      }
    },
    onError: (error) => {
      addNotification({
        type: 'error',
        title: 'Message Failed',
        message: error.message
      });
    }
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/ai/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Conversation' })
      });
      
      if (!response.ok) throw new Error('Failed to create conversation');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setSelectedConversation(data.data.id);
    }
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const response = await fetch(`/api/ai/conversations/${conversationId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete conversation');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      setSelectedConversation(null);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const message = currentMessage.trim();
    setCurrentMessage('');
    setIsTyping(true);

    try {
      await sendMessageMutation.mutateAsync({
        message,
        conversationId: selectedConversation || undefined
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setCurrentMessage(prompt);
    textareaRef.current?.focus();
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    addNotification({
      type: 'success',
      title: 'Copied',
      message: 'Message copied to clipboard'
    });
  };

  const handleMessageFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    try {
      await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, feedback })
      });
      
      addNotification({
        type: 'success',
        title: 'Feedback Sent',
        message: 'Thank you for your feedback!'
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Feedback Failed',
        message: 'Failed to send feedback'
      });
    }
  };

  const startNewConversation = () => {
    createConversationMutation.mutate();
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      
      {/* Sidebar - Conversations */}
      <div className="w-80 flex flex-col border-r border-default-200">
        <div className="p-4 border-b border-default-200">
          <Button
            color="primary"
            className="w-full"
            startContent={<Plus className="w-4 h-4" />}
            onPress={startNewConversation}
            isLoading={createConversationMutation.isLoading}
          >
            New Conversation
          </Button>
        </div>
        
        <ScrollShadow className="flex-1 p-2">
          {loadingConversations ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="p-3 bg-default-100 rounded-lg animate-pulse">
                  <div className="h-4 bg-default-200 rounded mb-2" />
                  <div className="h-3 bg-default-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <Card
                  key={conversation.id}
                  isPressable
                  className={`cursor-pointer ${
                    selectedConversation === conversation.id ? 'bg-primary-50 border-primary-200' : ''
                  }`}
                  onPress={() => setSelectedConversation(conversation.id)}
                >
                  <CardBody className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{conversation.title}</h4>
                        <p className="text-xs text-default-500 mt-1">
                          {conversation.messages?.length || 0} messages
                        </p>
                        <p className="text-xs text-default-400">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={(e) => {
                          e.stopPropagation();
                          deleteConversationMutation.mutate(conversation.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </ScrollShadow>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-default-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">AI Assistant</h2>
                <p className="text-sm text-default-500">
                  {currentConversation ? currentConversation.title : 'Start a new conversation'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Chip size="sm" color="success" variant="flat">
                Online
              </Chip>
              {profile?.tier && (
                <Chip size="sm" color="primary" variant="flat">
                  {profile.tier} Plan
                </Chip>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollShadow className="flex-1 p-4">
          {!currentConversation ? (
            <div className="h-full flex items-center justify-center">
              <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Welcome to AI Assistant</h2>
                  <p className="text-default-600">
                    I can help you analyze your financial data, provide insights, and answer questions about your portfolio.
                  </p>
                </div>
                
                <SuggestedPrompts onPromptSelect={handlePromptSelect} />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentConversation.messages?.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  onCopy={handleCopyMessage}
                  onFeedback={handleMessageFeedback}
                />
              ))}
              
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar
                    size="sm"
                    className="flex-shrink-0"
                    fallback={<Bot className="w-4 h-4" />}
                  />
                  <div className="bg-default-100 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-default-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-default-400 rounded-full animate-bounce delay-75" />
                      <div className="w-2 h-2 bg-default-400 rounded-full animate-bounce delay-150" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollShadow>

        {/* Input */}
        <div className="p-4 border-t border-default-200">
          <div className="flex gap-3">
            <Textarea
              ref={textareaRef}
              placeholder="Ask me anything about your financial data..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              variant="bordered"
              minRows={1}
              maxRows={4}
              className="flex-1"
              endContent={
                <Button
                  isIconOnly
                  color="primary"
                  variant="flat"
                  size="sm"
                  className="self-end mb-2"
                  onPress={handleSendMessage}
                  isDisabled={!currentMessage.trim() || sendMessageMutation.isLoading}
                  isLoading={sendMessageMutation.isLoading}
                >
                  <Send className="w-4 h-4" />
                </Button>
              }
            />
          </div>
          
          <div className="flex items-center justify-between mt-2 text-xs text-default-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span>
              Powered by GPT-4 • {profile?.tier || 'Free'} Plan
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}