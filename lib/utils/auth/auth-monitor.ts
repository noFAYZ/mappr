class AuthPerformanceMonitor {
    private metrics: Map<string, number[]> = new Map();
    private readonly maxSamples = 100;
  
    startTiming(operation: string): () => void {
      const start = performance.now();
      
      return () => {
        const duration = performance.now() - start;
        this.recordMetric(operation, duration);
      };
    }
  
    private recordMetric(operation: string, duration: number) {
      if (!this.metrics.has(operation)) {
        this.metrics.set(operation, []);
      }
  
      const samples = this.metrics.get(operation)!;
      samples.push(duration);
  
      if (samples.length > this.maxSamples) {
        samples.shift();
      }
    }
  
    getMetrics(operation: string) {
      const samples = this.metrics.get(operation) || [];
      if (samples.length === 0) return null;
  
      const sorted = [...samples].sort((a, b) => a - b);
      const sum = samples.reduce((acc, val) => acc + val, 0);
  
      return {
        count: samples.length,
        average: sum / samples.length,
        median: sorted[Math.floor(sorted.length / 2)],
        min: Math.min(...samples),
        max: Math.max(...samples),
        p95: sorted[Math.floor(sorted.length * 0.95)],
      };
    }
  
    getAllMetrics() {
      const result: Record<string, any> = {};
      for (const [operation] of this.metrics) {
        result[operation] = this.getMetrics(operation);
      }
      return result;
    }
  
    clear() {
      this.metrics.clear();
    }
  }
  
  export const authMonitor = new AuthPerformanceMonitor();