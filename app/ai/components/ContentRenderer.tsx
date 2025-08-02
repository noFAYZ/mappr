"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Chip, Spinner } from '@heroui/react';
import { 
  FileText, 
  BarChart3, 
  Lightbulb, 
  Target, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Code
} from 'lucide-react';
import clsx from 'clsx';

import { ErrorBoundary } from './ErrorBoundary';
import { type Message } from './types';
import { ContentParserService } from '@/lib/services/contentParser';

interface ContentRendererProps {
  content: string;
  metadata?: Message['metadata'];
  isError?: boolean;
}

interface ParsedContent {
  html: string;
  metadata: {
    hasCode: boolean;
    hasTable: boolean;
    hasFinancialData: boolean;
    hasMath: boolean;
    estimatedReadTime: number;
    contentType: 'text' | 'analysis' | 'code' | 'mixed';
    wordCount: number;
    headings: Array<{ level: number; text: string; id: string }>;
    codeLanguages: string[];
  };
  insights: string[];
  financialData?: {
    currencies: string[];
    percentages: string[];
    numbers: string[];
  };
}

export const ContentRenderer: React.FC<ContentRendererProps> = React.memo(({
  content,
  metadata,
  isError = false
}) => {
  const [parsedContent, setParsedContent] = useState<ParsedContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize parsing to prevent unnecessary re-renders
  const { shouldParse, contentHash } = useMemo(() => {
    const hash = btoa(content).slice(0, 10); // Simple content hash
    return {
      shouldParse: content?.trim().length > 0,
      contentHash: hash
    };
  }, [content]);

  useEffect(() => {
    if (!shouldParse) {
      setIsLoading(false);
      return;
    }

    const parseContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Parse content with enhanced error handling
        const parsed = await ContentParserService.parseContent(content);
        const insights = ContentParserService.extractInsights(content);
        const financialData = ContentParserService.extractFinancialData(content);
        
        setParsedContent({
          ...parsed,
          insights,
          financialData
        });
      } catch (err) {
        console.error('Content parsing failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to parse content');
        
        // Fallback to simple rendering
        setParsedContent({
          html: `<div class="text-default-700 dark:text-default-300 leading-relaxed text-sm">${content.replace(/\n/g, '<br>')}</div>`,
          metadata: {
            hasCode: false,
            hasTable: false,
            hasFinancialData: false,
            hasMath: false,
            estimatedReadTime: Math.max(1, Math.ceil(content.split(/\s+/).length / 250)),
            contentType: 'text',
            wordCount: content.split(/\s+/).length,
            headings: [],
            codeLanguages: []
          },
          insights: [],
          financialData: { currencies: [], percentages: [], numbers: [] }
        });
      } finally {
        setIsLoading(false);
      }
    };

    parseContent();
  }, [content, shouldParse, contentHash]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Spinner size="sm" color="primary" />
        <div className="animate-pulse space-y-2 flex-1">
          <div className="h-4 bg-default-200 rounded w-3/4"></div>
          <div className="h-4 bg-default-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !parsedContent) {
    return (
      <div className="flex items-center gap-2 p-3 bg-danger-50 dark:bg-danger-900/20 rounded-lg border border-danger-200">
        <AlertTriangle className="w-4 h-4 text-danger-500 flex-shrink-0" />
        <div className="text-danger-600 dark:text-danger-400 text-sm">
          {error}
          <button 
            onClick={() => window.location.reload()} 
            className="ml-2 underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!parsedContent) {
    return null;
  }

  const readingTime = Math.max(1, Math.ceil(parsedContent.metadata.wordCount / 250));

  return (
    <ErrorBoundary>
      <div className="space-y-3">
        {/* Content Type Indicator */}
        {parsedContent.metadata.contentType !== 'text' && (
          <div className="flex items-center gap-2 pb-2 border-b border-default-100">
            <Chip 
              size="sm" 
              variant="flat" 
              color="primary" 
              startContent={getContentIcon(parsedContent.metadata.contentType)}
              className="h-6"
            >
              {parsedContent.metadata.contentType}
            </Chip>
            
            {parsedContent.metadata.hasCode && (
              <Chip 
                size="sm" 
                variant="flat" 
                color="secondary" 
                startContent={<Code className="w-3 h-3" />}
                className="h-6"
              >
                {parsedContent.metadata.codeLanguages.length > 0 
                  ? parsedContent.metadata.codeLanguages.join(', ')
                  : 'Code'
                }
              </Chip>
            )}
            
            <Chip 
              size="sm" 
              variant="flat" 
              color="default"
              startContent={<Clock className="w-3 h-3" />}
              className="h-6"
            >
              {readingTime} min read
            </Chip>
          </div>
        )}

        {/* Main Content */}
        <div 
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: parsedContent.html }}
        />

        {/* Insights Section */}
        {parsedContent.insights.length > 0 && (
          <InsightsCard insights={parsedContent.insights} />
        )}

        {/* Financial Data Summary */}
        {parsedContent.metadata.hasFinancialData && parsedContent.financialData && (
          <FinancialDataCard financialData={parsedContent.financialData} />
        )}

        {/* Analysis Summary */}
        {metadata?.type === 'analysis' && metadata.data && (
          <AnalysisCard data={metadata.data} />
        )}

        {/* Recommendation Card */}
        {metadata?.type === 'recommendation' && (
          <RecommendationCard />
        )}
      </div>
    </ErrorBoundary>
  );
});

