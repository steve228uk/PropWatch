import { spawnSync } from 'child_process';
import { extname } from 'path';
import type { ChangedFile } from '../config/types.js';

export class GitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitError';
  }
}

export function runGit(args: string[]): string {
  const result = spawnSync('git', args, { encoding: 'utf8' });

  if (result.status !== 0) {
    throw new GitError(
      `git ${args[0]} failed: ${(result.stderr || '').trim() || '(no stderr)'}`
    );
  }

  return (result.stdout || '').trim();
}

export function getBaseContent(base: string, filePath: string): string | null {
  try {
    const result = spawnSync('git', ['show', `${base}:${filePath}`], {
      encoding: 'buffer',
    });

    if (result.status !== 0) return null;
    const buf = result.stdout;

    if (buf.includes(0x00)) return null;

    return buf.toString('utf8');
  } catch {
    return null;
  }
}

export function getChangedFiles(base: string, fileExtensions?: string[]): ChangedFile[] {
  const output = runGit(['diff', '--name-status', base, 'HEAD']);

  if (!output) return [];

  const entries: ChangedFile[] = [];

  for (const line of output.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split('\t');
    const rawStatus = parts[0];

    if (rawStatus.startsWith('R')) {
      const [, oldPath, newPath] = parts;

      if (oldPath && shouldIncludeFile(oldPath, fileExtensions)) {
        entries.push({ filePath: oldPath, status: 'D' });
      }
      if (newPath && shouldIncludeFile(newPath, fileExtensions)) {
        entries.push({ filePath: newPath, status: 'A' });
      }
      continue;
    }

    const status = rawStatus[0] as 'M' | 'A' | 'D';
    const filePath = parts[1];

    if (!filePath || !shouldIncludeFile(filePath, fileExtensions)) continue;
    if (!['M', 'A', 'D'].includes(status)) continue;

    entries.push({ filePath, status });
  }

  return entries;
}

function shouldIncludeFile(filePath: string, extensions?: string[]): boolean {
  if (!extensions || extensions.length === 0) return true;
  const ext = extname(filePath);
  return extensions.includes(ext);
}

export function validateBaseRef(base: string): void {
  try {
    runGit(['rev-parse', '--verify', base]);
  } catch {
    throw new GitError(
      `Could not resolve base ref '${base}'. Hint: run 'git fetch ${base.split('/')[0]} ${base.split('/')[1] || 'main'}' first.`
    );
  }
}
