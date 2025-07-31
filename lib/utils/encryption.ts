export class EncryptionService {
    private static readonly ALGORITHM = 'AES-GCM';
    private static readonly KEY_LENGTH = 256;
  
    private static async getKey(): Promise<CryptoKey> {
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(process.env.ENCRYPTION_KEY || 'default-key-change-in-production'),
        { name: 'PBKDF2' },
        false,
        ['deriveBits', 'deriveKey']
      );
  
      return crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: new TextEncoder().encode('salt'),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: this.ALGORITHM, length: this.KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
      );
    }
  
    static async encrypt(data: string): Promise<string> {
      try {
        const key = await this.getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encodedData = new TextEncoder().encode(data);
  
        const encryptedData = await crypto.subtle.encrypt(
          { name: this.ALGORITHM, iv },
          key,
          encodedData
        );
  
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);
  
        return btoa(String.fromCharCode(...combined));
      } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
      }
    }
  
    static async decrypt(encryptedData: string): Promise<string> {
      try {
        const key = await this.getKey();
        const combined = new Uint8Array(
          atob(encryptedData).split('').map(char => char.charCodeAt(0))
        );
  
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);
  
        const decryptedData = await crypto.subtle.decrypt(
          { name: this.ALGORITHM, iv },
          key,
          data
        );
  
        return new TextDecoder().decode(decryptedData);
      } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
      }
    }
  }