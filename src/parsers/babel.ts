import type { Parser, PropPattern, Match } from '../config/types.js';
import * as parser from '@babel/parser';
import traverseModule from '@babel/traverse';
import type { Node } from '@babel/types';

// Handle both bundled and unbundled environments
const traverse = (traverseModule as typeof traverseModule & { default?: typeof traverseModule }).default || traverseModule;

export class BabelParser implements Parser {
  readonly name = 'babel';

  extract(content: string, pattern: PropPattern): Match[] {
    const results: Match[] = [];
    const propNames = pattern.propNames || [];

    try {
      const ast = parser.parse(content, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript'],
        ...pattern.astOptions,
      });

      traverse(ast as Node, {
        JSXAttribute: (path) => {
          const node = path.node;
          const nameObj = node.name;
          const propName = typeof nameObj === 'object' && 'name' in nameObj ? String(nameObj.name) : '';

          if (propNames.includes(propName)) {
            const value = this.extractValue(node.value);
            if (value !== null) {
              const loc = node.loc;
              if (loc) {
                results.push({
                  value,
                  line: loc.start.line,
                });
              }
            }
          }
        },
      });
    } catch (error) {
      console.error(`Failed to parse with Babel: ${error}`);
    }

    return results;
  }

  private extractValue(valueNode: unknown): string | null {
    if (!valueNode || typeof valueNode !== 'object') return null;

    const node = valueNode as { type: string; value?: string; expression?: unknown; quasis?: Array<{ value: { raw: string } }> };

    if (node.type === 'StringLiteral') {
      return node.value ?? null;
    }

    if (node.type === 'JSXExpressionContainer') {
      const expression = node.expression as { type: string; value?: string; quasis?: Array<{ value: { raw: string } }> } | undefined;

      if (expression?.type === 'StringLiteral') {
        return expression.value ?? null;
      }

      if (expression?.type === 'TemplateLiteral' && expression.quasis) {
        return expression.quasis.map((q) => q.value.raw).join('${}');
      }
    }

    return null;
  }
}
