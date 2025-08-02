// lib/services/contentParser.ts

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
 * Ultra-fast, compact content parser optimized for AI responses
 * Uses regex-based parsing for maximum performance
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
    // Core patterns
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
    
    // Clean up patterns
    artifacts: /\[\/?(INST|ASS|SYS|USER|ASSISTANT)\]/g,
    prefixes: /^(Human:|Assistant:|AI:|User:)\s*/gm,
    tokens: /^\s*<\|.*?\|>\s*/gm,
    multiNewlines: /\n{3,}/g
  };

  private static codeBlockCache = new Map<string, string>();
  private static idCounter = 0;

  /**
   * Main parsing function - optimized for speed and compactness
   */
  static parseContent(content: string): ParsedContent {
    if (!content?.trim()) {
      return this.getEmptyResult();
    }

    try {
      // Step 1: Clean and analyze
      const cleaned = this.cleanContent(content);
      const metadata = this.analyzeContent(cleaned);
      
      // Step 2: Process content in optimized order
      let html = cleaned;
      
      // Preserve code blocks first (prevents interference)
      html = this.processCodeBlocks(html);
      
      // Process structural elements
      html = this.processHeaders(html);
      html = this.processTables(html);
      html = this.processLists(html);
      html = this.processSpecialElements(html);
      
      // Process inline formatting
      html = this.processInlineFormatting(html);
      html = this.processFinancialData(html);
      
      // Final processing
      html = this.processParagraphs(html);
      html = this.restoreCodeBlocks(html);
      
      return {
        html: html.trim(),
        metadata
      };
    } catch (error) {
      console.warn('Parser error, using fallback:', error);
      return this.getFallbackResult(content);
    }
  }

  /**
   * Clean content and remove AI artifacts
   */
  private static cleanContent(content: string): string {
    return content
      .replace(this.PATTERNS.artifacts, '')
      .replace(this.PATTERNS.prefixes, '')
      .replace(this.PATTERNS.tokens, '')
      .replace(this.PATTERNS.multiNewlines, '\n\n')
      .trim();
  }

  /**
   * Analyze content for metadata
   */
  private static analyzeContent(content: string): ParsedContent['metadata'] {
    const hasCode = this.PATTERNS.codeBlock.test(content) || this.PATTERNS.inlineCode.test(content);
    const hasTable = this.PATTERNS.table.test(content);
    const hasMath = /\$\$[\s\S]*?\$\$|\\\([^)]*\\\)/.test(content);
    
    // Check for financial data
    const hasFinancialData = this.PATTERNS.currency.test(content) || 
                           this.PATTERNS.percentage.test(content) ||
                           Array.from(this.FINANCIAL_KEYWORDS).some(keyword => 
                             content.toLowerCase().includes(keyword)
                           );

    // Word count and reading time
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

  /**
   * Process code blocks with caching
   */
  private static processCodeBlocks(content: string): string {
    return content.replace(this.PATTERNS.codeBlock, (match, lang, code) => {
      const id = `__CODE_${++this.idCounter}__`;
      const language = lang || 'text';
      const trimmedCode = code.trim();
      
      const codeHtml = `
        <div class="my-3 rounded-lg overflow-hidden border border-default-200 dark:border-default-700 shadow-sm">
          <div class="flex items-center justify-between px-3 py-1.5 bg-default-100 dark:bg-default-800 border-b">
            <span class="text-xs font-medium text-default-600">${language}</span>
            <button class="text-xs text-default-500 hover:text-default-700 px-2 py-0.5 rounded hover:bg-default-200 transition-colors" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">Copy</button>
          </div>
          <pre class="bg-default-50 dark:bg-default-900 p-3 overflow-x-auto text-sm"><code class="font-mono text-default-800 dark:text-default-200">${this.escapeHtml(trimmedCode)}</code></pre>
        </div>
      `;
      
      this.codeBlockCache.set(id, codeHtml);
      return id;
    });
  }

  /**
   * Process headers with compact styling
   */
  private static processHeaders(content: string): string {
    return content.replace(this.PATTERNS.headers, (match, hashes, text) => {
      const level = hashes.length;
      const id = this.generateId(text);
      const sizes = ['text-xl', 'text-lg', 'text-base', 'text-sm', 'text-sm', 'text-xs'];
      const margins = ['mt-4 mb-2', 'mt-3 mb-2', 'mt-3 mb-1.5', 'mt-2 mb-1', 'mt-2 mb-1', 'mt-1 mb-0.5'];
      
      return `<h${level} id="${id}" class="${sizes[level-1]} font-semibold text-foreground ${margins[level-1]} flex items-center gap-1.5">
        <span class="w-1 h-3 bg-primary-${Math.min(700 - (level-1)*100, 500)} rounded-full"></span>
        ${text}
      </h${level}>`;
    });
  }

  /**
   * Process tables with financial detection
   */
  private static processTables(content: string): string {
    return content.replace(this.PATTERNS.table, (match, header, divider, rows) => {
      const headers = header.split('|').map(h => h.trim()).filter(h => h);
      const tableRows = rows.trim().split('\n').map(row => 
        row.split('|').map(cell => cell.trim()).filter(cell => cell !== '')
      ).filter(row => row.length > 0);

      if (headers.length === 0 || tableRows.length === 0) return match;

      // Check if table contains financial data
      const isFinancial = headers.some(h => 
        Array.from(this.FINANCIAL_KEYWORDS).some(keyword => 
          h.toLowerCase().includes(keyword)
        )
      ) || tableRows.some(row => 
        row.some(cell => this.PATTERNS.currency.test(cell) || this.PATTERNS.percentage.test(cell))
      );

      const borderColor = isFinancial ? 'border-green-200 dark:border-green-800' : 'border-default-200';
      const headerBg = isFinancial ? 'bg-green-50 dark:bg-green-950/20' : 'bg-default-100 dark:bg-default-800';

      let table = `<div class="my-3 overflow-hidden rounded-lg border ${borderColor} shadow-sm">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="${headerBg}">
              <tr>`;
      
      headers.forEach(header => {
        table += `<th class="px-3 py-2 text-left font-medium text-default-800 dark:text-default-200 text-sm">${this.processInlineText(header)}</th>`;
      });
      
      table += `</tr></thead><tbody class="divide-y divide-default-200 dark:divide-default-700">`;
      
      tableRows.forEach((row, i) => {
        const bgClass = i % 2 === 0 ? 'bg-white dark:bg-default-900' : 'bg-default-50 dark:bg-default-800';
        table += `<tr class="${bgClass} hover:bg-default-100 dark:hover:bg-default-700 transition-colors">`;
        
        row.forEach((cell, j) => {
          const content = isFinancial && j > 0 ? this.processFinancialCell(cell) : this.processInlineText(cell);
          table += `<td class="px-3 py-2 text-default-700 dark:text-default-300 text-sm">${content}</td>`;
        });
        
        table += '</tr>';
      });
      
      return table + '</tbody></table></div></div>';
    });
  }

  /**
   * Process lists with compact styling
   */
  private static processLists(content: string): string {
    // Numbered lists
    content = content.replace(this.PATTERNS.numberedList, (match, indent, num, text) => {
      const marginClass = indent ? `ml-${Math.min(parseInt(indent.length / 2) * 2, 6)}` : '';
      return `<div class="flex items-start gap-2 my-1 ${marginClass}">
        <span class="min-w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">${num}</span>
        <span class="text-default-700 dark:text-default-300 text-sm leading-snug pt-0.5">${this.processInlineText(text)}</span>
      </div>`;
    });

    // Bullet lists
    content = content.replace(this.PATTERNS.bulletList, (match, indent, text) => {
      const marginClass = indent ? `ml-${Math.min(parseInt(indent.length / 2) * 2, 6)}` : '';
      return `<div class="flex items-start gap-2 my-1 ${marginClass}">
        <span class="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2 flex-shrink-0"></span>
        <span class="text-default-700 dark:text-default-300 text-sm leading-snug">${this.processInlineText(text)}</span>
      </div>`;
    });

    return content;
  }

  /**
   * Process special elements (blockquotes, callouts)
   */
  private static processSpecialElements(content: string): string {
    // Blockquotes
    content = content.replace(this.PATTERNS.blockquote, (match, text) => {
      return `<div class="border-l-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 pl-3 py-2 my-2 rounded-r text-sm">
        <span class="italic text-amber-800 dark:text-amber-200">${this.processInlineText(text)}</span>
      </div>`;
    });

    // Callouts
    content = content.replace(this.PATTERNS.callout, (match, emoji, text) => {
      const styles = {
        '⚠️': 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-300 text-yellow-800 dark:text-yellow-200',
        '❗': 'bg-red-50 dark:bg-red-950/20 border-red-300 text-red-800 dark:text-red-200',
        '💡': 'bg-blue-50 dark:bg-blue-950/20 border-blue-300 text-blue-800 dark:text-blue-200',
        '📊': 'bg-purple-50 dark:bg-purple-950/20 border-purple-300 text-purple-800 dark:text-purple-200',
        '🎯': 'bg-green-50 dark:bg-green-950/20 border-green-300 text-green-800 dark:text-green-200',
        '✅': 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 text-emerald-800 dark:text-emerald-200',
        '❌': 'bg-red-50 dark:bg-red-950/20 border-red-300 text-red-800 dark:text-red-200',
        '🔍': 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-300 text-indigo-800 dark:text-indigo-200',
        '📈': 'bg-green-50 dark:bg-green-950/20 border-green-300 text-green-800 dark:text-green-200',
        '📉': 'bg-red-50 dark:bg-red-950/20 border-red-300 text-red-800 dark:text-red-200',
        '🚫': 'bg-gray-50 dark:bg-gray-950/20 border-gray-300 text-gray-800 dark:text-gray-200'
      };
      
      const styleClass = styles[emoji] || styles['💡'];
      return `<div class="my-2 p-2 rounded border-l-2 ${styleClass}">
        <div class="flex items-start gap-2">
          <span class="text-base flex-shrink-0">${emoji}</span>
          <span class="text-sm">${this.processInlineText(text)}</span>
        </div>
      </div>`;
    });

    return content;
  }

  /**
   * Process inline formatting
   */
  private static processInlineFormatting(content: string): string {
    return content
      .replace(this.PATTERNS.strikethrough, '<del class="text-default-500">$1</del>')
      .replace(this.PATTERNS.bold, '<strong class="font-semibold text-foreground">$1</strong>')
      .replace(this.PATTERNS.italic, '<em class="italic text-default-600">$1</em>')
      .replace(this.PATTERNS.inlineCode, '<code class="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  }

  /**
   * Process financial data with smart highlighting
   */
  private static processFinancialData(content: string): string {
    // Currency amounts
    content = content.replace(this.PATTERNS.currency, (match) => {
      const value = parseFloat(match.replace(/[$,BMK]/g, ''));
      let colorClass = 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/30';
      
      if (match.includes('B') || value >= 1000000) {
        colorClass = 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30';
      } else if (match.includes('M') || value >= 1000) {
        colorClass = 'text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/30';
      }
      
      return `<span class="font-medium ${colorClass} px-1.5 py-0.5 rounded text-sm">${match}</span>`;
    });

    // Percentages
    content = content.replace(this.PATTERNS.percentage, (match) => {
      const value = parseFloat(match.replace('%', ''));
      let colorClass = 'text-default-700 dark:text-default-400 bg-default-100 dark:bg-default-950/30';
      
      if (value > 0) {
        colorClass = 'text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30';
      } else if (value < 0) {
        colorClass = 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-950/30';
      }
      
      return `<span class="font-medium ${colorClass} px-1.5 py-0.5 rounded text-sm">${match}</span>`;
    });

    // Financial keywords
    const keywordRegex = new RegExp(`\\b(${Array.from(this.FINANCIAL_KEYWORDS).join('|')})\\b`, 'gi');
    content = content.replace(keywordRegex, '<span class="font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/20 px-1 rounded text-sm">$1</span>');

    return content;
  }

  /**
   * Process paragraphs
   */
  private static processParagraphs(content: string): string {
    return content
      .split(/\n\s*\n/)
      .map(para => {
        const trimmed = para.trim();
        if (!trimmed || trimmed.startsWith('<')) return trimmed;
        
        // Don't wrap lists, headers, or special elements
        if (/^(<div|<h[1-6])/m.test(trimmed)) return trimmed;
        
        return `<p class="text-default-700 dark:text-default-300 leading-snug my-1.5 text-sm">${trimmed}</p>`;
      })
      .filter(p => p)
      .join('');
  }

  /**
   * Restore cached code blocks
   */
  private static restoreCodeBlocks(content: string): string {
    this.codeBlockCache.forEach((html, id) => {
      content = content.replace(id, html);
    });
    this.codeBlockCache.clear();
    return content;
  }

  /**
   * Process inline text (for table cells, list items, etc.)
   */
  private static processInlineText(text: string): string {
    return text
      .replace(this.PATTERNS.bold, '<strong>$1</strong>')
      .replace(this.PATTERNS.italic, '<em>$1</em>')
      .replace(this.PATTERNS.inlineCode, '<code class="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-200 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
  }

  /**
   * Process financial data in table cells
   */
  private static processFinancialCell(cell: string): string {
    let processed = this.processInlineText(cell);
    
    // Apply financial highlighting
    processed = processed.replace(this.PATTERNS.percentage, (match) => {
      const value = parseFloat(match.replace('%', ''));
      const color = value >= 0 ? 'text-green-600' : 'text-red-600';
      return `<span class="font-medium ${color}">${match}</span>`;
    });
    
    processed = processed.replace(this.PATTERNS.currency, (match) => {
      return `<span class="font-medium text-green-600">${match}</span>`;
    });
    
    return processed;
  }

  /**
   * Utility functions
   */
  private static generateId(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 50);
  }

  private static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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
      html: `<p class="text-default-700 dark:text-default-300 leading-snug my-1.5 text-sm">${this.escapeHtml(content)}</p>`,
      metadata: {
        hasCode: false,
        hasTable: false,
        hasFinancialData: false,
        hasMath: false,
        estimatedReadTime: Math.ceil(wordCount / 250),
        contentType: 'text',
        wordCount,
        headings: [],
        codeLanguages: []
      }
    };
  }

  /**
   * Static utility methods for external use
   */
  static getReadingTime(wordCount: number): string {
    const minutes = Math.max(1, Math.ceil(wordCount / 250));
    return minutes === 1 ? '1 min' : `${minutes} min`;
  }

  static extractInsights(content: string): string[] {
    const sentences = content
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 15 && s.length < 150);
    
    return sentences
      .map(sentence => {
        let score = 0;
        
        // Financial keywords
        Array.from(this.FINANCIAL_KEYWORDS).forEach(keyword => {
          if (sentence.toLowerCase().includes(keyword)) score += 2;
        });
        
        // Financial patterns
        if (this.PATTERNS.currency.test(sentence)) score += 1;
        if (this.PATTERNS.percentage.test(sentence)) score += 1;
        
        // Action words
        if (/\b(should|recommend|suggest|important|key|critical|significant)\b/i.test(sentence)) score += 1;
        
        return { sentence, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.sentence);
  }

  static getContentStats(content: string, metadata: ParsedContent['metadata']) {
    return {
      wordCount: metadata.wordCount,
      characterCount: content.length,
      estimatedReadTime: metadata.estimatedReadTime,
      paragraphCount: content.split(/\n\s*\n/).length,
      headingCount: metadata.headings.length,
      codeBlockCount: metadata.codeLanguages.length,
      hasFinancialData: metadata.hasFinancialData,
      contentComplexity: this.calculateComplexity(metadata)
    };
  }

  private static calculateComplexity(metadata: ParsedContent['metadata']): 'simple' | 'moderate' | 'complex' {
    let score = 0;
    if (metadata.hasCode) score += 2;
    if (metadata.hasTable) score += 1;
    if (metadata.hasMath) score += 2;
    if (metadata.hasFinancialData) score += 1;
    if (metadata.wordCount > 300) score += 1;
    if (metadata.headings.length > 3) score += 1;
    
    if (score <= 2) return 'simple';
    if (score <= 4) return 'moderate';
    return 'complex';
  }
}