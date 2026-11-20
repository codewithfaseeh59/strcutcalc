import { describe, expect, it } from 'vitest';
import { makeBeam } from './builders';
import { computeExtrema, criticalPositions } from './extrema';
import { computeReactions } from './reactions';
import type { Beam } from './types';

function extremaOf(beam: Beam) {
  return computeExtrema(beam, computeReactions(beam));
}

describe('computeExtrema', () => {
  it('SS, L=6, full-span UDL 10: M_max = 45 at x = 3, |V|max = 30', () => {
    const e = extremaOf(makeBeam('simply-supported', 6, [], [[10, 0, 6]]));
    expect(e.maxSagging.value).toBeCloseTo(45, 9);
    expect(e.maxSagging.position).toBeCloseTo(3, 9);
    expect(Math.abs(e.maxShear.value)).toBeCloseTo(30, 9);
    expect(e.maxHogging.value).toBeCloseTo(0, 9);
  });

  it('SS, L=4, P=20 at x=2: M_max = 20 at x = 2', () => {
    const e = extremaOf(makeBeam('simply-supported', 4, [[20, 2]]));
    expect(e.maxSagging.value).toBeCloseTo(20, 9);
    expect(e.maxSagging.position).toBeCloseTo(2, 9);
    expect(Math.abs(e.maxShear.value)).toBeCloseTo(10, 9);
  });

  it('SS, L=10, P=30 at x=3: M_max = 63 at x = 3, max shear 21 at x = 0', () => {
    const e = extremaOf(makeBeam('simply-supported', 10, [[30, 3]]));
    expect(e.maxSagging.value).toBeCloseTo(63, 9);
    expect(e.maxSagging.position).toBeCloseTo(3, 9);
    expect(e.maxShear.value).toBeCloseTo(21, 9);
    expect(e.maxShear.position).toBe(0);
  });

  it('SS, L=8, P=20 at 2 + UDL 5 over [4, 8]: M_max = 40, max shear 20', () => {
    // M(2) = 20*2 = 40, V = 0 on [2, 4] so M stays 40 until x = 4
    const e = extremaOf(makeBeam('simply-supported', 8, [[20, 2]], [[5, 4, 8]]));
    expect(e.maxSagging.value).toBeCloseTo(40, 9);
    expect(Math.abs(e.maxShear.value)).toBeCloseTo(20, 9);
  });

  it('cantilever, L=3, P=15 at x=3: hogging -45 at the fixed end, no sagging', () => {
    const e = extremaOf(makeBeam('cantilever', 3, [[15, 3]]));
    expect(e.maxHogging.value).toBeCloseTo(-45, 9);
    expect(e.maxHogging.position).toBe(0);
    expect(e.maxSagging.value).toBeCloseTo(0, 9);
    expect(e.maxShear.value).toBeCloseTo(15, 9);
  });

  it('cantilever, L=2.5, UDL 8: hogging -25 at the fixed end, max shear 20', () => {
    const e = extremaOf(makeBeam('cantilever', 2.5, [], [[8, 0, 2.5]]));
    expect(e.maxHogging.value).toBeCloseTo(-25, 9);
    expect(e.maxShear.value).toBeCloseTo(20, 9);
  });

  it('finds the zero-shear point inside a UDL that is not centred', () => {
    // SS L=10, UDL 4 over [0, 5]: W=20, c=2.5, R_B=5, R_A=15, V=0 at x=3.75
    // M(3.75) = 15*3.75 - 4*3.75^2/2 = 56.25 - 28.125 = 28.125
    const e = extremaOf(makeBeam('simply-supported', 10, [], [[4, 0, 5]]));
    expect(e.maxSagging.position).toBeCloseTo(3.75, 9);
    expect(e.maxSagging.value).toBeCloseTo(28.125, 9);
  });
});

describe('criticalPositions', () => {
  it('includes both ends, load positions, UDL edges and the zero-shear point', () => {
    const beam = makeBeam('simply-supported', 6, [[10, 1]], [[10, 2, 6]]);
    const stations = criticalPositions(beam, computeReactions(beam));
    for (const x of [0, 1, 2, 6]) {
      expect(stations).toContain(x);
    }
    expect(stations.length).toBeGreaterThan(4);
    expect([...stations].sort((a, b) => a - b)).toEqual(stations);
  });
});
