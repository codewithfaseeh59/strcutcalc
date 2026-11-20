import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it('defaults to light and applies it to <html>', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('uses the stored theme', () => {
    window.localStorage.setItem('structcalc-theme', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('toggles, applies and remembers the choice', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(window.localStorage.getItem('structcalc-theme')).toBe('dark');
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
  });

  it('ignores an invalid stored value', () => {
    window.localStorage.setItem('structcalc-theme', 'purple');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });
});
