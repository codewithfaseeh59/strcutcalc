import type { ReactNode } from 'react';
import styles from './VisuallyHidden.module.css';

/** Hides content visually but keeps it available to screen readers. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <div className={styles.hidden}>{children}</div>;
}
