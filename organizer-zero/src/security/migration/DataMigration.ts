import { SecurityContext } from '../core/SecurityContext';

export interface MigrationResult {
  success: boolean;
  migratedItems: number;
  errors: string[];
  timestamp: number;
}

export interface MigrationItem {
  key: string;
  value: any;
  source: 'localStorage' | 'sessionStorage' | 'indexedDB';
  timestamp: number;
}

export class DataMigration {
  private static readonly MIGRATION_KEY = '_migration_completed';
  private static readonly BACKUP_KEY = '_migration_backup';

  /**
   * Migrate data from localStorage to SecureStorage
   */
  static async migrateFromLocalStorage(security: SecurityContext): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedItems: 0,
      errors: [],
      timestamp: Date.now()
    };

    try {
      // Check if migration was already completed
      const migrationCompleted = await security.secureStorage.getSecure<boolean>(this.MIGRATION_KEY);
      if (migrationCompleted) {
        result.success = true;
        result.migratedItems = 0;
        result.errors.push('Migration already completed');
        return result;
      }

      // Create backup before migration
      await this.createBackup(security);

      // Get all localStorage items
      const localStorageItems = this.getLocalStorageItems();
      
      // Migrate each item
      for (const item of localStorageItems) {
        try {
          await security.secureStorage.setSecure(item.key, item.value);
          result.migratedItems++;
          
          // Log migration
          security.auditLog.logInfo('STORAGE', `Migrated item: ${item.key}`, { item });
        } catch (error) {
          const errorMsg = `Failed to migrate ${item.key}: ${(error as any).message}`;
          result.errors.push(errorMsg);
          security.auditLog.logError('STORAGE', errorMsg, { item, error });
        }
      }

      // Mark migration as completed
      await security.secureStorage.setSecure(this.MIGRATION_KEY, true);
      
      result.success = true;
      
      // Log successful migration
      security.auditLog.logInfo('STORAGE', 'Data migration completed successfully', {
        migratedItems: result.migratedItems,
        errors: result.errors
      });

    } catch (error) {
      result.errors.push(`Migration failed: ${(error as any).message}`);
      security.auditLog.logError('STORAGE', 'Data migration failed', { error });
    }

    return result;
  }

  /**
   * Get all items from localStorage
   */
  private static getLocalStorageItems(): MigrationItem[] {
    const items: MigrationItem[] = [];
    
    if (typeof localStorage === 'undefined') {
      return items;
    }

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith('_')) { // Skip internal keys
          try {
            const value = localStorage.getItem(key);
            if (value !== null) {
              const parsedValue = this.safeParseJSON(value);
              items.push({
                key,
                value: parsedValue,
                source: 'localStorage',
                timestamp: Date.now()
              });
            }
          } catch (error) {
            // Skip items that can't be parsed
            console.warn(`Skipping localStorage item ${key}: ${(error as any).message}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to read localStorage:', error);
    }

    return items;
  }

  /**
   * Create backup of existing data
   */
  private static async createBackup(security: SecurityContext): Promise<void> {
    try {
      const backup = {
        timestamp: Date.now(),
        localStorageItems: this.getLocalStorageItems(),
        sessionStorageItems: this.getSessionStorageItems()
      };

      await security.secureStorage.setSecure(this.BACKUP_KEY, backup);
      
      security.auditLog.logInfo('STORAGE', 'Migration backup created', { 
        backupSize: JSON.stringify(backup).length 
      });
    } catch (error) {
      security.auditLog.logWarn('STORAGE', 'Failed to create migration backup', { error });
    }
  }

  /**
   * Get all items from sessionStorage
   */
  private static getSessionStorageItems(): MigrationItem[] {
    const items: MigrationItem[] = [];
    
    if (typeof sessionStorage === 'undefined') {
      return items;
    }

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && !key.startsWith('_')) { // Skip internal keys
          try {
            const value = sessionStorage.getItem(key);
            if (value !== null) {
              const parsedValue = this.safeParseJSON(value);
              items.push({
                key,
                value: parsedValue,
                source: 'sessionStorage',
                timestamp: Date.now()
              });
            }
          } catch (error) {
            // Skip items that can't be parsed
            console.warn(`Skipping sessionStorage item ${key}: ${(error as any).message}`);
          }
        }
      }
    } catch (error) {
      console.error('Failed to read sessionStorage:', error);
    }

    return items;
  }

  /**
   * Safely parse JSON without throwing errors
   */
  private static safeParseJSON(value: string): any {
    try {
      return JSON.parse(value);
    } catch {
      // Return as string if JSON parsing fails
      return value;
    }
  }

  /**
   * Restore data from backup
   */
  static async restoreFromBackup(security: SecurityContext): Promise<boolean> {
    try {
      const backup = await security.secureStorage.getSecure<any>(this.BACKUP_KEY);
      if (!backup) {
        throw new Error('No backup found');
      }

      // Restore localStorage items
      if (backup.localStorageItems && Array.isArray(backup.localStorageItems)) {
        for (const item of backup.localStorageItems) {
          try {
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(item.key, JSON.stringify(item.value));
            }
          } catch (error) {
            security.auditLog.logWarn('STORAGE', `Failed to restore localStorage item: ${item.key}`, { error });
          }
        }
      }

      // Restore sessionStorage items
      if (backup.sessionStorageItems && Array.isArray(backup.sessionStorageItems)) {
        for (const item of backup.sessionStorageItems) {
          try {
            if (typeof sessionStorage !== 'undefined') {
              sessionStorage.setItem(item.key, JSON.stringify(item.value));
            }
          } catch (error) {
            security.auditLog.logWarn('STORAGE', `Failed to restore sessionStorage item: ${item.key}`, { error });
          }
        }
      }

      security.auditLog.logInfo('STORAGE', 'Data restored from backup', { 
        backupTimestamp: backup.timestamp 
      });

      return true;
    } catch (error) {
      security.auditLog.logError('STORAGE', 'Failed to restore from backup', { error });
      return false;
    }
  }

  /**
   * Check migration status
   */
  static async getMigrationStatus(security: SecurityContext): Promise<{
    isCompleted: boolean;
    backupExists: boolean;
    lastMigration?: number;
  }> {
    try {
      const migrationCompleted = await security.secureStorage.getSecure<boolean>(this.MIGRATION_KEY);
      const backup = await security.secureStorage.getSecure<any>(this.BACKUP_KEY);
      
      return {
        isCompleted: !!migrationCompleted,
        backupExists: !!backup,
        lastMigration: backup?.timestamp
      };
    } catch (error) {
      return {
        isCompleted: false,
        backupExists: false
      };
    }
  }

  /**
   * Clear migration data
   */
  static async clearMigrationData(security: SecurityContext): Promise<void> {
    try {
      await security.secureStorage.removeSecure(this.MIGRATION_KEY);
      await security.secureStorage.removeSecure(this.BACKUP_KEY);
      
      security.auditLog.logInfo('STORAGE', 'Migration data cleared');
    } catch (error) {
      security.auditLog.logError('STORAGE', 'Failed to clear migration data', { error });
    }
  }

  /**
   * Get migration statistics
   */
  static async getMigrationStats(security: SecurityContext): Promise<{
    totalItems: number;
    migratedItems: number;
    backupSize: number;
    migrationDate?: number;
  }> {
    try {
      const backup = await security.secureStorage.getSecure<any>(this.BACKUP_KEY);
      const migrationCompleted = await security.secureStorage.getSecure<boolean>(this.MIGRATION_KEY);
      
      const totalItems = (backup?.localStorageItems?.length || 0) + (backup?.sessionStorageItems?.length || 0);
      const backupSize = backup ? JSON.stringify(backup).length : 0;
      
      return {
        totalItems,
        migratedItems: migrationCompleted ? totalItems : 0,
        backupSize,
        migrationDate: backup?.timestamp
      };
    } catch (error) {
      return {
        totalItems: 0,
        migratedItems: 0,
        backupSize: 0
      };
    }
  }
}