# How It Works

## 1. Get changed files

PropWatch runs a `git diff` to find files that changed between your branch and the base ref:

```
git diff --name-status origin/main HEAD
```

Files are filtered to extensions matched by your configured patterns (`.tsx`, `.jsx`, `.html`, etc.) before any parsing happens.

## 2. Extract IDs

For each changed file, PropWatch reads both versions:

- **Base** — `git show origin/main:path/to/file.tsx`
- **Head** — the file on disk

It then runs the configured parser over each version to extract every matching ID and the line it appears on.

## 3. Diff the ID sets

IDs from the base and head versions are compared using a value-aware algorithm:

- IDs that exist in both versions unchanged are ignored
- IDs that appear at the same line in both versions but with different values are marked **Changed**
- IDs present in the base but absent from the head are marked **Removed**
- IDs present in the head but absent from the base are marked **Added**

The line-level pairing minimises false positives from simple renames:

```
Base:  line 10 → testID="submit-btn"
Head:  line 10 → testID="submit-button"

Result: 1 Changed  (not 1 Removed + 1 Added)
```

## 4. Classify changes

| Status | Breaking | Description |
|--------|----------|-------------|
| Added | No | New IDs don't affect existing tests |
| Changed | **Yes** | Existing selectors will stop matching |
| Removed | **Yes** | Existing selectors will stop matching |

`hasBreakingChanges` is true when any Changed or Removed results exist. With `--exit-on-breaking`, PropWatch exits with code 1.

## 5. Report

Results are passed to each configured reporter:

| Reporter | Output |
|----------|--------|
| `console` | ANSI table in the terminal |
| `junit` | `propwatch-junit.xml` — JUnit XML for CI test management |
| `json` | `propwatch-results.json` — full structured output |
| `github` | GitHub Actions annotations + Markdown summary |

## Parsers

### Regex

The default parser. Scans each line with one or more regex patterns and captures group 1 as the ID value.

```json
{
  "parser": "regex",
  "propPatterns": [
    "testID=\"([^\"]+)\"",
    "data-testid=\"([^\"]+)\""
  ]
}
```

### Babel AST

For JSX prop extraction, the Babel parser traverses the AST and finds `JSXAttribute` nodes matching the configured prop names. More reliable than regex for complex JSX (multiline props, template literals).

```json
{
  "parser": "babel",
  "propNames": ["testID", "testId", "data-testid"]
}
```

## File status handling

| Git status | Action |
|------------|--------|
| Modified (`M`) | Diff base vs head |
| Added (`A`) | All IDs are reported as Added |
| Deleted (`D`) | All IDs are reported as Removed |
| Renamed (`R`) | Old path treated as Deleted, new path as Added |
