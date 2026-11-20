import { udlResultant } from './reactions';
import type { Beam, DiagramPoint, Reactions, Side, UdlLoad } from './types';

const SAMPLE_INTERVALS = 400;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function uniqueSorted(values: readonly number[]): number[] {
  return [...new Set(values)].sort((a, b) => a - b);
}

/** Shear force V(x), up positive. At a point load, `side` picks the value just left or right. */
export function shearAt(beam: Beam, reactions: Reactions, x: number, side: Side = 'left'): number {
  let shear = reactions.ra;
  for (const load of beam.pointLoads) {
    if (side === 'left' ? load.position < x : load.position <= x) {
      shear -= load.magnitude;
    }
  }
  for (const udl of beam.udls) {
    shear -= udl.intensity * clamp(x - udl.start, 0, udl.end - udl.start);
  }
  return shear;
}

function udlMoment(udl: UdlLoad, x: number): number {
  if (x <= udl.start) return 0;
  if (x <= udl.end) return (udl.intensity * (x - udl.start) ** 2) / 2;
  const { force, centroid } = udlResultant(udl);
  return force * (x - centroid);
}

/** Bending moment M(x), sagging positive. */
export function momentAt(beam: Beam, reactions: Reactions, x: number): number {
  let moment = reactions.ra * x;
  if (beam.type === 'cantilever') {
    moment -= reactions.ma;
  }
  for (const load of beam.pointLoads) {
    if (load.position < x) {
      moment -= load.magnitude * (x - load.position);
    }
  }
  for (const udl of beam.udls) {
    moment -= udlMoment(udl, x);
  }
  return moment;
}

/** Positions where the shear diagram changes slope or jumps: both ends and every load edge. */
export function breakpoints(beam: Beam): number[] {
  return uniqueSorted([
    0,
    beam.length,
    ...beam.pointLoads.map((load) => load.position),
    ...beam.udls.flatMap((udl) => [udl.start, udl.end]),
  ]);
}

/**
 * Points used only to draw the curves. A point load contributes two points at the same
 * x (just-left and just-right shear) so the jump is drawn as a vertical line.
 */
export function sampleDiagrams(beam: Beam, reactions: Reactions): DiagramPoint[] {
  const uniform = Array.from({ length: SAMPLE_INTERVALS + 1 }, (_, index) =>
    index === SAMPLE_INTERVALS ? beam.length : (beam.length * index) / SAMPLE_INTERVALS,
  );
  const xs = uniqueSorted([...uniform, ...breakpoints(beam)]);
  const loadPositions = new Set(beam.pointLoads.map((load) => load.position));

  return xs.flatMap((x) => {
    const m = momentAt(beam, reactions, x);
    const left = { x, v: shearAt(beam, reactions, x, 'left'), m };
    if (!loadPositions.has(x) || x >= beam.length) {
      return [left];
    }
    return [left, { x, v: shearAt(beam, reactions, x, 'right'), m }];
  });
}
