import { AuditLogger } from './AuditLog';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retryCount?: number;
  encryptBody?: boolean;
}

export interface SecureHttpClient {
  get<T>(url: string, options?: RequestOptions): Promise<T>;
  post<T>(url: string, data: any, options?: RequestOptions): Promise<T>;
  put<T>(url: string, data: any, options?: RequestOptions): Promise<T>;
  delete<T>(url: string, options?: RequestOptions): Promise<T>;
}

export class SecureHttpClientImpl implements SecureHttpClient {
  private auditLogger: AuditLogger;
  private baseURL: string;
  private defaultTimeout: number = 30000;
  private defaultRetryCount: number = 3;

  constructor(auditLogger: AuditLogger, baseURL: string = '') {
    this.auditLogger = auditLogger;
    this.baseURL = baseURL;
  }

  /**
   * GET request
   */
  async get<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', url, undefined, options);
  }

  /**
   * POST request
   */
  async post<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('POST', url, data, options);
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('PUT', url, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', url, undefined, options);
  }

  /**
   * Main request method with security features
   */
  private async request<T>(
    method: string,
    url: string,
    data?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const fullURL = this.baseURL + url;
    const timeout = options.timeout || this.defaultTimeout;
    const retryCount = options.retryCount || this.defaultRetryCount;

    // Log request
    this.auditLogger.logInfo('HTTP', `${method} ${fullURL}`, {
      method,
      url: fullURL,
      data,
      options
    });

    // Security checks
    if (!this.validateURL(fullURL)) {
      this.auditLogger.logSecurity('HTTP', `Invalid URL detected: ${fullURL}`);
      throw new Error('Invalid URL');
    }

    // Prepare headers
    const headers = this.prepareHeaders(options.headers);

    // Prepare body
    let body: string | undefined;
    if (data) {
      body = options.encryptBody ? 
        await this.encryptBody(data) : 
        JSON.stringify(data);
    }

    // Execute request with retry logic
    let lastError: Error;
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await this.executeRequest(
          method,
          fullURL,
          headers,
          body,
          timeout
        );

        // Log successful response
        this.auditLogger.logInfo('HTTP', `${method} ${fullURL} successful`, {
          status: response.status,
          attempt: attempt + 1
        });

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        // Log error
        this.auditLogger.logError('HTTP', `${method} ${fullURL} failed`, {
          error: (error as any).message,
          attempt: attempt + 1,
          retryCount
        });

        // Don't retry on client errors (4xx)
        if ((error as any).status >= 400 && (error as any).status < 500) {
          break;
        }

        // Wait before retry (exponential backoff)
        if (attempt < retryCount) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Execute HTTP request
   */
  private async executeRequest(
    method: string,
    url: string,
    headers: Record<string, string>,
    body?: string,
    timeout?: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = timeout ? 
      setTimeout(() => controller.abort(), timeout) : 
      undefined;

    try {
      const response = await fetch(url, {
        method,
        headers,
        body,
        signal: controller.signal,
        credentials: 'include' // Include cookies for authentication
      });

      if (timeoutId) clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        (error as any).status = response.status;
        throw error;
      }

      return response;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if ((error as any).name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }

  /**
   * Prepare headers with security defaults
   */
  private prepareHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'X-Security-Token': this.generateSecurityToken()
    };

    return { ...defaultHeaders, ...customHeaders };
  }

  /**
   * Validate URL for security
   */
  private validateURL(url: string): boolean {
    try {
      const urlObj = new URL(url);
      
      // Only allow HTTPS in production
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && urlObj.protocol !== 'https:') {
        return false;
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /data:/i,
        /vbscript:/i,
        /on\w+\s*=/i
      ];

      return !suspiciousPatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  /**
   * Generate security token for request
   */
  private generateSecurityToken(): string {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Encrypt request body (placeholder for future implementation)
   */
  private async encryptBody(data: any): Promise<string> {
    // TODO: Implement body encryption
    this.auditLogger.logInfo('HTTP', 'Body encryption requested', { data });
    return JSON.stringify(data);
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set base URL
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Set default timeout
   */
  setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
  }

  /**
   * Set default retry count
   */
  setDefaultRetryCount(retryCount: number): void {
    this.defaultRetryCount = retryCount;
  }
}