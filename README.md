# PropWatch

Detect removed, renamed, and changed test IDs before they break your E2E tests.

PropWatch runs in your pull request pipeline, diffs changed files against the base branch, and reports which `testID`, `data-testid`, or custom prop IDs were removed or renamed. You find out in the same PR that introduced the change — not when your E2E suite fails later.

## Quick start

```bash
npx propwatch --base origin/main
```

## GitHub Actions

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

## Bitbucket Pipelines

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Check Test IDs
          script:
            - git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH --depth=1
            - bunx propwatch
                --base origin/$BITBUCKET_PR_DESTINATION_BRANCH
                --reporter console,junit
                --output test-reports/
          artifacts:
            upload:
              - name: propwatch-junit
                type: test-reports
                paths:
                  - test-reports/propwatch-junit.xml
```

## Config file

Drop a `propwatch.config.json` in your project root to customise patterns and reporters:

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

No config file is needed to get started — PropWatch works out of the box with sensible defaults for `testID` and `data-testid`.

## What it detects

| Status | Breaking | Description |
|--------|----------|-------------|
| Added | No | New IDs — informational only |
| Changed | **Yes** | ID renamed on the same line |
| Removed | **Yes** | ID deleted entirely |

## Documentation

Full documentation at **[propwatch.dev](https://propwatch.dev)**:

- [Installation](https://propwatch.dev/guide/installation)
- [Configuration reference](https://propwatch.dev/config/)
- [CI/CD setup guides](https://propwatch.dev/ci/) — GitHub Actions, Bitbucket, GitLab, CircleCI, Azure DevOps, Jenkins, Buildkite

## License

MIT
