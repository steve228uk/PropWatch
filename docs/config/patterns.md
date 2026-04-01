# Patterns

Patterns define what PropWatch looks for in your code.

## Pattern Structure

Each pattern has the following properties:

```json
{
  "name": "my-pattern",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "regex",
  "propPatterns": ["testID=\"([^\"]+)\""],
  "propNames": ["data-testid"],
  "astOptions": {}
}
```

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | ✅ | Unique name for the pattern |
| `fileGlobs` | string[] | ✅ | File patterns to match |
| `parser` | string | ✅ | Parser to use (`regex` or `babel`) |
| `propPatterns` | string[] | For regex | Regex patterns with capture groups |
| `propNames` | string[] | For babel | Prop names to extract |
| `astOptions` | object | For babel | Babel parser options |
| `junitProperties` | object | — | Key/value pairs added as `<property>` elements inside each JUnit `<testcase>` for this pattern. See [JUnit properties](#junit-properties). |

## Default Patterns

PropWatch includes these default patterns:

### testID (JSX/TSX)

```json
{
  "name": "testID",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "regex",
  "propPatterns": [
    "test(?:ID|Id)\\s*=\\s*\"([^\"]+)\"",
    "test(?:ID|Id)\\s*=\\s*\\{\\s*`([^`]+)`\\s*\\}"
  ]
}
```

Matches:
- `testID="submit-button"`
- `testId="submit-button"`
- `testID={\`submit-${type}\`}`

### data-testid (HTML/Vue/Svelte)

```json
{
  "name": "data-testid",
  "fileGlobs": ["**/*.html", "**/*.vue", "**/*.svelte", "**/*.astro"],
  "parser": "regex",
  "propPatterns": ["data-testid\\s*=\\s*\"([^\"]+)\""]
}
```

Matches:
- `data-testid="submit-button"`

## Custom Patterns

### Simple Regex Pattern

```json
{
  "name": "qa-id",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "regex",
  "propPatterns": ["data-qa-id=\"([^\"]+)\""]
}
```

Matches:
- `data-qa-id="login-form"`

### Multiple Patterns

```json
{
  "name": "all-test-ids",
  "fileGlobs": ["**/*.{tsx,jsx,vue}"],
  "parser": "regex",
  "propPatterns": [
    "testID=\"([^\"]+)\"",
    "data-testid=\"([^\"]+)\"",
    "qa-id=\"([^\"]+)\""
  ]
}
```

### Template Literals

```json
{
  "name": "dynamic-ids",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "regex",
  "propPatterns": [
    "testID=\\{\\s*`([^`]+)`\\s*\\}"
  ]
}
```

Matches:
- `testID={\`button-${id}\`}`

### Babel AST Pattern

For more complex extraction, use the Babel parser:

```json
{
  "name": "complex-ids",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "babel",
  "propNames": ["testID", "data-testid", "qa-id"],
  "astOptions": {
    "sourceType": "module",
    "plugins": ["jsx", "typescript"]
  }
}
```

Requires `@babel/core`, `@babel/parser`, `@babel/traverse`, and `@babel/types` to be installed.

## File Glob Patterns

Use glob patterns to target specific files:

```json
{
  "fileGlobs": [
    "src/**/*.{tsx,jsx}",
    "!**/*.test.{tsx,jsx}",
    "!**/node_modules/**"
  ]
}
```

## Multiple Patterns

Define multiple patterns for different file types:

```json
{
  "patterns": [
    {
      "name": "react-test-ids",
      "fileGlobs": ["**/*.{tsx,jsx}"],
      "parser": "regex",
      "propPatterns": ["testID=\"([^\"]+)\""]
    },
    {
      "name": "vue-test-ids",
      "fileGlobs": ["**/*.vue"],
      "parser": "regex",
      "propPatterns": ["data-testid=\"([^\"]+)\""]
    },
    {
      "name": "html-test-ids",
      "fileGlobs": ["**/*.html"],
      "parser": "regex",
      "propPatterns": ["data-testid=\"([^\"]+)\""]
    }
  ]
}
```

## JUnit Properties

The optional `junitProperties` field lets you attach custom `<property>` elements to each JUnit `<testcase>` generated for a pattern. This is useful for CI platforms that read JUnit annotations to display results in their UI.

No properties are emitted by default — only add them when your CI platform requires them.

```json
{
  "name": "react-native-testid",
  "fileGlobs": ["**/*.tsx", "**/*.jsx"],
  "parser": "babel",
  "propNames": ["testID"],
  "junitProperties": {
    "bbc.summary.kind": "test-id"
  }
}
```

The above produces the following inside each `<testcase>`:

```xml
<properties>
  <property name="bbc.summary.kind" value="test-id"/>
</properties>
```

### Bitbucket Pipelines

Bitbucket uses `bbc.summary.kind` to surface results in the **Tests** tab of a pipeline run:

```json
{
  "junitProperties": {
    "bbc.summary.kind": "test-id"
  }
}
```

You can set any number of properties per pattern:

```json
{
  "junitProperties": {
    "bbc.summary.kind": "test-id",
    "team": "frontend"
  }
}
```

## Regex Tips

- Use capture groups `()` to extract the value
- Escape special characters: `\\s` for whitespace, `\\"` for quotes
- Test your regex at [regex101.com](https://regex101.com)
- Use non-capturing groups `(?:)` for optional parts
