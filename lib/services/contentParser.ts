// lib/services/contentParser.ts
"use client";

import { CHAT_MESSAGE_CONFIG } from '@/lib/constants/chatMessage';

// ===== TYPE DEFINITIONS =====
interface ParsedContent {
  html: string;
  metadata: {
    hasCode: boolean;
    hasTable: boolean;
    hasFinancialData: boolean;
    hasMath: boolean;
    estimatedReadTime: number;
    contentType: 'text' | 'analysis' | 'code' | 'mixed' | 'financial';
    wordCount: number;
    headings: Array<{ level: number; text: string; id: string }>;
    codeLanguages: string[];
    complexity: 'low' | 'medium' | 'high';
    sentiment: 'positive' | 'neutral' | 'negative';
    topics: string[];
  };
  insights: string[];
  financialData?: {
    currencies: string[];
    percentages: string[];
    numbers: string[];
    metrics: string[];
  };
}

interface ContentBlock {
  type: 'text' | 'code' | 'table' | 'list' | 'heading' | 'quote' | 'math' | 'financial' | 'callout';
  content: string;
  language?: string;
  level?: number;
  metadata?: Record<string, any>;
}

// ===== ENTERPRISE CONTENT PARSER =====
export class ContentParserService {
  private static readonly FINANCIAL_KEYWORDS = new Set([
    'portfolio', 'investment', 'roi', 'return', 'profit', 'loss', 'dividend',
    'allocation', 'diversification', 'risk', 'beta', 'alpha', 'sharpe',
    'volatility', 'yield', 'nasdaq', 'sp500', 'dow', 'etf', 'fund', 'asset',
    'valuation', 'market cap', 'price', 'value', 'growth', 'income', 'stock',
    'crypto', 'bitcoin', 'ethereum', 'defi', 'trading', 'volume', 'cap',
    'bullish', 'bearish', 'rally', 'correction', 'recession', 'inflation'
  ]);

  private static readonly FINANCIAL_METRICS = new Set([
    'P/E', 'P/B', 'ROI', 'ROE', 'EBITDA', 'EPS', 'YTD', 'YoY', 'QoQ', 'MoM',
    'Sharpe ratio', 'beta', 'alpha', 'standard deviation', 'correlation',
    'VaR', 'maximum drawdown', 'volatility', 'liquidity ratio'
  ]);

