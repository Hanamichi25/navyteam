/**
 * Tipos del dominio "alimentos" (catálogo que usa el editor de planes de
 * alimentación para calcular calorías y macros).
 */

/** Unidad en la que se mide un alimento al añadirlo a una comida. */
export type FoodUnit = 'g' | 'ml' | 'unidad';

/**
 * Alimento del catálogo del entrenador. Los macros están dados por una
 * `refQuantity` de la `unit`: 100 g / 100 ml, o 1 unidad (ej: 1 huevo).
 */
export interface Food {
  id: string;
  name: string;
  unit: FoodUnit;
  /** Porción de referencia de los macros: 100 para `g`/`ml`, 1 para `unidad`. */
  refQuantity: number;
  /** Kcal por `refQuantity`. */
  kcal: number;
  /** Proteína (g) por `refQuantity`. */
  proteinG: number;
  /** Carbohidratos (g) por `refQuantity`. */
  carbsG: number;
  /** Grasas (g) por `refQuantity`. */
  fatG: number;
}

/** Campos editables al crear/actualizar un alimento. */
export type FoodInput = Omit<Food, 'id'>;
