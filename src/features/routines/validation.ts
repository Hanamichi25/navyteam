import { z } from 'zod';

const ROUTINE_CATEGORIES = ['strength', 'cardio', 'flexibility'] as const;
const ROUTINE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

/**
 * Esquema de validación de los datos generales de la rutina. Los bloques de
 * ejercicio se validan aparte en `RoutineEditorForm` (son estado local, no
 * campos de React Hook Form).
 */
export const routineMetaSchema = z
  .object({
    name: z.string().min(1, 'Ingresa un nombre'),
    category: z.enum(ROUTINE_CATEGORIES).nullable(),
    level: z.enum(ROUTINE_LEVELS).nullable(),
    durationMin: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.category === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['category'], message: 'Elige una categoría' });
    }
    if (values.level === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['level'], message: 'Elige un nivel' });
    }
    if (values.durationMin === null || values.durationMin <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['durationMin'], message: 'Ingresa la duración' });
    }
  });

export type RoutineMetaFormValues = z.infer<typeof routineMetaSchema>;
