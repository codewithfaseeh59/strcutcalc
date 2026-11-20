import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/');
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the default beam analysis and the educational footer', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'StructCalc' })).toBeInTheDocument();
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('30 kN');
    expect(screen.getByRole('row', { name: /Maximum sagging moment/ })).toHaveTextContent(
      '45 kN·m',
    );
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      'Educational tool. Always verify results by hand calculation before using them in real design.',
    );
  });

  it('loads a preset into the form, results and URL', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Cantilever, tip point load/ }));
    expect(screen.getByLabelText('Length (m)')).toHaveValue('3');
    expect(screen.getByRole('row', { name: /Fixed-end moment/ })).toHaveTextContent('45 kN·m');
    expect(window.location.search).toBe('?type=cantilever&length=3&p=15:3');
  });

  it('recomputes when the user edits a load', () => {
    render(<App />);
    const udl = screen.getByRole('group', { name: 'Distributed load 1' });
    fireEvent.change(within(udl).getByLabelText('Intensity (kN/m)'), { target: { value: '20' } });
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('60 kN');
    expect(screen.getByRole('row', { name: /Maximum sagging moment/ })).toHaveTextContent(
      '90 kN·m',
    );
  });

  it('hides results and diagrams while the input is invalid, and recovers', () => {
    render(<App />);
    const length = screen.getByLabelText('Length (m)');
    fireEvent.change(length, { target: { value: '0' } });
    expect(screen.getByText('Fix the highlighted inputs to see results.')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: /Beam, shear force/ })).not.toBeInTheDocument();
    expect(length).toBeInvalid();

    fireEvent.change(length, { target: { value: '6' } });
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('30 kN');
  });

  it('switches between beam types', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('radio', { name: /cantilever/i }));
    expect(screen.getByRole('row', { name: /Vertical reaction/ })).toHaveTextContent('60 kN');
  });

  it('restores the beam from the URL', () => {
    window.history.replaceState(null, '', '/?type=ss&length=10&p=30:3');
    render(<App />);
    expect(screen.getByLabelText('Length (m)')).toHaveValue('10');
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('21 kN');
  });

  it('falls back to the default beam for a garbage URL', () => {
    window.history.replaceState(null, '', '/?type=banana&length=-1');
    render(<App />);
    expect(screen.getByRole('row', { name: /Reaction at A/ })).toHaveTextContent('30 kN');
  });

  it('toggles the theme on <html>', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('copies the share link', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy share link' }));
    expect(await screen.findByRole('button', { name: 'Link copied' })).toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(window.location.href);
  });
});
