import { useMemo } from 'react';
import { criticalPositions, computeExtrema } from '../engine/extrema';
import { sampleDiagrams } from '../engine/diagrams';
import { computeReactions } from '../engine/reactions';
import type { Beam, DiagramPoint, Extrema, Reactions, ValidationError } from '../engine/types';
import { validateBeam } from '../engine/validate';

export interface Analysis {
  reactions: Reactions;
  extrema: Extrema;
  /** Curve points for drawing only. */
  samples: DiagramPoint[];
  /** Key positions for the data table. */
  stations: number[];
}

export interface AnalysisResult {
  errors: ValidationError[];
  /** null while the input is invalid. */
  analysis: Analysis | null;
}

export function analyseBeam(beam: Beam): AnalysisResult {
  const errors = validateBeam(beam);
  if (errors.length > 0) {
    return { errors, analysis: null };
  }
  const reactions = computeReactions(beam);
  return {
    errors,
    analysis: {
      reactions,
      extrema: computeExtrema(beam, reactions),
      samples: sampleDiagrams(beam, reactions),
      stations: criticalPositions(beam, reactions),
    },
  };
}

export function useAnalysis(beam: Beam): AnalysisResult {
  return useMemo(() => analyseBeam(beam), [beam]);
}
