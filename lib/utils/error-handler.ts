export class ErrorHandler {
    static handle(error: any, context?: string): void {
      const errorInfo = {
        message: error.message || 'Unknown error',
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      };
  
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]`, error);
      }
  
      // In production, you might want to send to error tracking service
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to Sentry, LogRocket, etc.
        // Sentry.captureException(error, { extra: errorInfo });
      }
  
      // Store in local error log for debugging
      if (typeof window !== 'undefined') {
        const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
        errorLog.push(errorInfo);
        
        // Keep only last 50 errors
        if (errorLog.length > 50) {
          errorLog.splice(0, errorLog.length - 50);
        }
        
        localStorage.setItem('error_log', JSON.stringify(errorLog));
      }
    }
  
    static getErrorLog(): any[] {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem('error_log') || '[]');
    }
  
    static clearErrorLog(): void {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('error_log');
      }
    }
  
    static createUserFriendlyMessage(error: any): string {
      if (error.message?.includes('API key')) {
        return 'API configuration issue. Please check your settings.';
      }
      
      if (error.message?.includes('rate limit')) {
        return 'Too many requests. Please wait a moment and try again.';
      }
      
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        return 'Network error. Please check your connection and try again.';
      }
      
      if (error.message?.includes('wallet') || error.message?.includes('address')) {
        return 'Invalid wallet address. Please check and try again.';
      }
      
      return 'Something went wrong. Please try again.';
    }
  }