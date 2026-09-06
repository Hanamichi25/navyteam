/**
 * Kcal a partir de los gramos de macronutrientes (factores de Atwater:
 * proteína y carbohidratos 4 kcal/g, grasa 9 kcal/g).
 *
 * Es la única fuente de la verdad de las calorías de un alimento del catálogo:
 * el entrenador introduce solo los macros y las kcal se derivan de aquí.
 */
export function kcalFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return Math.round(proteinG * 4 + carbsG * 4 + fatG * 9);
}
