import { randomBytes, pbkdf2Sync as pbkdf2 } from 'crypto';

export const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2(password, salt, 100_000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};
