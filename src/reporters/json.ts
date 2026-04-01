import type { Reporter, ScanResults, ReporterOptions } from '../config/types.js';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export class JSONReporter implements Reporter {
  readonly name = 'json';

  generate(results: ScanResults, options: ReporterOptions): string {
    const output = JSON.stringify(results, null, 2);

    const outputPath = join(options.outputDir, 'propwatch-results.json');
    mkdirSync(options.outputDir, { recursive: true });
    writeFileSync(outputPath, output, 'utf8');

    return output;
  }
}
