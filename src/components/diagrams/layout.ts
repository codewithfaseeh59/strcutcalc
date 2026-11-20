import { linearScale } from '../../lib/scales';

/** All three diagrams share this width and margins so their x axes line up exactly. */
export const VIEW_WIDTH = 720;
export const MARGIN_LEFT = 64;
export const MARGIN_RIGHT = 28;

export function createXScale(length: number) {
  return linearScale(0, length, MARGIN_LEFT, VIEW_WIDTH - MARGIN_RIGHT);
}

/**
 * Colours are `var()` references set as SVG attributes (not CSS classes) so the exporter
 * can swap them for real values and the exported file looks the same outside the page.
 */
export const COLORS = {
  beam: 'var(--color-beam)',
  load: 'var(--color-load)',
  grid: 'var(--color-grid)',
  axis: 'var(--color-axis)',
  text: 'var(--color-text)',
  hover: 'var(--color-hover)',
  shear: 'var(--color-shear)',
  moment: 'var(--color-moment)',
} as const;

export const FONT = 'var(--font-sans)';
