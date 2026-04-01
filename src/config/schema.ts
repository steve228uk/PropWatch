import { z } from 'zod';

const propPatternSchema = z.object({
  name: z.string(),
  fileGlobs: z.array(z.string()),
  parser: z.string().default('regex'),
  propPatterns: z.array(z.string()).optional(),
  propNames: z.array(z.string()).optional(),
  astOptions: z.record(z.unknown()).optional(),
  junitProperties: z.record(z.string()).optional(),
});

const monorepoConfigSchema = z.object({
  autoDetect: z.boolean().default(true),
  packages: z.array(z.string()).nullable().default(null),
  reportStrategy: z.enum(['aggregate', 'per-package', 'both']).default('both'),
});

export const configSchema = z.object({
  version: z.string().optional(),
  baseRef: z.string().default('origin/main'),
  exitOnBreaking: z.boolean().default(false),
  reporters: z.array(z.string()).default(['console']),
  outputDir: z.string().default('./test-reports'),
  monorepo: monorepoConfigSchema.default({
    autoDetect: true,
    packages: null,
    reportStrategy: 'both',
  }),
  patterns: z.array(propPatternSchema).default([
    {
      name: 'testID',
      fileGlobs: ['**/*.{tsx,jsx}'],
      parser: 'regex',
      propPatterns: [
        'test(?:ID|Id)\\s*=\\s*["\']([^"\']+)["\']',
        'test(?:ID|Id)\\s*=\\s*\\{\\s*`([^`]+)`\\s*\\}',
      ],
    },
    {
      name: 'data-testid',
      fileGlobs: ['**/*.html', '**/*.vue', '**/*.svelte', '**/*.astro'],
      parser: 'regex',
      propPatterns: ['data-testid\\s*=\\s*["\']([^"\']+)["\']'],
    },
  ]),
  ignorePatterns: z.array(z.string()).default([
    '**/*.test.{tsx,jsx,ts,js}',
    '**/*.spec.{tsx,jsx,ts,js}',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
  ]),
});

export type ConfigSchema = z.infer<typeof configSchema>;
