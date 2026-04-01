---
layout: home
title: PropWatch — Guard your E2E selectors in CI
titleTemplate: ':title'

hero:
  name: PropWatch
  text: Guard your E2E selectors in CI
  tagline: Detects removed, renamed, and changed test IDs before they break your E2E test suite.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/
    - theme: alt
      text: Configuration
      link: /config/
    - theme: alt
      text: View on GitHub
      link: https://github.com/steve228uk/propwatch

features:
  - icon: 🔍
    title: Catch breaking changes early
    details: Scans your PR diff for removed or renamed testID, data-testid, and custom prop IDs — before they fail your E2E suite in production.
  - icon: ⚡
    title: Zero config to start
    details: Works out of the box with sensible defaults for JSX/TSX testID and HTML data-testid. Drop in a config file when you need more control.
  - icon: 🏗️
    title: Any framework
    details: Regex and Babel AST parsers cover React, React Native, Vue, Svelte, Astro, and plain HTML.
  - icon: 📋
    title: JUnit reports
    details: Outputs JUnit XML compatible with GitHub Actions, Bitbucket Test Management, GitLab, CircleCI Insights, Azure DevOps, and more.
  - icon: 🏢
    title: Monorepo ready
    details: Auto-detects Turborepo, Nx, pnpm workspaces, and Lerna. Generates per-package or aggregated reports.
  - icon: 🔌
    title: Extensible
    details: Register custom parsers and reporters programmatically via the TypeScript API.
---
