export interface ITokenService {
  generateAccessToken(payload: Record<string, any>): Promise<string>;
  generateRefreshToken(payload: Record<string, any>): Promise<string>;
  verifyToken<T extends object= Record<string, unknown>>(token: string, type: 'access' | 'refresh'): Promise<T>;
  decodeToken<T = Record<string, unknown>>(token: string): T | null;
}
