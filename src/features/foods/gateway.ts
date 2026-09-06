import type { Food, FoodInput } from '@/types/food';

/**
 * Interfaz de infraestructura del catálogo de alimentos. Mismo patrón que
 * `ExercisesGateway`.
 */
export interface FoodsGateway {
  list(): Promise<Food[]>;
  create(input: FoodInput): Promise<Food>;
  update(id: string, input: Partial<FoodInput>): Promise<Food>;
  remove(id: string): Promise<void>;
}
