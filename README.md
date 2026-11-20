# StructCalc

A free web tool that analyses a beam and draws its shear force diagram (SFD) and bending moment diagram (BMD).

> Educational tool. Always verify results by hand calculation before using them in real design.

## What it does

- **Beams:** simply supported (pin at x = 0, roller at x = L) and cantilever (fixed at x = 0).
- **Loads:** downward point loads (kN at x m) and uniformly distributed loads (kN/m from a start to an end position).
- **Results:** support reactions, maximum shear, and maximum sagging and hogging moment with their positions.
- **Diagrams:** a beam sketch, an SFD and a BMD stacked on one shared x-scale, drawn as hand-built SVG, with one hover/keyboard readout of x, V and M.
- **Extras:** six textbook examples, shareable links (the beam lives in the URL query string), SVG export, light and dark themes, a responsive layout.
- **Accessibility:** labelled inputs with inline validation, `role="img"` diagrams with descriptive labels, a screen-reader data table of key values, keyboard-readable diagrams and visible focus.

Units are kN and m. x is measured from the left end, downward loads are positive, shear is positive upward and bending moment is positive when sagging.

## How the numbers are calculated

The engine in [src/engine](src/engine) is plain TypeScript with no React.

- **Reactions** come from equilibrium. For a simply supported beam, R_B = (ΣP·a + ΣW·c) / L and R_A = ΣP + ΣW − R_B. For a cantilever, R_A = ΣP + ΣW and the hogging fixed-end moment is M_A = ΣP·a + ΣW·c. Here W = w·(end − start) is the resultant of a UDL and c is its midpoint.
- **Shear and moment** are sums over the loads to the left of a section.
- **Reported maxima never rely on sampling.** V and M are evaluated exactly at the ends, at every load position, at every UDL start and end, and at the point inside each stretch where V crosses zero. About 400 samples are used only to draw the curves.

Every formula has a unit test with a hand-checked number, for example a 6 m beam with a 10 kN/m UDL gives R_A = R_B = 30 kN and M_max = wL²/8 = 45 kN·m.

## Getting started

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

| Script                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start the Vite dev server               |
| `npm run build`        | Type-check and build for production     |
| `npm run typecheck`    | Run the TypeScript compiler             |
| `npm run lint`         | Run ESLint                              |
| `npm test`             | Run the Vitest suite                    |
| `npm run format`       | Format the code with Prettier           |
| `npm run format:check` | Check formatting without changing files |

## Project structure

```
src/
  engine/       pure TypeScript: types, validation, reactions, shear and moment, extrema
  lib/          scales, number formatting, URL state, SVG export
  presets/      textbook examples
  hooks/        beam state with URL sync, analysis, theme
  components/   form, load editor, results, presets, diagrams, small UI pieces
  styles/       design tokens (light and dark) and global styles
```

## Sharing and export

The current beam is written to the URL (for example `?type=ss&length=6&u=10:0:6`), so copying the address shares the exact beam. An unreadable or invalid link falls back to the default beam. **Export SVG** downloads the beam sketch, SFD and BMD as one standalone SVG file.

## Deployment

The project is a standard Vite app. On Vercel, import the repository and keep the detected settings: build command `npm run build`, output directory `dist`. GitHub Actions runs type-check, lint, format check, tests and build on every push and pull request.
