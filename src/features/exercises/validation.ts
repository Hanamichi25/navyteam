import { z } from 'zod';

const MUSCLE_GROUPS = [
  'chest',
  'back',
  'legs',
  'shoulders',
  'arms',
  'core',
  'cardio',
  'full_body',
] as const;

/** Esquema de validación del formulario de ejercicio (crear/editar). */
export const exerciseSchema = z
  .object({
    name: z.string().min(1, 'Ingresa un nombre'),
    muscleGroup: z.enum(MUSCLE_GROUPS).nullable(),
    equipment: z.string().min(1, 'Ingresa el equipo necesario'),
    description: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.muscleGroup === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['muscleGroup'],
        message: 'Elige un grupo muscular',
      });
    }
  });

export type ExerciseFormValues = z.infer<typeof exerciseSchema>;
