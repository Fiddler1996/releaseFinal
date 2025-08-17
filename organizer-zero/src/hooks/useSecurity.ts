import { useCallback, useContext } from 'react';
import { useAppContext } from '../store/context';

export const useSecurity = () => {
  const { security } = useAppContext();

  const secureGet = useCallback(async <T>(key: string): Promise<T | null> => {
    if (!security) throw new Error('Security not initialized');
    return (security.secureStorage as any).getSecure(key);
  }, [security]);

  const secureSet = useCallback(async <T>(key: string, value: T): Promise<void> => {
    if (!security) throw new Error('Security not initialized');
    return security.secureStorage.setSecure(key, value);
  }, [security]);

  const secureRemove = useCallback(async (key: string): Promise<void> => {
    if (!security) throw new Error('Security not initialized');
    return security.secureStorage.removeSecure(key);
  }, [security]);

  const secureClear = useCallback(async (): Promise<void> => {
    if (!security) throw new Error('Security not initialized');
    return security.secureStorage.clear();
  }, [security]);

  const lock = useCallback(() => {
    if (!security) throw new Error('Security not initialized');
    security.lock();
  }, [security]);

  const unlock = useCallback(async (password: string): Promise<boolean> => {
    if (!security) throw new Error('Security not initialized');
    return security.unlock(password);
  }, [security]);

  const getSecurityStatus = useCallback(async () => {
    if (!security) throw new Error('Security not initialized');
    return security.getSecurityStatus();
  }, [security]);

  const exportAuditLog = useCallback(() => {
    if (!security) throw new Error('Security not initialized');
    return security.exportAuditLog();
  }, [security]);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!security) throw new Error('Security not initialized');
    return security.changeMasterPassword(oldPassword, newPassword);
  }, [security]);

  const backupSecurityData = useCallback(async (): Promise<string> => {
    if (!security) throw new Error('Security not initialized');
    return security.backupSecurityData();
  }, [security]);

  const restoreSecurityData = useCallback(async (backupData: string): Promise<boolean> => {
    if (!security) throw new Error('Security not initialized');
    return security.restoreSecurityData(backupData);
  }, [security]);

  return {
    // Core operations
    secureGet,
    secureSet,
    secureRemove,
    secureClear,
    
    // Authentication
    lock,
    unlock,
    
    // Security management
    getSecurityStatus,
    exportAuditLog,
    changePassword,
    backupSecurityData,
    restoreSecurityData,
    
    // Status
    isSecure: !!security,
    isInitialized: security?.isInitialized || false,
    
    // Direct access (use with caution)
    security
  };
};