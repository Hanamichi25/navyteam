import { z } from 'zod';

const NUTRITION_CATEGORIES = ['weight_loss', 'volume', 'maintenance'] as const;

/** Esquema de validación del formulario "Nuevo plan de alimentación". */
export const nutritionPlanSchema = z
  .object({
    name: z.string().min(1, 'Ingresa un nombre'),
    category: z.enum(NUTRITION_CATEGORIES).nullable(),
    kcalPerDay: z.number().nullable(),
    proteinPct: z.number().min(0, 'Debe ser 0 o más').max(100, 'No puede superar 100').nullable(),
    carbsPct: z.number().min(0, 'Debe ser 0 o más').max(100, 'No puede superar 100').nullable(),
    fatPct: z.number().min(0, 'Debe ser 0 o más').max(100, 'No puede superar 100').nullable(),
  })
  .superRefine((values, ctx) => {
    if (values.category === null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['category'], message: 'Elige una categoría' });
    }
    if (values.kcalPerDay === null || values.kcalPerDay <= 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['kcalPerDay'], message: 'Ingresa las kcal/día' });
    }
    for (const field of ['proteinPct', 'carbsPct', 'fatPct'] as const) {
      if (values[field] === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message: 'Ingresa un valor' });
      }
    }

    const { proteinPct, carbsPct, fatPct } = values;
    if (
      proteinPct !== null &&
      carbsPct !== null &&
      fatPct !== null &&
      proteinPct + carbsPct + fatPct !== 100
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fatPct'],
        message: 'Proteína + carbohidratos + grasas deben sumar 100%',
      });
    }
  });

export type NutritionPlanFormValues = z.infer<typeof nutritionPlanSchema>;
