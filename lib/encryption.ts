import CryptoJS from 'crypto-js';

export class EncryptionService {
  private static readonly key = process.env.ENCRYPTION_KEY!;

  static encrypt(data: string): Record<string, string> {
    const encrypted = CryptoJS.AES.encrypt(data, this.key).toString();
    return { encrypted };
  }

  static decrypt(encryptedData: Record<string, string>): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData.encrypted, this.key);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}