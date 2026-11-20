import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { makeBeam } from '../engine/builders';
import { DEFAULT_BEAM } from '../presets/presets';
import { useBeamState } from './useBeamState';

describe('useBeamState', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
  });

  it('starts from the default beam when the URL has no state', () => {
    const { result } = renderHook(() => useBeamState());
    expect(result.current[0]).toEqual(DEFAULT_BEAM);
  });

  it('starts from the beam described in the URL', () => {
    window.history.replaceState(null, '', '/?type=cantilever&length=3&p=15:3');
    const { result } = renderHook(() => useBeamState());
    expect(result.current[0]).toEqual(makeBeam('cantilever', 3, [[15, 3]]));
  });

  it('writes valid changes to the URL', () => {
    const { result } = renderHook(() => useBeamState());
    act(() => result.current[1](makeBeam('simply-supported', 4, [[20, 2]])));
    expect(window.location.search).toBe('?type=ss&length=4&p=20:2');
  });

  it('keeps the last valid URL while the input is invalid', () => {
    const { result } = renderHook(() => useBeamState());
    act(() => result.current[1](makeBeam('simply-supported', 4, [[20, 2]])));
    act(() => result.current[1](makeBeam('simply-supported', Number.NaN, [[20, 2]])));
    expect(window.location.search).toBe('?type=ss&length=4&p=20:2');
  });
});
