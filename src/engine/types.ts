export type BeamType = 'simply-supported' | 'cantilever';

/** Downward point load of `magnitude` kN at `position` m from the left end. */
export interface PointLoad {
  id: string;
  magnitude: number;
  position: number;
}

/** Downward uniformly distributed load of `intensity` kN/m from `start` to `end` (m). */
export interface UdlLoad {
  id: string;
  intensity: number;
  start: number;
  end: number;
}

export interface Loads {
  pointLoads: PointLoad[];
  udls: UdlLoad[];
}

export interface Beam extends Loads {
  type: BeamType;
  length: number;
}

/**
 * Support reactions. `rb` is 0 for a cantilever; `ma` (hogging fixed-end moment
 * magnitude) is 0 for a simply supported beam.
 */
export interface Reactions {
  ra: number;
  rb: number;
  ma: number;
}

/** Which side of a section to evaluate shear on, where a point load makes it jump. */
export type Side = 'left' | 'right';

export interface DiagramPoint {
  x: number;
  v: number;
  m: number;
}

export interface ExtremeValue {
  value: number;
  position: number;
}

export interface Extrema {
  /** Shear force with the largest magnitude (signed). */
  maxShear: ExtremeValue;
  /** Largest bending moment (sagging positive). */
  maxSagging: ExtremeValue;
  /** Smallest bending moment (hogging is negative). */
  maxHogging: ExtremeValue;
}

export interface ValidationError {
  field: string;
  message: string;
}
