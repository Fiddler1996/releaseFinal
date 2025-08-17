import { HardcoreCryptoEngine } from '../crypto/HardcoreCryptoEngine';

describe('HardcoreCryptoEngine', () => {
  let cryptoEngine: HardcoreCryptoEngine;
  let testKey: CryptoKey;

  beforeAll(async () => {
    cryptoEngine = new HardcoreCryptoEngine();
    
    // Generate a test key for testing
    testKey = await cryptoEngine.generateKey();
  });

  describe('Key Generation', () => {
    test('should generate random salt', () => {
      const salt1 = cryptoEngine.generateSalt();
      const salt2 = cryptoEngine.generateSalt();
      
      expect(salt1).toBeInstanceOf(Uint8Array);
      expect(salt1.length).toBe(32);
      expect(salt1).not.toEqual(salt2);
    });

    test('should generate random IV', () => {
      const iv1 = cryptoEngine.generateIV();
      const iv2 = cryptoEngine.generateIV();
      
      expect(iv1).toBeInstanceOf(Uint8Array);
      expect(iv1.length).toBe(12);
      expect(iv1).not.toEqual(iv2);
    });

    test('should generate crypto key', async () => {
      const key = await cryptoEngine.generateKey();
      
      expect(key).toBeInstanceOf(CryptoKey);
      expect(key.type).toBe('secret');
      expect(key.extractable).toBe(true);
    });
  });

  describe('Key Derivation', () => {
    test('should derive key from password', async () => {
      const password = 'testPassword123';
      const salt = cryptoEngine.generateSalt();
      
      const derivedKey = await cryptoEngine.deriveKey(password, salt);
      
      expect(derivedKey).toBeInstanceOf(CryptoKey);
      expect(derivedKey.type).toBe('secret');
    });

    test('should derive different keys for different passwords', async () => {
      const salt = cryptoEngine.generateSalt();
      const key1 = await cryptoEngine.deriveKey('password1', salt);
      const key2 = await cryptoEngine.deriveKey('password2', salt);
      
      expect(key1).not.toEqual(key2);
    });

    test('should derive different keys for different salts', async () => {
      const password = 'testPassword';
      const salt1 = cryptoEngine.generateSalt();
      const salt2 = cryptoEngine.generateSalt();
      
      const key1 = await cryptoEngine.deriveKey(password, salt1);
      const key2 = await cryptoEngine.deriveKey(password, salt2);
      
      expect(key1).not.toEqual(key2);
    });
  });

  describe('Encryption and Decryption', () => {
    test('should encrypt and decrypt data correctly', async () => {
      const testData = 'Hello, Security World!';
      
      const encrypted = await cryptoEngine.encrypt(testData, testKey);
      const decrypted = await cryptoEngine.decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(testData);
    });

    test('should encrypt different data differently', async () => {
      const data1 = 'Data 1';
      const data2 = 'Data 2';
      
      const encrypted1 = await cryptoEngine.encrypt(data1, testKey);
      const encrypted2 = await cryptoEngine.encrypt(data2, testKey);
      
      expect(encrypted1.ciphertext).not.toEqual(encrypted2.ciphertext);
      expect(encrypted1.iv).not.toEqual(encrypted2.iv);
    });

    test('should fail decryption with wrong key', async () => {
      const testData = 'Test data';
      const wrongKey = await cryptoEngine.generateKey();
      
      const encrypted = await cryptoEngine.encrypt(testData, testKey);
      
      await expect(
        cryptoEngine.decrypt(encrypted, wrongKey)
      ).rejects.toThrow();
    });
  });

  describe('HMAC Operations', () => {
    test('should sign and verify data correctly', async () => {
      const testData = 'Data to sign';
      
      const signature = await cryptoEngine.sign(testData, testKey);
      const isValid = await cryptoEngine.verify(testData, signature, testKey);
      
      expect(isValid).toBe(true);
    });

    test('should fail verification with wrong signature', async () => {
      const testData = 'Data to sign';
      const wrongSignature = 'wrong_signature';
      
      const isValid = await cryptoEngine.verify(testData, wrongSignature, testKey);
      
      expect(isValid).toBe(false);
    });

    test('should fail verification with modified data', async () => {
      const originalData = 'Original data';
      const modifiedData = 'Modified data';
      
      const signature = await cryptoEngine.sign(originalData, testKey);
      const isValid = await cryptoEngine.verify(modifiedData, signature, testKey);
      
      expect(isValid).toBe(false);
    });
  });

  describe('Configuration', () => {
    test('should return default key derivation parameters', () => {
      const params = cryptoEngine.getDefaultKeyDerivationParams();
      
      expect(params.iterations).toBe(200000);
      expect(params.hash).toBe('SHA-512');
      expect(params.salt).toBeInstanceOf(Uint8Array);
      expect(params.salt.length).toBe(32);
    });

    test('should return default encryption options', () => {
      const options = cryptoEngine.getDefaultEncryptionOptions();
      
      expect(options.algorithm).toBe('AES-GCM');
      expect(options.keyLength).toBe(256);
      expect(options.ivLength).toBe(12);
    });
  });

  describe('Error Handling', () => {
    test('should handle empty data gracefully', async () => {
      const emptyData = '';
      
      const encrypted = await cryptoEngine.encrypt(emptyData, testKey);
      const decrypted = await cryptoEngine.decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(emptyData);
    });

    test('should handle special characters', async () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      const encrypted = await cryptoEngine.encrypt(specialData, testKey);
      const decrypted = await cryptoEngine.decrypt(encrypted, testKey);
      
      expect(decrypted).toBe(specialData);
    });
  });
});