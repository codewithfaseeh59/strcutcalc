import { describe, expect, it } from 'vitest';
import { combineSvgs, resolveCssVars } from './exportSvg';

describe('resolveCssVars', () => {
  const values: Record<string, string> = { '--color-beam': '#39424f', '--color-load': '#c2410c' };
  const lookup = (name: string): string => values[name] ?? '';

  it('replaces every var() with its value', () => {
    const markup =
      '<line stroke="var(--color-beam)"/><path fill="var(--color-load)" stroke="var(--color-beam)"/>';
    expect(resolveCssVars(markup, lookup)).toBe(
      '<line stroke="#39424f"/><path fill="#c2410c" stroke="#39424f"/>',
    );
  });

  it('leaves unknown variables untouched', () => {
    expect(resolveCssVars('fill="var(--missing)"', lookup)).toBe('fill="var(--missing)"');
  });
});

describe('combineSvgs', () => {
  const parts = [
    { markup: '<circle r="1"/>', height: 100 },
    { markup: '<rect width="2" height="2"/>', height: 200 },
  ];
  const svg = combineSvgs(parts, 720, '#ffffff');

  it('produces a standalone document sized to fit all parts plus the gap', () => {
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="720" height="316"')).toBe(
      true,
    );
    expect(svg).toContain('viewBox="0 0 720 316"');
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('paints the background and offsets each part below the previous one', () => {
    expect(svg).toContain('<rect width="720" height="316" fill="#ffffff"/>');
    expect(svg).toContain('<g transform="translate(0 0)"><circle r="1"/></g>');
    expect(svg).toContain('<g transform="translate(0 116)"><rect width="2" height="2"/></g>');
  });
});
