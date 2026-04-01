export { loadConfig, createDefaultConfig } from './config/loader.js';
export { Scanner } from './core/scanner.js';
export { createReporter, registerReporter, getAvailableReporters } from './reporters/index.js';
export { createParser, registerParser } from './parsers/index.js';

export type {
  PropWatchConfig,
  PropPattern,
  MonorepoConfig,
  Match,
  Change,
  ScanResults,
  ChangedFile,
  ReporterOptions,
  Parser,
  Reporter,
} from './config/types.js';
