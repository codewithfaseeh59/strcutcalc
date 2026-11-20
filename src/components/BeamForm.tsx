import type { BeamType, ValidationError } from '../engine/types';
import { findError } from '../engine/validate';
import styles from './BeamForm.module.css';
import { NumberField } from './ui/NumberField';

interface BeamFormProps {
  type: BeamType;
  length: number;
  errors: readonly ValidationError[];
  onTypeChange: (type: BeamType) => void;
  onLengthChange: (length: number) => void;
}

const OPTIONS: readonly { type: BeamType; label: string }[] = [
  { type: 'simply-supported', label: 'Simply supported (pin at x = 0, roller at x = L)' },
  { type: 'cantilever', label: 'Cantilever (fixed at x = 0)' },
];

export function BeamForm({ type, length, errors, onTypeChange, onLengthChange }: BeamFormProps) {
  return (
    <section className={styles.section} aria-labelledby="beam-heading">
      <h2 id="beam-heading">Beam</h2>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Beam type</legend>
        {OPTIONS.map((option) => (
          <label key={option.type} className={styles.option}>
            <input
              type="radio"
              name="beam-type"
              checked={type === option.type}
              onChange={() => onTypeChange(option.type)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
      <NumberField
        id="beam-length"
        label="Length (m)"
        value={length}
        error={findError(errors, 'length')}
        onChange={onLengthChange}
      />
    </section>
  );
}
