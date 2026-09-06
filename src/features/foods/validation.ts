import { z } from 'zod';

const FOOD_UNITS = ['g', 'ml', 'unidad'] as const;

/** Esquema del formulario de alimento. */
export const foodSchema = z
  .object({
    name: z.string().min(1, 'Ingresa un nombre'),
    unit: z.enum(FOOD_UNITS).nullable(),
    kcal: z.number().nullable(),
    proteinG: z.number().nullable(),
    carbsG: z.number().nullable(),
    fatG: z.number().nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.unit === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['unit'], message: 'Elige una unidad' });
    }
    if (values.kcal === null || values.kcal < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['kcal'], message: 'Ingresa las kcal' });
    }
    for (const field of ['proteinG', 'carbsG', 'fatG'] as const) {
      if (values[field] === null || values[field]! < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: 'Ingresa un valor' });
      }
    }
  });

export type FoodFormValues = z.infer<typeof foodSchema>;
