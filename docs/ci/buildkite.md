# Buildkite

## Basic setup

```yaml
steps:
  - label: ":mag: Check Test IDs"
    command:
      - git fetch origin main --depth=1
      - npx propwatch --base origin/main
```

## With JUnit annotations

Use the [junit-annotate-buildkite-plugin](https://github.com/buildkite-plugins/junit-annotate-buildkite-plugin) to surface results as build annotations:

```yaml
steps:
  - label: ":mag: Check Test IDs"
    command:
      - git fetch origin main --depth=1
      - npx propwatch --base origin/main --reporter console,junit --output test-reports/
    artifact_paths: "test-reports/propwatch-junit.xml"
    plugins:
      - junit-annotate#v2.4.1:
          artifacts: test-reports/propwatch-junit.xml
```

Failures (Changed/Removed IDs) appear as error annotations on the build. Added IDs appear as skipped.

## Dynamic base branch

Use the `BUILDKITE_PULL_REQUEST_BASE_BRANCH` environment variable for pull request builds:

```yaml
steps:
  - label: ":mag: Check Test IDs"
    if: build.pull_request.id != null
    command:
      - git fetch origin $BUILDKITE_PULL_REQUEST_BASE_BRANCH --depth=1
      - npx propwatch
          --base origin/$BUILDKITE_PULL_REQUEST_BASE_BRANCH
          --reporter console,junit
          --output test-reports/
    artifact_paths: "test-reports/propwatch-junit.xml"
    plugins:
      - junit-annotate#v2.4.1:
          artifacts: test-reports/propwatch-junit.xml
```

## Using Docker

```yaml
steps:
  - label: ":mag: Check Test IDs"
    command:
      - git fetch origin $BUILDKITE_PULL_REQUEST_BASE_BRANCH --depth=1
      - propwatch
          --base origin/$BUILDKITE_PULL_REQUEST_BASE_BRANCH
          --reporter console,junit
          --output test-reports/
    plugins:
      - docker#v5.11.0:
          image: steve228uk/propwatch:latest
          volumes:
            - ".:/workspace"
    artifact_paths: "test-reports/propwatch-junit.xml"
```

## Fail on breaking changes

```yaml
command:
  - npx propwatch --base origin/$BUILDKITE_PULL_REQUEST_BASE_BRANCH --exit-on-breaking
```

The step will fail with exit code 1 when breaking changes are detected, blocking the build from proceeding.
