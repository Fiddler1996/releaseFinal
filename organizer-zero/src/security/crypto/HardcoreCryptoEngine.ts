import { EncryptedData, KeyDerivationParams, EncryptionOptions } from './types';

export class HardcoreCryptoEngine {
  private static readonly DEFAULT_ITERATIONS = 200000;
  private static readonly DEFAULT_HASH = 'SHA-512';
  private static readonly DEFAULT_KEY_LENGTH = 256;
  private static readonly DEFAULT_IV_LENGTH = 12;
  private static readonly ALGORITHM = 'AES-GCM';

  /**
   * Encrypt data using AES-256-GCM
   */
  async encrypt(data: string, key: CryptoKey): Promise<EncryptedData> {
    const iv = this.generateIV();
    const encodedData = new TextEncoder().encode(data);

    const encrypted = await crypto.subtle.encrypt(
      {
        name: HardcoreCryptoEngine.ALGORITHM,
        iv: iv as any,
        tagLength: 128
      },
      key,
      encodedData
    );

    return {
      ciphertext: encrypted,
      iv: iv as any,
      salt: new Uint8Array(0), // Salt is not used for AES-GCM, but kept for interface compatibility
      tag: new ArrayBuffer(0)  // Tag is embedded in ciphertext for AES-GCM
    } as any;
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  async decrypt(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
      {
        name: HardcoreCryptoEngine.ALGORITHM,
        iv: encryptedData.iv as any,
        tagLength: 128
      },
      key,
      encryptedData.ciphertext
    );

    return new TextDecoder().decode(decrypted);
  }

  /**
   * Derive key from password using PBKDF2-SHA512
   */
  async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encodedPassword = new TextEncoder().encode(password);
    
    const baseKey = await crypto.subtle.importKey(
      'raw',
      encodedPassword,
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as any,
        iterations: HardcoreCryptoEngine.DEFAULT_ITERATIONS,
        hash: HardcoreCryptoEngine.DEFAULT_HASH
      },
      baseKey,
      {
        name: HardcoreCryptoEngine.ALGORITHM,
        length: HardcoreCryptoEngine.DEFAULT_KEY_LENGTH
      },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate HMAC signature for data integrity
   */
  async sign(data: string, key: CryptoKey): Promise<string> {
    const encodedData = new TextEncoder().encode(data);
    
    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encodedData
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  /**
   * Verify HMAC signature
   */
  async verify(data: string, signature: string, key: CryptoKey): Promise<boolean> {
    try {
      const encodedData = new TextEncoder().encode(data);
      const signatureArray = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
      
      return await crypto.subtle.verify(
        'HMAC',
        key,
        signatureArray,
        encodedData
      );
    } catch {
      return false;
    }
  }

  /**
   * Generate random salt for key derivation
   */
  generateSalt(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  /**
   * Generate random IV for encryption
   */
  generateIV(): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(HardcoreCryptoEngine.DEFAULT_IV_LENGTH));
  }

  /**
   * Generate random key
   */
  async generateKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: HardcoreCryptoEngine.ALGORITHM,
        length: HardcoreCryptoEngine.DEFAULT_KEY_LENGTH
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get default key derivation parameters
   */
  getDefaultKeyDerivationParams(): KeyDerivationParams {
    return {
      iterations: HardcoreCryptoEngine.DEFAULT_ITERATIONS,
      hash: HardcoreCryptoEngine.DEFAULT_HASH,
      salt: this.generateSalt()
    };
  }

  /**
   * Get default encryption options
   */
  getDefaultEncryptionOptions(): EncryptionOptions {
    return {
      algorithm: HardcoreCryptoEngine.ALGORITHM,
      keyLength: HardcoreCryptoEngine.DEFAULT_KEY_LENGTH,
      ivLength: HardcoreCryptoEngine.DEFAULT_IV_LENGTH
    };
  }
}