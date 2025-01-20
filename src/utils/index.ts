import jwt from 'jsonwebtoken';
import { randomBytes, pbkdf2Sync as pbkdf2 } from 'crypto';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2(password, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password: string, hash: string) => {
  const [salt, hash1] = hash.split(':');
  const hash2 = pbkdf2(password, salt, 100_000, 64, 'sha512').toString('hex');
  return hash1 === hash2;
};

export const createToken = (
  payload: object,
  expiresIn: string | number = '1h'
) => {
  const secret = process.env.JWT_SECRET;
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token: string) => {
  try {
    const secret = process.env.JWT_SECRET;
    return jwt.verify(token, secret);
  } catch (e) {
    return null;
  }
};
