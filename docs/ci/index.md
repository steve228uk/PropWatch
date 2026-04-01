# CI/CD Setup

PropWatch is designed to run in pull request pipelines. The general pattern is the same across all platforms:

1. Checkout with full git history (`fetch-depth: 0`)
2. Fetch the base branch if it's not already available
3. Run PropWatch with `--base origin/<target-branch>`
4. Upload the JUnit report as a test artifact

## Platforms

| Platform | Guide | Method |
|----------|-------|--------|
| GitHub Actions | [→](/ci/github-actions) | Official action |
| Bitbucket Pipelines | [→](/ci/bitbucket) | `bunx` or Docker |
| GitLab CI | [→](/ci/gitlab) | Docker or `npx` |
| CircleCI | [→](/ci/circleci) | `npx` or Docker |
| Azure DevOps | [→](/ci/azure) | `npx` or Docker |
| Jenkins | [→](/ci/jenkins) | Docker or `npx` |
| Buildkite | [→](/ci/buildkite) | `npx` or Docker |
| Docker (generic) | [→](/ci/docker) | Any platform |

## Common options

```bash
propwatch \
  --base origin/main \
  --reporter console,junit \
  --output ./test-reports \
  --exit-on-breaking
```

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Success — no breaking changes (or `--exit-on-breaking` not set) |
| `1` | Breaking changes detected (requires `--exit-on-breaking`) |
| `1` | Scan error (invalid base ref, git failure, etc.) |

By default PropWatch always exits `0`. Pass `--exit-on-breaking` to fail the pipeline step on breaking changes.

## Test reports

The JUnit reporter (`--reporter junit`) produces `propwatch-junit.xml`, compatible with:

- GitHub Actions — via `actions/upload-artifact`
- Bitbucket Test Management — upload as a test artifact
- GitLab CI — `artifacts.reports.junit`
- CircleCI — `store_test_results`
- Azure DevOps — `PublishTestResults@2`
- Jenkins — JUnit plugin
- Buildkite — `junit` annotate plugin
