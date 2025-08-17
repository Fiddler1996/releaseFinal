import { SecureStorage, SecureStorageImpl } from '../storage/SecureStorage';
import { SecureHttpClient, SecureHttpClientImpl } from './SecureHttpClient';
import { AuditLogger, AuditLoggerImpl } from './AuditLog';
import { ActiveDefense, ActiveDefenseImpl } from '../defense/ActiveDefense';

export interface SecurityContext {
  secureStorage: SecureStorage;
  secureHttp: SecureHttpClient;
  auditLog: AuditLogger;
  defense: ActiveDefense;
  isInitialized: boolean;
  initialize(masterPassword: string): Promise<void>;
  lock(): void;
  unlock(password: string): Promise<boolean>;
  getSecurityStatus(): Promise<any>;
  exportAuditLog(): string;
}

export class SecurityContextImpl implements SecurityContext {
  public secureStorage: SecureStorage;
  public secureHttp: SecureHttpClient;
  public auditLog: AuditLogger;
  public defense: ActiveDefense;
  private _isInitialized: boolean = false;

  constructor() {
    // Initialize components
    this.auditLog = new AuditLoggerImpl();
    this.secureStorage = new SecureStorageImpl();
    this.secureHttp = new SecureHttpClientImpl(this.auditLog);
    this.defense = new ActiveDefenseImpl(this.auditLog);

    this.auditLog.logInfo('GENERAL', 'Security context created');
  }

  /**
   * Get initialization status
   */
  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * Initialize security context with master password
   */
  async initialize(masterPassword: string): Promise<void> {
    try {
      this.auditLog.logInfo('AUTH', 'Initializing security context');

      // Initialize secure storage
      await (this.secureStorage as any).initialize(masterPassword);
      this.auditLog.logInfo('STORAGE', 'Secure storage initialized');

      // Start active defense
      this.defense.start();
      this.auditLog.logInfo('DEFENSE', 'Active defense started');

              // Set base URL for HTTP client (if available)
        if (typeof window !== 'undefined') {
          const baseURL = window.location.origin;
          (this.secureHttp as any).setBaseURL(baseURL);
          this.auditLog.logInfo('HTTP', `HTTP client base URL set: ${baseURL}`);
        }

      this._isInitialized = true;
      this.auditLog.logInfo('AUTH', 'Security context initialization completed');
    } catch (error) {
      this.auditLog.logError('AUTH', 'Security context initialization failed', { error });
      throw error;
    }
  }

  /**
   * Lock security context
   */
  lock(): void {
    if (!this._isInitialized) {
      return;
    }

    try {
      // Lock secure storage
      (this.secureStorage as any).lock();
      
      // Stop active defense
      this.defense.stop();
      
      this._isInitialized = false;
      
      this.auditLog.logInfo('AUTH', 'Security context locked');
    } catch (error) {
      this.auditLog.logError('AUTH', 'Failed to lock security context', { error });
    }
  }

  /**
   * Unlock security context with password
   */
  async unlock(password: string): Promise<boolean> {
    try {
      this.auditLog.logInfo('AUTH', 'Attempting to unlock security context');

      // Try to unlock secure storage
      const success = await (this.secureStorage as any).unlock(password);
      
      if (success) {
        // Restart active defense
        this.defense.start();
        
        this._isInitialized = true;
        
        this.auditLog.logInfo('AUTH', 'Security context unlocked successfully');
        return true;
      } else {
        this.auditLog.logSecurity('AUTH', 'Failed to unlock security context - invalid password');
        return false;
      }
    } catch (error) {
      this.auditLog.logError('AUTH', 'Unlock operation failed', { error });
      return false;
    }
  }

  /**
   * Get current security status
   */
  async getSecurityStatus(): Promise<any> {
    try {
      const defenseStatus = await this.defense.getSecurityStatus();
      const auditEvents = this.auditLog.getEvents(50); // Last 50 events
      
      return {
        isInitialized: this._isInitialized,
        defense: defenseStatus,
        recentAuditEvents: auditEvents,
        timestamp: Date.now()
      };
    } catch (error) {
      this.auditLog.logError('GENERAL', 'Failed to get security status', { error });
      throw error;
    }
  }

  /**
   * Export audit log
   */
  exportAuditLog(): string {
    return this.auditLog.exportEvents();
  }

  /**
   * Get secure storage instance
   */
  getSecureStorage(): SecureStorage {
    if (!this._isInitialized) {
      throw new Error('Security context not initialized');
    }
    return this.secureStorage;
  }

  /**
   * Get secure HTTP client instance
   */
  getSecureHttpClient(): SecureHttpClient {
    if (!this._isInitialized) {
      throw new Error('Security context not initialized');
    }
    return this.secureHttp;
  }

  /**
   * Get audit logger instance
   */
  getAuditLogger(): AuditLogger {
    return this.auditLog;
  }

  /**
   * Get active defense instance
   */
  getActiveDefense(): ActiveDefense {
    if (!this._isInitialized) {
      throw new Error('Security context not initialized');
    }
    return this.defense;
  }

  /**
   * Change master password
   */
  async changeMasterPassword(oldPassword: string, newPassword: string): Promise<boolean> {
    try {
      this.auditLog.logInfo('AUTH', 'Attempting to change master password');

      // Verify old password
      const isValid = await (this.secureStorage as any).unlock(oldPassword);
      if (!isValid) {
        this.auditLog.logSecurity('AUTH', 'Password change failed - invalid old password');
        return false;
      }

      // Reinitialize with new password
      await (this.secureStorage as any).initialize(newPassword);
      
      this.auditLog.logInfo('AUTH', 'Master password changed successfully');
      return true;
    } catch (error) {
      this.auditLog.logError('AUTH', 'Password change failed', { error });
      return false;
    }
  }

  /**
   * Backup security data
   */
  async backupSecurityData(): Promise<string> {
    try {
      if (!this._isInitialized) {
        throw new Error('Security context not initialized');
      }

      const backup = {
        timestamp: Date.now(),
        auditLog: this.auditLog.exportEvents(),
        securityStatus: await this.getSecurityStatus()
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      this.auditLog.logError('GENERAL', 'Backup failed', { error });
      throw error;
    }
  }

  /**
   * Restore security data
   */
  async restoreSecurityData(backupData: string): Promise<boolean> {
    try {
      const backup = JSON.parse(backupData);
      
      // Validate backup structure
      if (!backup.timestamp || !backup.auditLog || !backup.securityStatus) {
        throw new Error('Invalid backup data structure');
      }

      this.auditLog.logInfo('GENERAL', 'Security data restore initiated', { 
        backupTimestamp: backup.timestamp 
      });

      // TODO: Implement restore logic
      // This would involve restoring audit logs and other security data
      
      return true;
    } catch (error) {
      this.auditLog.logError('GENERAL', 'Restore failed', { error });
      return false;
    }
  }
}