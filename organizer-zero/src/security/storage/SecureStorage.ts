import { HardcoreCryptoEngine } from '../crypto/HardcoreCryptoEngine';
import { IndexedDBAdapter } from './IndexedDBAdapter';

export interface SecureStorage {
  getSecure<T>(key: string): Promise<T | null>;
  setSecure<T>(key: string, value: T): Promise<void>;
  removeSecure(key: string): Promise<void>;
  clear(): Promise<void>;
  isInitialized(): boolean;
}

export class SecureStorageImpl implements SecureStorage {
  private cryptoEngine: HardcoreCryptoEngine;
  private dbAdapter: IndexedDBAdapter;
  private masterKey: CryptoKey | null = null;
  private isInitializedFlag = false;

  constructor() {
    this.cryptoEngine = new HardcoreCryptoEngine();
    this.dbAdapter = new IndexedDBAdapter({
      name: 'OrganizerZeroSecureDB',
      version: 1,
      storeName: 'secureData'
    });
  }

  /**
   * Initialize secure storage with master password
   */
  async initialize(masterPassword: string): Promise<void> {
    try {
      // Initialize IndexedDB
      await this.dbAdapter.initialize();

      // Derive master key from password
      const salt = this.cryptoEngine.generateSalt();
      this.masterKey = await this.cryptoEngine.deriveKey(masterPassword, salt);

      // Store salt securely (we'll use a special key for this)
      const saltData = {
        salt: Array.from(salt),
        timestamp: Date.now()
      };
      
      // Store salt without encryption (it's not sensitive)
      await this.dbAdapter.set('_salt', saltData);
      
      this.isInitializedFlag = true;
    } catch (error) {
      throw new Error(`Failed to initialize secure storage: ${error}`);
    }
  }

  /**
   * Get encrypted data and decrypt it
   */
  async getSecure<T>(key: string): Promise<T | null> {
    if (!this.isInitializedFlag || !this.masterKey) {
      throw new Error('Secure storage not initialized');
    }

    try {
      // Get encrypted data from IndexedDB
      const encryptedData = await this.dbAdapter.get<{
        encryptedValue: string;
        iv: number[];
        timestamp: number;
      }>(key);

      if (!encryptedData) {
        return null;
      }

      // Convert arrays back to proper types
      const iv = new Uint8Array(encryptedData.iv);
      
      // Decrypt the data
      const decrypted = await this.cryptoEngine.decrypt(
        {
          ciphertext: this.base64ToArrayBuffer(encryptedData.encryptedValue),
          iv: iv,
          salt: new Uint8Array(0),
          tag: new ArrayBuffer(0)
        },
        this.masterKey
      );

      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`Failed to decrypt data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Encrypt data and store it securely
   */
  async setSecure<T>(key: string, value: T): Promise<void> {
    if (!this.isInitializedFlag || !this.masterKey) {
      throw new Error('Secure storage not initialized');
    }

    try {
      // Serialize the value
      const serializedValue = JSON.stringify(value);
      
      // Encrypt the data
      const encrypted = await this.cryptoEngine.encrypt(serializedValue, this.masterKey);
      
      // Store encrypted data in IndexedDB
      const dataToStore = {
        encryptedValue: this.arrayBufferToBase64(encrypted.ciphertext),
        iv: Array.from(encrypted.iv),
        timestamp: Date.now()
      };

      await this.dbAdapter.set(key, dataToStore);
    } catch (error) {
      throw new Error(`Failed to encrypt and store data for key ${key}: ${error}`);
    }
  }

  /**
   * Remove encrypted data
   */
  async removeSecure(key: string): Promise<void> {
    if (!this.isInitializedFlag) {
      throw new Error('Secure storage not initialized');
    }

    await this.dbAdapter.remove(key);
  }

  /**
   * Clear all encrypted data
   */
  async clear(): Promise<void> {
    if (!this.isInitializedFlag) {
      throw new Error('Secure storage not initialized');
    }

    await this.dbAdapter.clear();
  }

  /**
   * Check if storage is initialized
   */
  isInitialized(): boolean {
    return this.isInitializedFlag;
  }

  /**
   * Get master key (for internal use only)
   */
  getMasterKey(): CryptoKey | null {
    return this.masterKey;
  }

  /**
   * Utility: Convert ArrayBuffer to base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Utility: Convert base64 string to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Lock the storage (clear master key)
   */
  lock(): void {
    this.masterKey = null;
    this.isInitializedFlag = false;
  }

  /**
   * Unlock the storage with password
   */
  async unlock(masterPassword: string): Promise<boolean> {
    try {
      // Get stored salt
      const saltData = await this.dbAdapter.get<{
        salt: number[];
        timestamp: number;
      }>('_salt');

      if (!saltData) {
        return false;
      }

      // Derive key and test with a known value
      const salt = new Uint8Array(saltData.salt);
      this.masterKey = await this.cryptoEngine.deriveKey(masterPassword, salt);
      
      // Test decryption with a test key
      const testKey = '_test_unlock';
      try {
        await this.getSecure(testKey);
        this.isInitializedFlag = true;
        return true;
      } catch {
        // If test fails, the password is wrong
        this.masterKey = null;
        return false;
      }
    } catch {
      return false;
    }
  }
}