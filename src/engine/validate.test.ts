import { describe, expect, it } from 'vitest';
import { makeBeam } from './builders';
import { findError, validateBeam } from './validate';

describe('validateBeam', () => {
  it('accepts a valid beam', () => {
    const beam = makeBeam('simply-supported', 6, [[20, 2]], [[10, 1, 5]]);
    expect(validateBeam(beam)).toEqual([]);
  });

  it('accepts loads exactly at both ends', () => {
    const beam = makeBeam(
      'simply-supported',
      6,
      [
        [20, 0],
        [10, 6],
      ],
      [[5, 0, 6]],
    );
    expect(validateBeam(beam)).toEqual([]);
  });

  it.each([0, -3, Number.NaN, Number.POSITIVE_INFINITY])('rejects length %s', (length) => {
    const errors = validateBeam(makeBeam('simply-supported', length));
    expect(findError(errors, 'length')).toBeDefined();
  });

  it('rejects a point load outside 0..L', () => {
    const errors = validateBeam(
      makeBeam('simply-supported', 6, [
        [10, -0.1],
        [10, 6.1],
        [10, Number.NaN],
      ]),
    );
    expect(findError(errors, 'pl-0.position')).toBeDefined();
    expect(findError(errors, 'pl-1.position')).toBeDefined();
    expect(findError(errors, 'pl-2.position')).toBeDefined();
  });

  it('rejects a point load magnitude <= 0', () => {
    const errors = validateBeam(
      makeBeam('cantilever', 3, [
        [0, 1],
        [-5, 1],
      ]),
    );
    expect(findError(errors, 'pl-0.magnitude')).toBeDefined();
    expect(findError(errors, 'pl-1.magnitude')).toBeDefined();
  });

  it('rejects a UDL whose start is not before its end', () => {
    const errors = validateBeam(
      makeBeam(
        'simply-supported',
        6,
        [],
        [
          [5, 3, 3],
          [5, 4, 2],
        ],
      ),
    );
    expect(findError(errors, 'udl-0.end')).toBe('End must be greater than start.');
    expect(findError(errors, 'udl-1.end')).toBe('End must be greater than start.');
  });

  it('rejects a UDL intensity <= 0 and a UDL outside the beam', () => {
    const errors = validateBeam(
      makeBeam(
        'simply-supported',
        6,
        [],
        [
          [0, 1, 2],
          [5, -1, 7],
        ],
      ),
    );
    expect(findError(errors, 'udl-0.intensity')).toBeDefined();
    expect(findError(errors, 'udl-1.start')).toBeDefined();
    expect(findError(errors, 'udl-1.end')).toBeDefined();
  });

  it('does not check upper bounds against an invalid length', () => {
    const errors = validateBeam(makeBeam('simply-supported', 0, [[10, 2]]));
    expect(findError(errors, 'pl-0.position')).toBeUndefined();
  });
});
