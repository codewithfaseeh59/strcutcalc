import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeBeam } from '../engine/builders';
import { validateBeam } from '../engine/validate';
import { PRESETS } from '../presets/presets';
import { BeamForm } from './BeamForm';
import { LoadEditor } from './LoadEditor';
import { PresetPicker } from './PresetPicker';

describe('BeamForm', () => {
  it('shows the current type and length and reports changes', () => {
    const onTypeChange = vi.fn();
    const onLengthChange = vi.fn();
    render(
      <BeamForm
        type="simply-supported"
        length={6}
        errors={[]}
        onTypeChange={onTypeChange}
        onLengthChange={onLengthChange}
      />,
    );
    expect(screen.getByRole('radio', { name: /simply supported/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /cantilever/i })).not.toBeChecked();

    fireEvent.click(screen.getByRole('radio', { name: /cantilever/i }));
    expect(onTypeChange).toHaveBeenCalledWith('cantilever');

    fireEvent.change(screen.getByLabelText('Length (m)'), { target: { value: '8' } });
    expect(onLengthChange).toHaveBeenCalledWith(8);
  });

  it('shows an inline error for an invalid length', () => {
    const errors = validateBeam(makeBeam('simply-supported', 0));
    render(
      <BeamForm
        type="simply-supported"
        length={0}
        errors={errors}
        onTypeChange={() => undefined}
        onLengthChange={() => undefined}
      />,
    );
    expect(screen.getByLabelText('Length (m)')).toHaveAccessibleDescription(
      'Length must be a number greater than 0.',
    );
  });
});

describe('LoadEditor', () => {
  const beam = makeBeam('simply-supported', 6, [[20, 2]], [[10, 0, 6]]);

  function setup(errors = validateBeam(beam)) {
    const onChange = vi.fn();
    render(
      <LoadEditor
        pointLoads={beam.pointLoads}
        udls={beam.udls}
        length={beam.length}
        errors={errors}
        onChange={onChange}
      />,
    );
    return onChange;
  }

  it('renders labelled inputs for every load', () => {
    setup();
    const point = screen.getByRole('group', { name: 'Point load 1' });
    expect(within(point).getByLabelText('Magnitude (kN)')).toHaveValue('20');
    expect(within(point).getByLabelText('Position x (m)')).toHaveValue('2');
    const udl = screen.getByRole('group', { name: 'Distributed load 1' });
    expect(within(udl).getByLabelText('Intensity (kN/m)')).toHaveValue('10');
    expect(within(udl).getByLabelText('Start x (m)')).toHaveValue('0');
    expect(within(udl).getByLabelText('End x (m)')).toHaveValue('6');
  });

  it('reports edits to a point load', () => {
    const onChange = setup();
    const point = screen.getByRole('group', { name: 'Point load 1' });
    fireEvent.change(within(point).getByLabelText('Position x (m)'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith({
      pointLoads: [{ id: 'pl-0', magnitude: 20, position: 3 }],
      udls: beam.udls,
    });
  });

  it('adds a point load at midspan and a UDL over the whole span', () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Add point load' }));
    const added = onChange.mock.lastCall?.[0].pointLoads.at(-1);
    expect(added).toMatchObject({ magnitude: 10, position: 3 });

    fireEvent.click(screen.getByRole('button', { name: 'Add distributed load' }));
    const addedUdl = onChange.mock.lastCall?.[0].udls.at(-1);
    expect(addedUdl).toMatchObject({ intensity: 5, start: 0, end: 6 });
  });

  it('removes loads', () => {
    const onChange = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Remove point load 1' }));
    expect(onChange).toHaveBeenLastCalledWith({ pointLoads: [], udls: beam.udls });
    fireEvent.click(screen.getByRole('button', { name: 'Remove distributed load 1' }));
    expect(onChange).toHaveBeenLastCalledWith({ pointLoads: beam.pointLoads, udls: [] });
  });

  it('shows inline validation next to the offending field', () => {
    const bad = makeBeam('simply-supported', 6, [[20, 9]], [[10, 4, 2]]);
    render(
      <LoadEditor
        pointLoads={bad.pointLoads}
        udls={bad.udls}
        length={bad.length}
        errors={validateBeam(bad)}
        onChange={() => undefined}
      />,
    );
    const point = screen.getByRole('group', { name: 'Point load 1' });
    expect(within(point).getByLabelText('Position x (m)')).toHaveAccessibleDescription(
      'Position must be between 0 and the beam length.',
    );
    const udl = screen.getByRole('group', { name: 'Distributed load 1' });
    expect(within(udl).getByLabelText('End x (m)')).toHaveAccessibleDescription(
      'End must be greater than start.',
    );
  });

  it('shows empty states', () => {
    render(
      <LoadEditor pointLoads={[]} udls={[]} length={6} errors={[]} onChange={() => undefined} />,
    );
    expect(screen.getByText('No point loads.')).toBeInTheDocument();
    expect(screen.getByText('No distributed loads.')).toBeInTheDocument();
  });
});

describe('PresetPicker', () => {
  it('lists every preset and selects its beam', () => {
    const onSelect = vi.fn();
    render(<PresetPicker onSelect={onSelect} />);
    expect(screen.getAllByRole('button')).toHaveLength(PRESETS.length);

    const target = PRESETS[4];
    if (!target) throw new Error('missing preset');
    fireEvent.click(screen.getByRole('button', { name: new RegExp(target.name) }));
    expect(onSelect).toHaveBeenCalledWith(target.beam);
  });
});
