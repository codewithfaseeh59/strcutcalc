import type { BeamType } from '../engine/types';
import type { Analysis } from '../hooks/useAnalysis';
import { formatForce, formatLength, formatMoment } from '../lib/format';
import styles from './ResultsPanel.module.css';

interface ResultsPanelProps {
  beamType: BeamType;
  length: number;
  analysis: Analysis | null;
}

/** Values closer to zero than this are reported as "none" (rounding noise). */
const NONE_THRESHOLD = 1e-9;

interface Row {
  label: string;
  value: string;
  position: string;
}

function buildRows(beamType: BeamType, length: number, analysis: Analysis): Row[] {
  const { reactions, extrema } = analysis;
  const at = (x: number): string => `x = ${formatLength(x)}`;

  const reactionRows: Row[] =
    beamType === 'simply-supported'
      ? [
          { label: 'Reaction at A (R_A)', value: formatForce(reactions.ra), position: at(0) },
          { label: 'Reaction at B (R_B)', value: formatForce(reactions.rb), position: at(length) },
        ]
      : [
          { label: 'Vertical reaction (R_A)', value: formatForce(reactions.ra), position: at(0) },
          {
            label: 'Fixed-end moment (M_A, hogging)',
            value: formatMoment(reactions.ma),
            position: at(0),
          },
        ];

  const sagging = extrema.maxSagging;
  const hogging = extrema.maxHogging;

  return [
    ...reactionRows,
    {
      label: 'Maximum shear (|V|max)',
      value: formatForce(Math.abs(extrema.maxShear.value)),
      position: at(extrema.maxShear.position),
    },
    sagging.value > NONE_THRESHOLD
      ? {
          label: 'Maximum sagging moment',
          value: formatMoment(sagging.value),
          position: at(sagging.position),
        }
      : { label: 'Maximum sagging moment', value: 'None', position: '—' },
    hogging.value < -NONE_THRESHOLD
      ? {
          label: 'Maximum hogging moment',
          value: formatMoment(Math.abs(hogging.value)),
          position: at(hogging.position),
        }
      : { label: 'Maximum hogging moment', value: 'None', position: '—' },
  ];
}

export function ResultsPanel({ beamType, length, analysis }: ResultsPanelProps) {
  return (
    <section className={styles.section} aria-labelledby="results-heading">
      <h2 id="results-heading">Results</h2>
      {analysis ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Quantity</th>
              <th scope="col">Value</th>
              <th scope="col">Location</th>
            </tr>
          </thead>
          <tbody>
            {buildRows(beamType, length, analysis).map((row) => (
              <tr key={row.label}>
                <th scope="row">{row.label}</th>
                <td>{row.value}</td>
                <td>{row.position}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.message}>Fix the highlighted inputs to see results.</p>
      )}
    </section>
  );
}
