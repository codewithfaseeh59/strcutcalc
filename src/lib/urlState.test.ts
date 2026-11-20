import { describe, expect, it } from 'vitest';
import { makeBeam } from '../engine/builders';
import { DEFAULT_BEAM, PRESETS } from '../presets/presets';
import { parseBeam, serializeBeam } from './urlState';

describe('urlState round-trip', () => {
  it('restores a beam with point loads and UDLs', () => {
    const beam = makeBeam(
      'simply-supported',
      8.5,
      [
        [20, 2],
        [12.25, 7],
      ],
      [
        [5, 4, 8],
        [1.5, 0, 2],
      ],
    );
    expect(parseBeam(`?${serializeBeam(beam)}`)).toEqual(beam);
  });

  it('restores a cantilever without loads', () => {
    const beam = makeBeam('cantilever', 3);
    expect(serializeBeam(beam)).toBe('type=cantilever&length=3');
    expect(parseBeam(serializeBeam(beam))).toEqual(beam);
  });

  it.each(PRESETS)('restores the preset "$name"', (preset) => {
    expect(parseBeam(serializeBeam(preset.beam))).toEqual(preset.beam);
  });

  it('writes a compact readable query string', () => {
    expect(serializeBeam(DEFAULT_BEAM)).toBe('type=ss&length=6&u=10:0:6');
  });
});

describe('parseBeam fallbacks', () => {
  it.each([
    ['empty string', ''],
    ['unrelated query', '?foo=bar'],
    ['random text', 'not a query string at all'],
    ['unknown beam type', '?type=truss&length=6'],
    ['missing length', '?type=ss'],
    ['non-numeric length', '?type=ss&length=abc'],
    ['negative length', '?type=ss&length=-4'],
    ['point load outside the beam', '?type=ss&length=6&p=10:9'],
    ['point load with a missing field', '?type=ss&length=6&p=10'],
    ['UDL with start after end', '?type=ss&length=6&u=5:4:2'],
    ['zero magnitude', '?type=ss&length=6&p=0:3'],
    ['too many loads', `?type=ss&length=6&p=${Array(60).fill('1:1').join(',')}`],
  ])('returns the default beam for %s', (_label, search) => {
    expect(parseBeam(search)).toEqual(DEFAULT_BEAM);
  });
});
