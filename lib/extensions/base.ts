export abstract class BaseExtension {
    abstract name: string;
    abstract provider: string;
    abstract category: string;
    abstract supportedDataTypes: string[];
  
    abstract connect(credentials: Record<string, any>): Promise<boolean>;
    abstract disconnect(): Promise<void>;
    abstract sync(dataTypes?: string[]): Promise<any[]>;
    abstract validateCredentials(credentials: Record<string, any>): Promise<boolean>;
    
    protected normalizeData(rawData: any, dataType: string): any {
      // Base normalization logic - override in specific extensions
      return {
        id: rawData.id || Math.random().toString(36),
        type: dataType,
        rawData,
        normalizedAt: new Date().toISOString()
      };
    }
    
    protected handleError(error: any): never {
      console.error(`${this.name} Error:`, error);
      throw new Error(`${this.name}: ${error.message || error}`);
    }
  }
  