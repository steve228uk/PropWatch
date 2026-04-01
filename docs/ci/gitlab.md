# GitLab CI

## Basic setup

```yaml
stages:
  - test

propwatch:
  stage: test
  image: node:20
  before_script:
    - git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME --depth=1
    - npm install -g propwatch
  script:
    - propwatch --base origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## With JUnit test report

GitLab natively renders JUnit XML under the **Tests** tab of a merge request:

```yaml
propwatch:
  stage: test
  image: node:20
  before_script:
    - git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME --depth=1
    - npm install -g propwatch
  script:
    - propwatch
        --base origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME
        --reporter console,junit
        --output test-reports/
  artifacts:
    when: always
    reports:
      junit: test-reports/propwatch-junit.xml
    paths:
      - test-reports/
    expire_in: 7 days
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Using Docker

No install step needed with the Docker image:

```yaml
propwatch:
  stage: test
  image: steve228uk/propwatch:latest
  before_script:
    - git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME --depth=1
  script:
    - propwatch
        --base origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME
        --reporter console,junit
        --output test-reports/
  artifacts:
    reports:
      junit: test-reports/propwatch-junit.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

## Fail on breaking changes

```yaml
script:
  - propwatch
      --base origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME
      --reporter console,junit
      --output test-reports/
      --exit-on-breaking
allow_failure: false
```

## Branch pipelines (no merge request)

```yaml
propwatch:
  stage: test
  image: node:20
  before_script:
    - git fetch origin $CI_DEFAULT_BRANCH --depth=1
    - npm install -g propwatch
  script:
    - propwatch --base origin/$CI_DEFAULT_BRANCH --reporter junit
  artifacts:
    reports:
      junit: test-reports/propwatch-junit.xml
  rules:
    - if: $CI_COMMIT_BRANCH && $CI_OPEN_MERGE_REQUESTS
      when: never
    - if: $CI_COMMIT_BRANCH
```

## Environment variables

```yaml
variables:
  PROPWATCH_REPORTERS: "console,junit"
  PROPWATCH_OUTPUT_DIR: "./test-reports"

propwatch:
  stage: test
  image: node:20
  before_script:
    - git fetch origin $CI_MERGE_REQUEST_TARGET_BRANCH_NAME --depth=1
    - npm install -g propwatch
  script:
    - PROPWATCH_BASE_REF="origin/$CI_MERGE_REQUEST_TARGET_BRANCH_NAME" propwatch
  artifacts:
    reports:
      junit: test-reports/propwatch-junit.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```
