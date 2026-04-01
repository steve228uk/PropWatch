# Parsers

Parsers extract IDs from your source files. PropWatch includes multiple parser options.

## Available Parsers

### regex (Default)

The regex parser is fast and works for most use cases. It uses JavaScript regular expressions to find patterns in your code.

**When to use:**
- Simple prop patterns
- Static string values
- Template literals with simple interpolation

**Configuration:**

```json
{
  "name": "my-pattern",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "regex",
  "propPatterns": [
    "testID=\"([^\"]+)\"",
    "testID=\\{\\s*`([^`]+)`\\s*\\}"
  ]
}
```

**Examples:**

| Pattern | Matches |
|---------|---------|
| `testID=\"([^\"]+)\"` | `testID="submit-button"` |
| `testID='([^']+)'` | `testID='submit-button'` |
| `testID=\\{\\s*`([^`]+)`\\s*\\}` | `testID={\`btn-${id}\`}` |

### babel (AST)

The Babel parser uses the Abstract Syntax Tree to extract IDs. It's more accurate but requires Babel dependencies.

**When to use:**
- Complex patterns
- Dynamic values
- Need to understand code structure

**Requirements:**

```bash
npm install @babel/core @babel/parser @babel/traverse @babel/types
```

**Configuration:**

```json
{
  "name": "babel-pattern",
  "fileGlobs": ["**/*.{tsx,jsx}"],
  "parser": "babel",
  "propNames": ["testID", "data-testid"],
  "astOptions": {
    "sourceType": "module",
    "plugins": ["jsx", "typescript"]
  }
}
```

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `propNames` | string[] | List of prop names to extract |
| `astOptions` | object | Babel parser options |

**Babel AST Options:**

```json
{
  "astOptions": {
    "sourceType": "module",
    "plugins": [
      "jsx",
      "typescript",
      "decorators",
      "classProperties"
    ]
  }
}
```

See [Babel Parser Options](https://babeljs.io/docs/babel-parser#options) for full documentation.

## Parser Comparison

| Feature | regex | babel |
|---------|-------|-------|
| Speed | ✅ Fast | Slower |
| Accuracy | Good | ✅ Better |
| Setup | ✅ None | Requires deps |
| Dynamic values | Limited | ✅ Full support |
| TypeScript | Via regex | ✅ Native |
| Vue SFC | Via regex | Via custom parser |

## Choosing a Parser

**Use regex if:**
- You have simple, static patterns
- Performance is critical
- You don't want extra dependencies

**Use babel if:**
- You have complex extraction needs
- Values are computed dynamically
- You need to understand JSX structure

## Custom Parsers

You can create custom parsers by implementing the Parser interface:

```typescript
import type { Parser, PropPattern, Match } from 'propwatch';

class MyParser implements Parser {
  readonly name = 'my-parser';

  extract(content: string, pattern: PropPattern): Match[] {
    // Your extraction logic
    const matches: Match[] = [];
    // ... extract IDs
    return matches;
  }
}

// Register the parser
import { registerParser } from 'propwatch';
registerParser('my-parser', new MyParser());
```

Then use it in your config:

```json
{
  "parser": "my-parser"
}
```

## Performance Tips

1. **Prefer regex for simple patterns** - It's 10x faster
2. **Limit file scope** - Use specific `fileGlobs` to reduce scanning
3. **Cache Babel AST** - Not needed, PropWatch optimizes automatically
4. **Use multiple patterns** - Different parsers for different file types

## Troubleshooting

### Regex not matching?

Test your regex:

```javascript
const pattern = /testID="([^"]+)"/g;
const content = '<button testID="submit">Submit</button>';
const matches = [...content.matchAll(pattern)];
console.log(matches);
```

### Babel parser errors?

Ensure all Babel dependencies are installed:

```bash
npm list @babel/core @babel/parser @babel/traverse @babel/types
```

Check your `astOptions` match your code (e.g., TypeScript needs `"plugins": ["typescript"]`).
