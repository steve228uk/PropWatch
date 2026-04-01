# Configuration

PropWatch can be configured via a JSON configuration file or environment variables.

## Configuration File

Create a `propwatch.config.json` file in your project root:

```json
{
  "$schema": "https://propwatch.dev/schema.json",
  "baseRef": "origin/main",
  "exitOnBreaking": false,
  "reporters": ["console", "junit"],
  "outputDir": "./test-reports",
  "monorepo": {
    "autoDetect": true,
    "packages": null,
    "reportStrategy": "both"
  },
  "patterns": [
    {
      "name": "testID",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "regex",
      "propPatterns": [
        "test(?:ID|Id)\\s*=\\s*\"([^\"]+)\"",
        "test(?:ID|Id)\\s*=\\s*\\{\\s*`([^`]+)`\\s*\\}"
      ]
    }
  ],
  "ignorePatterns": [
    "**/*.test.{tsx,jsx,ts,js}",
    "**/node_modules/**"
  ]
}
```

## Configuration Locations

PropWatch looks for config files in this order:

1. Path specified via `--config` CLI flag
2. `propwatch.config.json` in current directory
3. `.propwatchrc.json` in current directory
4. `.propwatchrc` in current directory
5. Parent directories (searched upward)

## Environment Variables

All configuration options can be set via environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PROPWATCH_BASE_REF` | Base ref to compare | `origin/main` |
| `PROPWATCH_CONFIG_PATH` | Path to config file | Auto-detected |
| `PROPWATCH_REPORTERS` | Comma-separated reporters | `console` |
| `PROPWATCH_OUTPUT_DIR` | Output directory | `./test-reports` |
| `PROPWATCH_EXIT_ON_BREAKING` | Exit with error on breaking changes | `false` |
| `PROPWATCH_REPORT_FORMAT` | Report format for monorepos | `both` |

Environment variables override config file values.

## Configuration Options

### `baseRef`

The Git reference to compare against.

```json
{
  "baseRef": "origin/develop"
}
```

### `exitOnBreaking`

Whether to exit with a non-zero code when breaking changes are detected.

```json
{
  "exitOnBreaking": true
}
```

### `reporters`

List of reporters to use. Can specify multiple.

```json
{
  "reporters": ["console", "junit", "json"]
}
```

Available reporters:
- `console` - Human-readable table output
- `junit` - JUnit XML for CI test management
- `json` - Structured JSON output
- `github` - GitHub PR comments

### `outputDir`

Directory for output files.

```json
{
  "outputDir": "./reports/propwatch"
}
```

### `patterns`

Array of pattern configurations. See [Patterns](./patterns) for details.

### `ignorePatterns`

Array of glob patterns for files to ignore.

```json
{
  "ignorePatterns": [
    "**/*.test.{tsx,jsx}",
    "**/node_modules/**",
    "**/dist/**"
  ]
}
```

### `monorepo`

Monorepo configuration. See [Monorepo](./monorepo) for details.

## CLI Overrides

All config options can be overridden via CLI flags:

```bash
propwatch \
  --base origin/develop \
  --reporter console,junit \
  --output ./reports \
  --exit-on-breaking
```

See [CLI Reference](../guide/quick-start) for all options.
