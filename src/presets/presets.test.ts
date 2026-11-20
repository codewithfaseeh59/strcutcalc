import { describe, expect, it } from 'vitest';
import { validateBeam } from '../engine/validate';
import { PRESETS } from './presets';

describe('PRESETS', () => {
  it('offers between four and six examples', () => {
    expect(PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(PRESETS.length).toBeLessThanOrEqual(6);
  });

  it('has unique ids', () => {
    expect(new Set(PRESETS.map((preset) => preset.id)).size).toBe(PRESETS.length);
  });

  it.each(PRESETS)('$name is a valid beam', (preset) => {
    expect(validateBeam(preset.beam)).toEqual([]);
  });
});
