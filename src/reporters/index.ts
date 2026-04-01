import type { Reporter } from '../config/types.js';
import { ConsoleReporter } from './console.js';
import { JUnitReporter } from './junit.js';
import { JSONReporter } from './json.js';
import { GitHubReporter } from './github.js';

const reporters = new Map<string, Reporter>();

reporters.set('console', new ConsoleReporter());
reporters.set('junit', new JUnitReporter());
reporters.set('json', new JSONReporter());
reporters.set('github', new GitHubReporter());

export function registerReporter(name: string, reporter: Reporter): void {
  reporters.set(name, reporter);
}

export function createReporter(name: string): Reporter {
  const reporter = reporters.get(name);
  if (!reporter) {
    throw new Error(
      `Unknown reporter: ${name}. Available reporters: ${Array.from(reporters.keys()).join(', ')}`
    );
  }
  return reporter;
}

export function getAvailableReporters(): string[] {
  return Array.from(reporters.keys());
}
