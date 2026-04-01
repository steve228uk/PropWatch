export interface PropPattern {
  name: string;
  fileGlobs: string[];
  parser: 'regex' | 'babel' | string;
  propPatterns?: string[];
  propNames?: string[];
  astOptions?: Record<string, unknown>;
  junitProperties?: Record<string, string>;
}

export interface MonorepoConfig {
  autoDetect: boolean;
  packages: string[] | null;
  reportStrategy: 'aggregate' | 'per-package' | 'both';
}

export interface PropWatchConfig {
  version?: string;
  baseRef: string;
  exitOnBreaking: boolean;
  reporters: string[];
  outputDir: string;
  monorepo: MonorepoConfig;
  patterns: PropPattern[];
  ignorePatterns: string[];
}

export interface Match {
  value: string;
  line: number;
}

export interface Change {
  file: string;
  line: number;
  oldValue: string | null;
  newValue: string | null;
  status: 'Removed' | 'Added' | 'Changed';
  patternName: string;
  junitProperties?: Record<string, string>;
}

export interface ScanResults {
  changes: Change[];
  duration: number;
  scannedFiles: number;
  hasBreakingChanges: boolean;
  breakingCount: number;
  addedCount: number;
  changedCount: number;
  removedCount: number;
}

export interface ChangedFile {
  filePath: string;
  status: 'M' | 'A' | 'D';
}

export interface ReporterOptions {
  outputDir: string;
  packageName?: string;
  includeSummary?: boolean;
}

export interface Parser {
  name: string;
  extract(content: string, pattern: PropPattern): Match[];
}

export interface Reporter {
  name: string;
  generate(results: ScanResults, options: ReporterOptions): string;
}
