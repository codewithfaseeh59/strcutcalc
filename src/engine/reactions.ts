import type { Beam, Reactions, UdlLoad } from './types';

/** Total force W = w*(e - s) and centroid c = (s + e)/2 of a UDL. */
export function udlResultant(udl: UdlLoad): { force: number; centroid: number } {
  return {
    force: udl.intensity * (udl.end - udl.start),
    centroid: (udl.start + udl.end) / 2,
  };
}

export function computeReactions(beam: Beam): Reactions {
  let totalForce = 0;
  let momentAboutLeft = 0;

  for (const load of beam.pointLoads) {
    totalForce += load.magnitude;
    momentAboutLeft += load.magnitude * load.position;
  }
  for (const udl of beam.udls) {
    const { force, centroid } = udlResultant(udl);
    totalForce += force;
    momentAboutLeft += force * centroid;
  }

  if (beam.type === 'cantilever') {
    return { ra: totalForce, rb: 0, ma: momentAboutLeft };
  }

  const rb = momentAboutLeft / beam.length;
  return { ra: totalForce - rb, rb, ma: 0 };
}
