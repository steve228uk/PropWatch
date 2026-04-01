#!/usr/bin/env node
import { loadConfig } from './config/loader.js';
import { Scanner } from './core/scanner.js';
import { createReporter } from './reporters/index.js';
import type { PropWatchConfig, ReporterOptions } from './config/types.js';

interface CLIArgs {
  base: string;
  config?: string;
  reporters: string[];
  outputDir: string;
  exitOnBreaking: boolean;
  packages: boolean;
  format: 'aggregate' | 'per-package' | 'both';
  help: boolean;
  version: boolean;
}

function parseArgs(): CLIArgs {
  const argv = process.argv.slice(2);
  const args: CLIArgs = {
    base: process.env.PROPWATCH_BASE_REF || 'origin/main',
    reporters: process.env.PROPWATCH_REPORTERS?.split(',').map(s => s.trim()) ?? [],
    outputDir: process.env.PROPWATCH_OUTPUT_DIR || './test-reports',
    exitOnBreaking: process.env.PROPWATCH_EXIT_ON_BREAKING === 'true',
    packages: false,
    format: (process.env.PROPWATCH_REPORT_FORMAT as any) || 'both',
    help: false,
    version: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;
      case '--version':
      case '-v':
        args.version = true;
        break;
      case '--base':
      case '-b':
        args.base = argv[++i];
        break;
      case '--config':
      case '-c':
        args.config = argv[++i];
        break;
      case '--reporter':
      case '-r':
        args.reporters.push(...argv[++i].split(',').map(s => s.trim()));
        break;
      case '--output':
      case '-o':
        args.outputDir = argv[++i];
        break;
      case '--exit-on-breaking':
        args.exitOnBreaking = true;
        break;
      case '--packages':
        args.packages = true;
        break;
      case '--format':
        args.format = argv[++i] as any;
        break;
    }
  }

  return args;
}

function showHelp(): void {
  console.log(`
PropWatch - Detect test/prop ID changes in CI pipelines

Usage: propwatch [options]

Options:
  -b, --base <ref>              Base ref to compare (default: origin/main)
  -c, --config <path>           Config file path
  -r, --reporter <name>         Reporter(s) (can be specified multiple times)
                                Available: console, junit, json, github
  -o, --output <dir>            Output directory for reports (default: ./test-reports)
      --exit-on-breaking        Exit with error code on breaking changes
      --packages                Scan all monorepo packages
      --format <type>           Report format: aggregate, per-package, both (default: both)
  -h, --help                    Show help
  -v, --version                 Show version

Environment Variables:
  PROPWATCH_BASE_REF            Base ref to compare
  PROPWATCH_CONFIG_PATH         Path to config file
  PROPWATCH_REPORTERS           Comma-separated list of reporters
  PROPWATCH_OUTPUT_DIR          Output directory for reports
  PROPWATCH_EXIT_ON_BREAKING    Exit with error code on breaking changes (true/false)
  PROPWATCH_REPORT_FORMAT       Report format: aggregate, per-package, both

Examples:
  propwatch
  propwatch --base origin/main
  propwatch --base HEAD~5 --reporter junit --output ./reports
  propwatch --reporter console --reporter junit
  propwatch --exit-on-breaking
`);
}

async function showVersion(): Promise<void> {
  try {
    const pkg = await import('../package.json', { assert: { type: 'json' } });
    console.log(`PropWatch v${pkg.default.version}`);
  } catch {
    console.log('PropWatch (version unknown)');
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  if (args.version) {
    showVersion();
    process.exit(0);
  }

  let config: PropWatchConfig;

  try {
    config = loadConfig(args.config);
  } catch (error) {
    console.error(`Error loading config: ${error}`);
    process.exit(1);
  }

  config.baseRef = args.base;
  config.reporters = args.reporters.length > 0 ? args.reporters : config.reporters;
  config.outputDir = args.outputDir;
  config.exitOnBreaking = args.exitOnBreaking;
  config.monorepo.reportStrategy = args.format;

  const scanner = new Scanner(config);

  try {
    const results = await scanner.scan(args.base);

    const reporterOptions: ReporterOptions = {
      outputDir: config.outputDir,
    };

    for (const reporterName of config.reporters) {
      try {
        const reporter = createReporter(reporterName);
        reporter.generate(results, reporterOptions);
      } catch (error) {
        console.error(`Error with reporter '${reporterName}': ${error}`);
      }
    }

    console.log(`\nReports written to: ${config.outputDir}`);

    if (config.exitOnBreaking && results.hasBreakingChanges) {
      console.error('\nBreaking changes detected. Exiting with error code.');
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error(`Scan failed: ${error}`);
    process.exit(1);
  }
}

main();
