import { makeBeam } from '../engine/builders';
import type { Beam } from '../engine/types';
import { validateBeam } from '../engine/validate';
import { DEFAULT_BEAM } from '../presets/presets';

const MAX_LOADS = 50;

function formatParam(value: number): string {
  return String(Number(value.toFixed(6)));
}

/** Query string (without the leading "?") that describes the beam, e.g. `type=ss&length=6&u=10:0:6`. */
export function serializeBeam(beam: Beam): string {
  const params = [
    `type=${beam.type === 'simply-supported' ? 'ss' : 'cantilever'}`,
    `length=${formatParam(beam.length)}`,
  ];
  if (beam.pointLoads.length > 0) {
    const points = beam.pointLoads.map(
      (load) => `${formatParam(load.magnitude)}:${formatParam(load.position)}`,
    );
    params.push(`p=${points.join(',')}`);
  }
  if (beam.udls.length > 0) {
    const udls = beam.udls.map(
      (udl) => `${formatParam(udl.intensity)}:${formatParam(udl.start)}:${formatParam(udl.end)}`,
    );
    params.push(`u=${udls.join(',')}`);
  }
  return params.join('&');
}

function parseNumber(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

/** Parses "a:b,c:d" into rows of `size` numbers; null when malformed or too long. */
function parseRows(raw: string | null, size: number): number[][] | null {
  if (raw === null || raw === '') return [];
  const items = raw.split(',');
  if (items.length > MAX_LOADS) return null;
  const rows = items.map((item) => item.split(':').map(parseNumber));
  return rows.every((row) => row.length === size) ? rows : null;
}

/** Rebuilds a beam from a query string; anything malformed or invalid gives the default beam. */
export function parseBeam(search: string): Beam {
  const params = new URLSearchParams(search);
  const type = params.get('type');
  const pointRows = parseRows(params.get('p'), 2);
  const udlRows = parseRows(params.get('u'), 3);
  if ((type !== 'ss' && type !== 'cantilever') || !pointRows || !udlRows) {
    return DEFAULT_BEAM;
  }

  const beam = makeBeam(
    type === 'ss' ? 'simply-supported' : 'cantilever',
    parseNumber(params.get('length') ?? ''),
    pointRows.map(
      ([magnitude = Number.NaN, position = Number.NaN]) => [magnitude, position] as const,
    ),
    udlRows.map(
      ([intensity = Number.NaN, start = Number.NaN, end = Number.NaN]) =>
        [intensity, start, end] as const,
    ),
  );
  return validateBeam(beam).length === 0 ? beam : DEFAULT_BEAM;
}
