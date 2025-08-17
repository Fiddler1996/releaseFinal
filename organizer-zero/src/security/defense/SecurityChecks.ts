// Security Checks for Runtime Protection
export interface SecurityCheck {
  name: string;
  description: string;
  check(): boolean | Promise<boolean>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityCheckResult {
  check: SecurityCheck;
  passed: boolean;
  timestamp: number;
  details?: any;
}

export interface SecurityChecker {
  runChecks(): Promise<SecurityCheckResult[]>;
  runCheck(name: string): Promise<SecurityCheckResult | null>;
  getCheckResults(): SecurityCheckResult[];
  clearResults(): void;
}

export class SecurityCheckerImpl implements SecurityChecker {
  private checks: SecurityCheck[] = [];
  private results: SecurityCheckResult[] = [];

  constructor() {
    this.initializeChecks();
  }

  /**
   * Initialize default security checks
   */
  private initializeChecks(): void {
    this.checks = [
      new EnvironmentCheck(),
      new CryptoCheck(),
      new StorageCheck(),
      new NetworkCheck(),
      new DOMCheck(),
      new ConsoleCheck()
    ];
  }

  /**
   * Run all security checks
   */
  async runChecks(): Promise<SecurityCheckResult[]> {
    this.results = [];
    
    for (const check of this.checks) {
      try {
        const passed = await check.check();
        const result: SecurityCheckResult = {
          check,
          passed,
          timestamp: Date.now()
        };
        this.results.push(result);
      } catch (error) {
        const result: SecurityCheckResult = {
          check,
          passed: false,
          timestamp: Date.now(),
          details: { error: (error as any).message }
        };
        this.results.push(result);
      }
    }

    return this.results;
  }

  /**
   * Run specific security check
   */
  async runCheck(name: string): Promise<SecurityCheckResult | null> {
    const check = this.checks.find(c => c.name === name);
    if (!check) return null;

    try {
      const passed = await check.check();
      const result: SecurityCheckResult = {
        check,
        passed,
        timestamp: Date.now()
      };
      
      // Update existing result or add new one
      const existingIndex = this.results.findIndex(r => r.check.name === name);
      if (existingIndex >= 0) {
        this.results[existingIndex] = result;
      } else {
        this.results.push(result);
      }

      return result;
    } catch (error) {
              const result: SecurityCheckResult = {
          check,
          passed: false,
          timestamp: Date.now(),
          details: { error: (error as any).message }
        };
        return result;
    }
  }

  /**
   * Get all check results
   */
  getCheckResults(): SecurityCheckResult[] {
    return [...this.results];
  }

  /**
   * Clear all results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Add custom security check
   */
  addCheck(check: SecurityCheck): void {
    this.checks.push(check);
  }

  /**
   * Get failed checks
   */
  getFailedChecks(): SecurityCheckResult[] {
    return this.results.filter(result => !result.passed);
  }

  /**
   * Get checks by severity
   */
  getChecksBySeverity(severity: SecurityCheck['severity']): SecurityCheckResult[] {
    return this.results.filter(result => result.check.severity === severity);
  }
}

// Concrete Security Check Implementations

export class EnvironmentCheck implements SecurityCheck {
  name = 'Environment Check';
  description = 'Check if running in secure environment';
  severity: SecurityCheck['severity'] = 'MEDIUM';

  async check(): Promise<boolean> {
          // Check if running in HTTPS
      if (typeof window !== 'undefined') {
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
          return false;
        }
      }

    // Check if running in iframe (potential clickjacking)
    if (typeof window !== 'undefined') {
      try {
        if (window.top !== window.self) {
          return false;
        }
      } catch {
        return false;
      }
    }

    return true;
  }
}

export class CryptoCheck implements SecurityCheck {
  name = 'Crypto Check';
  description = 'Check if crypto APIs are available';
  severity: SecurityCheck['severity'] = 'CRITICAL';

  async check(): Promise<boolean> {
    // Check if crypto.subtle is available
    if (typeof crypto === 'undefined' || !crypto.subtle) {
      return false;
    }

    // Check if getRandomValues is available
    if (!crypto.getRandomValues) {
      return false;
    }

    // Test basic crypto operations
    try {
      const testArray = new Uint8Array(16);
      crypto.getRandomValues(testArray);
      return true;
    } catch {
      return false;
    }
  }
}

export class StorageCheck implements SecurityCheck {
  name = 'Storage Check';
  description = 'Check if secure storage is available';
  severity: SecurityCheck['severity'] = 'HIGH';

  async check(): Promise<boolean> {
    // Check if IndexedDB is available
    if (typeof indexedDB === 'undefined') {
      return false;
    }

    // Check if localStorage is available
    if (typeof localStorage === 'undefined') {
      return false;
    }

    // Check if sessionStorage is available
    if (typeof sessionStorage === 'undefined') {
      return false;
    }

    return true;
  }
}

export class NetworkCheck implements SecurityCheck {
  name = 'Network Check';
  description = 'Check network security features';
  severity: SecurityCheck['severity'] = 'MEDIUM';

  async check(): Promise<boolean> {
    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      return false;
    }

    // Check if AbortController is available
    if (typeof AbortController === 'undefined') {
      return false;
    }

    return true;
  }
}

export class DOMCheck implements SecurityCheck {
  name = 'DOM Check';
  description = 'Check DOM security features';
  severity: SecurityCheck['severity'] = 'LOW';

  async check(): Promise<boolean> {
    // Check if MutationObserver is available
    if (typeof MutationObserver === 'undefined') {
      return false;
    }

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      return false;
    }

    return true;
  }
}

export class ConsoleCheck implements SecurityCheck {
  name = 'Console Check';
  description = 'Check console security';
  severity: SecurityCheck['severity'] = 'LOW';

  async check(): Promise<boolean> {
    // Check if console methods are available
    if (typeof console === 'undefined') {
      return false;
    }

    // Check if console.log is available
    if (typeof console.log !== 'function') {
      return false;
    }

    return true;
  }
}