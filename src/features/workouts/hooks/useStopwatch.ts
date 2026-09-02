import { useCallback, useEffect, useRef, useState } from 'react';

interface Stopwatch {
  /** Segundos transcurridos (se congela mientras está en pausa). */
  elapsedSec: number;
  /** `true` si el cronómetro está corriendo. */
  running: boolean;
  /** Alterna entre correr y pausa. */
  toggle: () => void;
}

/**
 * Cronómetro para el entreno en curso. Cuenta con marcas de tiempo reales
 * (`Date.now()`), no sumando ticks, para no acumular deriva ni perder tiempo
 * entre re-renders.
 */
export function useStopwatch(autoStart = true): Stopwatch {
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const elapsedRef = useRef(0);
  elapsedRef.current = elapsedSec;

  useEffect(() => {
    if (!running) return;
    const anchorAt = Date.now();
    const base = elapsedRef.current;
    const id = setInterval(() => {
      setElapsedSec(base + Math.floor((Date.now() - anchorAt) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, [running]);

  const toggle = useCallback(() => setRunning((value) => !value), []);

  return { elapsedSec, running, toggle };
}

/** Segundos → `mm:ss` (o `h:mm:ss` si pasa de una hora). */
export function formatStopwatch(totalSec: number): string {
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
