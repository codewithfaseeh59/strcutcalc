import { breakpoints, momentAt, shearAt, uniqueSorted } from './diagrams';
import type { Beam, ExtremeValue, Extrema, Reactions } from './types';

/** Differences smaller than this count as ties, so the first position wins. */
const TIE_TOLERANCE = 1e-9;

/**
 * Every position where V or M can reach an extreme: the breakpoints plus the point
 * inside each load-free stretch where V crosses zero (V is linear between breakpoints).
 */
export function criticalPositions(beam: Beam, reactions: Reactions): number[] {
  const base = breakpoints(beam);
  const zeroCrossings: number[] = [];

  for (const [index, end] of base.entries()) {
    const start = base[index - 1];
    if (start === undefined) continue;
    const vStart = shearAt(beam, reactions, start, 'right');
    const vEnd = shearAt(beam, reactions, end, 'left');
    if (vStart * vEnd < 0) {
      zeroCrossings.push(start + (vStart * (end - start)) / (vStart - vEnd));
    }
  }

  return uniqueSorted([...base, ...zeroCrossings]);
}

export function computeExtrema(beam: Beam, reactions: Reactions): Extrema {
  const stations = criticalPositions(beam, reactions);

  let maxShear: ExtremeValue = { value: 0, position: 0 };
  let maxSagging: ExtremeValue = { value: Number.NEGATIVE_INFINITY, position: 0 };
  let maxHogging: ExtremeValue = { value: Number.POSITIVE_INFINITY, position: 0 };

  for (const position of stations) {
    for (const side of ['left', 'right'] as const) {
      const value = shearAt(beam, reactions, position, side);
      if (Math.abs(value) > Math.abs(maxShear.value) + TIE_TOLERANCE) {
        maxShear = { value, position };
      }
    }
    const moment = momentAt(beam, reactions, position);
    if (moment > maxSagging.value + TIE_TOLERANCE) {
      maxSagging = { value: moment, position };
    }
    if (moment < maxHogging.value - TIE_TOLERANCE) {
      maxHogging = { value: moment, position };
    }
  }

  return { maxShear, maxSagging, maxHogging };
}
