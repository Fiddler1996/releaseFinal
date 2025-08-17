import { SecurityChecker, SecurityCheckerImpl } from './SecurityChecks';
import { AuditLogger } from '../core/AuditLog';

export interface ActiveDefense {
  start(): void;
  stop(): void;
  isRunning(): boolean;
  getSecurityStatus(): Promise<SecurityStatus>;
  enableFeature(feature: DefenseFeature): void;
  disableFeature(feature: DefenseFeature): void;
}

export interface SecurityStatus {
  isSecure: boolean;
  threats: Threat[];
  lastCheck: number;
  recommendations: string[];
}

export interface Threat {
  type: 'INJECTION' | 'TAMPERING' | 'REPLAY' | 'TIMING' | 'SIDE_CHANNEL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  timestamp: number;
  mitigated: boolean;
}

export type DefenseFeature = 
  | 'DOM_MONITORING'
  | 'NETWORK_MONITORING'
  | 'STORAGE_MONITORING'
  | 'CRYPTO_MONITORING'
  | 'CONSOLE_MONITORING';

export class ActiveDefenseImpl implements ActiveDefense {
  private securityChecker: SecurityChecker;
  private auditLogger: AuditLogger;
  private isRunningFlag = false;
  private monitoringIntervals: Map<DefenseFeature, any> = new Map();
  private enabledFeatures: Set<DefenseFeature> = new Set();
  private threats: Threat[] = [];
  private lastCheckTime = 0;

  constructor(auditLogger: AuditLogger) {
    this.securityChecker = new SecurityCheckerImpl();
    this.auditLogger = auditLogger;
  }

  /**
   * Start active defense monitoring
   */
  start(): void {
    if (this.isRunningFlag) {
      return;
    }

    this.isRunningFlag = true;
    this.auditLogger.logInfo('DEFENSE', 'Active defense started');

    // Enable default features
    this.enableFeature('DOM_MONITORING');
    this.enableFeature('STORAGE_MONITORING');
    this.enableFeature('CRYPTO_MONITORING');

    // Run initial security check
    this.runSecurityCheck();
  }

  /**
   * Stop active defense monitoring
   */
  stop(): void {
    if (!this.isRunningFlag) {
      return;
    }

    this.isRunningFlag = false;
    this.auditLogger.logInfo('DEFENSE', 'Active defense stopped');

    // Clear all monitoring intervals
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();
  }

  /**
   * Check if defense is running
   */
  isRunning(): boolean {
    return this.isRunningFlag;
  }

  /**
   * Get current security status
   */
  async getSecurityStatus(): Promise<SecurityStatus> {
    const results = await this.securityChecker.runChecks();
    const failedChecks = results.filter(r => !r.passed);
    
    const isSecure = failedChecks.length === 0;
    const recommendations = this.generateRecommendations(failedChecks);

    return {
      isSecure,
      threats: [...this.threats],
      lastCheck: this.lastCheckTime,
      recommendations
    };
  }

  /**
   * Enable specific defense feature
   */
  enableFeature(feature: DefenseFeature): void {
    if (this.enabledFeatures.has(feature)) {
      return;
    }

    this.enabledFeatures.add(feature);
    this.auditLogger.logInfo('DEFENSE', `Defense feature enabled: ${feature}`);

    switch (feature) {
      case 'DOM_MONITORING':
        this.startDOMMonitoring();
        break;
      case 'NETWORK_MONITORING':
        this.startNetworkMonitoring();
        break;
      case 'STORAGE_MONITORING':
        this.startStorageMonitoring();
        break;
      case 'CRYPTO_MONITORING':
        this.startCryptoMonitoring();
        break;
      case 'CONSOLE_MONITORING':
        this.startConsoleMonitoring();
        break;
    }
  }

