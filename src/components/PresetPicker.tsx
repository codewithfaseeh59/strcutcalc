import type { Beam } from '../engine/types';
import { PRESETS } from '../presets/presets';
import styles from './PresetPicker.module.css';

interface PresetPickerProps {
  onSelect: (beam: Beam) => void;
}

export function PresetPicker({ onSelect }: PresetPickerProps) {
  return (
    <section className={styles.section} aria-labelledby="presets-heading">
      <h2 id="presets-heading">Textbook examples</h2>
      <ul className={styles.list}>
        {PRESETS.map((preset) => (
          <li key={preset.id}>
            <button type="button" className={styles.preset} onClick={() => onSelect(preset.beam)}>
              <span className={styles.name}>{preset.name}</span>
              <span className={styles.description}>{preset.description}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
