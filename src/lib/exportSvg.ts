export interface SvgPart {
  /** Inner markup of one diagram's <svg>. */
  markup: string;
  /** Height of that diagram's viewBox. */
  height: number;
}

const GAP = 16;

/** Replaces `var(--name)` with concrete values, because a standalone file has no CSS variables. */
export function resolveCssVars(markup: string, lookup: (name: string) => string): string {
  return markup.replace(/var\((--[\w-]+)\)/g, (match, name: string) => lookup(name) || match);
}

/** Stacks diagrams vertically into one standalone SVG document. */
export function combineSvgs(parts: readonly SvgPart[], width: number, background: string): string {
  let y = 0;
  const groups = parts.map((part) => {
    const group = `<g transform="translate(0 ${y})">${part.markup}</g>`;
    y += part.height + GAP;
    return group;
  });
  const height = Math.max(y - GAP, 0);
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<rect width="${width}" height="${height}" fill="${background}"/>`,
    ...groups,
    '</svg>',
  ].join('');
}

/** Downloads every `svg[data-export]` inside `root` as one SVG file. */
export function exportDiagrams(root: HTMLElement, filename: string): void {
  const svgs = Array.from(root.querySelectorAll<SVGSVGElement>('svg[data-export]'));
  const first = svgs[0];
  if (!first) return;

  const parts = svgs.map((svg) => {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.querySelectorAll('[data-hover]').forEach((node) => node.remove());
    return { markup: clone.innerHTML, height: svg.viewBox.baseVal.height };
  });

  const styles = getComputedStyle(document.documentElement);
  const lookup = (name: string): string => styles.getPropertyValue(name).trim();
  const svgText = resolveCssVars(
    combineSvgs(parts, first.viewBox.baseVal.width, 'var(--color-surface)'),
    lookup,
  );

  const url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
