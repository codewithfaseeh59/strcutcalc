import { useState, type ChangeEvent } from 'react';
import styles from './NumberField.module.css';

function parseDraft(text: string): number {
  return text.trim() === '' ? Number.NaN : Number(text);
}

function toDraft(value: number): string {
  return Number.isNaN(value) ? '' : String(value);
}

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string | undefined;
}

/**
 * Text input for a number. It keeps what the user typed (so "1." or "" can exist while
 * typing) and reports NaN for anything that is not a number, which validation then flags.
 */
export function NumberField({ id, label, value, onChange, error }: NumberFieldProps) {
  const [draft, setDraft] = useState(() => toDraft(value));
  const [syncedValue, setSyncedValue] = useState(value);

  // The value changed from outside (e.g. a preset was loaded): show it instead of the old text.
  if (!Object.is(syncedValue, value)) {
    setSyncedValue(value);
    if (!Object.is(parseDraft(draft), value)) {
      setDraft(toDraft(value));
    }
  }

  const errorId = `${id}-error`;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setDraft(event.target.value);
    onChange(parseDraft(event.target.value));
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={draft}
        onChange={handleChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
      />
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
