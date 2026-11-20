/** Rounds to `decimals` places, drops trailing zeros and never prints "-0". */
export function formatNumber(value: number, decimals = 2): string {
  const fixed = value.toFixed(decimals);
  const trimmed = fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
  return trimmed === '-0' ? '0' : trimmed;
}

export function formatForce(value: number): string {
  return `${formatNumber(value)} kN`;
}

export function formatMoment(value: number): string {
  return `${formatNumber(value)} kN·m`;
}

export function formatLength(value: number): string {
  return `${formatNumber(value)} m`;
}
