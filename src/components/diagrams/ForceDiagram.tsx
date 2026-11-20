import type { PointerEvent } from 'react';
import type { DiagramPoint } from '../../engine/types';
import { formatNumber } from '../../lib/format';
import { linearScale, niceTicks } from '../../lib/scales';
import { COLORS, FONT, MARGIN_LEFT, MARGIN_RIGHT, VIEW_WIDTH, createXScale } from './layout';

const HEIGHT = 230;
const TOP = 26;
const BOTTOM = 36;
const PADDING_RATIO = 0.12;

interface ForceDiagramProps {
  title: string;
  unit: string;
  /** Which value of each sample to plot: shear `v` or moment `m`. */
  quantity: 'v' | 'm';
  color: string;
  summary: string;
  length: number;
  points: readonly DiagramPoint[];
  hoverX: number | null;
  /** Value at `hoverX`, drawn as a dot on the curve. */
  hoverValue: number | null;
  onHoverChange: (x: number | null) => void;
}

const coord = (value: number): string => value.toFixed(2);

export function ForceDiagram({
  title,
  unit,
  quantity,
  color,
  summary,
  length,
  points,
  hoverX,
  hoverValue,
  onHoverChange,
}: ForceDiagramProps) {
  const xScale = createXScale(length);
  const values = points.map((point) => point[quantity]);
  let low = Math.min(0, ...values);
  let high = Math.max(0, ...values);
  if (high - low < 1e-9) {
    low = -1;
    high = 1;
  }
  const padding = (high - low) * PADDING_RATIO;
  low -= padding;
  high += padding;

  const yScale = linearScale(low, high, HEIGHT - BOTTOM, TOP);
  const zeroY = yScale(0);
  const yTicks = niceTicks(low, high, 4);
  const xTicks = niceTicks(0, length, 6);

  const line = points
    .map(
      (point, i) =>
        `${i === 0 ? 'M' : 'L'}${coord(xScale(point.x))},${coord(yScale(point[quantity]))}`,
    )
    .join(' ');
  const area = `${line} L${coord(xScale(length))},${coord(zeroY)} L${coord(xScale(0))},${coord(zeroY)} Z`;

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const viewX = ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH;
    onHoverChange(Math.min(Math.max(xScale.invert(viewX), 0), length));
  }

  return (
    <svg
      role="img"
      aria-label={summary}
      viewBox={`0 0 ${VIEW_WIDTH} ${HEIGHT}`}
      width="100%"
      height="auto"
      data-export
      style={{ touchAction: 'pan-y' }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => onHoverChange(null)}
    >
      <text
        x={MARGIN_LEFT}
        y={14}
        fontSize={14}
        fontWeight={700}
        fontFamily={FONT}
        fill={COLORS.text}
      >
        {`${title} (${unit})`}
      </text>

      {yTicks.map((tick) => (
        <g key={tick}>
          <line
            x1={MARGIN_LEFT}
            y1={yScale(tick)}
            x2={VIEW_WIDTH - MARGIN_RIGHT}
            y2={yScale(tick)}
            stroke={COLORS.grid}
          />
          <text
            x={MARGIN_LEFT - 8}
            y={yScale(tick) + 4}
            textAnchor="end"
            fontSize={11}
            fontFamily={FONT}
            fill={COLORS.axis}
          >
            {formatNumber(tick)}
          </text>
        </g>
      ))}

      {xTicks.map((tick) => (
        <text
          key={tick}
          x={xScale(tick)}
          y={HEIGHT - BOTTOM + 16}
          textAnchor="middle"
          fontSize={11}
          fontFamily={FONT}
          fill={COLORS.axis}
        >
          {formatNumber(tick)}
        </text>
      ))}
      <text
        x={VIEW_WIDTH - MARGIN_RIGHT}
        y={HEIGHT - 6}
        textAnchor="end"
        fontSize={11}
        fontFamily={FONT}
        fill={COLORS.axis}
      >
        x (m)
      </text>

      <path d={area} fill={color} fillOpacity={0.16} stroke="none" />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      <line
        x1={MARGIN_LEFT}
        y1={zeroY}
        x2={VIEW_WIDTH - MARGIN_RIGHT}
        y2={zeroY}
        stroke={COLORS.axis}
        strokeWidth={1.5}
      />

      {hoverX !== null ? (
        <g data-hover>
          <line
            x1={xScale(hoverX)}
            y1={TOP}
            x2={xScale(hoverX)}
            y2={HEIGHT - BOTTOM}
            stroke={COLORS.hover}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          {hoverValue !== null ? (
            <circle cx={xScale(hoverX)} cy={yScale(hoverValue)} r={4.5} fill={COLORS.hover} />
          ) : null}
        </g>
      ) : null}
    </svg>
  );
}
