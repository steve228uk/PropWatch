import type { Match, Change } from '../config/types.js';

export function groupByValue(entries: Match[]): Map<string, Match[]> {
  const map = new Map<string, Match[]>();

  for (const entry of entries) {
    let list = map.get(entry.value);
    if (!list) {
      list = [];
      map.set(entry.value, list);
    }
    list.push(entry);
  }

  return map;
}

export function pairLineLevelDiff(
  rawRemoved: Match[],
  rawAdded: Match[],
  filePath: string,
  patternName: string,
  junitProperties: Record<string, string> | undefined
): Change[] {
  const byLineRem = new Map<number, string[]>();
  const byLineAdd = new Map<number, string[]>();

  for (const r of rawRemoved) {
    if (!byLineRem.has(r.line)) byLineRem.set(r.line, []);
    byLineRem.get(r.line)!.push(r.value);
  }
  for (const a of rawAdded) {
    if (!byLineAdd.has(a.line)) byLineAdd.set(a.line, []);
    byLineAdd.get(a.line)!.push(a.value);
  }

  const lines = new Set([...byLineRem.keys(), ...byLineAdd.keys()]);
  const changes: Change[] = [];

  for (const line of [...lines].sort((a, b) => a - b)) {
    const rems = byLineRem.get(line) ?? [];
    const adds = byLineAdd.get(line) ?? [];
    const paired = Math.min(rems.length, adds.length);

    for (let i = 0; i < paired; i++) {
      if (rems[i] === adds[i]) continue;

      changes.push({
        file: filePath,
        line,
        oldValue: rems[i],
        newValue: adds[i],
        status: 'Changed',
        patternName,
        junitProperties,
      });
    }
    for (let i = paired; i < rems.length; i++) {
      changes.push({
        file: filePath,
        line,
        oldValue: rems[i],
        newValue: null,
        status: 'Removed',
        patternName,
        junitProperties,
      });
    }
    for (let i = paired; i < adds.length; i++) {
      changes.push({
        file: filePath,
        line,
        oldValue: null,
        newValue: adds[i],
        status: 'Added',
        patternName,
        junitProperties,
      });
    }
  }

  const statusRank = { Removed: 0, Changed: 1, Added: 2 };

  return changes.sort(
    (x, y) => x.line - y.line || statusRank[x.status] - statusRank[y.status]
  );
}

export function compareMatches(
  baseEntries: Match[],
  headEntries: Match[],
  filePath: string,
  patternName: string,
  junitProperties: Record<string, string> | undefined
): Change[] {
  const baseBy = groupByValue(baseEntries);
  const headBy = groupByValue(headEntries);

  const rawRemoved: Match[] = [];
  const rawAdded: Match[] = [];

  for (const [value, baseList] of baseBy) {
    const headList = headBy.get(value) ?? [];
    const excess = baseList.length - headList.length;

    for (let i = 0; i < excess; i++) {
      const r = baseList[baseList.length - 1 - i];
      rawRemoved.push({ line: r.line, value: r.value });
    }
  }

  for (const [value, headList] of headBy) {
    const baseList = baseBy.get(value) ?? [];
    const excess = headList.length - baseList.length;

    for (let i = 0; i < excess; i++) {
      const a = headList[baseList.length + i];
      rawAdded.push({ line: a.line, value: a.value });
    }
  }

  return pairLineLevelDiff(rawRemoved, rawAdded, filePath, patternName, junitProperties);
}
