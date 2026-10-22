# Cleanup Report

## Outcome

- Source records assessed: **2,091**
- Source payload size: **149.8 MiB**
- Source files retained: **1,697**
- Retained source payload: **99.5 MiB**
- Files excluded: **394**
- Excluded payload: **50.2 MiB**
- Exact duplicate records removed: **47**
- Evidence/archive records represented by metadata only: **317**

## Applied decisions

- Current, unique, useful source and documentation were retained.
- Alternative generated register formats were removed in favour of canonical structured sources.
- Runtime records, endpoint runs, raw response samples, release packages, and historical archives were removed from the active folio.
- Exact duplicates were removed by SHA-256 hash.
- Shared brand assets and fonts were consolidated.
- Excluded items remain traceable through `cleanup-report.json`; retained-evidence candidates are also listed in `evidence-register.yaml`.

## Important retention note

The source export does not provide an external evidence-store URL. Accordingly, this package removes the evidence payloads from the active folio and preserves their paths, sizes, hashes, and disposition in the evidence register. That is the maximum complete migration possible from the supplied export alone without inventing storage locations.
