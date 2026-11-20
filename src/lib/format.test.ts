import { describe, expect, it } from 'vitest';
import { formatForce, formatLength, formatMoment, formatNumber } from './format';

describe('formatNumber', () => {
  it('trims trailing zeros', () => {
    expect(formatNumber(30)).toBe('30');
    expect(formatNumber(2.5)).toBe('2.5');
    expect(formatNumber(28.125)).toBe('28.13');
    expect(formatNumber(100)).toBe('100');
  });

  it('never prints negative zero', () => {
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(-0.001)).toBe('0');
  });

  it('keeps the sign of real negatives', () => {
    expect(formatNumber(-45)).toBe('-45');
  });

  it('respects the decimals argument', () => {
    expect(formatNumber(1.23456, 3)).toBe('1.235');
    expect(formatNumber(1.5, 0)).toBe('2');
  });
});

describe('unit helpers', () => {
  it('append units', () => {
    expect(formatForce(30)).toBe('30 kN');
    expect(formatMoment(45)).toBe('45 kN·m');
    expect(formatLength(6)).toBe('6 m');
  });
});
