# CircleCI

## Basic setup

```yaml
version: 2.1

jobs:
  propwatch:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Fetch base branch
          command: git fetch origin main --depth=1
      - run:
          name: Scan test IDs
          command: npx propwatch --base origin/main

workflows:
  pull-request:
    jobs:
      - propwatch
```

## With Test Insights

CircleCI surfaces JUnit results in the **Tests** tab and test timing insights. Use `store_test_results` to enable this:

```yaml
version: 2.1

jobs:
  propwatch:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run:
          name: Fetch base branch
          command: git fetch origin main --depth=1
      - run:
          name: Install PropWatch
          command: npm install -g propwatch
      - run:
          name: Scan test IDs
          command: |
            propwatch \
              --base origin/main \
              --reporter console,junit \
              --output test-reports/
      - store_test_results:
          path: test-reports
      - store_artifacts:
          path: test-reports
          destination: propwatch-reports

workflows:
  pull-request:
    jobs:
      - propwatch
```

## With pipeline parameters (dynamic base branch)

```yaml
version: 2.1

parameters:
  base-branch:
    type: string
    default: "main"

jobs:
  propwatch:
    docker:
      - image: cimg/node:20.0
    steps:
      - checkout
      - run: git fetch origin << pipeline.parameters.base-branch >> --depth=1
      - run:
          command: |
            npx propwatch \
              --base origin/<< pipeline.parameters.base-branch >> \
              --reporter console,junit \
              --output test-reports/
      - store_test_results:
          path: test-reports

workflows:
  pull-request:
    jobs:
      - propwatch
```

## Using Docker

```yaml
version: 2.1

jobs:
  propwatch:
    docker:
      - image: steve228uk/propwatch:latest
    steps:
      - checkout
      - run: git fetch origin main --depth=1
      - run: propwatch --base origin/main --reporter junit --output test-reports/
      - store_test_results:
          path: test-reports

workflows:
  pull-request:
    jobs:
      - propwatch
```

## Fail on breaking changes

```yaml
- run:
    name: Scan test IDs
    command: |
      npx propwatch \
        --base origin/main \
        --reporter console,junit \
        --output test-reports/ \
        --exit-on-breaking
```

The job will fail with exit code 1 if any IDs are changed or removed.
