import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'PropWatch',
  description: 'Detect test ID changes in CI pipelines before they break your E2E tests.',
  base: '/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
  ],
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/' },
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
