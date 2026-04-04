import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PropWatch',
  description: 'Catch removed or renamed test IDs in CI before they break your Playwright, Cypress, or Appium tests. Works with any framework, zero config to start.',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'PropWatch' }],
    ['meta', { property: 'og:url', content: 'https://propwatch.dev' }],
    ['meta', { property: 'og:title', content: 'PropWatch — Guard your E2E selectors in CI' }],
    ['meta', { property: 'og:description', content: 'Catch removed or renamed test IDs in CI before they break your Playwright, Cypress, or Appium tests. Works with any framework, zero config to start.' }],
    ['meta', { property: 'og:image', content: 'https://propwatch.dev/og.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    // Twitter / X
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'PropWatch — Guard your E2E selectors in CI' }],
    ['meta', { name: 'twitter:description', content: 'Catch removed or renamed test IDs in CI before they break your Playwright, Cypress, or Appium tests. Works with any framework, zero config to start.' }],
    ['meta', { name: 'twitter:image', content: 'https://propwatch.dev/og.png' }],
  ],
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Use Cases', link: '/guide/use-cases' },
      { text: 'Configuration', link: '/config/' },
      { text: 'CI/CD', link: '/ci/' },
    ],
    editLink: {
      pattern: 'https://github.com/steve228uk/propwatch/edit/main/docs/:path',
      text: 'Edit this page on GitHub',
    },
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
            { text: 'How It Works', link: '/guide/how-it-works' },
            { text: 'Use Cases', link: '/guide/use-cases' },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Configuration',
          items: [
            { text: 'Overview', link: '/config/' },
            { text: 'Patterns', link: '/config/patterns' },
            { text: 'Parsers', link: '/config/parsers' },
            { text: 'Reporters', link: '/config/reporters' },
            { text: 'Monorepo', link: '/config/monorepo' },
          ],
        },
      ],
      '/ci/': [
        {
          text: 'CI/CD Setup',
          items: [
            { text: 'Overview', link: '/ci/' },
            { text: 'GitHub Actions', link: '/ci/github-actions' },
            { text: 'Bitbucket Pipelines', link: '/ci/bitbucket' },
            { text: 'GitLab CI', link: '/ci/gitlab' },
            { text: 'CircleCI', link: '/ci/circleci' },
            { text: 'Azure DevOps', link: '/ci/azure' },
            { text: 'Jenkins', link: '/ci/jenkins' },
            { text: 'Buildkite', link: '/ci/buildkite' },
            { text: 'Docker', link: '/ci/docker' },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/steve228uk/propwatch' },
    ],
    footer: {
      message: 'Released under the MIT License',
      copyright: 'Copyright © 2026 Stephen Radford',
    },
    search: {
      provider: 'local',
    },
  },
})