  private static readonly PATTERNS = {
    // Enhanced financial patterns
    currency: /(?:\$|USD|EUR|GBP|JPY|CAD|AUD|CHF|CNY)[\s]?[\d,]+(?:\.?\d*)?(?:[BMK])?/gi,
    percentage: /[+-]?\d+(?:\.\d+)?%/g,
    financialNumber: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?(?:\s?(?:[BMK]|billion|million|thousand))?/gi,
    
    // Code patterns
    codeBlock: /```(\w*)\n?([\s\S]*?)```/g,
    inlineCode: /`([^`\n]+)`/g,
    
    // Markdown patterns
    bold: /\*\*([^*\n]+?)\*\*/g,
    italic: /\*([^*\n]+?)\*/g,
    strikethrough: /~~([^~\n]+?)~~/g,
    
    // Structure patterns
    headers: /^(#{1,6})\s+(.+)$/gm,
    numberedList: /^(\s*)(\d+)\.\s+(.+)$/gm,
    bulletList: /^(\s*)[-*+]\s+(.+)$/gm,
    table: /\|(.+)\|\s*\n\|([:|\\-]+)\|\s*\n((?:\|.+\|\s*\n?)*)/g,
    
    // Special elements
    blockquote: /^>\s*(.+)$/gm,
    callout: /^(⚠️|❗|💡|📊|🎯|✅|❌|🔍|📈|📉|🚫|💰|🏦|📋)\s+(.+)$/gm,
    mathBlock: /\$\$([\s\S]*?)\$\$/g,
    mathInline: /\$([^$\n]+)\$/g,
    
    // Links
    links: /\[([^\]]+)\]\(([^)]+)\)/g,
    autoLinks: /(https?:\/\/[^\s]+)/g,
    
    // Cleanup patterns
    artifacts: /\[\/?(INST|ASS|SYS|USER|ASSISTANT)\]/g,
    prefixes: /^(Human:|Assistant:|AI:|User:)\s*/gm,
    tokens: /^\s*<\|.*?\|>\s*/gm,
    multiNewlines: /\n{3,}/g
  };

  private static cacheMap = new Map<string, ParsedContent>();
  private static processingQueue = new Map<string, Promise<ParsedContent>>();

  /**
   * Main parsing function with caching and performance optimization
   */
  static async parseContent(content: string): Promise<ParsedContent> {
    if (!content?.trim()) {
      return this.getEmptyResult();
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(content);
    const cached = this.cacheMap.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if already processing
    const existingPromise = this.processingQueue.get(cacheKey);
    if (existingPromise) {
      return existingPromise;
    }

    // Create new parsing promise
    const parsePromise = this.performParsing(content);
    this.processingQueue.set(cacheKey, parsePromise);

    try {
      const result = await parsePromise;
      
      // Cache result
      this.cacheMap.set(cacheKey, result);
      this.cleanupCache();
      
      return result;
    } finally {
      this.processingQueue.delete(cacheKey);
    }
  }

  /**
   * Perform the actual content parsing
   */
  private static async performParsing(content: string): Promise<ParsedContent> {
    return new Promise((resolve, reject) => {
      // Use timeout to prevent blocking
      const timeoutId = setTimeout(() => {
        reject(new Error('Parsing timeout'));
      }, CHAT_MESSAGE_CONFIG.RENDER_TIMEOUT);

      try {
        // Clean content
        const cleaned = this.cleanContent(content);
        
        // Parse into blocks
        const blocks = this.parseIntoBlocks(cleaned);
        
        // Generate metadata
        const metadata = this.generateMetadata(cleaned, blocks);
        
        // Render HTML
        const html = this.renderBlocks(blocks);
        
        // Extract insights and financial data
        const insights = this.extractInsights(cleaned);
        const financialData = this.extractFinancialData(cleaned);

        clearTimeout(timeoutId);
        resolve({
          html: this.sanitizeHTML(html),
          metadata,
          insights,
          financialData
        });
      } catch (error) {
        clearTimeout(timeoutId);
        console.warn('Content parsing failed, using fallback:', error);
        resolve(this.getFallbackResult(content));
      }
    });
  }

  /**
   * Parse content into structured blocks
   */
  private static parseIntoBlocks(content: string): ContentBlock[] {
    const blocks: ContentBlock[] = [];
    let workingContent = content;

    // Extract code blocks first (preserve them)
    const codeBlocks: { placeholder: string; block: ContentBlock }[] = [];
    workingContent = workingContent.replace(this.PATTERNS.codeBlock, (match, language, code) => {
      const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push({
        placeholder,
        block: {
          type: 'code',
          content: code.trim(),
          language: language || 'text'
        }
      });
      return placeholder;
    });

    // Extract math blocks
    const mathBlocks: { placeholder: string; block: ContentBlock }[] = [];
    workingContent = workingContent.replace(this.PATTERNS.mathBlock, (match, formula) => {
      const placeholder = `__MATH_BLOCK_${mathBlocks.length}__`;
      mathBlocks.push({
        placeholder,
        block: {
          type: 'math',
          content: formula.trim()
        }
      });
      return placeholder;
    });

    // Extract tables
    const tableBlocks: { placeholder: string; block: ContentBlock }[] = [];
    workingContent = workingContent.replace(this.PATTERNS.table, (match, header, separator, rows) => {
      const placeholder = `__TABLE_BLOCK_${tableBlocks.length}__`;
      tableBlocks.push({
        placeholder,
        block: {
          type: 'table',
          content: match,
          metadata: {
            headers: header.split('|').map(h => h.trim()).filter(Boolean),
            rowCount: rows.split('\n').filter(row => row.trim()).length
          }
        }
      });
      return placeholder;
    });

    // Split remaining content into paragraphs and process
    const paragraphs = workingContent.split('\n\n').filter(p => p.trim());
    
    paragraphs.forEach(paragraph => {
      const trimmed = paragraph.trim();
      
      // Check for placeholders
      if (trimmed.startsWith('__CODE_BLOCK_')) {
        const codeBlock = codeBlocks.find(cb => cb.placeholder === trimmed);
        if (codeBlock) blocks.push(codeBlock.block);
      } else if (trimmed.startsWith('__MATH_BLOCK_')) {
        const mathBlock = mathBlocks.find(mb => mb.placeholder === trimmed);
        if (mathBlock) blocks.push(mathBlock.block);
      } else if (trimmed.startsWith('__TABLE_BLOCK_')) {
        const tableBlock = tableBlocks.find(tb => tb.placeholder === trimmed);
        if (tableBlock) blocks.push(tableBlock.block);
      } else {
        // Process other content types
        this.processTextBlock(trimmed, blocks);
      }
    });

    return blocks;
  }

  /**
   * Process text blocks for headings, lists, quotes, etc.
   */
  private static processTextBlock(text: string, blocks: ContentBlock[]): void {
    const lines = text.split('\n');
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check for headings
      const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        blocks.push({
          type: 'heading',
          content: headerMatch[2],
          level: headerMatch[1].length
        });
        return;
      }

      // Check for lists
      const listMatch = trimmed.match(/^(\s*)[-*+]\s+(.+)$/) || trimmed.match(/^(\s*)(\d+)\.\s+(.+)$/);
      if (listMatch) {
        blocks.push({
          type: 'list',
          content: listMatch[listMatch.length - 1],
          metadata: { indent: listMatch[1]?.length || 0 }
        });
        return;
      }

      // Check for blockquotes
      const quoteMatch = trimmed.match(/^>\s*(.+)$/);
      if (quoteMatch) {
        blocks.push({
          type: 'quote',
          content: quoteMatch[1]
        });
        return;
      }

      // Check for callouts
      const calloutMatch = trimmed.match(/^(⚠️|❗|💡|📊|🎯|✅|❌|🔍|📈|📉|🚫|💰|🏦|📋)\s+(.+)$/);
      if (calloutMatch) {
        blocks.push({
          type: 'callout',
          content: calloutMatch[2],
          metadata: { icon: calloutMatch[1] }
        });
        return;
      }

      // Regular text
      blocks.push({
        type: 'text',
        content: trimmed
      });
    });
  }

  /**
   * Generate comprehensive metadata
   */
  private static generateMetadata(content: string, blocks: ContentBlock[]): ParsedContent['metadata'] {
    const hasCode = blocks.some(b => b.type === 'code');
    const hasTable = blocks.some(b => b.type === 'table');
    const hasMath = blocks.some(b => b.type === 'math');
    
    const codeLanguages = blocks
      .filter(b => b.type === 'code' && b.language)
      .map(b => b.language!)
      .filter((lang, index, arr) => arr.indexOf(lang) === index);

    const headings = blocks
      .filter(b => b.type === 'heading')
      .map(b => ({
        level: b.level!,
        text: b.content,
        id: this.generateId(b.content)
      }));

    const hasFinancialData = this.detectFinancialContent(content);
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 250));

    // Determine content type
    let contentType: ParsedContent['metadata']['contentType'] = 'text';
    if (hasFinancialData) contentType = 'financial';
    else if (hasCode && hasTable) contentType = 'mixed';
    else if (hasCode) contentType = 'code';
    else if (hasTable || hasMath) contentType = 'analysis';

    // Analyze complexity
    const complexity = this.analyzeComplexity(content, blocks);
    
    // Analyze sentiment and topics
    const { sentiment, topics } = this.analyzeContentSemantic(content);

    return {
      hasCode,
      hasTable,
      hasFinancialData,
      hasMath,
      estimatedReadTime,
      contentType,
      wordCount,
      headings,
      codeLanguages,
      complexity,
      sentiment,
      topics
    };
  }

  /**
   * Render blocks to HTML
   */
  private static renderBlocks(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading':
          const id = this.generateId(block.content);
          return `<h${block.level} id="${id}" class="text-lg font-semibold mb-3 mt-4 text-foreground scroll-mt-4">${this.escapeHtml(block.content)}</h${block.level}>`;
        
        case 'code':
          return this.renderCodeBlock(block);
        
        case 'table':
          return this.renderTable(block);
        
        case 'math':
          return `<div class="my-4 p-4 bg-primary-50 dark:bg-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800">
            <code class="text-primary-800 dark:text-primary-200 font-mono">${this.escapeHtml(block.content)}</code>
          </div>`;
        
        case 'list':
          return `<li class="ml-4 mb-2 text-sm text-foreground">• ${this.processInlineFormatting(block.content)}</li>`;
        
        case 'quote':
          return `<blockquote class="border-l-4 border-default-300 pl-4 py-2 my-3 bg-default-50 dark:bg-default-950/20 italic text-default-600 dark:text-default-400">
            ${this.processInlineFormatting(block.content)}
          </blockquote>`;
        
        case 'callout':
          return this.renderCallout(block);
        
        case 'text':
        default:
          return `<p class="mb-3 text-sm leading-relaxed text-foreground">${this.processInlineFormatting(block.content)}</p>`;
      }
    }).join('\n');
  }

  /**
   * Render code block with syntax highlighting
   */
  private static renderCodeBlock(block: ContentBlock): string {
    const language = block.language || 'text';
    const languageLabel = language.charAt(0).toUpperCase() + language.slice(1);
    
    return `
      <div class="my-4 rounded-lg overflow-hidden border border-default-200 dark:border-default-700">
        <div class="bg-default-100 dark:bg-default-800 px-4 py-2 text-sm font-medium text-default-600 dark:text-default-400 border-b border-default-200 dark:border-default-700 flex items-center justify-between">
          <span>${languageLabel}</span>
          <button class="text-xs text-default-500 hover:text-default-700 dark:hover:text-default-300" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">
            Copy
          </button>
        </div>
        <pre class="bg-default-50 dark:bg-default-900 p-4 overflow-x-auto"><code class="text-sm font-mono text-default-800 dark:text-default-200">${this.escapeHtml(block.content)}</code></pre>
      </div>
    `;
  }

  /**
   * Render table with proper styling
   */
  private static renderTable(block: ContentBlock): string {
    return `<div class="my-4 overflow-x-auto">
      <table class="min-w-full border border-default-200 dark:border-default-700 rounded-lg overflow-hidden">
        ${block.content.replace(/\|/g, '<td class="px-3 py-2 border-b border-default-200 dark:border-default-700 text-sm">').replace(/\n/g, '</td></tr><tr>')}
      </table>
    </div>`;
  }

  /**
   * Render callout with appropriate styling
   */
  private static renderCallout(block: ContentBlock): string {
    const icon = block.metadata?.icon || '💡';
    const colorClass = this.getCalloutColor(icon);
    
    return `<div class="my-4 p-4 rounded-lg ${colorClass} border-l-4">
      <div class="flex items-start gap-3">
        <span class="text-lg flex-shrink-0">${icon}</span>
        <div class="text-sm">${this.processInlineFormatting(block.content)}</div>
      </div>
    </div>`;
  }

  /**
   * Get callout color based on icon
   */
  private static getCalloutColor(icon: string): string {
    const colorMap: Record<string, string> = {
      '⚠️': 'bg-warning-50 dark:bg-warning-950/20 border-warning-500',
      '❗': 'bg-danger-50 dark:bg-danger-950/20 border-danger-500',
      '💡': 'bg-primary-50 dark:bg-primary-950/20 border-primary-500',
      '📊': 'bg-success-50 dark:bg-success-950/20 border-success-500',
      '🎯': 'bg-secondary-50 dark:bg-secondary-950/20 border-secondary-500',
      '✅': 'bg-success-50 dark:bg-success-950/20 border-success-500',
      '❌': 'bg-danger-50 dark:bg-danger-950/20 border-danger-500',
      '💰': 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500',
      '🏦': 'bg-blue-50 dark:bg-blue-950/20 border-blue-500'
    };
    
    return colorMap[icon] || 'bg-default-50 dark:bg-default-950/20 border-default-500';
  }

  /**
   * Process inline formatting (bold, italic, etc.)
   */
  private static processInlineFormatting(text: string): string {
    let processed = text;
    
    // Process inline code first
    processed = processed.replace(this.PATTERNS.inlineCode, '<code class="px-1 py-0.5 bg-default-100 dark:bg-default-800 rounded text-xs font-mono">$1</code>');
    
    // Process inline math
    processed = processed.replace(this.PATTERNS.mathInline, '<span class="px-1 py-0.5 bg-primary-100 dark:bg-primary-900 rounded font-mono text-primary-800 dark:text-primary-200">$1</span>');
    
    // Process bold
    processed = processed.replace(this.PATTERNS.bold, '<strong class="font-semibold">$1</strong>');
    
    // Process italic
    processed = processed.replace(this.PATTERNS.italic, '<em class="italic">$1</em>');
    
    // Process strikethrough
    processed = processed.replace(this.PATTERNS.strikethrough, '<del class="line-through text-default-500">$1</del>');
    
    // Process links
    processed = processed.replace(this.PATTERNS.links, '<a href="$2" class="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Process auto-links
    processed = processed.replace(this.PATTERNS.autoLinks, '<a href="$1" class="text-primary-600 dark:text-primary-400 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Highlight financial data
    processed = this.highlightFinancialData(processed);
    
    return processed;
  }

  /**
   * Highlight financial data in content
   */
  private static highlightFinancialData(content: string): string {
    // Highlight currencies
    content = content.replace(this.PATTERNS.currency, (match) => {
      return `<span class="font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded">${match}</span>`;
    });

    // Highlight percentages
    content = content.replace(this.PATTERNS.percentage, (match) => {
      const isPositive = match.startsWith('+') || (!match.startsWith('-') && parseFloat(match) > 0);
      const colorClass = isPositive 
        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' 
        : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      return `<span class="font-semibold ${colorClass} px-1 rounded">${match}</span>`;
    });

    return content;
  }

  // ===== UTILITY METHODS =====

  static extractInsights(content: string): string[] {
    const insights: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    const insightPatterns = [
      /(?:key insight|important|notably|significantly|interestingly)/i,
      /(?:this suggests|this indicates|this means)/i,
      /(?:therefore|consequently|as a result)/i,
      /(?:recommendation|suggest|recommend)/i,
      /(?:outperformed|underperformed|exceeded|below expectations)/i
    ];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (insightPatterns.some(pattern => pattern.test(trimmed)) && insights.length < 5) {
        insights.push(trimmed + '.');
      }
    });

    return insights;
  }

  static extractFinancialData(content: string): ParsedContent['financialData'] {
    const currencies = [...content.matchAll(this.PATTERNS.currency)].map(m => m[0]);
    const percentages = [...content.matchAll(this.PATTERNS.percentage)].map(m => m[0]);
    const numbers = [...content.matchAll(this.PATTERNS.financialNumber)].map(m => m[0]);
    
    const metrics = Array.from(this.FINANCIAL_METRICS).filter(metric => 
      content.toLowerCase().includes(metric.toLowerCase())
    );

    return {
      currencies: [...new Set(currencies)],
      percentages: [...new Set(percentages)],
      numbers: [...new Set(numbers)].slice(0, 10), // Limit to prevent overflow
      metrics: [...new Set(metrics)]
    };
  }

  static getContentStats(content: string, metadata?: any): Record<string, any> {
    const wordCount = content.split(/\s+/).length;
    const charCount = content.length;
    const paragraphCount = content.split('\n\n').length;
    const sentenceCount = content.split(/[.!?]+/).filter(s => s.trim()).length;

    return {
      wordCount,
      charCount,
      paragraphCount,
      sentenceCount,
      avgWordsPerSentence: Math.round(wordCount / Math.max(sentenceCount, 1)),
      readingLevel: this.calculateReadingLevel(wordCount, sentenceCount),
      ...metadata
    };
  }

  static getReadingTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 250));
  }

  // ===== PRIVATE HELPER METHODS =====

  private static cleanContent(content: string): string {
    return content
      .replace(this.PATTERNS.artifacts, '')
      .replace(this.PATTERNS.prefixes, '')
      .replace(this.PATTERNS.tokens, '')
      .replace(this.PATTERNS.multiNewlines, '\n\n')
      .trim();
  }

  private static detectFinancialContent(content: string): boolean {
    const hasFinancialPatterns = this.PATTERNS.currency.test(content) || 
                                this.PATTERNS.percentage.test(content);
    
    const hasFinancialKeywords = Array.from(this.FINANCIAL_KEYWORDS).some(keyword => 
      content.toLowerCase().includes(keyword)
    );

    return hasFinancialPatterns || hasFinancialKeywords;
  }

  private static analyzeComplexity(content: string, blocks: ContentBlock[]): 'low' | 'medium' | 'high' {
    const factors = {
      codeBlocks: blocks.filter(b => b.type === 'code').length,
      tables: blocks.filter(b => b.type === 'table').length,
      mathBlocks: blocks.filter(b => b.type === 'math').length,
      headings: blocks.filter(b => b.type === 'heading').length,
      wordCount: content.split(/\s+/).length
    };

    const complexityScore = 
      factors.codeBlocks * 3 +
      factors.tables * 2 +
      factors.mathBlocks * 2 +
      factors.headings * 1 +
      (factors.wordCount > 500 ? 2 : 0);

    if (complexityScore >= 8) return 'high';
    if (complexityScore >= 4) return 'medium';
    return 'low';
  }

  private static analyzeContentSemantic(content: string): { sentiment: 'positive' | 'neutral' | 'negative'; topics: string[] } {
    const positiveWords = ['gain', 'profit', 'growth', 'increase', 'improve', 'positive', 'strong', 'excellent', 'outperform'];
    const negativeWords = ['loss', 'decline', 'decrease', 'negative', 'weak', 'poor', 'underperform', 'risk', 'volatile'];
    
    const lowerContent = content.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount + 1) sentiment = 'positive';
    else if (negativeCount > positiveCount + 1) sentiment = 'negative';

    const topics = Array.from(this.FINANCIAL_KEYWORDS)
      .filter(keyword => lowerContent.includes(keyword))
      .slice(0, 5);

    return { sentiment, topics };
  }

  private static calculateReadingLevel(wordCount: number, sentenceCount: number): string {
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
    
    if (avgWordsPerSentence <= 12) return 'Easy';
    if (avgWordsPerSentence <= 17) return 'Medium';
    return 'Difficult';
  }

  private static sanitizeHTML(html: string): string {
    // Remove potentially dangerous attributes and tags
    return html
      .replace(/on\w+="[^"]*"/g, '') // Remove event handlers
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, ''); // Remove iframes
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
  }

// lib/services/contentParser.ts (continued)

private static generateCacheKey(content: string): string {
  // Simple hash function for caching
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

private static cleanupCache(): void {
  if (this.cacheMap.size > CHAT_MESSAGE_CONFIG.CACHE_SIZE) {
    const entries = Array.from(this.cacheMap.entries());
    const toDelete = entries.slice(0, entries.length - CHAT_MESSAGE_CONFIG.CACHE_SIZE);
    toDelete.forEach(([key]) => this.cacheMap.delete(key));
  }
}

private static getEmptyResult(): ParsedContent {
  return {
    html: '',
    metadata: {
      hasCode: false,
      hasTable: false,
      hasFinancialData: false,
      hasMath: false,
      estimatedReadTime: 0,
      contentType: 'text',
      wordCount: 0,
      headings: [],
      codeLanguages: [],
      complexity: 'low',
      sentiment: 'neutral',
      topics: []
    },
    insights: [],
    financialData: {
      currencies: [],
      percentages: [],
      numbers: [],
      metrics: []
    }
  };
}

private static getFallbackResult(content: string): ParsedContent {
  const wordCount = content.split(/\s+/).length;
  return {
    html: `<p class="text-default-700 dark:text-default-300 leading-relaxed">${this.escapeHtml(content)}</p>`,
    metadata: {
      hasCode: false,
      hasTable: false,
      hasFinancialData: this.detectFinancialContent(content),
      hasMath: false,
      estimatedReadTime: Math.max(1, Math.ceil(wordCount / 250)),
      contentType: 'text',
      wordCount,
      headings: [],
      codeLanguages: [],
      complexity: wordCount > 300 ? 'medium' : 'low',
      sentiment: 'neutral',
      topics: []
    },
    insights: [],
    financialData: this.extractFinancialData(content)
  };
}

/**
 * Clear all caches (useful for memory management)
 */
static clearCache(): void {
  this.cacheMap.clear();
  this.processingQueue.clear();
}

/**
 * Get cache statistics
 */
static getCacheStats(): { size: number; processing: number } {
  return {
    size: this.cacheMap.size,
    processing: this.processingQueue.size
  };
}
}