import { ErrorHandler } from "../utils/error-handler";

export abstract class BaseExtension {
  abstract name: string;
  abstract provider: string;
  abstract category: 'crypto' | 'banking' | 'ecommerce' | 'accounting' | 'file' | 'other';
  abstract supportedDataTypes: string[];

  abstract connect(credentials: Record<string, any>): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sync(dataTypes?: string[]): Promise<any[]>;
  abstract validateCredentials(credentials: Record<string, any>): Promise<boolean>;

  protected normalizeData(rawData: any, dataType: string): any {
    // Base normalization logic
    return {
      type: dataType,
      data: rawData,
      normalizedAt: new Date().toISOString(),
      provider: this.provider
    };
  }

  protected handleError(error: any, context?: string): void {
    ErrorHandler.handle(error, `${this.name}.${context}`);
  }

  protected validateConfig(config: Record<string, any>, requiredFields: string[]): void {
    for (const field of requiredFields) {
      if (!config[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  protected async rateLimitedRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // If it's a rate limit error, wait and retry
        if (error.message?.includes('rate limit') || error.status === 429) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // For other errors, don't retry
        throw error;
      }
    }
    
    throw lastError;
  }
}