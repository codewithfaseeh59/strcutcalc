import type { Beam } from '../../engine/types';
import { formatNumber } from '../../lib/format';
import { COLORS, FONT, VIEW_WIDTH, createXScale } from './layout';

const HEIGHT = 200;
const BEAM_Y = 100;
const BEAM_THICKNESS = 10;
const BEAM_BOTTOM = BEAM_Y + BEAM_THICKNESS;
const POINT_ARROW_LENGTH = 52;
const UDL_HEIGHT = 34;
const HEAD = 8;

function describeBeam(beam: Beam): string {
  const kind = beam.type === 'simply-supported' ? 'Simply supported beam' : 'Cantilever beam';
  const parts = [`${kind}, ${formatNumber(beam.length)} metres long.`];
  for (const load of beam.pointLoads) {
    parts.push(
      `Point load ${formatNumber(load.magnitude)} kilonewtons at ${formatNumber(load.position)} metres.`,
    );
  }
  for (const udl of beam.udls) {
    parts.push(
      `Distributed load ${formatNumber(udl.intensity)} kilonewtons per metre from ${formatNumber(udl.start)} to ${formatNumber(udl.end)} metres.`,
    );
  }
  return parts.join(' ');
}

function Arrow({ x, top }: { x: number; top: number }) {
  return (
    <g fill={COLORS.load} stroke={COLORS.load}>
      <line x1={x} y1={top} x2={x} y2={BEAM_Y - HEAD} strokeWidth={2} />
      <polygon
        points={`${x},${BEAM_Y} ${x - 4},${BEAM_Y - HEAD} ${x + 4},${BEAM_Y - HEAD}`}
        stroke="none"
      />
    </g>
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={13} fontFamily={FONT} fill={COLORS.text}>
      {children}
    </text>
  );
}

function PinSupport({ x }: { x: number }) {
  const base = BEAM_BOTTOM + 22;
  return (
    <g stroke={COLORS.beam} strokeWidth={2} fill="none">
      <polygon points={`${x},${BEAM_BOTTOM} ${x - 12},${base} ${x + 12},${base}`} />
      <line x1={x - 20} y1={base} x2={x + 20} y2={base} />
    </g>
  );
}

function RollerSupport({ x }: { x: number }) {
  const base = BEAM_BOTTOM + 18;
  return (
    <g stroke={COLORS.beam} strokeWidth={2} fill="none">
      <polygon points={`${x},${BEAM_BOTTOM} ${x - 12},${base} ${x + 12},${base}`} />
      <circle cx={x - 6} cy={base + 4} r={4} />
      <circle cx={x + 6} cy={base + 4} r={4} />
      <line x1={x - 20} y1={base + 8} x2={x + 20} y2={base + 8} />
    </g>
  );
}

function FixedSupport({ x }: { x: number }) {
  const top = BEAM_Y - 26;
  const bottom = BEAM_BOTTOM + 26;
  const hatches = [0, 1, 2, 3, 4, 5].map((i) => top + 6 + i * 11);
  return (
    <g stroke={COLORS.beam} strokeWidth={2}>
      <line x1={x} y1={top} x2={x} y2={bottom} strokeWidth={4} />
      {hatches.map((y) => (
        <line key={y} x1={x} y1={y} x2={x - 10} y2={y + 8} />
      ))}
    </g>
  );
}

interface BeamDiagramProps {
  beam: Beam;
  hoverX: number | null;
}

export function BeamDiagram({ beam, hoverX }: BeamDiagramProps) {
  const xScale = createXScale(beam.length);
  const x0 = xScale(0);
  const xL = xScale(beam.length);
  const supportLabelY = BEAM_BOTTOM + 54;
  const dimensionY = HEIGHT - 22;

  return (
    <svg
      role="img"
      aria-label={describeBeam(beam)}
      viewBox={`0 0 ${VIEW_WIDTH} ${HEIGHT}`}
      width="100%"
      height="auto"
      data-export
    >
      <rect x={x0} y={BEAM_Y} width={xL - x0} height={BEAM_THICKNESS} fill={COLORS.beam} />

      {beam.type === 'simply-supported' ? (
        <>
          <PinSupport x={x0} />
          <RollerSupport x={xL} />
          <Label x={x0} y={supportLabelY}>
            A
          </Label>
          <Label x={xL} y={supportLabelY}>
            B
          </Label>
        </>
      ) : (
        <>
          <FixedSupport x={x0} />
          <Label x={x0 + 14} y={supportLabelY - 20}>
            A
          </Label>
        </>
      )}

      {beam.udls.map((udl) => {
        const xs = xScale(udl.start);
        const xe = xScale(udl.end);
        const top = BEAM_Y - UDL_HEIGHT;
        const count = Math.max(2, Math.round((xe - xs) / 24) + 1);
        const arrowXs = Array.from({ length: count }, (_, i) => xs + ((xe - xs) * i) / (count - 1));
        return (
          <g key={udl.id}>
            <line x1={xs} y1={top} x2={xe} y2={top} stroke={COLORS.load} strokeWidth={2} />
            {arrowXs.map((x) => (
              <Arrow key={x} x={x} top={top} />
            ))}
            <Label x={(xs + xe) / 2} y={top - 8}>{`${formatNumber(udl.intensity)} kN/m`}</Label>
          </g>
        );
      })}

      {beam.pointLoads.map((load) => {
        const x = xScale(load.position);
        return (
          <g key={load.id}>
            <Arrow x={x} top={BEAM_Y - POINT_ARROW_LENGTH} />
            <Label
              x={x}
              y={BEAM_Y - POINT_ARROW_LENGTH - 8}
            >{`${formatNumber(load.magnitude)} kN`}</Label>
          </g>
        );
      })}

      <g stroke={COLORS.axis} strokeWidth={1}>
        <line x1={x0} y1={dimensionY} x2={xL} y2={dimensionY} />
        <line x1={x0} y1={dimensionY - 5} x2={x0} y2={dimensionY + 5} />
        <line x1={xL} y1={dimensionY - 5} x2={xL} y2={dimensionY + 5} />
      </g>
      <Label x={(x0 + xL) / 2} y={dimensionY + 16}>{`L = ${formatNumber(beam.length)} m`}</Label>

      {hoverX !== null ? (
        <g data-hover>
          <line
            x1={xScale(hoverX)}
            y1={0}
            x2={xScale(hoverX)}
            y2={HEIGHT}
            stroke={COLORS.hover}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </g>
      ) : null}
    </svg>
  );
}
