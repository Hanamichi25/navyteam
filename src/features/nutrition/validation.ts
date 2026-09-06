import { z } from 'zod';

const NUTRITION_CATEGORIES = ['weight_loss', 'volume', 'maintenance'] as const;

/**
 * Esquema de la metadata del plan de alimentación. Las comidas se validan
 * aparte en `NutritionPlanForm` (estado propio); las kcal/macros se calculan.
 */
export const nutritionPlanSchema = z
  .object({
    name: z.string().min(1, 'Ingresa un nombre'),
    category: z.enum(NUTRITION_CATEGORIES).nullable(),
    /** Objetivo diario opcional. */
    targetKcalPerDay: z.number().nullable(),
    notes: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.category === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['category'],
        message: 'Elige una categoría',
      });
    }
    if (values.targetKcalPerDay !== null && values.targetKcalPerDay <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['targetKcalPerDay'],
        message: 'Debe ser mayor que 0',
      });
    }
  });

export type NutritionPlanFormValues = z.infer<typeof nutritionPlanSchema>;
