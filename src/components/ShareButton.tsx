import { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { VisuallyHidden } from './ui/VisuallyHidden';

type Status = 'idle' | 'copied' | 'failed';

const RESET_DELAY_MS = 2500;

const LABELS: Record<Status, string> = {
  idle: 'Copy share link',
  copied: 'Link copied',
  failed: 'Copy failed',
};

const ANNOUNCEMENTS: Record<Status, string> = {
  idle: '',
  copied: 'Link copied to the clipboard.',
  failed: 'Could not copy the link.',
};

/** Copies the current page URL, which already holds the beam in its query string. */
export function ShareButton() {
  const [status, setStatus] = useState<Status>('idle');

  useEffect(() => {
    if (status === 'idle') return;
    const timer = window.setTimeout(() => setStatus('idle'), RESET_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [status]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
  }

  return (
    <>
      <Button onClick={() => void copyLink()}>{LABELS[status]}</Button>
      <VisuallyHidden>
        <span role="status">{ANNOUNCEMENTS[status]}</span>
      </VisuallyHidden>
    </>
  );
}
