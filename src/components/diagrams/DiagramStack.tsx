import { useRef, useState, type KeyboardEvent } from 'react';
import { momentAt, shearAt } from '../../engine/diagrams';
import type { Beam } from '../../engine/types';
import type { Analysis } from '../../hooks/useAnalysis';
import { exportDiagrams } from '../../lib/exportSvg';
import { formatForce, formatLength, formatMoment, formatNumber } from '../../lib/format';
import { Button } from '../ui/Button';
import { VisuallyHidden } from '../ui/VisuallyHidden';
import { BeamDiagram } from './BeamDiagram';
import styles from './DiagramStack.module.css';
import { ForceDiagram } from './ForceDiagram';
import { COLORS } from './layout';

interface DiagramStackProps {
  beam: Beam;
  analysis: Analysis;
}

const FINE_STEPS = 100;
const COARSE_STEPS = 10;
const READOUT_HINT =
  'Hover over a diagram, or focus it and use the arrow keys, to read x, V and M.';

export function DiagramStack({ beam, analysis }: DiagramStackProps) {
  const { reactions, extrema, samples, stations } = analysis;
  const [hoverX, setHoverX] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const clampX = (x: number): number => Math.min(Math.max(x, 0), beam.length);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = beam.length / (event.shiftKey ? COARSE_STEPS : FINE_STEPS);
    const current = hoverX ?? 0;
    const next: Record<string, number | null> = {
      ArrowLeft: clampX(current - step),
      ArrowRight: clampX(current + step),
      Home: 0,
      End: beam.length,
      Escape: null,
    };
    const target = next[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setHoverX(target);
  }

  const shearSummary = `Shear force diagram. Maximum shear ${formatForce(Math.abs(extrema.maxShear.value))} at x = ${formatLength(extrema.maxShear.position)}.`;
  const momentSummary = `Bending moment diagram. Maximum sagging moment ${formatMoment(Math.max(extrema.maxSagging.value, 0))}, maximum hogging moment ${formatMoment(Math.max(-extrema.maxHogging.value, 0))}.`;

  const hoverShear = hoverX === null ? null : shearAt(beam, reactions, hoverX);
  const hoverMoment = hoverX === null ? null : momentAt(beam, reactions, hoverX);

  return (
    <section className={styles.section} aria-labelledby="diagrams-heading">
      <div className={styles.header}>
        <h2 id="diagrams-heading">Diagrams</h2>
        <Button
          onClick={() =>
            containerRef.current && exportDiagrams(containerRef.current, 'structcalc-diagrams.svg')
          }
        >
          Export SVG
        </Button>
      </div>

      <div
        ref={containerRef}
        className={styles.stack}
        role="group"
        tabIndex={0}
        aria-label="Beam, shear force and bending moment diagrams. Use the left and right arrow keys to read values along the beam; Shift moves faster, Home and End jump to the ends, Escape clears."
        onKeyDown={handleKeyDown}
        onBlur={() => setHoverX(null)}
      >
        <BeamDiagram beam={beam} hoverX={hoverX} />
        <ForceDiagram
          title="Shear force V"
          unit="kN"
          quantity="v"
          color={COLORS.shear}
          summary={shearSummary}
          length={beam.length}
          points={samples}
          hoverX={hoverX}
          hoverValue={hoverShear}
          onHoverChange={setHoverX}
        />
        <ForceDiagram
          title="Bending moment M (sagging positive)"
          unit="kN·m"
          quantity="m"
          color={COLORS.moment}
          summary={momentSummary}
          length={beam.length}
          points={samples}
          hoverX={hoverX}
          hoverValue={hoverMoment}
          onHoverChange={setHoverX}
        />
      </div>

      <p className={styles.readout} role="status">
        {hoverX === null || hoverShear === null || hoverMoment === null
          ? READOUT_HINT
          : `x = ${formatNumber(hoverX)} m · V = ${formatForce(hoverShear)} · M = ${formatMoment(hoverMoment)}`}
      </p>

      <VisuallyHidden>
        <table>
          <caption>Key shear force and bending moment values along the beam</caption>
          <thead>
            <tr>
              <th scope="col">x (m)</th>
              <th scope="col">V just left (kN)</th>
              <th scope="col">V just right (kN)</th>
              <th scope="col">M (kN·m)</th>
            </tr>
          </thead>
          <tbody>
            {stations.map((x) => (
              <tr key={x}>
                <th scope="row">{formatNumber(x)}</th>
                <td>{formatNumber(shearAt(beam, reactions, x, 'left'))}</td>
                <td>{formatNumber(shearAt(beam, reactions, x, 'right'))}</td>
                <td>{formatNumber(momentAt(beam, reactions, x))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VisuallyHidden>
    </section>
  );
}
