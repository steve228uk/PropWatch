import type { Parser, PropPattern, Match } from '../config/types.js';

export class RegexParser implements Parser {
  readonly name = 'regex';

  extract(content: string, pattern: PropPattern): Match[] {
    const results: Match[] = [];
    const lines = content.split('\n');
    const propPatterns = pattern.propPatterns || [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      for (const propPattern of propPatterns) {
        const regex = new RegExp(propPattern, 'g');
        let match: RegExpExecArray | null;

        while ((match = regex.exec(line)) !== null) {
          const value = match[1];
          if (value !== undefined && value.length > 0) {
            results.push({ value, line: lineNum });
          }
        }
      }
    }

    return results;
  }
}
