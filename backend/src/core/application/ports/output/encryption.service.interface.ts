export interface EncryptionServiceInterface {
  encrypt(plainText: string): string;
  decrypt(cipherText: string): string;
}
