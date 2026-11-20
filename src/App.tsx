import styles from './App.module.css';
import { BeamForm } from './components/BeamForm';
import { DiagramStack } from './components/diagrams/DiagramStack';
import { LoadEditor } from './components/LoadEditor';
import { PresetPicker } from './components/PresetPicker';
import { ResultsPanel } from './components/ResultsPanel';
import { ShareButton } from './components/ShareButton';
import { ThemeToggle } from './components/ui/ThemeToggle';
import { useAnalysis } from './hooks/useAnalysis';
import { useBeamState } from './hooks/useBeamState';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const [beam, setBeam] = useBeamState();
  const { errors, analysis } = useAnalysis(beam);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>StructCalc</h1>
          <p className={styles.subtitle}>
            Shear force and bending moment diagrams for simply supported beams and cantilevers.
          </p>
        </div>
        <div className={styles.actions}>
          <ShareButton />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.column}>
          <PresetPicker onSelect={setBeam} />
          <BeamForm
            type={beam.type}
            length={beam.length}
            errors={errors}
            onTypeChange={(type) => setBeam((current) => ({ ...current, type }))}
            onLengthChange={(length) => setBeam((current) => ({ ...current, length }))}
          />
          <LoadEditor
            pointLoads={beam.pointLoads}
            udls={beam.udls}
            length={beam.length}
            errors={errors}
            onChange={(loads) => setBeam((current) => ({ ...current, ...loads }))}
          />
        </div>

        <div className={styles.column}>
          <ResultsPanel beamType={beam.type} length={beam.length} analysis={analysis} />
          {analysis ? <DiagramStack beam={beam} analysis={analysis} /> : null}
        </div>
      </main>

      <footer className={styles.footer}>
        Educational tool. Always verify results by hand calculation before using them in real
        design.
      </footer>
    </div>
  );
}
