# Docker

PropWatch is available as a Docker image — useful for CI platforms without a native install method or when you want a pinned, reproducible environment.

## Images

| Tag | Description |
|-----|-------------|
| `steve228uk/propwatch:latest` | Latest stable release |
| `steve228uk/propwatch:v1` | Latest v1.x release |
| `steve228uk/propwatch:v1.0.0` | Specific version |

## Basic usage

```bash
docker run --rm \
  -v $(pwd):/workspace \
  steve228uk/propwatch:latest \
  --base origin/main
```

The image sets `/workspace` as the working directory and expects your repository to be mounted there.

## With a config file

```bash
docker run --rm \
  -v $(pwd):/workspace \
  steve228uk/propwatch:latest \
  --base origin/main \
  --config propwatch.config.json
```

## Generate reports

Mount a host directory to capture the JUnit output:

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -v $(pwd)/reports:/workspace/test-reports \
  steve228uk/propwatch:latest \
  --base origin/main \
  --reporter console,junit \
  --output test-reports/
```

## Environment variables

Pass configuration via environment variables instead of CLI flags:

```bash
docker run --rm \
  -v $(pwd):/workspace \
  -e PROPWATCH_BASE_REF=origin/develop \
  -e PROPWATCH_REPORTERS=console,junit \
  -e PROPWATCH_OUTPUT_DIR=test-reports \
  steve228uk/propwatch:latest
```

## Custom image

Extend the image with your own config baked in:

```dockerfile
FROM steve228uk/propwatch:latest

COPY propwatch.config.json /workspace/
```

```bash
docker build -t my-propwatch .
docker run --rm -v $(pwd):/workspace my-propwatch --base origin/main
```

## CI platform examples

See the individual CI guides for platform-specific Docker usage:

- [Bitbucket Pipelines](/ci/bitbucket) — `image:` key
- [GitLab CI](/ci/gitlab) — `image:` key
- [CircleCI](/ci/circleci) — `docker:` executor
- [Azure DevOps](/ci/azure) — `container:` resource
- [Jenkins](/ci/jenkins) — `docker` agent
- [Buildkite](/ci/buildkite) — `docker` plugin
