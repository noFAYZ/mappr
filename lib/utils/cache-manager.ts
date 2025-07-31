export class CacheManager {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
    private namespace: string;
    private config: {
      defaultTTL: number;
      maxSize: number;
    };
  
    constructor(namespace: string, config: { defaultTTL: number; maxSize: number }) {
      this.namespace = namespace;
      this.config = config;
    }
  
    set(key: string, data: any, ttl?: number): void {
      const fullKey = `${this.namespace}:${key}`;
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttl || this.config.defaultTTL
      };
  
      // Clean up if cache is too large
      if (this.cache.size >= this.config.maxSize) {
        this.cleanup();
      }
  
      this.cache.set(fullKey, item);
    }
  
    get(key: string): any | null {
      const fullKey = `${this.namespace}:${key}`;
      const item = this.cache.get(fullKey);
  
      if (!item) return null;
  
      // Check if expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.cache.delete(fullKey);
        return null;
      }
  
      return item.data;
    }
  
    has(key: string): boolean {
      return this.get(key) !== null;
    }
  
    delete(key: string): boolean {
      const fullKey = `${this.namespace}:${key}`;
      return this.cache.delete(fullKey);
    }
  
    clear(): void {
      // Only clear items from this namespace
      for (const key of this.cache.keys()) {
        if (key.startsWith(`${this.namespace}:`)) {
          this.cache.delete(key);
        }
      }
    }
  
    private cleanup(): void {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      
      // Remove expired items first
      for (const [key, item] of entries) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }
  
      // If still too large, remove oldest items
      if (this.cache.size >= this.config.maxSize) {
        const sortedEntries = entries
          .filter(([key]) => this.cache.has(key)) // Only items that still exist
          .sort(([, a], [, b]) => a.timestamp - b.timestamp);
  
        const itemsToRemove = this.cache.size - Math.floor(this.config.maxSize * 0.8);
        for (let i = 0; i < itemsToRemove; i++) {
          if (sortedEntries[i]) {
            this.cache.delete(sortedEntries[i][0]);
          }
        }
      }
    }
  
    getStats() {
      const namespaceItems = Array.from(this.cache.entries())
        .filter(([key]) => key.startsWith(`${this.namespace}:`));
  
      return {
        size: namespaceItems.length,
        totalSize: this.cache.size,
        namespace: this.namespace,
        oldestItem: namespaceItems.reduce((oldest, [, item]) => 
          !oldest || item.timestamp < oldest ? item.timestamp : oldest, null as number | null
        )
      };
    }
  }