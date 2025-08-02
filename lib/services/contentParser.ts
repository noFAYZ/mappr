"use client";

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
}

/**
 * Enhanced ContentParser for robust AI response parsing
 * Production-grade with comprehensive error handling and performance optimization
 */
export class ContentParserService {
  private static readonly FINANCIAL_KEYWORDS = new Set([
    'portfolio', 'investment', 'roi', 'return', 'profit', 'loss', 'dividend',
    'allocation', 'diversification', 'risk', 'beta', 'alpha', 'sharpe',
    'volatility', 'yield', 'nasdaq', 'sp500', 'dow', 'etf', 'fund', 'asset',
    'valuation', 'market cap', 'price', 'value', 'growth', 'income', 'stock',
    'crypto', 'bitcoin', 'ethereum', 'defi', 'trading', 'volume', 'cap'
  ]);

  private static readonly PATTERNS = {
    // Currency patterns
    currency: /\$[\d,]+(?:\.?\d*)?(?:[BMK])?/g,
    percentage: /[+-]?\d+(?:\.\d+)?%/g,
    number: /\b\d{1,3}(?:,\d{3})*(?:\.\d+)?\b/g,
    
    // Markdown patterns
    codeBlock: /```(\w*)\n?([\s\S]*?)```/g,
    inlineCode: /`([^`\n]+)`/g,
    bold: /\*\*([^*\n]+?)\*\*/g,
    italic: /\*([^*\n]+?)\*/g,
    strikethrough: /~~([^~\n]+?)~~/g,
    
    // Headers
    headers: /^(#{1,6})\s+(.+)$/gm,
    
    // Lists
    numberedList: /^(\s*)(\d+)\.\s+(.+)$/gm,
    bulletList: /^(\s*)[-*+]\s+(.+)$/gm,
    
    // Tables
    table: /\|(.+)\|\s*\n\|([:|\\-]+)\|\s*\n((?:\|.+\|\s*\n?)*)/g,
    
    // Special elements
    blockquote: /^>\s*(.+)$/gm,
    callout: /^(⚠️|❗|💡|📊|🎯|✅|❌|🔍|📈|📉|🚫)\s+(.+)$/gm,
    
    // Cleanup patterns
    artifacts: /\[\/?(INST|ASS|SYS|USER|ASSISTANT)\]/g,
    prefixes: /^(Human:|Assistant:|AI:|User:)\s*/gm,
    tokens: /^\s*<\|.*?\|>\s*/gm,
    multiNewlines: /\n{3,}/g,
    
    // Links
    links: /\[([^\]]+)\]\(([^)]+)\)/g,
    autoLinks: /(https?:\/\/[^\s]+)/g
  };

  private static codeBlockCache = new Map<string, string>();
  private static idCounter = 0;

  /**
   * Main parsing function with enhanced error handling
   */
  static async parseContent(content: string): Promise<ParsedContent> {
    if (!content?.trim()) {
      return this.getEmptyResult();
    }

    try {
      // Clean and prepare content
      const cleaned = this.cleanContent(content);
      const metadata = this.analyzeContent(cleaned);
      
      // Process content in optimized order
      let html = cleaned;
      
      // Preserve code blocks first
      html = this.processCodeBlocks(html);
      
      // Process structural elements
      html = this.processHeaders(html);
      html = this.processTables(html);
      html = this.processLists(html);
      html = this.processSpecialElements(html);
      
      // Process inline formatting
      html = this.processInlineFormatting(html);
      html = this.processLinks(html);
      html = this.processFinancialData(html);
      
      // Final processing
      html = this.processParagraphs(html);
      html = this.restoreCodeBlocks(html);
      html = this.addAccessibilityAttributes(html);
      
      return {
        html: html.trim(),
        metadata
      };
    } catch (error) {
      console.warn('ContentParser error, using fallback:', error);
      return this.getFallbackResult(content);
    }
  }

  /**
   * Extract insights from content
   */
  static extractInsights(content: string): string[] {
    const insights: string[] = [];
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for insight indicators
    const insightPatterns = [
      /(?:key insight|important|notably|significantly|interestingly)/i,
      /(?:this suggests|this indicates|this means)/i,
      /(?:therefore|consequently|as a result)/i,
      /(?:recommendation|suggest|recommend)/i
    ];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (insightPatterns.some(pattern => pattern.test(trimmed)) && insights.length < 5) {
        insights.push(trimmed + '.');
      }
    });

    return insights;
  }

  /**
   * Extract financial data from content
   */
  static extractFinancialData(content: string): {
    currencies: string[];
    percentages: string[];
    numbers: string[];
  } {
    const currencies = [...new Set(content.match(this.PATTERNS.currency) || [])];
    const percentages = [...new Set(content.match(this.PATTERNS.percentage) || [])];
    const numbers = [...new Set(content.match(this.PATTERNS.number) || [])]
      .filter(num => parseFloat(num.replace(/,/g, '')) > 1000); // Only significant numbers

    return {
      currencies: currencies.slice(0, 10),
      percentages: percentages.slice(0, 10),
      numbers: numbers.slice(0, 10)
    };
  }

  /**
   * Get reading time estimate
   */
  static getReadingTime(wordCount: number): number {
    return Math.max(1, Math.ceil(wordCount / 250));
  }

  /**
   * Get content statistics
   */
  static getContentStats(content: string, metadata: any): {
    complexity: 'low' | 'medium' | 'high';
    topics: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  } {
    const wordCount = metadata?.wordCount || content.split(/\s+/).length;
    const hasCode = metadata?.hasCode || false;
    const hasFinancial = metadata?.hasFinancialData || false;
    
    // Determine complexity
    let complexity: 'low' | 'medium' | 'high' = 'low';
    if (wordCount > 500 || hasCode || hasFinancial) complexity = 'medium';
    if (wordCount > 1000 && hasCode && hasFinancial) complexity = 'high';

    // Extract topics (simplified)
    const topics = Array.from(this.FINANCIAL_KEYWORDS)
      .filter(keyword => content.toLowerCase().includes(keyword))
      .slice(0, 5);

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'growth', 'profit', 'gain'];
    const negativeWords = ['bad', 'poor', 'negative', 'loss', 'decline', 'risk'];
    
    const positiveCount = positiveWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;
    const negativeCount = negativeWords.filter(word => 
      content.toLowerCase().includes(word)
    ).length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (positiveCount > negativeCount) sentiment = 'positive';
    else if (negativeCount > positiveCount) sentiment = 'negative';

    return { complexity, topics, sentiment };
  }

  // Private helper methods

  private static cleanContent(content: string): string {
    return content
      .replace(this.PATTERNS.artifacts, '')
      .replace(this.PATTERNS.prefixes, '')
      .replace(this.PATTERNS.tokens, '')
      .replace(this.PATTERNS.multiNewlines, '\n\n')
      .trim();
  }

  private static analyzeContent(content: string): ParsedContent['metadata'] {
    const hasCode = this.PATTERNS.codeBlock.test(content) || this.PATTERNS.inlineCode.test(content);
    const hasTable = this.PATTERNS.table.test(content);
    const hasMath = /\$\$[\s\S]*?\$\$|\\\([^)]*\\\)/.test(content);
    
    const hasFinancialData = this.PATTERNS.currency.test(content) || 
                           this.PATTERNS.percentage.test(content) ||
                           Array.from(this.FINANCIAL_KEYWORDS).some(keyword => 
                             content.toLowerCase().includes(keyword)
                           );

    const words = content.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 250));

    // Extract headings
    const headings: Array<{ level: number; text: string; id: string }> = [];
    let match;
    this.PATTERNS.headers.lastIndex = 0;
    while ((match = this.PATTERNS.headers.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = this.generateId(text);
      headings.push({ level, text, id });
    }

    // Extract code languages
    const codeLanguages: string[] = [];
    this.PATTERNS.codeBlock.lastIndex = 0;
    while ((match = this.PATTERNS.codeBlock.exec(content)) !== null) {
      if (match[1]) {
        codeLanguages.push(match[1]);
      }
    }

    // Determine content type
    let contentType: 'text' | 'analysis' | 'code' | 'mixed' = 'text';
    if (hasCode && hasFinancialData) contentType = 'mixed';
    else if (hasCode) contentType = 'code';
    else if (hasFinancialData) contentType = 'analysis';

    return {
      hasCode,
      hasTable,
      hasFinancialData,
      hasMath,
      estimatedReadTime,
      contentType,
      wordCount,
      headings,
      codeLanguages: [...new Set(codeLanguages)]
    };
  }

  private static processCodeBlocks(content: string): string {
    return content.replace(this.PATTERNS.codeBlock, (match, lang, code) => {
      const id = `__CODE_${++this.idCounter}__`;
      const language = lang || 'text';
      const trimmedCode = code.trim();
      
      const codeHtml = `
        <div class="my-4 rounded-lg overflow-hidden border border-default-200 dark:border-default-700 shadow-sm bg-default-50 dark:bg-default-900">
          <div class="flex items-center justify-between px-4 py-2 bg-default-100 dark:bg-default-800 border-b">
            <span class="text-xs font-semibold text-default-600 uppercase tracking-wide">${this.escapeHtml(language)}</span>
            <button 
              class="text-xs text-default-500 hover:text-default-700 px-2 py-1 rounded hover:bg-default-200 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500" 
              onclick="navigator.clipboard.writeText(this.closest('.my-4').querySelector('code').textContent); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy', 2000)"
              tabindex="0"
              aria-label="Copy code to clipboard"
            >
              Copy
            </button>
          </div>
          <pre class="p-4 overflow-x-auto text-sm leading-relaxed"><code class="font-mono text-default-800 dark:text-default-200">${this.escapeHtml(trimmedCode)}</code></pre>
        </div>
      `;
      
      this.codeBlockCache.set(id, codeHtml);
      return id;
    });
  }

  private static processHeaders(content: string): string {
    return content.replace(this.PATTERNS.headers, (match, hashes, text) => {
      const level = hashes.length;
      const id = this.generateId(text);
      const className = `text-default-900 dark:text-default-100 font-bold leading-tight mb-3 mt-6`;
      const sizeClasses = {
        1: 'text-2xl',
        2: 'text-xl', 
        3: 'text-lg',
        4: 'text-base',
        5: 'text-sm font-semibold',
        6: 'text-sm font-medium'
      };
      
      return `<h${level} id="${id}" class="${className} ${sizeClasses[level as keyof typeof sizeClasses]}">${this.escapeHtml(text.trim())}</h${level}>`;
    });
  }

  private static processTables(content: string): string {
    return content.replace(this.PATTERNS.table, (match, header, separator, rows) => {
      const headerCells = header.split('|').map(cell => cell.trim()).filter(Boolean);
      const alignments = separator.split('|').map(cell => {
        const trimmed = cell.trim();
        if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
        if (trimmed.endsWith(':')) return 'right';
        return 'left';
      });

      const rowsArray = rows.trim().split('\n').filter(Boolean);
      
      let tableHtml = `
        <div class="my-4 overflow-x-auto rounded-lg border border-default-200 dark:border-default-700">
          <table class="w-full text-sm">
            <thead class="bg-default-100 dark:bg-default-800">
              <tr>
      `;
      
      headerCells.forEach((cell, index) => {
        const alignment = alignments[index] || 'left';
        tableHtml += `<th class="px-4 py-2 text-${alignment} font-semibold text-default-700 dark:text-default-300">${this.escapeHtml(cell)}</th>`;
      });
      
      tableHtml += `
              </tr>
            </thead>
            <tbody class="bg-content1">
      `;
      
      rowsArray.forEach((row, rowIndex) => {
        const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);
        tableHtml += `<tr class="${rowIndex % 2 === 0 ? 'bg-default-50 dark:bg-default-900/50' : ''}">`;
        
        cells.forEach((cell, index) => {
          const alignment = alignments[index] || 'left';
          tableHtml += `<td class="px-4 py-2 text-${alignment} text-default-600 dark:text-default-400 border-t border-default-200 dark:border-default-700">${this.escapeHtml(cell)}</td>`;
        });
        
        tableHtml += '</tr>';
      });
      
      tableHtml += `
            </tbody>
          </table>
        </div>
      `;
      
      return tableHtml;
    });
  }

  private static processLists(content: string): string {
    // Process numbered lists
    content = content.replace(this.PATTERNS.numberedList, (match, indent, number, text) => {
      const level = indent.length / 2;
      const marginClass = level > 0 ? `ml-${Math.min(level * 4, 8)}` : '';
      return `<li class="text-default-700 dark:text-default-300 mb-1 ${marginClass}">${this.escapeHtml(text.trim())}</li>`;
    });

    // Process bullet lists  
    content = content.replace(this.PATTERNS.bulletList, (match, indent, text) => {
      const level = indent.length / 2;
      const marginClass = level > 0 ? `ml-${Math.min(level * 4, 8)}` : '';
      return `<li class="text-default-700 dark:text-default-300 mb-1 ${marginClass} list-disc list-inside">${this.escapeHtml(text.trim())}</li>`;
    });

    return content;
  }

  private static processSpecialElements(content: string): string {
    // Process blockquotes
    content = content.replace(this.PATTERNS.blockquote, (match, text) => {
      return `<blockquote class="border-l-4 border-primary-500 pl-4 py-2 my-3 bg-primary-50 dark:bg-primary-950/30 text-primary-800 dark:text-primary-200 italic">${this.escapeHtml(text.trim())}</blockquote>`;
    });

    // Process callouts
    content = content.replace(this.PATTERNS.callout, (match, emoji, text) => {
      const colorMap: Record<string, string> = {
        '⚠️': 'warning',
        '❗': 'danger', 
        '💡': 'primary',
        '📊': 'secondary',
        '🎯': 'success',
        '✅': 'success',
        '❌': 'danger',
        '🔍': 'primary',
        '📈': 'success',
        '📉': 'danger',
        '🚫': 'danger'
      };
      
      const color = colorMap[emoji] || 'default';
      return `<div class="my-3 p-3 rounded-lg border-l-4 border-${color}-500 bg-${color}-50 dark:bg-${color}-950/30"><span class="mr-2">${emoji}</span><span class="text-${color}-800 dark:text-${color}-200">${this.escapeHtml(text.trim())}</span></div>`;
    });

    return content;
  }

  private static processInlineFormatting(content: string): string {
    // Bold
    content = content.replace(this.PATTERNS.bold, (match, text) => {
      return `<strong class="font-semibold text-default-900 dark:text-default-100">${this.escapeHtml(text)}</strong>`;
    });

    // Italic  
    content = content.replace(this.PATTERNS.italic, (match, text) => {
      return `<em class="italic text-default-800 dark:text-default-200">${this.escapeHtml(text)}</em>`;
    });

    // Strikethrough
    content = content.replace(this.PATTERNS.strikethrough, (match, text) => {
      return `<del class="line-through text-default-500">${this.escapeHtml(text)}</del>`;
    });

    // Inline code
    content = content.replace(this.PATTERNS.inlineCode, (match, code) => {
      return `<code class="px-1.5 py-0.5 bg-default-100 dark:bg-default-800 text-default-800 dark:text-default-200 rounded text-sm font-mono">${this.escapeHtml(code)}</code>`;
    });

    return content;
  }

  private static processLinks(content: string): string {
    // Markdown links
    content = content.replace(this.PATTERNS.links, (match, text, url) => {
      return `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors">${this.escapeHtml(text)}</a>`;
    });

    // Auto links
    content = content.replace(this.PATTERNS.autoLinks, (match, url) => {
      return `<a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 underline transition-colors break-all">${this.escapeHtml(url)}</a>`;
    });

    return content;
  }

  private static processFinancialData(content: string): string {
    // Highlight currencies
    content = content.replace(this.PATTERNS.currency, (match) => {
      return `<span class="font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-1 rounded">${match}</span>`;
    });

    // Highlight percentages
    content = content.replace(this.PATTERNS.percentage, (match) => {
      const isPositive = match.startsWith('+') || (!match.startsWith('-') && parseFloat(match) > 0);
      const colorClass = isPositive ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      return `<span class="font-semibold ${colorClass} px-1 rounded">${match}</span>`;
    });

    return content;
  }

  private static processParagraphs(content: string): string {
    return content
      .split('\n\n')
      .map(para => {
        const trimmed = para.trim();
        if (!trimmed) return '';
        
        // Skip if already wrapped in HTML tags
        if (trimmed.startsWith('<') && trimmed.endsWith('>')) return trimmed;
        
        return `<p class="text-default-700 dark:text-default-300 leading-relaxed mb-3">${trimmed}</p>`;
      })
      .filter(Boolean)
      .join('\n\n');
  }

  private static restoreCodeBlocks(content: string): string {
    this.codeBlockCache.forEach((html, id) => {
      content = content.replace(id, html);
    });
    this.codeBlockCache.clear();
    return content;
  }

  private static addAccessibilityAttributes(content: string): string {
    // Add ARIA labels and roles where appropriate
    content = content.replace(/<table/g, '<table role="table"');
    content = content.replace(/<blockquote/g, '<blockquote role="blockquote"');
    return content;
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
        codeLanguages: []
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
        hasFinancialData: false,
        hasMath: false,
        estimatedReadTime: Math.max(1, Math.ceil(wordCount / 250)),
        contentType: 'text',
        wordCount,
        headings: [],
        codeLanguages: []
      }
    };
  }
}
