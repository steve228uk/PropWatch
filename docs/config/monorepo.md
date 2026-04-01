# Monorepo Support

PropWatch has built-in support for monorepos with automatic detection and flexible reporting options.

## Automatic Detection

PropWatch automatically detects monorepo structures by looking for:

1. `turbo.json` (Turborepo)
2. `pnpm-workspace.yaml` (pnpm workspaces)
3. `lerna.json` (Lerna)
4. `nx.json` (Nx)
5. `package.json` with `workspaces` (npm/yarn workspaces)

## Configuration

### Enable Monorepo Mode

```json
{
  "monorepo": {
    "autoDetect": true,
    "packages": null,
    "reportStrategy": "both"
  }
}
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `autoDetect` | boolean | `true` | Auto-detect monorepo structure |
| `packages` | string[] | `null` | Manual package paths (glob patterns) |
| `reportStrategy` | string | `"both"` | How to generate reports |

### Report Strategies

- **`aggregate`** - Single combined report for all packages
- **`per-package`** - Separate report for each package
- **`both`** - Both aggregate and per-package reports

## Manual Package Configuration

Override auto-detection with manual package paths:

```json
{
  "monorepo": {
    "autoDetect": false,
    "packages": [
      "apps/web",
      "apps/mobile",
      "packages/ui",
      "packages/utils"
    ],
    "reportStrategy": "both"
  }
}
```

Or use glob patterns:

```json
{
  "monorepo": {
    "packages": [
      "apps/*",
      "packages/*"
    ]
  }
}
```

## Package-Level Configuration

Each package can have its own `propwatch.config.json`:

```
root/
├── propwatch.config.json      # Root config
├── apps/
│   ├── web/
│   │   ├── src/
│   │   └── propwatch.config.json  # Package override
│   └── mobile/
└── packages/
    └── ui/
```

### Root Config

```json
{
  "baseRef": "origin/main",
  "patterns": [
    {
      "name": "default",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "regex",
      "propPatterns": ["testID=\"([^\"]+)\""]
    }
  ]
}
```

### Package Config (apps/web/propwatch.config.json)

```json
{
  "patterns": [
    {
      "name": "web-specific",
      "fileGlobs": ["**/*.tsx"],
      "parser": "babel",
      "propNames": ["data-qa", "testID"]
    }
  ]
}
```

Package configs are merged with root config, with package values taking precedence.

## CLI Usage

### Scan All Packages

```bash
propwatch --packages
```

### Specific Report Format

```bash
propwatch --packages --format aggregate
propwatch --packages --format per-package
propwatch --packages --format both
```

## Output Structure

### Aggregate Report

```
test-reports/
└── propwatch-aggregate.xml
```

### Per-Package Reports

```
test-reports/
├── propwatch-aggregate.xml
├── apps-web.xml
├── apps-mobile.xml
└── packages-ui.xml
```

### JSON Output

```
test-reports/
├── propwatch-aggregate.json
├── apps-web.json
├── apps-mobile.json
└── packages-ui.json
```

## CI/CD Integration

### GitHub Actions

```yaml
- uses: steve228uk/propwatch@v1
  with:
    packages: true
    format: both
```

### Bitbucket Pipelines

```yaml
- step:
    name: PropWatch - Monorepo
    script:
      - bunx propwatch --packages --format both
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

## Examples

### Turborepo

```json
{
  "monorepo": {
    "autoDetect": true,
    "reportStrategy": "both"
  }
}
```

Auto-detects from `turbo.json`:

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Nx

```json
{
  "monorepo": {
    "autoDetect": true,
    "reportStrategy": "both"
  }
}
```

Auto-detects from `nx.json`.

### pnpm Workspaces

```json
{
  "monorepo": {
    "autoDetect": true,
    "reportStrategy": "both"
  }
}
```

Auto-detects from `pnpm-workspace.yaml`:

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Performance

PropWatch optimizes monorepo scanning:

- Only scans changed files
- Parallel package scanning (future enhancement)
- Shared git operations
- Incremental reporting

## Troubleshooting

### Packages Not Detected

Check that your monorepo config file exists and is valid:

```bash
# Turborepo
cat turbo.json

# pnpm
cat pnpm-workspace.yaml

# npm/yarn
cat package.json | grep workspaces
```

### Override Detection

If auto-detection fails, use manual configuration:

```json
{
  "monorepo": {
    "autoDetect": false,
    "packages": ["apps/*", "packages/*"]
  }
}
```

### Package Config Not Loading

Ensure `propwatch.config.json` exists in the package directory and contains valid JSON.
