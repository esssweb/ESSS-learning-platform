export interface HashServiceInterface {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hashedText: string): Promise<boolean>;
}
