// lib/utils/messageExport.ts
"use client";

import { Message } from '@/app/ai/components/types';
import { ChatMessageUtils } from './chatMessage';

export interface ExportOptions {
  format: 'txt' | 'md' | 'json' | 'html' | 'csv' | 'pdf';
  includeMetadata?: boolean;
  includeTimestamps?: boolean;
  includeAttachments?: boolean;
  filterRoles?: Array<'user' | 'assistant' | 'system'>;
  dateRange?: {
    start: Date;
    end: Date;
  };
  customTemplate?: string;
  title?: string;
  description?: string;
}

export interface ExportResult {
  content: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface ExportProgress {
    phase: 'filtering' | 'formatting' | 'generating' | 'complete';
    progress: number; // 0-100
    message: string;
    estimatedTimeRemaining?: number;
  }

/**
 * Comprehensive utility class for exporting chat messages in various formats
 * Production-grade with error handling and customization options
 */
export class MessageExporter {
  private static readonly MIME_TYPES = {
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    html: 'text/html',
    csv: 'text/csv',
    pdf: 'application/pdf'
  } as const;

  /**
   * Export messages to specified format with comprehensive options
   */
  static async export(messages: Message[], options: ExportOptions): Promise<ExportResult> {
    try {
      // Validate inputs
      this.validateInputs(messages, options);

      // Filter messages based on options
      const filteredMessages = this.filterMessages(messages, options);

      if (filteredMessages.length === 0) {
        throw new Error('No messages match the specified criteria');
      }

      // Generate content based on format
      let content: string;
      let filename: string;
      let mimeType: string;

      switch (options.format) {
        case 'txt':
          content = this.exportAsText(filteredMessages, options);
          filename = this.generateFilename('txt', options.title);
          mimeType = this.MIME_TYPES.txt;
          break;
        case 'md':
          content = this.exportAsMarkdown(filteredMessages, options);
          filename = this.generateFilename('md', options.title);
          mimeType = this.MIME_TYPES.md;
          break;
        case 'json':
          content = this.exportAsJSON(filteredMessages, options);
          filename = this.generateFilename('json', options.title);
          mimeType = this.MIME_TYPES.json;
          break;
        case 'html':
          content = this.exportAsHTML(filteredMessages, options);
          filename = this.generateFilename('html', options.title);
          mimeType = this.MIME_TYPES.html;
          break;
        case 'csv':
          content = this.exportAsCSV(filteredMessages, options);
          filename = this.generateFilename('csv', options.title);
          mimeType = this.MIME_TYPES.csv;
          break;
        case 'pdf':
          throw new Error('PDF export requires additional dependencies. Use HTML export and convert to PDF.');
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      return {
        content,
        filename,
        mimeType,
        size: new Blob([content]).size
      };
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download exported messages as file
   */
  static async download(messages: Message[], options: ExportOptions): Promise<void> {
    try {
      const result = await this.export(messages, options);
      
      const blob = new Blob([result.content], { type: result.mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Cleanup
      setTimeout(() => URL.revokeObjectURL(url), 100);
      
      // Log success
      console.log(`Successfully exported ${messages.length} messages as ${options.format.toUpperCase()}`);
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  }

  /**
   * Get export preview without downloading
   */
  static async getPreview(messages: Message[], options: ExportOptions, maxLength: number = 1000): Promise<string> {
    const result = await this.export(messages, options);
    return result.content.length > maxLength 
      ? result.content.substring(0, maxLength) + '...\n\n[Content truncated for preview]'
      : result.content;
  }

  /**
   * Export as plain text with customizable formatting
   */
  private static exportAsText(messages: Message[], options: ExportOptions): string {
    const title = options.title || 'Chat Export';
    const description = options.description || `Exported ${messages.length} messages`;
    
    let output = `${title}\n${'='.repeat(title.length)}\n`;
    output += `${description}\n`;
    output += `Export Date: ${new Date().toLocaleString()}\n`;
    output += `Total Messages: ${messages.length}\n\n`;
    
    messages.forEach((message, index) => {
      const role = this.formatRole(message.role);
      const timestamp = options.includeTimestamps 
        ? ` (${this.formatTimestamp(message.timestamp)})`
        : '';
      
      output += `${role}${timestamp}:\n`;
      output += `${this.cleanContentForText(message.content)}\n`;
      
      // Add attachments
      if (options.includeAttachments && message.attachments?.length) {
        output += `\nAttachments:\n`;
        message.attachments.forEach(attachment => {
          output += `  - ${attachment.name} (${attachment.type})\n`;
        });
      }
      
      // Add metadata
      if (options.includeMetadata && message.metadata) {
        output += `\nMetadata:\n`;
        output += `  Model: ${message.metadata.model || 'Unknown'}\n`;
        output += `  Word Count: ${message.metadata.wordCount || 'Unknown'}\n`;
        if (message.metadata.processingTime) {
          output += `  Processing Time: ${message.metadata.processingTime}ms\n`;
        }
        if (message.metadata.confidence) {
          output += `  Confidence: ${(message.metadata.confidence * 100).toFixed(1)}%\n`;
        }
      }
      
      if (index < messages.length - 1) {
        output += '\n' + '-'.repeat(50) + '\n\n';
      }
    });
    
    return output;
  }

  /**
   * Export as Markdown with rich formatting
   */
  private static exportAsMarkdown(messages: Message[], options: ExportOptions): string {
    const title = options.title || 'Chat Export';
    const description = options.description || `Exported ${messages.length} messages`;
    
    let output = `# ${title}\n\n`;
    output += `> ${description}  \n`;
    output += `> Export Date: ${new Date().toLocaleString()}  \n`;
    output += `> Total Messages: ${messages.length}\n\n`;
    
    // Add table of contents if many messages
    if (messages.length > 10) {
      output += `## Table of Contents\n\n`;
      messages.forEach((message, index) => {
        const role = this.formatRole(message.role);
        const preview = this.getMessagePreview(message.content, 50);
        output += `${index + 1}. [${role}: ${preview}](#message-${index + 1})\n`;
      });
      output += '\n---\n\n';
    }
    
    messages.forEach((message, index) => {
      const role = this.formatRole(message.role);
      const timestamp = options.includeTimestamps 
        ? ` - ${this.formatTimestamp(message.timestamp)}`
        : '';
      
      output += `## Message ${index + 1}: ${role}${timestamp} {#message-${index + 1}}\n\n`;
      
      // Add role badge
      const roleBadge = this.getRoleBadge(message.role);
      output += `${roleBadge}\n\n`;
      
      // Add content (preserve markdown formatting)
      output += `${message.content}\n\n`;
      
      // Add attachments as a collapsible section
      if (options.includeAttachments && message.attachments?.length) {
        output += `<details>\n<summary>📎 Attachments (${message.attachments.length})</summary>\n\n`;
        message.attachments.forEach(attachment => {
          output += `- **${attachment.name}** (${attachment.type})`;
          if (attachment.size) {
            output += ` - ${this.formatFileSize(attachment.size)}`;
          }
          output += '\n';
        });
        output += `\n</details>\n\n`;
      }
      
      // Add metadata as a collapsible section
      if (options.includeMetadata && message.metadata) {
        output += `<details>\n<summary>ℹ️ Metadata</summary>\n\n`;
        output += `| Property | Value |\n|----------|-------|\n`;
        
        if (message.metadata.model) {
          output += `| Model | \`${message.metadata.model}\` |\n`;
        }
        if (message.metadata.wordCount) {
          output += `| Word Count | ${message.metadata.wordCount} |\n`;
        }
        if (message.metadata.processingTime) {
          output += `| Processing Time | ${message.metadata.processingTime}ms |\n`;
        }
        if (message.metadata.confidence) {
          output += `| Confidence | ${(message.metadata.confidence * 100).toFixed(1)}% |\n`;
        }
        if (message.metadata.contentType) {
          output += `| Content Type | ${message.metadata.contentType} |\n`;
        }
        
        output += `\n</details>\n\n`;
      }
      
      if (index < messages.length - 1) {
        output += '---\n\n';
      }
    });
    
    return output;
  }

  /**
   * Export as JSON with comprehensive structure
   */
  private static exportAsJSON(messages: Message[], options: ExportOptions): string {
    const exportData = {
      meta: {
        title: options.title || 'Chat Export',
        description: options.description || `Exported ${messages.length} messages`,
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        exportOptions: {
          format: options.format,
          includeMetadata: options.includeMetadata,
          includeTimestamps: options.includeTimestamps,
          includeAttachments: options.includeAttachments,
          filterRoles: options.filterRoles
        },
        statistics: this.generateQuickStats(messages)
      },
      messages: messages.map((message, index) => ({
        index: index + 1,
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp,
        formattedTimestamp: this.formatTimestamp(message.timestamp),
        wordCount: ChatMessageUtils.getWordCount(message.content),
        ...(options.includeMetadata && message.metadata && { 
          metadata: {
            ...message.metadata,
            ...(message.metadata.confidence && {
              confidenceLevel: this.getConfidenceLevel(message.metadata.confidence)
            })
          }
        }),
        ...(options.includeAttachments && message.attachments && { 
          attachments: message.attachments.map(att => ({
            ...att,
            formattedSize: att.size ? this.formatFileSize(att.size) : undefined
          }))
        }),
        isStreaming: message.isStreaming || false,
        isError: message.isError || false
      }))
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Export as HTML with modern styling
   */
  private static exportAsHTML(messages: Message[], options: ExportOptions): string {
    const title = options.title || 'Chat Export';
    const description = options.description || `Exported ${messages.length} messages`;
    
    let output = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        ${this.getHTMLStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${this.escapeHtml(title)}</h1>
            <p class="description">${this.escapeHtml(description)}</p>
            <div class="meta">
                <span>📅 Exported: ${new Date().toLocaleString()}</span>
                <span>💬 Messages: ${messages.length}</span>
                <span>👥 Participants: ${this.getUniqueRoles(messages).join(', ')}</span>
            </div>
        </header>
        
        <main class="messages">`;

    messages.forEach((message, index) => {
      const roleClass = `message-${message.role}`;
      const roleName = this.formatRole(message.role);
      const timestamp = options.includeTimestamps 
        ? `<time class="timestamp" datetime="${message.timestamp}">${this.formatTimestamp(message.timestamp)}</time>`
        : '';

      output += `
            <article class="message ${roleClass}" id="message-${index + 1}">
                <div class="message-header">
                    <div class="role-info">
                        <span class="role-badge role-${message.role}">${this.getRoleEmoji(message.role)} ${roleName}</span>
                        ${timestamp}
                    </div>
                    <div class="message-number">#${index + 1}</div>
                </div>
                
                <div class="message-content">
                    ${this.formatContentForHTML(message.content)}
                </div>`;

      // Add attachments
      if (options.includeAttachments && message.attachments?.length) {
        output += `
                <div class="attachments">
                    <h4>📎 Attachments</h4>
                    <ul class="attachment-list">`;
        
        message.attachments.forEach(attachment => {
          output += `
                        <li class="attachment-item">
                            <span class="attachment-name">${this.escapeHtml(attachment.name)}</span>
                            <span class="attachment-type">${attachment.type}</span>
                            ${attachment.size ? `<span class="attachment-size">${this.formatFileSize(attachment.size)}</span>` : ''}
                        </li>`;
        });
        
        output += `
                    </ul>
                </div>`;
      }

      // Add metadata
      if (options.includeMetadata && message.metadata) {
        output += `
                <details class="metadata">
                    <summary>ℹ️ Message Metadata</summary>
                    <dl class="metadata-list">`;
        
        if (message.metadata.model) {
          output += `<dt>Model</dt><dd><code>${this.escapeHtml(message.metadata.model)}</code></dd>`;
        }
        if (message.metadata.wordCount) {
          output += `<dt>Word Count</dt><dd>${message.metadata.wordCount}</dd>`;
        }
        if (message.metadata.processingTime) {
          output += `<dt>Processing Time</dt><dd>${message.metadata.processingTime}ms</dd>`;
        }
        if (message.metadata.confidence) {
          const confidence = (message.metadata.confidence * 100).toFixed(1);
          const confidenceClass = this.getConfidenceClass(message.metadata.confidence);
          output += `<dt>Confidence</dt><dd><span class="confidence ${confidenceClass}">${confidence}%</span></dd>`;
        }
        if (message.metadata.contentType) {
          output += `<dt>Content Type</dt><dd><span class="content-type">${message.metadata.contentType}</span></dd>`;
        }
        
        output += `
                    </dl>
                </details>`;
      }

      output += `
            </article>`;
    });

    output += `
        </main>
        
        <footer class="footer">
            <p>Generated by Mappr ChatMessage Exporter on ${new Date().toLocaleString()}</p>
            <p class="stats">
                📊 Total words: ${this.getTotalWords(messages)} | 
                ⏱️ Conversation duration: ${this.getConversationDuration(messages)} |
                📈 Avg. words per message: ${this.getAverageWordsPerMessage(messages)}
            </p>
        </footer>
    </div>
    
    <script>
        ${this.getHTMLScript()}
    </script>
</body>
</html>`;

    return output;
  }

  /**
   * Export as CSV for data analysis
   */
  private static exportAsCSV(messages: Message[], options: ExportOptions): string {
    const headers = [
      'Index',
      'ID',
      'Role',
      'Content',
      'Word_Count',
      'Character_Count'
    ];

    if (options.includeTimestamps) {
      headers.push('Timestamp', 'Formatted_Timestamp');
    }

    if (options.includeMetadata) {
      headers.push('Model', 'Processing_Time_ms', 'Confidence', 'Content_Type');
    }

    if (options.includeAttachments) {
      headers.push('Attachment_Count', 'Attachment_Names');
    }

    let csv = headers.join(',') + '\n';

    messages.forEach((message, index) => {
      const row = [
        index + 1,
        `"${this.escapeCsv(message.id)}"`,
        `"${message.role}"`,
        `"${this.escapeCsv(this.cleanContentForCSV(message.content))}"`,
        ChatMessageUtils.getWordCount(message.content),
        message.content.length
      ];

      if (options.includeTimestamps) {
        row.push(
          `"${message.timestamp}"`,
          `"${this.formatTimestamp(message.timestamp)}"`
        );
      }

      if (options.includeMetadata) {
        row.push(
          `"${message.metadata?.model || ''}"`,
          message.metadata?.processingTime || '',
          message.metadata?.confidence || '',
          `"${message.metadata?.contentType || ''}"`
        );
      }

      if (options.includeAttachments) {
        const attachmentCount = message.attachments?.length || 0;
        const attachmentNames = message.attachments?.map(a => a.name).join('; ') || '';
        row.push(
          attachmentCount,
          `"${this.escapeCsv(attachmentNames)}"`
        );
      }

      csv += row.join(',') + '\n';
    });

    return csv;
  }

  // Helper Methods

  private static validateInputs(messages: Message[], options: ExportOptions): void {
    if (!Array.isArray(messages)) {
      throw new Error('Messages must be an array');
    }

    if (messages.length === 0) {
      throw new Error('No messages to export');
    }

    if (!options.format) {
      throw new Error('Export format is required');
    }

    if (!['txt', 'md', 'json', 'html', 'csv', 'pdf'].includes(options.format)) {
      throw new Error(`Unsupported format: ${options.format}`);
    }
  }

  private static filterMessages(messages: Message[], options: ExportOptions): Message[] {
    let filtered = [...messages];

    // Filter by roles
    if (options.filterRoles?.length) {
      filtered = filtered.filter(msg => options.filterRoles!.includes(msg.role));
    }

    // Filter by date range
    if (options.dateRange) {
      filtered = filtered.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= options.dateRange!.start && msgDate <= options.dateRange!.end;
      });
    }

    return filtered;
  }

  private static formatRole(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  private static formatTimestamp(timestamp: string): string {
    try {
      return new Date(timestamp).toLocaleString();
    } catch {
      return timestamp;
    }
  }

  private static cleanContentForText(content: string): string {
    return content
      .replace(/```[\s\S]*?```/g, '[Code Block]')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .trim();
  }

  private static cleanContentForCSV(content: string): string {
    return content
      .replace(/\n/g, ' ')
      .replace(/"/g, '""')
      .trim();
  }

  private static escapeCsv(text: string): string {
    return text.replace(/"/g, '""');
  }

  private static escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  private static formatContentForHTML(content: string): string {
    // Simple markdown to HTML conversion
    return content
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
      .trim();
  }

  private static getRoleBadge(role: string): string {
    const badges = {
      user: '👤 **User**',
      assistant: '🤖 **Assistant**',
      system: '⚙️ **System**'
    };
    return badges[role as keyof typeof badges] || `**${this.formatRole(role)}**`;
  }

  private static getRoleEmoji(role: string): string {
    const emojis = {
      user: '👤',
      assistant: '🤖',
      system: '⚙️'
    };
    return emojis[role as keyof typeof emojis] || '💬';
  }

  private static getMessagePreview(content: string, maxLength: number): string {
    const cleaned = content.replace(/[#*`_~\[\]()]/g, '').trim();
    return cleaned.length > maxLength ? cleaned.substring(0, maxLength) + '...' : cleaned;
  }

  private static formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  private static getConfidenceLevel(confidence: number): string {
    if (confidence >= 0.9) return 'high';
    if (confidence >= 0.7) return 'medium';
    return 'low';
  }

  private static getConfidenceClass(confidence: number): string {
    if (confidence >= 0.9) return 'confidence-high';
    if (confidence >= 0.7) return 'confidence-medium';
    return 'confidence-low';
  }

  private static getUniqueRoles(messages: Message[]): string[] {
    const roles = new Set(messages.map(m => this.formatRole(m.role)));
    return Array.from(roles);
  }

  private static generateQuickStats(messages: Message[]) {
    const totalWords = this.getTotalWords(messages);
    const roles = messages.reduce((acc, msg) => {
      acc[msg.role] = (acc[msg.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalWords,
      averageWordsPerMessage: Math.round(totalWords / messages.length),
      roleDistribution: roles,
      conversationDuration: this.getConversationDuration(messages)
    };
  }

  private static getTotalWords(messages: Message[]): number {
    return messages.reduce((total, msg) => total + ChatMessageUtils.getWordCount(msg.content), 0);
  }

  private static getAverageWordsPerMessage(messages: Message[]): number {
    return Math.round(this.getTotalWords(messages) / messages.length);
  }

  private static getConversationDuration(messages: Message[]): string {
    if (messages.length < 2) return 'N/A';
    
    const first = new Date(messages[0].timestamp);
    const last = new Date(messages[messages.length - 1].timestamp);
    const diffMs = last.getTime() - first.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    
    if (diffMins < 60) return `${diffMins} minutes`;
    const diffHours = Math.round(diffMins / 60);
    return `${diffHours} hours`;
  }

  private static generateFilename(extension: string, title?: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const prefix = title ? title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase() : 'chat-export';
    return `${prefix}-${timestamp}.${extension}`;
  }

private static getHTMLStyles(): string {
    return `
        * { box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background: #f8fafc;
            color: #334155;
        }
        
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .header {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 2rem;
        }
        
        .header h1 {
            margin: 0 0 0.5rem 0;
            color: #1e293b;
            font-size: 2rem;
        }
        
        .description {
            margin: 0 0 1rem 0;
            color: #64748b;
            font-size: 1.1rem;
        }
        
        .meta {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .messages {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .message {
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            overflow: hidden;
            transition: transform 0.2s ease;
        }
        
        .message:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 1.5rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .role-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        
        .role-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 600;
        }
        
        .role-user { 
            background: #dbeafe; 
            color: #1e40af; 
            border: 1px solid #bfdbfe;
        }
        .role-assistant { 
            background: #dcfce7; 
            color: #166534; 
            border: 1px solid #bbf7d0;
        }
        .role-system { 
            background: #fef3c7; 
            color: #92400e; 
            border: 1px solid #fde68a;
        }
        
        .timestamp {
            font-size: 0.8rem;
            color: #64748b;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        
        .message-number {
            font-size: 0.8rem;
            color: #94a3b8;
            font-weight: 500;
            background: #f1f5f9;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
        }
        
        .message-content {
            padding: 1.5rem;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .message-content pre {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 1rem;
            overflow-x: auto;
            margin: 1rem 0;
        }
        
        .message-content code {
            background: #f1f5f9;
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-size: 0.9em;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
        }
        
        .message-content pre code {
            background: none;
            padding: 0;
        }
        
        .message-content strong {
            color: #1e293b;
            font-weight: 600;
        }
        
        .message-content em {
            color: #475569;
            font-style: italic;
        }
        
        .attachments, .metadata {
            margin: 1rem 1.5rem;
            padding: 1rem;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }
        
        .attachments h4 {
            margin: 0 0 0.75rem 0;
            font-size: 0.9rem;
            color: #475569;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .attachment-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .attachment-item {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 0;
            font-size: 0.85rem;
            border-bottom: 1px solid #e2e8f0;
        }
        
        .attachment-item:last-child {
            border-bottom: none;
        }
        
        .attachment-name { 
            font-weight: 500; 
            color: #1e293b;
        }
        .attachment-type { 
            color: #64748b; 
            background: #f1f5f9;
            padding: 0.1rem 0.3rem;
            border-radius: 3px;
            font-size: 0.8rem;
        }
        .attachment-size { 
            color: #94a3b8; 
            margin-left: auto;
        }
        
        .metadata summary {
            cursor: pointer;
            font-weight: 500;
            margin-bottom: 0.75rem;
            padding: 0.5rem;
            background: #f1f5f9;
            border-radius: 6px;
            user-select: none;
        }
        
        .metadata summary:hover {
            background: #e2e8f0;
        }
        
        .metadata-list {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 0.5rem 1rem;
            margin: 0;
            margin-top: 0.75rem;
        }
        
        .metadata-list dt {
            font-weight: 500;
            color: #475569;
        }
        
        .metadata-list dd {
            margin: 0;
            color: #64748b;
        }
        
        .confidence {
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .confidence-high {
            background: #dcfce7;
            color: #166534;
        }
        
        .confidence-medium {
            background: #fef3c7;
            color: #92400e;
        }
        
        .confidence-low {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .content-type {
            background: #f3e8ff;
            color: #7c3aed;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .footer {
            margin-top: 3rem;
            padding: 2rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
            border-top: 3px solid #3b82f6;
        }
        
        .footer p {
            margin: 0.5rem 0;
            color: #64748b;
        }
        
        .stats {
            font-size: 0.9rem;
            color: #94a3b8;
        }
        
        /* Dark mode styles */
        @media (prefers-color-scheme: dark) {
            body {
                background: #0f172a;
                color: #e2e8f0;
            }
            
            .header, .message, .footer {
                background: #1e293b;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
            
            .message-header {
                background: #334155;
                border-bottom-color: #475569;
            }
            
            .attachments, .metadata {
                background: #334155;
                border-color: #475569;
            }
            
            .message-content pre {
                background: #334155;
                border-color: #475569;
            }
            
            .message-content code {
                background: #334155;
            }
            
            .metadata summary {
                background: #334155;
            }
            
            .metadata summary:hover {
                background: #475569;
            }
        }
        
        /* Print styles */
        @media print {
            body {
                background: white;
                color: black;
            }
            
            .container {
                max-width: none;
                padding: 1rem;
            }
            
            .message {
                box-shadow: none;
                border: 1px solid #e2e8f0;
                break-inside: avoid;
                page-break-inside: avoid;
            }
            
            .message:hover {
                transform: none;
                box-shadow: none;
            }
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header {
                padding: 1.5rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
            
            .meta {
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .message-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .message-content {
                padding: 1rem;
            }
            
            .metadata-list {
                grid-template-columns: 1fr;
                gap: 0.25rem;
            }
        }
    `;
  }

  private static getHTMLScript(): string {
    return `
        // Add interactive features to the exported HTML
        document.addEventListener('DOMContentLoaded', function() {
            // Add copy-to-clipboard for code blocks
            const codeBlocks = document.querySelectorAll('pre code');
            codeBlocks.forEach(function(codeBlock) {
                const pre = codeBlock.parentElement;
                const button = document.createElement('button');
                button.textContent = 'Copy';
                button.style.cssText = \`
                    position: absolute;
                    top: 0.5rem;
                    right: 0.5rem;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    padding: 0.25rem 0.5rem;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s;
                \`;
                
                pre.style.position = 'relative';
                pre.appendChild(button);
                
                pre.addEventListener('mouseenter', function() {
                    button.style.opacity = '1';
                });
                
                pre.addEventListener('mouseleave', function() {
                    button.style.opacity = '0';
                });
                
                button.addEventListener('click', function() {
                    navigator.clipboard.writeText(codeBlock.textContent).then(function() {
                        button.textContent = 'Copied!';
                        setTimeout(function() {
                            button.textContent = 'Copy';
                        }, 2000);
                    });
                });
            });
            
            // Add smooth scrolling for anchor links
            const anchorLinks = document.querySelectorAll('a[href^="#"]');
            anchorLinks.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(this.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Add message highlighting on hover
            const messages = document.querySelectorAll('.message');
            messages.forEach(function(message) {
                message.addEventListener('mouseenter', function() {
                    this.style.borderLeft = '4px solid #3b82f6';
                });
                
                message.addEventListener('mouseleave', function() {
                    this.style.borderLeft = 'none';
                });
            });
            
            // Add search functionality
            function addSearchBox() {
                const header = document.querySelector('.header');
                const searchContainer = document.createElement('div');
                searchContainer.style.cssText = \`
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                \`;
                
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.placeholder = 'Search messages...';
                searchInput.style.cssText = \`
                    width: 100%;
                    padding: 0.5rem;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 0.9rem;
                \`;
                
                const resultCount = document.createElement('div');
                resultCount.style.cssText = \`
                    margin-top: 0.5rem;
                    font-size: 0.8rem;
                    color: #64748b;
                \`;
                
                searchContainer.appendChild(searchInput);
                searchContainer.appendChild(resultCount);
                header.appendChild(searchContainer);
                
                // Search functionality
                let searchTimeout;
                searchInput.addEventListener('input', function() {
                    clearTimeout(searchTimeout);
                    searchTimeout = setTimeout(function() {
                        performSearch(searchInput.value, resultCount);
                    }, 300);
                });
            }
            
            function performSearch(query, resultElement) {
                const messages = document.querySelectorAll('.message');
                let matchCount = 0;
                
                messages.forEach(function(message) {
                    const content = message.querySelector('.message-content');
                    const originalContent = content.dataset.original || content.innerHTML;
                    content.dataset.original = originalContent;
                    
                    if (!query.trim()) {
                        content.innerHTML = originalContent;
                        message.style.display = 'block';
                        return;
                    }
                    
                    const regex = new RegExp(\`(\${query.replace(/[.*+?^$()|[\\]\\\\]/g, '\\\\$&')})\`, 'gi');
                    const hasMatch = regex.test(content.textContent);
                    
                    if (hasMatch) {
                        matchCount++;
                        content.innerHTML = originalContent.replace(regex, '<mark style="background: #fef3c7; padding: 0.1rem 0.2rem; border-radius: 3px;">$1</mark>');
                        message.style.display = 'block';
                    } else {
                        message.style.display = 'none';
                    }
                });
                
                resultElement.textContent = query.trim() 
                    ? \`Found \${matchCount} message\${matchCount !== 1 ? 's' : ''} matching "\${query}"\`
                    : '';
            }
            
            // Add search box if there are enough messages
            if (document.querySelectorAll('.message').length > 5) {
                addSearchBox();
            }
            
            // Add table of contents navigation for long exports
            function addTableOfContents() {
                const messages = document.querySelectorAll('.message');
                if (messages.length <= 10) return;
                
                const header = document.querySelector('.header');
                const tocContainer = document.createElement('div');
                tocContainer.style.cssText = \`
                    margin-top: 1rem;
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 8px;
                    border: 1px solid #e2e8f0;
                \`;
                
                const tocTitle = document.createElement('h3');
                tocTitle.textContent = 'Quick Navigation';
                tocTitle.style.cssText = 'margin: 0 0 0.75rem 0; font-size: 1rem; color: #374151;';
                
                const tocList = document.createElement('div');
                tocList.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem;';
                
                messages.forEach(function(message, index) {
                    const role = message.querySelector('.role-badge').textContent.trim();
                    const preview = message.querySelector('.message-content').textContent.slice(0, 40) + '...';
                    
                    const tocItem = document.createElement('a');
                    tocItem.href = '#message-' + (index + 1);
                    tocItem.textContent = \`\${index + 1}. \${role}: \${preview}\`;
                    tocItem.style.cssText = \`
                        display: block;
                        padding: 0.5rem;
                        background: white;
                        border-radius: 6px;
                        text-decoration: none;
                        color: #374151;
                        font-size: 0.8rem;
                        border: 1px solid #e5e7eb;
                        transition: all 0.2s;
                    \`;
                    
                    tocItem.addEventListener('mouseenter', function() {
                        this.style.borderColor = '#3b82f6';
                        this.style.backgroundColor = '#eff6ff';
                    });
                    
                    tocItem.addEventListener('mouseleave', function() {
                        this.style.borderColor = '#e5e7eb';
                        this.style.backgroundColor = 'white';
                    });
                    
                    tocList.appendChild(tocItem);
                });
                
                tocContainer.appendChild(tocTitle);
                tocContainer.appendChild(tocList);
                header.appendChild(tocContainer);
            }
            
            addTableOfContents();
            
            // Add export info banner
            function addExportInfo() {
                const banner = document.createElement('div');
                banner.style.cssText = \`
                    position: fixed;
                    bottom: 1rem;
                    right: 1rem;
                    background: #1e293b;
                    color: white;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-size: 0.8rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 1000;
                    max-width: 300px;
                \`;
                
                banner.innerHTML = \`
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span>📄</span>
                        <div>
                            <div style="font-weight: 500;">Chat Export</div>
                            <div style="opacity: 0.8;">Generated by Mappr AI</div>
                        </div>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: none;
                            border: none;
                            color: white;
                            cursor: pointer;
                            opacity: 0.7;
                            margin-left: auto;
                            padding: 0.25rem;
                            border-radius: 4px;
                        ">✕</button>
                    </div>
                \`;
                
                document.body.appendChild(banner);
                
                // Auto-hide after 10 seconds
                setTimeout(function() {
                    if (banner.parentElement) {
                        banner.style.opacity = '0';
                        banner.style.transform = 'translateY(100%)';
                        setTimeout(function() {
                            if (banner.parentElement) {
                                banner.remove();
                            }
                        }, 300);
                    }
                }, 10000);
            }
            
            addExportInfo();
        });
    `;
  }
}

// Export format specific utilities
export class ExportFormatUtils {
  /**
   * Get available export formats with their capabilities
   */
  static getAvailableFormats(): Array<{
    format: ExportOptions['format'];
    name: string;
    description: string;
    features: string[];
    fileExtension: string;
    mimeType: string;
    maxRecommendedMessages: number;
  }> {
    return [
      {
        format: 'txt',
        name: 'Plain Text',
        description: 'Simple text format, readable everywhere',
        features: ['Lightweight', 'Universal compatibility', 'Easy to read'],
        fileExtension: 'txt',
        mimeType: 'text/plain',
        maxRecommendedMessages: 1000
      },
      {
        format: 'md',
        name: 'Markdown',
        description: 'Formatted text with rich markup support',
        features: ['Rich formatting', 'Code syntax highlighting', 'Tables', 'Links'],
        fileExtension: 'md',
        mimeType: 'text/markdown',
        maxRecommendedMessages: 500
      },
      {
        format: 'html',
        name: 'HTML',
        description: 'Interactive web page with search and navigation',
        features: ['Interactive', 'Search functionality', 'Navigation', 'Responsive design'],
        fileExtension: 'html',
        mimeType: 'text/html',
        maxRecommendedMessages: 300
      },
      {
        format: 'json',
        name: 'JSON',
        description: 'Structured data format for programmatic access',
        features: ['Structured data', 'API compatible', 'Metadata rich', 'Machine readable'],
        fileExtension: 'json',
        mimeType: 'application/json',
        maxRecommendedMessages: 2000
      },
      {
        format: 'csv',
        name: 'CSV',
        description: 'Spreadsheet format for data analysis',
        features: ['Spreadsheet compatible', 'Data analysis friendly', 'Lightweight'],
        fileExtension: 'csv',
        mimeType: 'text/csv',
        maxRecommendedMessages: 5000
      }
    ];
  }

  /**
   * Get recommended format based on use case
   */
  static getRecommendedFormat(useCase: 'sharing' | 'analysis' | 'backup' | 'presentation'): ExportOptions['format'] {
    const recommendations = {
      sharing: 'html',
      analysis: 'csv',
      backup: 'json',
      presentation: 'md'
    };
    
    return recommendations[useCase];
  }

  /**
   * Validate export options
   */
  static validateExportOptions(options: ExportOptions): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!options.format) {
      errors.push('Export format is required');
    }
    
    if (options.dateRange) {
      if (options.dateRange.start >= options.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }
    
    if (options.filterRoles && options.filterRoles.length === 0) {
      errors.push('At least one role must be selected when filtering by roles');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get estimated export size
   */
  static estimateExportSize(messages: Message[], format: ExportOptions['format']): {
    estimatedSizeBytes: number;
    estimatedSizeFormatted: string;
    processingTimeMs: number;
  } {
    const totalChars = messages.reduce((sum, msg) => sum + msg.content.length, 0);
    const totalMessages = messages.length;
    
    // Size multipliers for different formats
    const multipliers = {
      txt: 1.2,
      md: 1.5,
      json: 2.5,
      html: 4.0,
      csv: 1.8,
      pdf: 3.0
    };
    
    const estimatedSizeBytes = Math.round(totalChars * multipliers[format]);
    const estimatedSizeFormatted = this.formatBytes(estimatedSizeBytes);
    
    // Processing time estimation (very rough)
    const processingTimeMs = Math.round(totalMessages * 2 + (estimatedSizeBytes / 1000));
    
    return {
      estimatedSizeBytes,
      estimatedSizeFormatted,
      processingTimeMs
    };
  }

  /**
   * Format bytes to human readable string
   */
  private static formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }
}

// Export progress tracking
export class ExportProgressTracker {
  private callbacks: Set<(progress: ExportProgress) => void> = new Set();



  subscribe(callback: (progress: ExportProgress) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }

  private emit(progress: ExportProgress): void {
    this.callbacks.forEach(callback => callback(progress));
  }

  async trackExport<T>(
    exportFn: (tracker: ExportProgressTracker) => Promise<T>,
    totalSteps: number = 100
  ): Promise<T> {
    const startTime = Date.now();
    
    try {
      this.emit({
        phase: 'filtering',
        progress: 0,
        message: 'Starting export...'
      });

      const result = await exportFn(this);

      this.emit({
        phase: 'complete',
        progress: 100,
        message: 'Export completed successfully!'
      });

      return result;
    } catch (error) {
      this.emit({
        phase: 'complete',
        progress: 100,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      throw error;
    }
  }

  updateProgress(
    phase: ExportProgress['phase'],
    progress: number,
    message: string
  ): void {
    this.emit({
      phase,
      progress: Math.min(100, Math.max(0, progress)),
      message
    });
  }
}