import type { Reporter, ScanResults, ReporterOptions } from '../config/types.js';

export class GitHubReporter implements Reporter {
  readonly name = 'github';

  generate(results: ScanResults, _options: ReporterOptions): string {
    const { changes, hasBreakingChanges, breakingCount, addedCount } = results;

    if (changes.length === 0) {
      console.log('::notice::PropWatch: No ID changes detected. All IDs are stable.');
      return '';
    }

    const summary = this.buildSummary(results);
    console.log(summary);

    for (const change of changes) {
      if (change.status !== 'Added') {
        const message = change.status === 'Removed'
          ? `ID '${change.oldValue}' was removed — existing E2E tests using this ID will break`
          : `ID changed from '${change.oldValue}' to '${change.newValue}' — update E2E selectors`;

        console.log(`::error file=${change.file},line=${change.line}::${message}`);
      }
    }

    return summary;
  }

  private buildSummary(results: ScanResults): string {
    const { hasBreakingChanges, breakingCount, addedCount, changedCount, removedCount, duration } = results;

    const lines = [
      '## PropWatch Report',
      '',
      `**Scan completed in ${duration.toFixed(3)}s**`,
      '',
      hasBreakingChanges
        ? `⚠️ **${breakingCount} breaking change(s) detected**`
        : '✅ **No breaking changes**',
      '',
      '| Status | Count |',
      '|--------|-------|',
      `| Added | ${addedCount} |`,
      `| Changed | ${changedCount} |`,
      `| Removed | ${removedCount} |`,
      '',
    ];

    if (results.changes.length > 0) {
      lines.push('### Changes');
      lines.push('');
      lines.push('| File | Line | Old Value | New Value | Status |');
      lines.push('|------|------|-----------|-----------|--------|');

      for (const change of results.changes) {
        const status = change.status === 'Added' ? '✅ Added' : change.status === 'Changed' ? '⚠️ Changed' : '❌ Removed';
        lines.push(`| ${change.file} | ${change.line} | ${change.oldValue ?? '-'} | ${change.newValue ?? '-'} | ${status} |`);
      }
    }

    return lines.join('\n');
  }
}
