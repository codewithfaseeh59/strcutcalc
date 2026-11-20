import type { Beam, ValidationError } from './types';

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/** Returns every problem with the beam; an empty array means it is safe to analyse. */
export function validateBeam(beam: Beam): ValidationError[] {
  const errors: ValidationError[] = [];
  const lengthValid = isPositive(beam.length);
  const withinBeam = (value: number): boolean =>
    Number.isFinite(value) && value >= 0 && (!lengthValid || value <= beam.length);

  if (!lengthValid) {
    errors.push({ field: 'length', message: 'Length must be a number greater than 0.' });
  }

  for (const load of beam.pointLoads) {
    if (!isPositive(load.magnitude)) {
      errors.push({
        field: `${load.id}.magnitude`,
        message: 'Magnitude must be a number greater than 0.',
      });
    }
    if (!withinBeam(load.position)) {
      errors.push({
        field: `${load.id}.position`,
        message: 'Position must be between 0 and the beam length.',
      });
    }
  }

  for (const udl of beam.udls) {
    const startValid = withinBeam(udl.start);
    const endValid = withinBeam(udl.end);
    if (!isPositive(udl.intensity)) {
      errors.push({
        field: `${udl.id}.intensity`,
        message: 'Intensity must be a number greater than 0.',
      });
    }
    if (!startValid) {
      errors.push({
        field: `${udl.id}.start`,
        message: 'Start must be between 0 and the beam length.',
      });
    }
    if (!endValid) {
      errors.push({
        field: `${udl.id}.end`,
        message: 'End must be between 0 and the beam length.',
      });
    } else if (startValid && udl.start >= udl.end) {
      errors.push({ field: `${udl.id}.end`, message: 'End must be greater than start.' });
    }
  }

  return errors;
}

export function findError(errors: readonly ValidationError[], field: string): string | undefined {
  return errors.find((error) => error.field === field)?.message;
}
