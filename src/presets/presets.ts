import { makeBeam } from '../engine/builders';
import type { Beam } from '../engine/types';

export interface Preset {
  id: string;
  name: string;
  description: string;
  beam: Beam;
}

export const DEFAULT_BEAM: Beam = makeBeam('simply-supported', 6, [], [[10, 0, 6]]);

export const PRESETS: readonly Preset[] = [
  {
    id: 'ss-udl',
    name: 'Simply supported, full-span UDL',
    description: 'L = 6 m, w = 10 kN/m. Maximum moment wL²/8 = 45 kN·m at midspan.',
    beam: DEFAULT_BEAM,
  },
  {
    id: 'ss-central-point',
    name: 'Simply supported, central point load',
    description: 'L = 4 m, P = 20 kN at midspan. Maximum moment PL/4 = 20 kN·m.',
    beam: makeBeam('simply-supported', 4, [[20, 2]]),
  },
  {
    id: 'ss-offset-point',
    name: 'Simply supported, off-centre point load',
    description: 'L = 10 m, P = 30 kN at x = 3 m. Reactions 21 kN and 9 kN.',
    beam: makeBeam('simply-supported', 10, [[30, 3]]),
  },
  {
    id: 'ss-mixed',
    name: 'Simply supported, point load and partial UDL',
    description: 'L = 8 m, P = 20 kN at x = 2 m and w = 5 kN/m from x = 4 m to 8 m.',
    beam: makeBeam('simply-supported', 8, [[20, 2]], [[5, 4, 8]]),
  },
  {
    id: 'cantilever-tip',
    name: 'Cantilever, tip point load',
    description: 'L = 3 m, P = 15 kN at the free end. Fixed-end moment PL = 45 kN·m.',
    beam: makeBeam('cantilever', 3, [[15, 3]]),
  },
  {
    id: 'cantilever-udl',
    name: 'Cantilever, full-span UDL',
    description: 'L = 2.5 m, w = 8 kN/m. Fixed-end moment wL²/2 = 25 kN·m.',
    beam: makeBeam('cantilever', 2.5, [], [[8, 0, 2.5]]),
  },
];
