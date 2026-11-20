import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';
import { NumberField } from './NumberField';
import { ThemeToggle } from './ThemeToggle';

describe('NumberField', () => {
  it('shows a labelled input with the current value', () => {
    render(<NumberField id="len" label="Length (m)" value={6} onChange={() => undefined} />);
    expect(screen.getByLabelText('Length (m)')).toHaveValue('6');
  });

  it('reports parsed numbers and NaN for blank or invalid text', () => {
    const onChange = vi.fn();
    render(<NumberField id="len" label="Length (m)" value={6} onChange={onChange} />);
    const input = screen.getByLabelText('Length (m)');
    fireEvent.change(input, { target: { value: '7.5' } });
    expect(onChange).toHaveBeenLastCalledWith(7.5);
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).toHaveBeenLastCalledWith(Number.NaN);
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(onChange).toHaveBeenLastCalledWith(Number.NaN);
  });

  it('keeps partial typing such as "1." visible', () => {
    function Harness() {
      return <NumberField id="x" label="X" value={1} onChange={() => undefined} />;
    }
    render(<Harness />);
    const input = screen.getByLabelText('X');
    fireEvent.change(input, { target: { value: '1.' } });
    expect(input).toHaveValue('1.');
  });

  it('replaces the text when the value changes from outside', () => {
    const { rerender } = render(
      <NumberField id="len" label="Length (m)" value={6} onChange={() => undefined} />,
    );
    rerender(<NumberField id="len" label="Length (m)" value={4} onChange={() => undefined} />);
    expect(screen.getByLabelText('Length (m)')).toHaveValue('4');
  });

  it('links the error message to the input', () => {
    render(
      <NumberField
        id="len"
        label="Length (m)"
        value={0}
        error="Must be positive."
        onChange={() => undefined}
      />,
    );
    const input = screen.getByLabelText('Length (m)');
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('Must be positive.');
  });
});

describe('Button', () => {
  it('is a non-submitting button by default', () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole('button', { name: 'Go' })).toHaveAttribute('type', 'button');
  });
});

describe('ThemeToggle', () => {
  it('reflects and toggles the theme', () => {
    const onToggle = vi.fn();
    const { rerender } = render(<ThemeToggle theme="light" onToggle={onToggle} />);
    const button = screen.getByRole('button', { name: 'Dark mode' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledOnce();
    rerender(<ThemeToggle theme="dark" onToggle={onToggle} />);
    expect(screen.getByRole('button', { name: 'Dark mode' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
