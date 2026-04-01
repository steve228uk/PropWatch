import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { configSchema, type ConfigSchema } from './schema.js';
import type { PropWatchConfig } from './types.js';

const DEFAULT_CONFIG_FILES = [
  'propwatch.config.json',
  '.propwatchrc.json',
  '.propwatchrc',
];

function loadJsonConfig(filePath: string): unknown {
  const content = readFileSync(filePath, 'utf8');
  return JSON.parse(content);
}

function findConfigFile(startDir: string): string | null {
  let currentDir = resolve(startDir);

  while (true) {
    for (const fileName of DEFAULT_CONFIG_FILES) {
      const filePath = join(currentDir, fileName);
      if (existsSync(filePath)) {
        return filePath;
      }
    }

    const parentDir = resolve(currentDir, '..');
    if (parentDir === currentDir) {
      break;
    }
    currentDir = parentDir;
  }

  return null;
}

function mergeWithEnv(config: PropWatchConfig): PropWatchConfig {
  const env = process.env;

  return {
    ...config,
    baseRef: env.PROPWATCH_BASE_REF || config.baseRef,
    exitOnBreaking: env.PROPWATCH_EXIT_ON_BREAKING === 'true' || config.exitOnBreaking,
    reporters: env.PROPWATCH_REPORTERS
      ? env.PROPWATCH_REPORTERS.split(',').map((s) => s.trim())
      : config.reporters,
    outputDir: env.PROPWATCH_OUTPUT_DIR || config.outputDir,
    monorepo: {
      ...config.monorepo,
      reportStrategy: (env.PROPWATCH_REPORT_FORMAT as PropWatchConfig['monorepo']['reportStrategy']) || config.monorepo.reportStrategy,
    },
  };
}

export function loadConfig(customPath?: string): PropWatchConfig {
  let configData: unknown = {};

  if (customPath) {
    if (!existsSync(customPath)) {
      throw new Error(`Config file not found: ${customPath}`);
    }
    configData = loadJsonConfig(customPath);
  } else {
    const configPath = findConfigFile(process.cwd());
    if (configPath) {
      configData = loadJsonConfig(configPath);
    }
  }

  const parsed = configSchema.parse(configData);
  const merged = mergeWithEnv(parsed as PropWatchConfig);

  return merged;
}

export function createDefaultConfig(): PropWatchConfig {
  return configSchema.parse({});
}
