import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import { UserJson } from '@app/database/models/user';

const { JWT_SECRET } = process.env;
const refreshTokenSize = 24;

interface JwtDecode {
  user: UserJson
}

export const generateAccessToken = <P extends object>(payload: P, expiresIn: string = '1h'): string =>
  jwt.sign(payload, JWT_SECRET as string, { issuer: 'beginner', expiresIn });

export const decodeAccessToken = (token: string) => jwt.verify(token, JWT_SECRET) as JwtDecode;

export const generateRefreshToken = (): string => crypto.randomBytes(refreshTokenSize).toString('hex');