  /**
   * Disable specific defense feature
   */
  disableFeature(feature: DefenseFeature): void {
    if (!this.enabledFeatures.has(feature)) {
      return;
    }

    this.enabledFeatures.delete(feature);
    this.auditLogger.logInfo('DEFENSE', `Defense feature disabled: ${feature}`);

    // Clear monitoring interval
    const interval = this.monitoringIntervals.get(feature);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(feature);
    }
  }

  /**
   * Start DOM monitoring for XSS protection
   */
  private startDOMMonitoring(): void {
    if (typeof window === 'undefined') return;

    const interval = setInterval(() => {
      this.checkDOMSecurity();
    }, 5000); // Check every 5 seconds

    this.monitoringIntervals.set('DOM_MONITORING', interval);
  }

  /**
   * Start network monitoring
   */
  private startNetworkMonitoring(): void {
    const interval = setInterval(() => {
      this.checkNetworkSecurity();
    }, 10000); // Check every 10 seconds

    this.monitoringIntervals.set('NETWORK_MONITORING', interval);
  }

  /**
   * Start storage monitoring
   */
  private startStorageMonitoring(): void {
    const interval = setInterval(() => {
      this.checkStorageSecurity();
    }, 15000); // Check every 15 seconds

    this.monitoringIntervals.set('STORAGE_MONITORING', interval);
  }

  /**
   * Start crypto monitoring
   */
  private startCryptoMonitoring(): void {
    const interval = setInterval(() => {
      this.checkCryptoSecurity();
    }, 20000); // Check every 20 seconds

    this.monitoringIntervals.set('CRYPTO_MONITORING', interval);
  }

  /**
   * Start console monitoring
   */
  private startConsoleMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor console access
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      this.auditLogger.logInfo('DEFENSE', 'Console.log called', { args });
      originalLog.apply(console, args);
    };

    console.warn = (...args) => {
      this.auditLogger.logWarn('DEFENSE', 'Console.warn called', { args });
      originalWarn.apply(console, args);
    };

    console.error = (...args) => {
      this.auditLogger.logError('DEFENSE', 'Console.error called', { args });
      originalError.apply(console, args);
    };
  }

  /**
   * Check DOM security
   */
  private checkDOMSecurity(): void {
    if (typeof window === 'undefined') return;

    try {
      // Check for suspicious scripts
      const scripts = document.querySelectorAll('script');
      scripts.forEach(script => {
        const src = script.src;
        if (src && !this.isTrustedSource(src)) {
          this.addThreat('INJECTION', 'HIGH', `Suspicious script source: ${src}`);
        }
      });

      // Check for inline event handlers
      const elementsWithEvents = document.querySelectorAll('[onclick], [onload], [onerror]');
      if (elementsWithEvents.length > 0) {
        this.addThreat('INJECTION', 'MEDIUM', 'Inline event handlers detected');
      }
    } catch (error) {
      this.auditLogger.logError('DEFENSE', 'DOM security check failed', { error });
    }
  }

  /**
   * Check network security
   */
  private checkNetworkSecurity(): void {
    // Check if we're still on HTTPS
    if (typeof window !== 'undefined' && window.location.protocol !== 'https:') {
      this.addThreat('TAMPERING', 'HIGH', 'Protocol downgrade detected');
    }
  }

  /**
   * Check storage security
   */
  private checkStorageSecurity(): void {
    try {
      // Check if storage is accessible
      if (typeof localStorage !== 'undefined') {
        localStorage.getItem('_security_test');
      }
    } catch (error) {
      this.addThreat('TAMPERING', 'MEDIUM', 'Storage access blocked');
    }
  }

  /**
   * Check crypto security
   */
  private checkCryptoSecurity(): void {
    try {
      if (typeof crypto === 'undefined' || !crypto.subtle) {
        this.addThreat('TAMPERING', 'CRITICAL', 'Crypto API not available');
      }
    } catch (error) {
      this.addThreat('TAMPERING', 'CRITICAL', 'Crypto API check failed');
    }
  }

  /**
   * Check if source is trusted
   */
  private isTrustedSource(src: string): boolean {
    const trustedDomains = [
      window.location.origin,
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ];

    return trustedDomains.some(domain => src.startsWith(domain));
  }

  /**
   * Add new threat
   */
  private addThreat(type: Threat['type'], severity: Threat['severity'], description: string): void {
    const threat: Threat = {
      type,
      severity,
      description,
      timestamp: Date.now(),
      mitigated: false
    };

    this.threats.push(threat);
    this.auditLogger.logSecurity('DEFENSE', `Threat detected: ${description}`, { threat });

    // Auto-mitigate low severity threats
    if (severity === 'LOW') {
      this.mitigateThreat(threat);
    }
  }

  /**
   * Mitigate threat
   */
  private mitigateThreat(threat: Threat): void {
    threat.mitigated = true;
    this.auditLogger.logInfo('DEFENSE', `Threat mitigated: ${threat.description}`);
  }

  /**
   * Run security check
   */
  private async runSecurityCheck(): Promise<void> {
    try {
      await this.securityChecker.runChecks();
      this.lastCheckTime = Date.now();
    } catch (error) {
      this.auditLogger.logError('DEFENSE', 'Security check failed', { error });
    }
  }

  /**
   * Generate security recommendations
   */
  private generateRecommendations(failedChecks: any[]): string[] {
    const recommendations: string[] = [];

    if (failedChecks.some(check => check.check.name === 'Crypto Check')) {
      recommendations.push('Enable HTTPS and ensure crypto APIs are available');
    }

    if (failedChecks.some(check => check.check.name === 'Storage Check')) {
      recommendations.push('Check browser storage permissions and IndexedDB support');
    }

    if (this.threats.some(threat => !threat.mitigated && threat.severity === 'HIGH')) {
      recommendations.push('Address high-severity threats immediately');
    }

    return recommendations;
  }
}