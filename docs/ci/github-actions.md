# GitHub Actions

## Official action

The simplest setup — no install step required:

```yaml
name: PropWatch
on:
  pull_request:
    branches: [main]

jobs:
  propwatch:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: steve228uk/propwatch@v1
        with:
          base-ref: origin/${{ github.base_ref }}
```

## With annotations and JUnit report

```yaml
name: PropWatch
on:
  pull_request:
    branches: [main, develop]

jobs:
  propwatch:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: steve228uk/propwatch@v1
        with:
          base-ref: origin/${{ github.base_ref }}
          reporters: console,junit,github
          output-dir: ./test-reports
          exit-on-breaking: true
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Upload report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: propwatch-report
          path: ./test-reports/
```

The `github` reporter adds inline annotations to the diff and posts a Markdown summary to the PR.

## Action inputs

| Input | Description | Default |
|-------|-------------|---------|
| `base-ref` | Base ref to compare | `origin/main` |
| `config-path` | Path to config file | Auto-detected |
| `reporters` | Comma-separated list | `console,junit` |
| `output-dir` | Output directory for reports | `./test-reports` |
| `exit-on-breaking` | Fail the step on breaking changes | `false` |
| `report-format` | Monorepo format: `aggregate`, `per-package`, `both` | `both` |
| `github-token` | GitHub token for PR annotations | — |

## Action outputs

| Output | Description |
|--------|-------------|
| `has-breaking-changes` | `"true"` if breaking changes were detected |
| `breaking-count` | Number of breaking changes |
| `added-count` | Number of added IDs |
| `report-path` | Path to the generated reports directory |

## Monorepo

```yaml
- uses: steve228uk/propwatch@v1
  with:
    base-ref: origin/${{ github.base_ref }}
    packages: true
    format: both
```

## Matrix build per package

```yaml
jobs:
  propwatch:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package: [web, mobile, api]
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: steve228uk/propwatch@v1
        with:
          base-ref: origin/${{ github.base_ref }}
          config-path: ./packages/${{ matrix.package }}/propwatch.config.json
```

## Using npx directly

```yaml
steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0

  - run: npx propwatch --base origin/${{ github.base_ref }} --reporter junit --output test-reports/

  - uses: actions/upload-artifact@v4
    if: always()
    with:
      name: propwatch-report
      path: test-reports/
```
