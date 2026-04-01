# Bitbucket Pipelines

## Basic setup

```yaml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Check Test IDs
          script:
            - git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH --depth=1
            - bunx propwatch --base origin/$BITBUCKET_PR_DESTINATION_BRANCH
```

## With Test Management

Upload JUnit results to Bitbucket's **Tests** tab. To surface results there, Bitbucket reads the `bbc.summary.kind` JUnit property — configure this per-pattern in your config:

```json
{
  "patterns": [
    {
      "name": "testID",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "babel",
      "propNames": ["testID", "testId"],
      "junitProperties": {
        "bbc.summary.kind": "test-id"
      }
    }
  ]
}
```

Then upload the report:

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

Results appear in the pull request under **Reports → Tests**, with failures (Changed/Removed IDs) and skipped (Added IDs) clearly separated.

## Reusable step definition

```yaml
image: node:20

definitions:
  steps:
    - step: &propwatch
        name: PropWatch — Test ID Check
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

pipelines:
  pull-requests:
    '**':
      - step: *propwatch
  branches:
    main:
      - step:
          <<: *propwatch
          name: PropWatch — Post-merge check
          script:
            - git fetch origin main --depth=1
            - bunx propwatch --base origin/main --reporter console,junit --output test-reports/
```

## Fail on breaking changes

```yaml
script:
  - bunx propwatch
      --base origin/$BITBUCKET_PR_DESTINATION_BRANCH
      --reporter console,junit
      --output test-reports/
      --exit-on-breaking
```

The pipeline step will fail if any IDs are removed or changed.

## Monorepo

```yaml
script:
  - git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH --depth=1
  - bunx propwatch
      --base origin/$BITBUCKET_PR_DESTINATION_BRANCH
      --reporter console,junit
      --output test-reports/
      --packages
      --format both
artifacts:
  upload:
    - name: propwatch-aggregate
      type: test-reports
      paths:
        - test-reports/propwatch-aggregate.xml
    - name: propwatch-packages
      type: test-reports
      paths:
        - test-reports/package-*.xml
```

## Using Docker

```yaml
- step:
    name: Check Test IDs
    image: steve228uk/propwatch:latest
    script:
      - git fetch origin $BITBUCKET_PR_DESTINATION_BRANCH --depth=1
      - propwatch --base origin/$BITBUCKET_PR_DESTINATION_BRANCH --reporter junit
    artifacts:
      upload:
        - name: propwatch-junit
          type: test-reports
          paths:
            - test-reports/propwatch-junit.xml
```

## Environment variables

```yaml
- step:
    name: Check Test IDs
    script:
      - export PROPWATCH_BASE_REF="origin/$BITBUCKET_PR_DESTINATION_BRANCH"
      - export PROPWATCH_REPORTERS="console,junit"
      - export PROPWATCH_OUTPUT_DIR="./test-reports"
      - bunx propwatch
```
