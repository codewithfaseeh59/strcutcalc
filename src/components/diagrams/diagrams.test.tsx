import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeBeam } from '../../engine/builders';
import { analyseBeam } from '../../hooks/useAnalysis';
import { BeamDiagram } from './BeamDiagram';
import { DiagramStack } from './DiagramStack';

function renderStack(beam: ReturnType<typeof makeBeam>) {
  const { analysis } = analyseBeam(beam);
  if (!analysis) throw new Error('beam should be valid');
  return render(<DiagramStack beam={beam} analysis={analysis} />);
}

describe('BeamDiagram', () => {
  it('describes the beam and its loads for screen readers', () => {
    const beam = makeBeam('simply-supported', 6, [[20, 2]], [[10, 1, 5]]);
    render(<BeamDiagram beam={beam} hoverX={null} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(
      'Simply supported beam, 6 metres long. Point load 20 kilonewtons at 2 metres. Distributed load 10 kilonewtons per metre from 1 to 5 metres.',
    );
  });

  it('draws one arrow group per load and the support labels', () => {
    const beam = makeBeam('simply-supported', 6, [[20, 2]]);
    const { container } = render(<BeamDiagram beam={beam} hoverX={null} />);
    expect(screen.getByText('20 kN')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    expect(container.querySelector('[data-hover]')).toBeNull();
  });

  it('labels only support A on a cantilever', () => {
    render(<BeamDiagram beam={makeBeam('cantilever', 3, [[15, 3]])} hoverX={null} />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('B')).not.toBeInTheDocument();
  });
});

describe('DiagramStack', () => {
  const beam = makeBeam('simply-supported', 6, [], [[10, 0, 6]]);

  it('renders the beam, SFD and BMD as labelled images', () => {
    renderStack(beam);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    expect(
      screen.getByRole('img', { name: /Shear force diagram. Maximum shear 30 kN at x = 0 m/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: /Bending moment diagram. Maximum sagging moment 45 kN·m, maximum hogging moment 0 kN·m/,
      }),
    ).toBeInTheDocument();
  });

  it('exposes the key values in a data table', () => {
    renderStack(beam);
    const table = screen.getByRole('table', { name: /Key shear force and bending moment values/ });
    const midspan = within(table).getByRole('row', { name: /^3 / });
    const cells = within(midspan)
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(cells).toEqual(['0', '0', '45']);
  });

  it('starts with a hint and shows no hover marker', () => {
    const { container } = renderStack(beam);
    expect(screen.getByRole('status')).toHaveTextContent('Hover over a diagram');
    expect(container.querySelector('[data-hover]')).toBeNull();
  });

  it('reads x, V and M from the keyboard and syncs all three diagrams', () => {
    const { container } = renderStack(beam);
    const group = screen.getByRole('group');

    fireEvent.keyDown(group, { key: 'End' });
    expect(screen.getByRole('status')).toHaveTextContent('x = 6 m · V = -30 kN · M = 0 kN·m');
    expect(container.querySelectorAll('[data-hover]')).toHaveLength(3);

    fireEvent.keyDown(group, { key: 'Home' });
    expect(screen.getByRole('status')).toHaveTextContent('x = 0 m · V = 30 kN · M = 0 kN·m');

    fireEvent.keyDown(group, { key: 'ArrowRight', shiftKey: true });
    expect(screen.getByRole('status')).toHaveTextContent('x = 0.6 m');

    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('status')).toHaveTextContent('x = 0.54 m');
  });

  it('shows 3 m midspan values and clears on Escape', () => {
    const { container } = renderStack(beam);
    const group = screen.getByRole('group');
    for (let i = 0; i < 50; i += 1) {
      fireEvent.keyDown(group, { key: 'ArrowRight' });
    }
    expect(screen.getByRole('status')).toHaveTextContent('x = 3 m · V = 0 kN · M = 45 kN·m');

    fireEvent.keyDown(group, { key: 'Escape' });
    expect(screen.getByRole('status')).toHaveTextContent('Hover over a diagram');
    expect(container.querySelector('[data-hover]')).toBeNull();
  });

  it('does not move past either end of the beam', () => {
    renderStack(beam);
    const group = screen.getByRole('group');
    fireEvent.keyDown(group, { key: 'ArrowLeft' });
    expect(screen.getByRole('status')).toHaveTextContent('x = 0 m');
    fireEvent.keyDown(group, { key: 'End' });
    fireEvent.keyDown(group, { key: 'ArrowRight' });
    expect(screen.getByRole('status')).toHaveTextContent('x = 6 m');
  });

  it('has an export button', () => {
    renderStack(beam);
    expect(screen.getByRole('button', { name: 'Export SVG' })).toBeInTheDocument();
  });
});
