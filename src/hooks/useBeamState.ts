import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { Beam } from '../engine/types';
import { validateBeam } from '../engine/validate';
import { parseBeam, serializeBeam } from '../lib/urlState';

/** Beam state that starts from the URL query string and writes every valid change back to it. */
export function useBeamState(): [Beam, Dispatch<SetStateAction<Beam>>] {
  const [beam, setBeam] = useState<Beam>(() => parseBeam(window.location.search));

  useEffect(() => {
    if (validateBeam(beam).length === 0) {
      window.history.replaceState(null, '', `?${serializeBeam(beam)}`);
    }
  }, [beam]);

  return [beam, setBeam];
}
