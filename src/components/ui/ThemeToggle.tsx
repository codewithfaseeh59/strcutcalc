import type { Theme } from '../../hooks/useTheme';
import { Button } from './Button';

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <Button aria-pressed={theme === 'dark'} onClick={onToggle}>
      Dark mode
    </Button>
  );
}
