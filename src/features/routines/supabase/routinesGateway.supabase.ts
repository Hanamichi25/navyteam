import { createId } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { unwrapList, unwrapRequired } from '@/lib/supabaseQuery';
import type {
  Routine,
  RoutineBlock,
  RoutineCategory,
  RoutineDetail,
  RoutineInput,
  RoutineLevel,
} from '@/types/routine';
import type { RoutinesGateway } from '../gateway';

/**
 * Implementación real de `RoutinesGateway` sobre Supabase (`routines` +
 * `routine_blocks`). `exerciseCount` y `assignedCount` se derivan de los
 * embeds `routine_blocks(count)` / `client_routines(count)` — resuelve la
 * desincronización del mock. `update()` con `blocks` los reemplaza en bloque
 * (misma semántica que el mock).
 */

interface BlockRow {
  id: string;
  exercise_id: string;
  position: number;
  sets: number;
  reps_min: number;
  reps_max: number;
  suggested_load: string;
  rest_sec: number;
}

interface RoutineRow {
  id: string;
  name: string;
  category: string;
  level: string;
  duration_min: number;
  image_url: string;
  routine_blocks?: BlockRow[] | { count: number }[];
  client_routines?: { count: number }[];
}

const LIST_COLUMNS =
  'id, name, category, level, duration_min, image_url, routine_blocks(count), client_routines(count)';
const DETAIL_COLUMNS =
  'id, name, category, level, duration_min, image_url, routine_blocks(id, exercise_id, position, sets, reps_min, reps_max, suggested_load, rest_sec), client_routines(count)';

function placeholderImageUrl(): string {
  const seeds = ['strength', 'cardio', 'flex', 'core', 'fullbody'];
  const seed = seeds[Math.floor(Math.random() * seeds.length)];
  return `https://picsum.photos/seed/navyteam-${seed}-${createId('img')}/640/360`;
}

function countFrom(embed: { count: number }[] | undefined): number {
  return embed?.[0]?.count ?? 0;
}

function blockRowToBlock(row: BlockRow): RoutineBlock {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    sets: row.sets,
    repsMin: row.reps_min,
    repsMax: row.reps_max,
    suggestedLoad: row.suggested_load,
    restSec: row.rest_sec,
  };
}

function rowToRoutine(row: RoutineRow): Routine {
  const blocksEmbed = (row.routine_blocks as { count: number }[] | undefined) ?? [];
  return {
    id: row.id,
    name: row.name,
    category: row.category as RoutineCategory,
    level: row.level as RoutineLevel,
    durationMin: row.duration_min,
    exerciseCount: countFrom(blocksEmbed),
    assignedCount: countFrom(row.client_routines),
    imageUrl: row.image_url,
  };
}

function rowToRoutineDetail(row: RoutineRow): RoutineDetail {
  const blockRows = ((row.routine_blocks as BlockRow[] | undefined) ?? [])
    .slice()
    .sort((a, b) => a.position - b.position);
  return {
    id: row.id,
    name: row.name,
    category: row.category as RoutineCategory,
    level: row.level as RoutineLevel,
    durationMin: row.duration_min,
    exerciseCount: blockRows.length,
    assignedCount: countFrom(row.client_routines),
    imageUrl: row.image_url,
    blocks: blockRows.map(blockRowToBlock),
  };
}

/** Filas de `routine_blocks` a insertar para una rutina, respetando el orden del array. */
function blockInserts(routineId: string, blocks: RoutineBlock[]): Record<string, unknown>[] {
  return blocks.map((block, position) => ({
    id: block.id || createId('blk'),
    routine_id: routineId,
    exercise_id: block.exerciseId,
    position,
    sets: block.sets,
    reps_min: block.repsMin,
    reps_max: block.repsMax,
    suggested_load: block.suggestedLoad,
    rest_sec: block.restSec,
  }));
}

async function replaceBlocks(routineId: string, blocks: RoutineBlock[]): Promise<void> {
  const del = await supabase.from('routine_blocks').delete().eq('routine_id', routineId);
  if (del.error) throw new Error(del.error.message);
  if (blocks.length > 0) {
    const ins = await supabase.from('routine_blocks').insert(blockInserts(routineId, blocks));
    if (ins.error) throw new Error(ins.error.message);
  }
}

async function fetchDetail(id: string): Promise<RoutineDetail> {
  const row = unwrapRequired(
    await supabase.from('routines').select(DETAIL_COLUMNS).eq('id', id).single(),
    `Rutina no encontrada: ${id}`,
  );
  return rowToRoutineDetail(row as unknown as RoutineRow);
}

export function createSupabaseRoutinesGateway(): RoutinesGateway {
  return {
    async list() {
      const rows = unwrapList(
        await supabase.from('routines').select(LIST_COLUMNS).order('name'),
      );
      return rows.map((row) => rowToRoutine(row as unknown as RoutineRow));
    },

    async get(id) {
      return fetchDetail(id);
    },

    async create(input: RoutineInput) {
      const id = createId('rtn');
      const created = await supabase.from('routines').insert({
        id,
        name: input.name,
        category: input.category,
        level: input.level,
        duration_min: input.durationMin,
        image_url: placeholderImageUrl(),
      });
      if (created.error) throw new Error(created.error.message);
      await replaceBlocks(id, input.blocks);
      return fetchDetail(id);
    },

    async update(id, input) {
      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.category !== undefined) patch.category = input.category;
      if (input.level !== undefined) patch.level = input.level;
      if (input.durationMin !== undefined) patch.duration_min = input.durationMin;

      if (Object.keys(patch).length > 0) {
        const updated = await supabase.from('routines').update(patch).eq('id', id);
        if (updated.error) throw new Error(updated.error.message);
      }
      if (input.blocks !== undefined) {
        await replaceBlocks(id, input.blocks);
      }
      return fetchDetail(id);
    },

    async remove(id) {
      const { error } = await supabase.from('routines').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  };
}
