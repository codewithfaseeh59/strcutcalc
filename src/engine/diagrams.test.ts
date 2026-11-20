import { describe, expect, it } from 'vitest';
import { makeBeam } from './builders';
import { momentAt, sampleDiagrams, shearAt } from './diagrams';
import { computeReactions } from './reactions';

const ssUdl = makeBeam('simply-supported', 6, [], [[10, 0, 6]]);
const ssCentral = makeBeam('simply-supported', 4, [[20, 2]]);
const ssOffset = makeBeam('simply-supported', 10, [[30, 3]]);
const cantilevers = [
  makeBeam('cantilever', 3, [[15, 3]]),
  makeBeam('cantilever', 2.5, [], [[8, 0, 2.5]]),
];

describe('shearAt', () => {
  it('SS full-span UDL: V(0) = 30 and V(6) = -30', () => {
    const r = computeReactions(ssUdl);
    expect(shearAt(ssUdl, r, 0)).toBeCloseTo(30, 9);
    expect(shearAt(ssUdl, r, 6)).toBeCloseTo(-30, 9);
    expect(shearAt(ssUdl, r, 3)).toBeCloseTo(0, 9);
  });

  it('jumps by the load magnitude across a point load', () => {
    const r = computeReactions(ssCentral);
    expect(shearAt(ssCentral, r, 2, 'left')).toBeCloseTo(10, 9);
    expect(shearAt(ssCentral, r, 2, 'right')).toBeCloseTo(-10, 9);
  });

  it('cantilever tip load: V = 15 along the whole span', () => {
    const [beam] = cantilevers;
    if (!beam) throw new Error('missing fixture');
    const r = computeReactions(beam);
    expect(shearAt(beam, r, 1.5)).toBeCloseTo(15, 9);
  });
});

describe('momentAt', () => {
  it('SS full-span UDL: M(3) = 45 (wL^2/8)', () => {
    expect(momentAt(ssUdl, computeReactions(ssUdl), 3)).toBeCloseTo(45, 9);
  });

  it('SS central point load: M(2) = 20 (PL/4)', () => {
    expect(momentAt(ssCentral, computeReactions(ssCentral), 2)).toBeCloseTo(20, 9);
  });

  it('SS off-centre point load: M(3) = 63 (R_A * 3)', () => {
    expect(momentAt(ssOffset, computeReactions(ssOffset), 3)).toBeCloseTo(63, 9);
  });

  it.each([ssUdl, ssCentral, ssOffset])('SS has M(0) = M(L) = 0', (beam) => {
    const r = computeReactions(beam);
    expect(momentAt(beam, r, 0)).toBeCloseTo(0, 9);
    expect(momentAt(beam, r, beam.length)).toBeCloseTo(0, 9);
  });

  it.each(cantilevers)('cantilever has M(L) = 0', (beam) => {
    expect(momentAt(beam, computeReactions(beam), beam.length)).toBeCloseTo(0, 9);
  });

  it('cantilever tip load: M(0) = -45', () => {
    const [beam] = cantilevers;
    if (!beam) throw new Error('missing fixture');
    expect(momentAt(beam, computeReactions(beam), 0)).toBeCloseTo(-45, 9);
  });

  it('cantilever UDL: M(0) = -25', () => {
    const beam = cantilevers[1];
    if (!beam) throw new Error('missing fixture');
    expect(momentAt(beam, computeReactions(beam), 0)).toBeCloseTo(-25, 9);
  });
});

describe('sampleDiagrams', () => {
  const points = sampleDiagrams(ssCentral, computeReactions(ssCentral));

  it('spans the whole beam in increasing x with about 400 samples', () => {
    expect(points[0]?.x).toBe(0);
    expect(points.at(-1)?.x).toBe(4);
    expect(points.length).toBeGreaterThanOrEqual(401);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i]!.x).toBeGreaterThanOrEqual(points[i - 1]!.x);
    }
  });

  it('records both sides of a point load so the shear jump can be drawn', () => {
    const atLoad = points.filter((p) => p.x === 2);
    expect(atLoad.map((p) => p.v)).toEqual([10, -10]);
  });
});
