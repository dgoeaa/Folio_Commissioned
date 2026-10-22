# Build sources — not packages

These five files are the later builds of five portal flows, kept only as **inputs** to
`scripts/build-identification-conformance.mjs`, which builds the conformance stage in memory; the identification release
is built from that stage. They are older than what the tenant runs. **Never paste or import them.**

The packages to use are the identification release: [`packages/identification-phase3/`](../../packages/identification-phase3/README.md)
and [`packages/identification-phase4/`](../../packages/identification-phase4/README.md). Moved here from
`surfaces/portal/delivered/` on 2026-10-21 (owner direction: the branch keeps only the latest version of every package).
