import type { Loads, PointLoad, UdlLoad, ValidationError } from '../engine/types';
import { findError } from '../engine/validate';
import styles from './LoadEditor.module.css';
import { Button } from './ui/Button';
import { NumberField } from './ui/NumberField';

interface LoadEditorProps extends Loads {
  length: number;
  errors: readonly ValidationError[];
  onChange: (loads: Loads) => void;
}

let createdLoads = 0;

function newLoadId(prefix: string): string {
  createdLoads += 1;
  return `${prefix}-new-${createdLoads}`;
}

export function LoadEditor({ pointLoads, udls, length, errors, onChange }: LoadEditorProps) {
  const span = Number.isFinite(length) && length > 0 ? length : 1;

  function updatePoint(id: string, patch: Partial<Omit<PointLoad, 'id'>>) {
    onChange({
      pointLoads: pointLoads.map((load) => (load.id === id ? { ...load, ...patch } : load)),
      udls,
    });
  }

  function updateUdl(id: string, patch: Partial<Omit<UdlLoad, 'id'>>) {
    onChange({
      pointLoads,
      udls: udls.map((udl) => (udl.id === id ? { ...udl, ...patch } : udl)),
    });
  }

  function addPoint() {
    const load: PointLoad = { id: newLoadId('pl'), magnitude: 10, position: span / 2 };
    onChange({ pointLoads: [...pointLoads, load], udls });
  }

  function addUdl() {
    const udl: UdlLoad = { id: newLoadId('udl'), intensity: 5, start: 0, end: span };
    onChange({ pointLoads, udls: [...udls, udl] });
  }

  return (
    <section className={styles.section} aria-labelledby="loads-heading">
      <h2 id="loads-heading">Loads</h2>

      <div className={styles.group}>
        <h3 className={styles.groupHeading}>Point loads</h3>
        {pointLoads.length === 0 ? <p className={styles.empty}>No point loads.</p> : null}
        {pointLoads.map((load, index) => (
          <fieldset key={load.id} className={styles.load}>
            <legend className={styles.legend}>Point load {index + 1}</legend>
            <div className={styles.fields}>
              <NumberField
                id={`${load.id}-magnitude`}
                label="Magnitude (kN)"
                value={load.magnitude}
                error={findError(errors, `${load.id}.magnitude`)}
                onChange={(magnitude) => updatePoint(load.id, { magnitude })}
              />
              <NumberField
                id={`${load.id}-position`}
                label="Position x (m)"
                value={load.position}
                error={findError(errors, `${load.id}.position`)}
                onChange={(position) => updatePoint(load.id, { position })}
              />
            </div>
            <Button
              aria-label={`Remove point load ${index + 1}`}
              onClick={() =>
                onChange({ pointLoads: pointLoads.filter((p) => p.id !== load.id), udls })
              }
            >
              Remove
            </Button>
          </fieldset>
        ))}
        <Button onClick={addPoint}>Add point load</Button>
      </div>

      <div className={styles.group}>
        <h3 className={styles.groupHeading}>Uniformly distributed loads</h3>
        {udls.length === 0 ? <p className={styles.empty}>No distributed loads.</p> : null}
        {udls.map((udl, index) => (
          <fieldset key={udl.id} className={styles.load}>
            <legend className={styles.legend}>Distributed load {index + 1}</legend>
            <div className={styles.fields}>
              <NumberField
                id={`${udl.id}-intensity`}
                label="Intensity (kN/m)"
                value={udl.intensity}
                error={findError(errors, `${udl.id}.intensity`)}
                onChange={(intensity) => updateUdl(udl.id, { intensity })}
              />
              <NumberField
                id={`${udl.id}-start`}
                label="Start x (m)"
                value={udl.start}
                error={findError(errors, `${udl.id}.start`)}
                onChange={(start) => updateUdl(udl.id, { start })}
              />
              <NumberField
                id={`${udl.id}-end`}
                label="End x (m)"
                value={udl.end}
                error={findError(errors, `${udl.id}.end`)}
                onChange={(end) => updateUdl(udl.id, { end })}
              />
            </div>
            <Button
              aria-label={`Remove distributed load ${index + 1}`}
              onClick={() => onChange({ pointLoads, udls: udls.filter((u) => u.id !== udl.id) })}
            >
              Remove
            </Button>
          </fieldset>
        ))}
        <Button onClick={addUdl}>Add distributed load</Button>
      </div>
    </section>
  );
}
