import type { Exercise } from '@/types/exercise';

/**
 * Datos semilla del catálogo de ejercicios, usados por
 * `exercisesGateway.mock.ts` para sembrar AsyncStorage la primera vez.
 *
 * TODO(backend): estos datos desaparecen al conectar el backend real (Fase 9).
 */
export const EXERCISES_SEED: readonly Exercise[] = [
  {
    id: 'exc_bench_press',
    name: 'Press de banca',
    muscleGroup: 'chest',
    equipment: 'Barra',
    description: 'Empuje horizontal en banco plano, agarre a la altura de los hombros.',
  },
  {
    id: 'exc_barbell_row',
    name: 'Remo con barra',
    muscleGroup: 'back',
    equipment: 'Barra',
    description: 'Tronco inclinado, tirar la barra hacia el abdomen.',
  },
  {
    id: 'exc_squat',
    name: 'Sentadilla',
    muscleGroup: 'legs',
    equipment: 'Barra',
    description: 'Barra en la espalda, descenso controlado hasta paralelo.',
  },
  {
    id: 'exc_shoulder_press',
    name: 'Press militar',
    muscleGroup: 'shoulders',
    equipment: 'Mancuernas',
    description: 'Empuje vertical por encima de la cabeza, de pie o sentado.',
  },
  {
    id: 'exc_bicep_curl',
    name: 'Curl de bíceps',
    muscleGroup: 'arms',
    equipment: 'Mancuernas',
  },
  {
    id: 'exc_plank',
    name: 'Plancha',
    muscleGroup: 'core',
    equipment: 'Peso corporal',
    description: 'Isométrico, cuerpo alineado apoyado en antebrazos y pies.',
  },
  {
    id: 'exc_lunges',
    name: 'Zancadas',
    muscleGroup: 'legs',
    equipment: 'Mancuernas',
  },
  {
    id: 'exc_lat_pulldown',
    name: 'Jalón al pecho',
    muscleGroup: 'back',
    equipment: 'Máquina',
  },
  {
    id: 'exc_lateral_raise',
    name: 'Elevaciones laterales',
    muscleGroup: 'shoulders',
    equipment: 'Mancuernas',
  },
  {
    id: 'exc_burpees',
    name: 'Burpees',
    muscleGroup: 'full_body',
    equipment: 'Peso corporal',
  },
  {
    id: 'exc_treadmill',
    name: 'Cinta de correr',
    muscleGroup: 'cardio',
    equipment: 'Máquina',
  },
];
