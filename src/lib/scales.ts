export interface LinearScale {
  (value: number): number;
  invert: (pixel: number) => number;
}

/** Maps the domain [d0, d1] linearly onto the range [r0, r1]. */
export function linearScale(d0: number, d1: number, r0: number, r1: number): LinearScale {
  const domainSpan = d1 - d0 || 1;
  const rangeSpan = r1 - r0;
  const scale = (value: number): number => r0 + ((value - d0) / domainSpan) * rangeSpan;
  const invert = (pixel: number): number =>
    rangeSpan === 0 ? d0 : d0 + ((pixel - r0) / rangeSpan) * domainSpan;
  return Object.assign(scale, { invert });
}

/** Round-numbered tick values (1, 2 or 5 times a power of ten) covering [min, max]. */
export function niceTicks(min: number, max: number, targetCount = 5): number[] {
  if (!(max > min)) return [min];
  const rawStep = (max - min) / targetCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
  const step = niceFraction * magnitude;

  const ticks: number[] = [];
  for (let k = Math.ceil(min / step); k * step <= max + step * 1e-9; k += 1) {
    ticks.push(Number((k * step).toFixed(10)));
  }
  return ticks;
}
