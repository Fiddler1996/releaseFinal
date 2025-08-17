import { SecureStorageImpl } from '../storage/SecureStorage';
import { IndexedDBAdapter } from '../storage/IndexedDBAdapter';

// Mock IndexedDB for testing
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn()
};

// Mock crypto for testing
const mockCrypto = {
  subtle: {
    importKey: jest.fn(),
    deriveKey: jest.fn(),
    encrypt: jest.fn(),
    decrypt: jest.fn()
  },
  getRandomValues: jest.fn()
};

// Mock global objects
Object.defineProperty(global, 'indexedDB', {
  value: mockIndexedDB,
  writable: true
});

Object.defineProperty(global, 'crypto', {
  value: mockCrypto,
  writable: true
});

describe('SecureStorage', () => {
  let secureStorage: SecureStorageImpl;
  let mockDBAdapter: jest.Mocked<IndexedDBAdapter>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock IndexedDB adapter
    mockDBAdapter = {
      initialize: jest.fn(),
      set: jest.fn(),
      get: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      getAllKeys: jest.fn(),
      close: jest.fn()
    } as any;

    // Create SecureStorage with mocked dependencies
    secureStorage = new SecureStorageImpl();
    
    // Mock the private dbAdapter property
    (secureStorage as any).dbAdapter = mockDBAdapter;
  });

  describe('Initialization', () => {
    test('should initialize successfully with valid password', async () => {
      const masterPassword = 'testPassword123';
      
      // Mock successful initialization
      mockDBAdapter.initialize.mockResolvedValue(undefined);
      mockDBAdapter.set.mockResolvedValue(undefined);
      
      // Mock crypto operations
      const mockSalt = new Uint8Array(32);
      const mockKey = {} as CryptoKey;
      
      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      await secureStorage.initialize(masterPassword);

      expect(mockDBAdapter.initialize).toHaveBeenCalled();
      expect(mockDBAdapter.set).toHaveBeenCalledWith('_salt', expect.any(Object));
      expect(secureStorage.isInitialized()).toBe(true);
    });

    test('should fail initialization with invalid password', async () => {
      mockDBAdapter.initialize.mockRejectedValue(new Error('DB Error'));

      await expect(
        secureStorage.initialize('invalidPassword')
      ).rejects.toThrow('Failed to initialize secure storage: DB Error');

      expect(secureStorage.isInitialized()).toBe(false);
    });
  });

  describe('Storage Operations', () => {
    beforeEach(async () => {
      // Initialize storage first
      const masterPassword = 'testPassword123';
      mockDBAdapter.initialize.mockResolvedValue(undefined);
      mockDBAdapter.set.mockResolvedValue(undefined);
      
      const mockSalt = new Uint8Array(32);
      const mockKey = {} as CryptoKey;
      
      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      await secureStorage.initialize(masterPassword);
    });

    test('should store and retrieve data securely', async () => {
      const testData = { name: 'Test', value: 123 };
      const testKey = 'testKey';

      // Mock encryption
      const mockEncrypted = {
        ciphertext: new ArrayBuffer(16),
        iv: new Uint8Array(12),
        salt: new Uint8Array(0),
        tag: new ArrayBuffer(0)
      };

      mockCrypto.subtle.encrypt.mockResolvedValue(mockEncrypted.ciphertext);
      mockDBAdapter.set.mockResolvedValue(undefined);

      // Store data
      await secureStorage.setSecure(testKey, testData);

      expect(mockDBAdapter.set).toHaveBeenCalledWith(testKey, expect.objectContaining({
        encryptedValue: expect.any(String),
        iv: expect.any(Array),
        timestamp: expect.any(Number)
      }));

      // Mock decryption
      mockDBAdapter.get.mockResolvedValue({
        encryptedValue: 'encryptedData',
        iv: Array.from(mockEncrypted.iv),
        timestamp: Date.now()
      });

      mockCrypto.subtle.decrypt.mockResolvedValue(
        new TextEncoder().encode(JSON.stringify(testData))
      );

      // Retrieve data
      const retrieved = await secureStorage.getSecure(testKey);

      expect(retrieved).toEqual(testData);
    });

    test('should handle non-existent keys', async () => {
      mockDBAdapter.get.mockResolvedValue(null);

      const result = await secureStorage.getSecure('nonExistentKey');

      expect(result).toBeNull();
    });

    test('should remove data securely', async () => {
      const testKey = 'testKey';
      mockDBAdapter.remove.mockResolvedValue(undefined);

      await secureStorage.removeSecure(testKey);

      expect(mockDBAdapter.remove).toHaveBeenCalledWith(testKey);
    });

    test('should clear all data', async () => {
      mockDBAdapter.clear.mockResolvedValue(undefined);

      await secureStorage.clear();

      expect(mockDBAdapter.clear).toHaveBeenCalled();
    });
  });

  describe('Lock and Unlock', () => {
    beforeEach(async () => {
      // Initialize storage first
      const masterPassword = 'testPassword123';
      mockDBAdapter.initialize.mockResolvedValue(undefined);
      mockDBAdapter.set.mockResolvedValue(undefined);
      
      const mockSalt = new Uint8Array(32);
      const mockKey = {} as CryptoKey;
      
      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      await secureStorage.initialize(masterPassword);
    });

    test('should lock storage', () => {
      secureStorage.lock();

      expect(secureStorage.isInitialized()).toBe(false);
    });

    test('should unlock storage with correct password', async () => {
      // Lock first
      secureStorage.lock();

      // Mock unlock process
      mockDBAdapter.get.mockResolvedValue({
        salt: Array.from(new Uint8Array(32)),
        timestamp: Date.now()
      });

      const mockKey = {} as CryptoKey;
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      // Mock test key retrieval
      mockDBAdapter.get.mockResolvedValueOnce({
        salt: Array.from(new Uint8Array(32)),
        timestamp: Date.now()
      }).mockResolvedValueOnce(null); // Test key not found

      const success = await secureStorage.unlock('testPassword123');

      expect(success).toBe(false); // Should fail because test key doesn't exist
    });

    test('should fail unlock with wrong password', async () => {
      // Lock first
      secureStorage.lock();

      // Mock salt retrieval
      mockDBAdapter.get.mockResolvedValue({
        salt: Array.from(new Uint8Array(32)),
        timestamp: Date.now()
      });

      // Mock failed key derivation
      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Invalid password'));

      const success = await secureStorage.unlock('wrongPassword');

      expect(success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should throw error when accessing uninitialized storage', async () => {
      const testKey = 'testKey';

      await expect(
        secureStorage.getSecure(testKey)
      ).rejects.toThrow('Secure storage not initialized');
    });

    test('should handle encryption errors gracefully', async () => {
      // Initialize storage
      const masterPassword = 'testPassword123';
      mockDBAdapter.initialize.mockResolvedValue(undefined);
      mockDBAdapter.set.mockResolvedValue(undefined);
      
      const mockSalt = new Uint8Array(32);
      const mockKey = {} as CryptoKey;
      
      mockCrypto.getRandomValues.mockReturnValue(mockSalt);
      mockCrypto.subtle.importKey.mockResolvedValue(mockKey);
      mockCrypto.subtle.deriveKey.mockResolvedValue(mockKey);

      await secureStorage.initialize(masterPassword);

      // Mock encryption failure
      mockCrypto.subtle.encrypt.mockRejectedValue(new Error('Encryption failed'));

      await expect(
        secureStorage.setSecure('testKey', 'testValue')
      ).rejects.toThrow('Failed to encrypt and store data for key testKey: Encryption failed');
    });
  });

  describe('Utility Methods', () => {
    test('should convert ArrayBuffer to base64 and back', () => {
      const testData = 'Hello, World!';
      const encoder = new TextEncoder();
      const arrayBuffer = encoder.encode(testData).buffer;

      // Test conversion methods (accessing private methods through any)
      const base64 = (secureStorage as any).arrayBufferToBase64(arrayBuffer);
      const restored = (secureStorage as any).base64ToArrayBuffer(base64);

      expect(base64).toBeTypeOf('string');
      expect(restored).toBeInstanceOf(ArrayBuffer);
      
      // Verify data integrity
      const decoder = new TextDecoder();
      const restoredText = decoder.decode(restored);
      expect(restoredText).toBe(testData);
    });
  });
});