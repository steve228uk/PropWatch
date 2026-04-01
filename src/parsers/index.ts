import type { Parser } from '../config/types.js';
import { RegexParser } from './regex.js';
import { BabelParser } from './babel.js';

const parsers = new Map<string, Parser>();

parsers.set('regex', new RegexParser());
parsers.set('babel', new BabelParser());

export function registerParser(name: string, parser: Parser): void {
  parsers.set(name, parser);
}

export function createParser(name: string): Parser {
  const parser = parsers.get(name);
  if (!parser) {
    throw new Error(`Unknown parser: ${name}. Available parsers: ${Array.from(parsers.keys()).join(', ')}`);
  }
  return parser;
}
