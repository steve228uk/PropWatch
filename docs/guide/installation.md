# Installation

## Requirements

- Node.js 18+ or Bun 1.0+
- A Git repository

## npx / bunx (no install)

Run PropWatch without installing anything:

```bash
npx propwatch --base origin/main
# or
bunx propwatch --base origin/main
```

## Global install

```bash
npm install -g propwatch
# or
bun install -g propwatch
```

Then:

```bash
propwatch --base origin/main
```

## Project dependency

Install as a dev dependency to pin a version and run via package scripts:

```bash
npm install --save-dev propwatch
```

```json
{
  "scripts": {
    "check:ids": "propwatch --base origin/main"
  }
}
```

## Docker

```bash
docker run --rm -v $(pwd):/workspace steve228uk/propwatch:latest \
  --base origin/main
```

## CI/CD

For CI-specific setup see the [CI/CD guides](/ci/).

| Platform | Method |
|----------|--------|
| [GitHub Actions](/ci/github-actions) | Official action — no install needed |
| [Bitbucket Pipelines](/ci/bitbucket) | `bunx propwatch` or Docker image |
| [GitLab CI](/ci/gitlab) | Docker image or `npx` |
| [CircleCI](/ci/circleci) | Docker image or `npx` |
| [Azure DevOps](/ci/azure) | `npx` or Docker image |
| [Jenkins](/ci/jenkins) | Docker image or `npx` |
| [Buildkite](/ci/buildkite) | `npx` or Docker image |

## Verify

```bash
propwatch --version
```
