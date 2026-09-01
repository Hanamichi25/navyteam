import { z } from 'zod';

/** Esquema de validación del formulario de login (solo UX; el backend revalida). */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Ingresa tu correo electrónico')
    .email('El correo electrónico no es válido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
