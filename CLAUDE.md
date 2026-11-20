You are helping me build StructCalc in this repo folder. First, save this whole brief as CLAUDE.md in the repo root (exactly as written), then do STEP 1 only.

## RULES
1. I am the only author. Never add "Co-Authored-By", Claude, Anthropic or "Generated with" lines anywhere (commits, PRs, README, comments, files).
2. NEVER run git commit, git push, or create/merge pull requests. Write the code, then give me: branch name, commit message, PR title and PR description. I run the Git commands myself.
3. One feature per branch/PR. Never work on main (except step 1). Stop after each step and wait for me.
4. After each step explain in 3-5 simple lines what you built and why. I must be able to explain every file in an interview.
5. TypeScript strict, no `any`. No chart libraries, no UI kits. Diagrams are hand-built SVG.
6. Every engine formula must have a test with a hand-checked number. If a test fails, fix the engine, never the test.
7. No placeholder junk, dead code, unused dependencies or commented-out code.

## PROJECT
StructCalc: a free web tool that analyses a beam and draws its shear force diagram (SFD) and bending moment diagram (BMD). Educational tool: add the footer text "Educational tool. Always verify results by hand calculation before using them in real design."
v1 scope: simply supported beam (pin at x=0, roller at x=L) and cantilever (fixed at x=0). Loads: downward point loads (kN at x m) and UDLs (kN/m from start to end). Units: kN and m.
Stack: Vite, React 18+, TypeScript strict, plain CSS variables + CSS Modules (light/dark), Vitest + React Testing Library, ESLint + Prettier, GitHub Actions CI, deploy on Vercel.

## FEATURES
Beam setup + load editor with inline validation; results panel (reactions, max shear, max sagging/hogging moment with positions); SVG beam diagram (supports, load arrows, UDL); SFD and BMD stacked on the same x-scale with one synced hover/keyboard readout (x, V, M); 4-6 textbook presets; share state through the URL query string; export diagrams as SVG; light/dark theme; responsive; accessible (role="img", aria-labels, hidden data table, labelled inputs, visible focus).

## FOLDER STRUCTURE
src/engine/ (pure TS, no React): types.ts, validate.ts, reactions.ts, diagrams.ts, extrema.ts + tests
src/lib/: scales.ts, format.ts, urlState.ts, exportSvg.ts
src/presets/presets.ts, src/hooks/, src/components/ (BeamForm, LoadEditor, ResultsPanel, PresetPicker, diagrams/BeamDiagram, diagrams/ForceDiagram, ui/), src/styles/ (tokens.css, global.css)
.github/workflows/ci.yml, .claude/settings.json

## ENGINE FORMULAS
x is measured from the left end. Downward loads positive. V = sum of vertical forces to the left of the section (up positive). M is sagging positive.
For point loads P_i at a_i and UDLs w_j over [s_j, e_j]: W_j = w_j*(e_j - s_j), c_j = (s_j + e_j)/2.
Simply supported:
  R_B = (sum P_i*a_i + sum W_j*c_j) / L
  R_A = sum P_i + sum W_j - R_B
Cantilever (fixed at x=0):
  R_A = sum P_i + sum W_j
  M_A = sum P_i*a_i + sum W_j*c_j (hogging magnitude)
Both:
  V(x) = R_A - sum over a_i<x of P_i - sum_j w_j*clamp(x - s_j, 0, e_j - s_j)
  M(x) = (simply supported) R_A*x - sum over a_i<x of P_i*(x - a_i) - sum_j U_j(x)
  M(x) = (cantilever) -M_A + R_A*x - sum over a_i<x of P_i*(x - a_i) - sum_j U_j(x)
  U_j(x) = 0 if x <= s_j; w_j*(x - s_j)^2/2 if s_j < x <= e_j; W_j*(x - c_j) if x > e_j
Extrema: evaluate V and M at candidates: 0, L, every point load position, every UDL start/end, and the point inside each UDL segment where V = 0 (V is linear there). Use just-left and just-right values of V at point loads. Never rely on sampling for reported numbers; sample (about 400 points) only to draw curves.

## REQUIRED TESTS (tolerance 1e-9)
- SS, L=6, UDL w=10 over the whole span: R_A=R_B=30; M_max=45 at x=3; V(0)=30, V(6)=-30
- SS, L=4, P=20 at x=2: R_A=R_B=10; M_max=20 at x=2
- SS, L=10, P=30 at x=3: R_A=21, R_B=9; M_max=63 at x=3
- Cantilever, L=3, P=15 at x=3: R_A=15; M_A=45; M(0)=-45
- Cantilever, L=2.5, UDL w=8 over the whole span: R_A=20; M_A=25
- Boundary checks: SS has M(0)=M(L)=0; cantilever has M(L)=0
- Validation rejects: position outside 0..L, UDL start >= end, magnitude <= 0, length <= 0
- urlState round-trip; garbage input falls back to a safe default

## STEPS (each its own branch and PR)
1 scaffold (main) | 2 feat/design-tokens-and-shell | 3 feat/engine-types-validation | 4 feat/engine-reactions | 5 feat/engine-shear-moment | 6 feat/engine-extrema | 7 feat/beam-form-and-loads | 8 feat/results-panel | 9 feat/beam-diagram | 10 feat/sfd-bmd-diagrams | 11 feat/hover-readout | 12 feat/presets | 13 feat/url-sharing | 14 feat/svg-export | 15 feat/theme-toggle | 16 fix/a11y-and-responsive | 17 ci/github-actions | 18 docs/readme
PR titles use conventional commits, for example "feat: add support reaction calculations".

## STEP 1 NOW
The folder already has README.md and .gitignore: do not overwrite them, merge anything Vite needs into them. Scaffold Vite + React + TypeScript (strict) in the current folder, add ESLint and Prettier, create .claude/settings.json with {"attribution":{"commit":"","pr":""},"includeCoAuthoredBy":false}, and save this brief as CLAUDE.md. Add scripts: typecheck, lint, test, build. Do not commit or push. Then explain what you created in simple words and give me the commit message.
