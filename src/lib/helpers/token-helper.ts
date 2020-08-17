import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = process.env;
const refreshTokenSize = 24;

export const generateAccessToken = <P extends object>(payload: P, expiresIn: string = '1h'): string =>
  jwt.sign(payload, JWT_SECRET as string, { issuer: 'beginner', expiresIn });

export const decodeAccessToken = (token: string): object | string => jwt.verify(token, JWT_SECRET as string);

export const generateRefreshToken = (): string => crypto.randomBytes(refreshTokenSize).toString('hex');
