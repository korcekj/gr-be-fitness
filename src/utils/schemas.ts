import { z } from 'zod';
import { hashPassword } from './';
import { USER_ROLE } from './enums';

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signUpSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.nativeEnum(USER_ROLE).optional(),
  })
  .transform((data) => {
    return {
      ...data,
      password: hashPassword(data.password),
    };
  });
