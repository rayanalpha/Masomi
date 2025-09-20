/**
 * Enhanced Logging System
 * Provides structured logging with different levels and contextual information
 */

export interface LogContext {
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  method?: string;
  url?: string;
  duration?: number;
  [key: string]: any;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, this.isDevelopment ? 2 : 0) : '';
    
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr ? ` | Context: ${contextStr}` : ''}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (this.isDevelopment) return true;
    
    // In production, only log info and above
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };
    
    return levels[level] >= levels.info;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog('debug')) return;
    console.log(this.formatMessage('debug', message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog('info')) return;
    console.log(this.formatMessage('info', message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog('warn')) return;
    console.warn(this.formatMessage('warn', message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (!this.shouldLog('error')) return;
    
    const errorInfo = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : { error };

    const fullContext = { ...context, error: errorInfo };
    console.error(this.formatMessage('error', message, fullContext));
  }

  fatal(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorInfo = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : { error };

    const fullContext = { ...context, error: errorInfo };
    console.error(this.formatMessage('fatal', message, fullContext));
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, context?: LogContext): void {
    this.info(`API Request: ${method} ${url}`, { method, url, ...context });
  }

  apiResponse(method: string, url: string, status: number, duration: number, context?: LogContext): void {
    const level: LogLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    this[level](`API Response: ${method} ${url} - ${status}`, { 
      method, 
      url, 
      status, 
      duration,
      ...context 
    });
  }

  dbOperation(operation: string, table?: string, duration?: number, context?: LogContext): void {
    this.debug(`DB Operation: ${operation}${table ? ` on ${table}` : ''}`, {
      operation,
      table,
      duration,
      ...context
    });
  }

  dbError(operation: string, error: Error, context?: LogContext): void {
    this.error(`DB Error during ${operation}`, error, {
      operation,
      ...context
    });
  }

  authEvent(event: string, userId?: string, context?: LogContext): void {
    this.info(`Auth Event: ${event}`, {
      event,
      userId,
      ...context
    });
  }

  securityEvent(event: string, level: 'info' | 'warn' | 'error' = 'warn', context?: LogContext): void {
    this[level](`Security Event: ${event}`, {
      event,
      security: true,
      ...context
    });
  }
}

// Singleton instance
export const logger = new Logger();

// Request context middleware helper
export function createRequestContext(request: Request): LogContext {
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const method = request.method;
  
  return {
    requestId: crypto.randomUUID(),
    method,
    url: url.pathname + url.search,
    userAgent,
    timestamp: Date.now()
  };
}

// Performance measurement utility
export function createPerformanceTracker() {
  const start = Date.now();
  
  return {
    end(): number {
      return Date.now() - start;
    },
    
    log(operation: string, context?: LogContext): void {
      const duration = Date.now() - start;
      logger.debug(`Performance: ${operation} took ${duration}ms`, {
        operation,
        duration,
        ...context
      });
    }
  };
}

export default logger;