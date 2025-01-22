import { z } from 'zod';
import { hashPassword } from './';
import { USER_ROLE } from './enums';

export const tokenSchema = z.object({
  id: z.string().min(1),
});

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

export const getUserSchema = z.object({
  id: z.string().min(1),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1),
    surname: z.string().min(1),
    nickName: z.string().min(1),
    age: z.number().positive(),
    role: z.nativeEnum(USER_ROLE),
  })
  .partial();

export const getExercisesSchema = z
  .object({
    search: z.string().min(1),
    page: z.coerce.number().positive(),
    limit: z.coerce.number().positive(),
    programID: z.coerce.number().positive(),
  })
  .partial()
  .refine(({ page, limit }) => (page !== undefined) === (limit !== undefined), {
    message: 'Both page and limit must be positive',
    path: ['page', 'limit'],
  });
