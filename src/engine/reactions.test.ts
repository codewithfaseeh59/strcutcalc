import { describe, expect, it } from 'vitest';
import { makeBeam } from './builders';
import { computeReactions } from './reactions';

describe('computeReactions', () => {
  it('SS, L=6, UDL 10 over the whole span: R_A = R_B = 30', () => {
    const r = computeReactions(makeBeam('simply-supported', 6, [], [[10, 0, 6]]));
    expect(r.ra).toBeCloseTo(30, 9);
    expect(r.rb).toBeCloseTo(30, 9);
    expect(r.ma).toBe(0);
  });

  it('SS, L=4, P=20 at x=2: R_A = R_B = 10', () => {
    const r = computeReactions(makeBeam('simply-supported', 4, [[20, 2]]));
    expect(r.ra).toBeCloseTo(10, 9);
    expect(r.rb).toBeCloseTo(10, 9);
  });

  it('SS, L=10, P=30 at x=3: R_A = 21, R_B = 9', () => {
    const r = computeReactions(makeBeam('simply-supported', 10, [[30, 3]]));
    expect(r.ra).toBeCloseTo(21, 9);
    expect(r.rb).toBeCloseTo(9, 9);
  });

  it('SS, L=8, P=20 at x=2 plus UDL 5 over [4, 8]: R_A = R_B = 20', () => {
    // R_B = (20*2 + 20*6) / 8 = 20, R_A = 40 - 20 = 20
    const r = computeReactions(makeBeam('simply-supported', 8, [[20, 2]], [[5, 4, 8]]));
    expect(r.ra).toBeCloseTo(20, 9);
    expect(r.rb).toBeCloseTo(20, 9);
  });

  it('cantilever, L=3, P=15 at x=3: R_A = 15, M_A = 45', () => {
    const r = computeReactions(makeBeam('cantilever', 3, [[15, 3]]));
    expect(r.ra).toBeCloseTo(15, 9);
    expect(r.ma).toBeCloseTo(45, 9);
    expect(r.rb).toBe(0);
  });

  it('cantilever, L=2.5, UDL 8 over the whole span: R_A = 20, M_A = 25', () => {
    const r = computeReactions(makeBeam('cantilever', 2.5, [], [[8, 0, 2.5]]));
    expect(r.ra).toBeCloseTo(20, 9);
    expect(r.ma).toBeCloseTo(25, 9);
  });
});
