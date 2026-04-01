# Introduction

PropWatch is a CI tool that catches breaking changes to test IDs before they fail your E2E suite.

## The problem

When developers refactor components they often rename or remove `testID`, `data-testid`, or similar props without realising that E2E tests depend on them. The tests fail — sometimes minutes later in CI, sometimes days later in a staging environment.

PropWatch runs in your pull request pipeline, diffs the changed files against the base branch, and reports which IDs were removed or renamed. You find out immediately, in the same PR that introduced the change.

## What it detects

| Status | Example | Breaking? |
|--------|---------|-----------|
| **Added** | A new `testID="submit-button"` appeared | No — informational only |
| **Changed** | `"submit-btn"` renamed to `"submit-button"` on the same line | Yes |
| **Removed** | `testID="submit-btn"` deleted entirely | Yes |

## How it works

1. Runs `git diff` to find changed files in your branch
2. Extracts test IDs from both the base version and the current version of each file
3. Compares the two sets to identify additions, changes, and removals
4. Outputs results via your configured reporters

See [How It Works](/guide/how-it-works) for a deeper look at the diffing algorithm.

## Supported ID types

Out of the box:

- `testID` / `testId` in JSX/TSX (React, React Native)
- `data-testid` in HTML, Vue, Svelte, Astro

Any prop or attribute is configurable via [patterns](/config/patterns).

## Next steps

- [Installation](/guide/installation) — install via npm, npx, Bun, or Docker
- [Quick Start](/guide/quick-start) — up and running in 5 minutes
- [CI/CD Setup](/ci/) — add PropWatch to your pipeline
