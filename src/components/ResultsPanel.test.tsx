import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeBeam } from '../engine/builders';
import { analyseBeam } from '../hooks/useAnalysis';
import { ResultsPanel } from './ResultsPanel';

function renderFor(beam: ReturnType<typeof makeBeam>) {
  render(
    <ResultsPanel
      beamType={beam.type}
      length={beam.length}
      analysis={analyseBeam(beam).analysis}
    />,
  );
}

describe('ResultsPanel', () => {
  it('SS full-span UDL: reactions 30 kN, max shear 30 kN, sagging 45 kN·m at x = 3 m', () => {
    renderFor(makeBeam('simply-supported', 6, [], [[10, 0, 6]]));
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('30 kN');
    expect(screen.getByRole('row', { name: /Reaction at B/ })).toHaveTextContent('30 kN');
    expect(screen.getByRole('row', { name: /Maximum shear/ })).toHaveTextContent('30 kN');
    const sagging = screen.getByRole('row', { name: /Maximum sagging moment/ });
    expect(sagging).toHaveTextContent('45 kN·m');
    expect(sagging).toHaveTextContent('x = 3 m');
    expect(screen.getByRole('row', { name: /Maximum hogging moment/ })).toHaveTextContent('None');
  });

  it('SS off-centre point load: reactions 21 kN and 9 kN, sagging 63 kN·m at x = 3 m', () => {
    renderFor(makeBeam('simply-supported', 10, [[30, 3]]));
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('21 kN');
    expect(screen.getByRole('row', { name: /Reaction at B/ })).toHaveTextContent('9 kN');
    expect(screen.getByRole('row', { name: /Maximum sagging moment/ })).toHaveTextContent(
      '63 kN·m',
    );
  });

  it('cantilever: shows the fixed-end moment and hogging, no sagging', () => {
    renderFor(makeBeam('cantilever', 3, [[15, 3]]));
    expect(screen.getByRole('row', { name: /Vertical reaction/ })).toHaveTextContent('15 kN');
    expect(screen.getByRole('row', { name: /Fixed-end moment/ })).toHaveTextContent('45 kN·m');
    expect(screen.getByRole('row', { name: /Maximum hogging moment/ })).toHaveTextContent(
      '45 kN·m',
    );
    expect(screen.getByRole('row', { name: /Maximum sagging moment/ })).toHaveTextContent('None');
    expect(screen.queryByRole('row', { name: /Reaction at B/ })).not.toBeInTheDocument();
  });

  it('asks the user to fix the inputs when there is no analysis', () => {
    render(<ResultsPanel beamType="simply-supported" length={0} analysis={null} />);
    expect(screen.getByText('Fix the highlighted inputs to see results.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