ContentRenderer.displayName = 'ContentRenderer';

// Helper function to get content type icon
function getContentIcon(contentType: string) {
  switch (contentType) {
    case 'analysis':
      return <BarChart3 className="w-3 h-3" />;
    case 'code':
      return <Code className="w-3 h-3" />;
    case 'mixed':
      return <FileText className="w-3 h-3" />;
    default:
      return <FileText className="w-3 h-3" />;
  }
}

// Insights Card Component
const InsightsCard: React.FC<{ insights: string[] }> = ({ insights }) => (
  <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800">
    <div className="flex items-center gap-2 mb-2">
      <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Key Insights</span>
    </div>
    <div className="space-y-1.5">
      {insights.slice(0, 3).map((insight, index) => (
        <div key={index} className="flex items-start gap-2">
          <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span className="text-blue-700 dark:text-blue-300 text-xs leading-relaxed">{insight}</span>
        </div>
      ))}
    </div>
  </Card>
);

// Financial Data Card Component
const FinancialDataCard: React.FC<{ 
  financialData: { currencies: string[]; percentages: string[]; numbers: string[] } 
}> = ({ financialData }) => (
  <Card className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
    <div className="flex items-center gap-2 mb-2">
      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      <span className="font-semibold text-emerald-800 dark:text-emerald-200 text-sm">Financial Data</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
      {financialData.currencies.length > 0 && (
        <div className="text-emerald-700 dark:text-emerald-300">
          <span className="font-medium">Currencies:</span> {financialData.currencies.slice(0, 3).join(', ')}
        </div>
      )}
      {financialData.percentages.length > 0 && (
        <div className="text-emerald-700 dark:text-emerald-300">
          <span className="font-medium">Changes:</span> {financialData.percentages.slice(0, 3).join(', ')}
        </div>
      )}
    </div>
  </Card>
);

// Analysis Card Component
const AnalysisCard: React.FC<{ data: Record<string, any> }> = ({ data }) => (
  <Card className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-purple-200 dark:border-purple-800">
    <div className="flex items-center gap-2 mb-2">
      <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
      <span className="font-semibold text-purple-800 dark:text-purple-200 text-sm">Analysis Summary</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(data).slice(0, 4).map(([key, value]) => (
        <div key={key} className="flex justify-between items-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
          <span className="text-purple-700 dark:text-purple-300 font-medium text-xs uppercase tracking-wide">
            {key}:
          </span>
          <span className="font-bold text-purple-900 dark:text-purple-100 text-xs">
            {String(value)}
          </span>
        </div>
      ))}
    </div>
  </Card>
);

// Recommendation Card Component
const RecommendationCard: React.FC = () => (
  <Card className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
    <div className="flex items-center gap-2">
      <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
      <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">AI Recommendation</span>
    </div>
  </Card>
);