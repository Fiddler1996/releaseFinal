// Audit Log for Security Events
export interface AuditEvent {
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SECURITY';
  category: 'AUTH' | 'CRYPTO' | 'STORAGE' | 'HTTP' | 'DEFENSE' | 'GENERAL';
  message: string;
  details?: any;
  userId?: string;
  sessionId?: string;
}

export interface AuditLogger {
  logInfo(category: AuditEvent['category'], message: string, details?: any): void;
  logWarn(category: AuditEvent['category'], message: string, details?: any): void;
  logError(category: AuditEvent['category'], message: string, details?: any): void;
  logSecurity(category: AuditEvent['category'], message: string, details?: any): void;
  getEvents(limit?: number): AuditEvent[];
  clearEvents(): void;
  exportEvents(): string;
}

export class AuditLoggerImpl implements AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents = 1000;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Log info level event
   */
  logInfo(category: AuditEvent['category'], message: string, details?: any): void {
    this.logEvent('INFO', category, message, details);
  }

  /**
   * Log warning level event
   */
  logWarn(category: AuditEvent['category'], message: string, details?: any): void {
    this.logEvent('WARN', category, message, details);
  }

  /**
   * Log error level event
   */
  logError(category: AuditEvent['category'], message: string, details?: any): void {
    this.logEvent('ERROR', category, message, details);
  }

  /**
   * Log security level event
   */
  logSecurity(category: AuditEvent['category'], message: string, details?: any): void {
    this.logEvent('SECURITY', category, message, details);
    console.warn(`[SECURITY] ${category}: ${message}`, details);
  }

  /**
   * Get recent audit events
   */
  getEvents(limit: number = 100): AuditEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Clear all audit events
   */
  clearEvents(): void {
    this.events = [];
  }

  /**
   * Export events as JSON string
   */
  exportEvents(): string {
    return JSON.stringify(this.events, null, 2);
  }

  /**
   * Internal method to log events
   */
  private logEvent(level: AuditEvent['level'], category: AuditEvent['category'], message: string, details?: any): void {
    const event: AuditEvent = {
      timestamp: Date.now(),
      level,
      category,
      message,
      details,
      sessionId: this.sessionId
    };

    this.events.push(event);

    // Keep only the last maxEvents
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console for development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const timestamp = new Date(event.timestamp).toISOString();
      console.log(`[${timestamp}] [${level}] [${category}] ${message}`, details);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user ID for future events
   */
  setUserId(userId: string): void {
    // Update all future events with this user ID
    this.events.forEach(event => {
      if (!event.userId) {
        event.userId = userId;
      }
    });
  }

  /**
   * Get events by category
   */
  getEventsByCategory(category: AuditEvent['category']): AuditEvent[] {
    return this.events.filter(event => event.category === category);
  }

  /**
   * Get events by level
   */
  getEventsByLevel(level: AuditEvent['level']): AuditEvent[] {
    return this.events.filter(event => event.level === level);
  }

  /**
   * Get events in time range
   */
  getEventsInRange(startTime: number, endTime: number): AuditEvent[] {
    return this.events.filter(event => 
      event.timestamp >= startTime && event.timestamp <= endTime
    );
  }
}