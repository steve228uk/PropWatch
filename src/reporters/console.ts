import type { Reporter, ScanResults, Change, ReporterOptions } from '../config/types.js';

const useColor =
  process.env.NO_COLOR == null &&
  (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true' || !!process.stdout.isTTY);

const c = useColor
  ? { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m' }
  : { reset: '', bold: '', dim: '', red: '', green: '', yellow: '', cyan: '' };

const COLS = { file: 50, line: 6, oldId: 32, newId: 32, status: 13 };

function pad(str: string | number | null, width: number): string {
  return String(str ?? '').padEnd(width).slice(0, width);
}

function padStart(str: string | number | null, width: number): string {
  return String(str ?? '').padStart(width).slice(-width);
}

function truncate(str: string | null, width: number): string {
  const s = String(str ?? '');
  return s.length > width ? s.slice(0, width - 3) + '...' : s;
}

function sep(): string {
  return (
    '+' +
    '-'.repeat(COLS.file + 2) +
    '+' +
    '-'.repeat(COLS.line + 2) +
    '+' +
    '-'.repeat(COLS.oldId + 2) +
    '+' +
    '-'.repeat(COLS.newId + 2) +
    '+' +
    '-'.repeat(COLS.status + 2) +
    '+'
  );
}

function tableRow(file: string | number, line: string | number, oldId: string | null, newId: string | null, status: string): string {
  return (
    '| ' +
    pad(truncate(file as string, COLS.file), COLS.file) +
    ' | ' +
    padStart(line, COLS.line) +
    ' | ' +
    pad(truncate(oldId, COLS.oldId), COLS.oldId) +
    ' | ' +
    pad(truncate(newId, COLS.newId), COLS.newId) +
    ' | ' +
    pad(status, COLS.status) +
    ' |'
  );
}

function printTable(changes: Change[]): void {
  const divider = sep();
  console.log(c.dim + divider + c.reset);
  console.log(c.bold + tableRow('File', 'Line', 'Old ID', 'New ID', 'Status') + c.reset);
  console.log(c.dim + divider + c.reset);

  for (const change of changes) {
    const [colour, label] =
      change.status === 'Removed'
        ? [c.red, '✕ Removed']
        : change.status === 'Changed'
        ? [c.yellow, '~ Changed']
        : [c.green, '+ Added'];

    console.log(
      colour +
      tableRow(change.file, change.line, change.oldValue ?? '—', change.newValue ?? '—', label) +
      c.reset
    );
  }

  console.log(c.dim + divider + c.reset);
}

export class ConsoleReporter implements Reporter {
  readonly name = 'console';

  generate(results: ScanResults, options: ReporterOptions): string {
    const { changes, duration, scannedFiles, hasBreakingChanges, breakingCount, addedCount } = results;

    console.log(c.bold + c.cyan + '  PropWatch - Test ID Scanner' + c.reset);
    console.log(c.dim + `  Scanned ${scannedFiles} file(s) in ${duration.toFixed(3)}s` + c.reset);
    console.log('');

    if (changes.length === 0) {
      console.log(c.green + '✓ No ID changes detected. All IDs are stable.' + c.reset + '\n');
      return '';
    }

    if (hasBreakingChanges) {
      console.log(c.bold + c.yellow + '⚠  WARNING: Changes detected' + c.reset);
    } else {
      console.log(c.bold + c.green + '✓ Only new IDs were added' + c.reset);
    }

    console.log('');

    if (breakingCount > 0) {
      console.log(
        c.red + `   ${breakingCount} change(s)` + c.reset + c.dim + '  (Removed or Changed)' + c.reset
      );
    }
    if (addedCount > 0) {
      console.log(c.green + `   ${addedCount} new ID(s)` + c.reset + c.dim + '  (Added — informational)' + c.reset);
    }
    console.log('');

    printTable(changes);

    return '';
  }
}
