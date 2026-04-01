import type { Reporter, ScanResults, ReporterOptions, Change } from '../config/types.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

function xmlEscape(str: string | null): string {
  if (str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildPropertiesBlock(properties: Record<string, string>, indent: string): string {
  const lines = [`${indent}<properties>`];
  for (const [name, value] of Object.entries(properties)) {
    lines.push(`${indent}  <property name="${xmlEscape(name)}" value="${xmlEscape(value)}"/>`);
  }
  lines.push(`${indent}</properties>`);
  return lines.join('\n');
}

export class JUnitReporter implements Reporter {
  readonly name = 'junit';

  generate(results: ScanResults, options: ReporterOptions): string {
    const { changes, duration, breakingCount, addedCount } = results;

    const total = changes.length === 0 ? 1 : changes.length;
    const failures = breakingCount;
    const skipped = addedCount;
    const time = duration.toFixed(3);

    const cases = this.buildTestCases(changes, duration);

    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      `<testsuites name="PropWatch" tests="${total}" failures="${failures}" errors="0" skipped="${skipped}" time="${time}">`,
      `  <testsuite name="ID Changes" tests="${total}" failures="${failures}" errors="0" skipped="${skipped}" time="${time}">`,
      ...cases,
      '  </testsuite>',
      '</testsuites>',
    ].join('\n');

    const outputPath = join(options.outputDir, 'propwatch-junit.xml');
    mkdirSync(options.outputDir, { recursive: true });
    writeFileSync(outputPath, xml, 'utf8');

    return xml;
  }

  private buildTestCases(changes: Change[], duration: number): string[] {
    if (changes.length === 0) {
      return [
        `    <testcase name="All IDs stable" classname="PropWatch.Scanner" time="${duration.toFixed(3)}"/>`,
      ];
    }

    return changes.map((change) =>
      change.status === 'Added'
        ? this.buildSkippedCase(change)
        : this.buildFailureCase(change)
    );
  }

  private buildSkippedCase(change: Change): string {
    const name = xmlEscape(`${change.file} :: ${change.newValue} (new)`);
    const msg = xmlEscape(`New ID '${change.newValue}' added — no existing tests affected`);

    const lines = [`    <testcase name="${name}" classname="PropWatch.Added" time="0">`];
    if (change.junitProperties) {
      lines.push(buildPropertiesBlock(change.junitProperties, '      '));
    }
    lines.push(`      <skipped message="${msg}"/>`, '    </testcase>');
    return lines.join('\n');
  }

  private buildFailureCase(change: Change): string {
    const isChange = change.status === 'Changed';
    const name = xmlEscape(
      isChange
        ? `${change.file} :: ${change.oldValue} → ${change.newValue}`
        : `${change.file} :: ${change.oldValue ?? change.newValue}`
    );
    const classname = `PropWatch.${change.status}`;
    const msg = xmlEscape(
      isChange
        ? `ID changed from '${change.oldValue}' to '${change.newValue}' — update E2E selectors`
        : `ID '${change.oldValue}' was removed — existing E2E tests using this ID will break`
    );
    const detail = xmlEscape(
      `File: ${change.file}\nLine: ${change.line}\nOld: ${change.oldValue ?? '(none)'}\nNew: ${change.newValue ?? '(none)'}\nPattern: ${change.patternName}`
    );

    const lines = [`    <testcase name="${name}" classname="${classname}" time="0">`];
    if (change.junitProperties) {
      lines.push(buildPropertiesBlock(change.junitProperties, '      '));
    }
    lines.push(`      <failure message="${msg}">${detail}</failure>`, '    </testcase>');
    return lines.join('\n');
  }
}
