// IndexedDB Adapter for Secure Storage
export interface IndexedDBConfig {
  name: string;
  version: number;
  storeName: string;
}

export class IndexedDBAdapter {
  private db: IDBDatabase | null = null;
  private readonly config: IndexedDBConfig;

  constructor(config: IndexedDBConfig) {
    this.config = config;
  }

  /**
   * Initialize IndexedDB connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.config.name, this.config.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.config.storeName)) {
          db.createObjectStore(this.config.storeName, { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * Store data in IndexedDB
   */
  async set(key: string, value: any): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      
      const request = store.put({ key, value, timestamp: Date.now() });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Retrieve data from IndexedDB
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  /**
   * Remove data from IndexedDB
   */
  async remove(key: string): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all data from IndexedDB
   */
  async clear(): Promise<void> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readwrite');
      const store = transaction.objectStore(this.config.storeName);
      
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Get all keys from IndexedDB
   */
  async getAllKeys(): Promise<string[]> {
    if (!this.db) {
      throw new Error('IndexedDB not initialized');
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.config.storeName], 'readonly');
      const store = transaction.objectStore(this.config.storeName);
      
      const request = store.getAllKeys();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const keys = request.result as string[];
        resolve(keys);
      };
    });
  }

  /**
   * Check if IndexedDB is available
   */
  static isAvailable(): boolean {
    return typeof indexedDB !== 'undefined';
  }

  /**
   * Close IndexedDB connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}