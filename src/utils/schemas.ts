import { z } from 'zod';
import { hashPassword } from './';
import { USER_ROLE, EXERCISE_DIFFICULTY } from './enums';

export const getModelSchema = z
  .object({
    id: z.string().min(1),
  })
  .refine(({ id }) => !isNaN(Number(id)), {
    message: 'ID must be a number',
    path: ['id'],
  });

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

export const createExerciseSchema = z.object({
  name: z.string().min(1),
  difficulty: z.nativeEnum(EXERCISE_DIFFICULTY),
  programID: z.number().positive(),
});

export const updateExerciseSchema = createExerciseSchema.partial();

export const updateProgramExerciseSchema = z
  .object({
    programID: z.string().min(1),
    exerciseID: z.string().min(1),
  })
  .refine(
    ({ programID, exerciseID }) =>
      !isNaN(Number(programID)) && !isNaN(Number(exerciseID)),
    {
      message: 'Program ID and exercise ID must be numbers',
      path: ['programID', 'exerciseID'],
    }
  );

export const createCompletionSchema = z.object({
  exerciseID: z.number().positive(),
  duration: z.number().positive(),
});
