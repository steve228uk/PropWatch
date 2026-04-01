# Reporters

Reporters output the results of PropWatch scans in various formats.

## Available Reporters

### console

Human-readable table output displayed in the terminal.

**Output:**

```
+--------------------------------------------------+--------+----------------------------------+----------------------------------+---------------+
| File                                             |   Line | Old ID                           | New ID                           | Status        |
+--------------------------------------------------+--------+----------------------------------+----------------------------------+---------------+
| src/components/Button.tsx                        |     42 | submit-btn                       | submit-button                    | ~ Changed     |
| src/components/Form.tsx                          |     15 | —                                | login-form                       | + Added       |
| src/components/Input.tsx                         |     23 | search-input                     | —                                | ✕ Removed     |
+--------------------------------------------------+--------+----------------------------------+----------------------------------+---------------+
```

**Usage:**

```bash
propwatch --reporter console
```

### junit

JUnit XML format for CI test management systems.

**Features:**
- Compatible with Bitbucket Test Management
- Compatible with GitHub Actions test summaries
- Compatible with GitLab CI test reports
- Compatible with any JUnit-compatible CI platform

**Output:** `test-reports/propwatch-junit.xml`

**Test Status Mapping:**

| Change Type | JUnit Status |
|-------------|--------------|
| Added | Skipped (informational) |
| Changed | Failure (breaking) |
| Removed | Failure (breaking) |

**Usage:**

```bash
propwatch --reporter junit --output ./test-reports
```

**Bitbucket Pipelines:**

To surface results in the Bitbucket **Tests** tab, add `junitProperties` to each pattern in your config — Bitbucket reads the `bbc.summary.kind` property to categorise test cases:

```json
{
  "patterns": [
    {
      "name": "testID",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "babel",
      "propNames": ["testID"],
      "junitProperties": {
        "bbc.summary.kind": "test-id"
      }
    }
  ]
}
```

Then upload the report as a test artifact:

```yaml
artifacts:
  upload:
    - name: propwatch-junit
      type: test-reports
      paths:
        - test-reports/propwatch-junit.xml
```

See [JUnit properties](/config/patterns#junit-properties) for full documentation.

### json

Structured JSON output for programmatic use.

**Output:** `test-reports/propwatch-results.json`

**Structure:**

```json
{
  "changes": [
    {
      "file": "src/components/Button.tsx",
      "line": 42,
      "oldValue": "submit-btn",
      "newValue": "submit-button",
      "status": "Changed",
      "patternName": "testID"
    }
  ],
  "duration": 0.523,
  "scannedFiles": 15,
  "hasBreakingChanges": true,
  "breakingCount": 2,
  "addedCount": 3,
  "changedCount": 1
}
```

**Usage:**

```bash
propwatch --reporter json
```

### github

GitHub-specific output with workflow commands and PR comments.

**Features:**
- Annotations in GitHub Actions logs
- Error highlighting on specific lines
- Markdown summary for PR comments

**Output:** Workflow commands + markdown summary

**Usage:**

```bash
propwatch --reporter github
```

**GitHub Actions:**

```yaml
- uses: steve228uk/propwatch@v1
  with:
    reporters: console,junit,github
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Using Multiple Reporters

You can use multiple reporters simultaneously:

```bash
propwatch --reporter console --reporter junit --reporter json
```

Or via config:

```json
{
  "reporters": ["console", "junit", "json"]
}
```

## Reporter Configuration

### Output Directory

All file-based reporters write to the configured output directory:

```bash
propwatch --reporter junit --output ./reports
```

### In CI Pipelines

**Recommended setup:**

```bash
propwatch --reporter console,junit
```

This gives you:
- Human-readable output in logs
- Machine-readable reports for CI test management

## Custom Reporters

You can create custom reporters by implementing the Reporter interface:

```typescript
import type { Reporter, ScanResults, ReporterOptions } from 'propwatch';

class MyReporter implements Reporter {
  readonly name = 'my-reporter';

  generate(results: ScanResults, options: ReporterOptions): string {
    // Your output logic
    const output = formatResults(results);
    
    // Write to file or output
    console.log(output);
    
    return output;
  }
}

// Register the reporter
import { registerReporter } from 'propwatch';
registerReporter('my-reporter', new MyReporter());
```

Then use it in your config:

```json
{
  "reporters": ["my-reporter"]
}
```

## CI Platform Recommendations

| Platform | Recommended Reporters |
|----------|----------------------|
| GitHub Actions | console, junit, github |
| Bitbucket Pipelines | console, junit |
| GitLab CI | console, junit |
| CircleCI | console, junit |
| Azure DevOps | console, junit |
| Local Development | console |
