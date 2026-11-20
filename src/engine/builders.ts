import type { Beam, BeamType } from './types';

type PointTuple = readonly [magnitude: number, position: number];
type UdlTuple = readonly [intensity: number, start: number, end: number];

/** Builds a beam from plain tuples; load ids are derived from their index. */
export function makeBeam(
  type: BeamType,
  length: number,
  points: readonly PointTuple[] = [],
  udls: readonly UdlTuple[] = [],
): Beam {
  return {
    type,
    length,
    pointLoads: points.map(([magnitude, position], index) => ({
      id: `pl-${index}`,
      magnitude,
      position,
    })),
    udls: udls.map(([intensity, start, end], index) => ({
      id: `udl-${index}`,
      intensity,
      start,
      end,
    })),
  };
}
