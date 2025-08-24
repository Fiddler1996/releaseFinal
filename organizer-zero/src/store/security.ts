// store/security.ts
import { settingsManager } from './settings';
import CryptoJS from 'crypto-js';

export interface SecurityState {
  isLocked: boolean;
  lastActive: number;
}

class SecurityManager {
  private state: SecurityState = {
    isLocked: false,
    lastActive: Date.now()
  };

  private LOCK_KEY = 'security_lock';

  constructor() {
    this.loadState();
    this.setupAutoLock();
  }

  private loadState() {
    try {
      const stored = localStorage.getItem(this.LOCK_KEY);
      if (stored) {
        this.state = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load security state', e);
    }
  }

  private saveState() {
    try {
      localStorage.setItem(this.LOCK_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save security state', e);
    }
  }

  public setupAutoLock() {
    const timeout = settingsManager.getSetting('autoLockTimeout') as number | undefined;
    if (timeout && timeout > 0) {
      setInterval(() => {
        const now = Date.now();
        const elapsed = (now - this.state.lastActive) / 60000;
        if (elapsed >= timeout && !this.state.isLocked) {
          this.lock();
        }
      }, 60 * 1000);
    }
  }

  public lock() {
    this.state.isLocked = true;
    this.saveState();
  }

  public unlock(password?: string) {
    // placeholder for auth validation
    this.state.isLocked = false;
    this.state.lastActive = Date.now();
    this.saveState();
  }

  public isLocked(): boolean {
    return this.state.isLocked;
  }

  public updateActivity() {
    this.state.lastActive = Date.now();
    this.saveState();
  }

  public encryptData(data: string): string {
    const secret = this.getSecret();
    return CryptoJS.AES.encrypt(data, secret).toString();
  }

  public decryptData(cipher: string): string {
    const secret = this.getSecret();
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, secret);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  }

  private getSecret(): string {
    const requireAuth = settingsManager.getSetting('requireAuth') as boolean | undefined;
    return requireAuth ? 'local_secret_key' : 'default_key';
  }

  public getState(): SecurityState {
    return { ...this.state };
  }
}

export const securityManager = new SecurityManager();