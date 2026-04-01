import { readFileSync } from 'fs';
import { minimatch } from 'minimatch';
import type {
  PropWatchConfig,
  PropPattern,
  ChangedFile,
  Change,
  ScanResults,
  Match,
} from '../config/types.js';
import { getBaseContent, getChangedFiles, validateBaseRef } from '../git/diff.js';
import { compareMatches } from './matcher.js';
import { createParser } from '../parsers/index.js';

export class Scanner {
  private config: PropWatchConfig;
  private readonly fileExtensions: string[];

  constructor(config: PropWatchConfig) {
    this.config = config;
    this.fileExtensions = this.extractFileExtensions();
  }

  async scan(base: string): Promise<ScanResults> {
    const startTime = Date.now();

    try {
      validateBaseRef(base);
    } catch (error) {
      return this.createErrorResults(error as Error, startTime);
    }

    const changedFiles = getChangedFiles(base, this.fileExtensions);

    if (changedFiles.length === 0) {
      return this.createEmptyResults(startTime);
    }

    const allChanges: Change[] = [];

    for (const { filePath, status } of changedFiles) {
      if (this.shouldIgnoreFile(filePath)) continue;

      const changes = await this.scanFile(filePath, status, base);
      allChanges.push(...changes);
    }

    const duration = (Date.now() - startTime) / 1000;
    return this.createResults(allChanges, changedFiles.length, duration);
  }

  private async scanFile(
    filePath: string,
    status: ChangedFile['status'],
    base: string
  ): Promise<Change[]> {
    const patterns = this.getMatchingPatterns(filePath);
    const allChanges: Change[] = [];

    for (const pattern of patterns) {
      const changes = await this.scanWithPattern(filePath, status, base, pattern);
      allChanges.push(...changes);
    }

    return allChanges;
  }

  private async scanWithPattern(
    filePath: string,
    status: ChangedFile['status'],
    base: string,
    pattern: PropPattern
  ): Promise<Change[]> {
    const parser = createParser(pattern.parser);
    const { junitProperties } = pattern;

    if (status === 'A') {
      const headContent = this.readFile(filePath);
      if (!headContent) return [];

      const headEntries = parser.extract(headContent, pattern);
      return headEntries.map((e) => ({
        file: filePath,
        line: e.line,
        oldValue: null,
        newValue: e.value,
        status: 'Added' as const,
        patternName: pattern.name,
        junitProperties,
      }));
    }

    if (status === 'D') {
      const baseContent = getBaseContent(base, filePath);
      if (!baseContent) return [];

      const baseEntries = parser.extract(baseContent, pattern);
      return baseEntries.map((e) => ({
        file: filePath,
        line: e.line,
        oldValue: e.value,
        newValue: null,
        status: 'Removed' as const,
        patternName: pattern.name,
        junitProperties,
      }));
    }

    const baseContent = getBaseContent(base, filePath);
    const headContent = this.readFile(filePath);

    if (!headContent) return [];

    const baseEntries = baseContent ? parser.extract(baseContent, pattern) : [];
    const headEntries = parser.extract(headContent, pattern);

    return compareMatches(baseEntries, headEntries, filePath, pattern.name, junitProperties);
  }

  private getMatchingPatterns(filePath: string): PropPattern[] {
    return this.config.patterns.filter((pattern) =>
      pattern.fileGlobs.some((glob) => minimatch(filePath, glob))
    );
  }

  private shouldIgnoreFile(filePath: string): boolean {
    return this.config.ignorePatterns.some((pattern) =>
      minimatch(filePath, pattern)
    );
  }

  private readFile(filePath: string): string | null {
    try {
      return readFileSync(filePath, 'utf8');
    } catch {
      return null;
    }
  }

  private extractFileExtensions(): string[] {
    const extensions = new Set<string>();
    for (const pattern of this.config.patterns) {
      for (const glob of pattern.fileGlobs) {
        const match = glob.match(/\.\w+$/);
        if (match) {
          extensions.add(match[0]);
        }
      }
    }
    return Array.from(extensions);
  }

  private createEmptyResults(startTime: number): ScanResults {
    return {
      changes: [],
      duration: (Date.now() - startTime) / 1000,
      scannedFiles: 0,
      hasBreakingChanges: false,
      breakingCount: 0,
      addedCount: 0,
      changedCount: 0,
      removedCount: 0,
    };
  }

  private createErrorResults(error: Error, startTime: number): ScanResults {
    console.error(`Error: ${error.message}`);
    return this.createEmptyResults(startTime);
  }

  private createResults(
    changes: Change[],
    scannedFiles: number,
    duration: number
  ): ScanResults {
    let breakingCount = 0, addedCount = 0, changedCount = 0, removedCount = 0;
    for (const c of changes) {
      if (c.status === 'Added') addedCount++;
      else if (c.status === 'Changed') { changedCount++; breakingCount++; }
      else { removedCount++; breakingCount++; }
    }

    return {
      changes,
      duration,
      scannedFiles,
      hasBreakingChanges: breakingCount > 0,
      breakingCount,
      addedCount,
      changedCount,
      removedCount,
    };
  }
}
