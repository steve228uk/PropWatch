# Quick Start

## 1. Run a scan

```bash
npx propwatch --base origin/main
```

PropWatch compares your current branch against `origin/main` and prints a table of any test ID changes.

## 2. Create a config (optional)

PropWatch works without a config file. When you're ready to customise patterns or reporters, create `propwatch.config.json` in your project root:

```json
{
  "$schema": "https://propwatch.dev/schema.json",
  "baseRef": "origin/main",
  "reporters": ["console", "junit"],
  "patterns": [
    {
      "name": "testID",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "babel",
      "propNames": ["testID", "testId"]
    }
  ],
  "ignorePatterns": [
    "**/*.test.{tsx,jsx,ts,js}",
    "**/*.spec.{tsx,jsx,ts,js}",
    "**/node_modules/**"
  ]
}
```

## 3. Add to CI

### GitHub Actions

```yaml
name: PropWatch
on: [pull_request]

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
          reporters: console,junit
          exit-on-breaking: true
```

### Bitbucket Pipelines

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Check Test IDs
          script:
            - git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH --depth=1
            - bunx propwatch --base origin/$BITBUCKET_PR_DESTINATION_BRANCH --reporter junit --output test-reports/
          artifacts:
            upload:
              - name: propwatch-junit
                type: test-reports
                paths:
                  - test-reports/propwatch-junit.xml
```

## CLI reference

```
propwatch [options]

Options:
  -b, --base <ref>          Base ref to compare (default: origin/main)
  -c, --config <path>       Config file path
  -r, --reporter <name>     Reporter — console, junit, json, github (repeatable)
  -o, --output <dir>        Output directory (default: ./test-reports)
      --exit-on-breaking    Exit 1 if breaking changes are detected
      --packages            Scan all monorepo packages
      --format <type>       Report format: aggregate | per-package | both
  -h, --help                Show help
  -v, --version             Show version
```
