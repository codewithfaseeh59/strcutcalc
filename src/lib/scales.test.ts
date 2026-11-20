import { describe, expect, it } from 'vitest';
import { linearScale, niceTicks } from './scales';

describe('linearScale', () => {
  it('maps domain ends to range ends and the midpoint to the middle', () => {
    const scale = linearScale(0, 6, 64, 692);
    expect(scale(0)).toBe(64);
    expect(scale(6)).toBe(692);
    expect(scale(3)).toBe(378);
  });

  it('supports an inverted range for y axes', () => {
    const scale = linearScale(-10, 10, 200, 0);
    expect(scale(10)).toBe(0);
    expect(scale(-10)).toBe(200);
    expect(scale(0)).toBe(100);
  });

  it('inverts back to the domain', () => {
    const scale = linearScale(0, 6, 64, 692);
    expect(scale.invert(378)).toBeCloseTo(3, 12);
    expect(scale.invert(scale(4.2))).toBeCloseTo(4.2, 12);
  });

  it('does not divide by zero for an empty domain', () => {
    expect(Number.isFinite(linearScale(2, 2, 0, 100)(2))).toBe(true);
  });
});

describe('niceTicks', () => {
  it('uses steps of 1, 2 or 5 times a power of ten', () => {
    expect(niceTicks(0, 6, 6)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(niceTicks(0, 10, 5)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(0, 45, 5)).toEqual([0, 10, 20, 30, 40]);
  });

  it('includes zero when the range spans it', () => {
    expect(niceTicks(-30, 30, 6)).toEqual([-30, -20, -10, 0, 10, 20, 30]);
    expect(niceTicks(-30, 30, 4)).toEqual([-20, 0, 20]);
  });

  it('returns a single tick for an empty range', () => {
    expect(niceTicks(3, 3)).toEqual([3]);
  });
});
