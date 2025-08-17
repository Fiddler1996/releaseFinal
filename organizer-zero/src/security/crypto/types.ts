// Crypto Types for Security Core
export interface EncryptedData {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
  tag: ArrayBuffer;
}

export interface CryptoKeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface KeyDerivationParams {
  iterations: number;
  hash: string;
  salt: Uint8Array;
}

export interface EncryptionOptions {
  algorithm: string;
  keyLength: number;
  ivLength: number;
}

export interface SignatureData {
  signature: ArrayBuffer;
  algorithm: string;
  timestamp: number;
}