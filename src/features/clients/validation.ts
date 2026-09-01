import { z } from 'zod';

const CLIENT_GOALS = ['weight_loss', 'muscle_gain', 'maintenance'] as const;
const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Esquema del formulario de cliente. `isCreate` exige el "Peso inicial" (solo
 * se pide al crear; en edición el peso se gestiona vía `addMeasurement`).
 */
export function clientSchema(isCreate: boolean) {
  return z
    .object({
      name: z.string().min(1, 'Ingresa un nombre'),
      goal: z.enum(CLIENT_GOALS).nullable(),
      email: z.string(),
      phone: z.string(),
      birthDate: z.string(),
      heightCm: z.number().nullable(),
      goalKg: z.number().nullable(),
      startWeightKg: z.number().nullable(),
      notes: z.string(),
    })
    .superRefine((values, ctx) => {
      if (values.goal === null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['goal'], message: 'Elige un objetivo' });
      }
      if (values.birthDate === '' || !DATE_PATTERN.test(values.birthDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['birthDate'],
          message: 'Usa el formato dd/mm/aaaa',
        });
      }
      if (values.email !== '' && !EMAIL_PATTERN.test(values.email)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['email'], message: 'Email inválido' });
      }
      if (values.heightCm === null || values.heightCm <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['heightCm'], message: 'Ingresa la altura' });
      }
      if (values.goalKg === null || values.goalKg <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['goalKg'], message: 'Ingresa la meta de peso' });
      }
      if (isCreate && (values.startWeightKg === null || values.startWeightKg <= 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['startWeightKg'],
          message: 'Ingresa el peso inicial',
        });
      }
    });
}

export type ClientFormValues = z.infer<ReturnType<typeof clientSchema>>;
