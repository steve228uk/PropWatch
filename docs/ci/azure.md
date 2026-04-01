# Azure DevOps

## Basic setup

```yaml
trigger: none

pr:
  branches:
    include:
      - main
      - develop

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    fetchDepth: 0

  - script: |
      git fetch origin $(System.PullRequest.TargetBranch) --depth=1
      npx propwatch --base origin/$(System.PullRequest.TargetBranch)
    displayName: Scan test IDs
```

## With test results

Azure DevOps renders JUnit XML in the **Tests** tab of a pipeline run via `PublishTestResults@2`:

```yaml
trigger: none

pr:
  branches:
    include:
      - main

pool:
  vmImage: ubuntu-latest

steps:
  - checkout: self
    fetchDepth: 0

  - task: NodeTool@0
    inputs:
      versionSpec: '20.x'
    displayName: Install Node.js

  - script: npm install -g propwatch
    displayName: Install PropWatch

  - script: |
      git fetch origin $(System.PullRequest.TargetBranch) --depth=1
      propwatch \
        --base origin/$(System.PullRequest.TargetBranch) \
        --reporter console,junit \
        --output $(Build.ArtifactStagingDirectory)/test-reports/
    displayName: Scan test IDs

  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: '**/propwatch-junit.xml'
      searchFolder: $(Build.ArtifactStagingDirectory)/test-reports
      testRunTitle: PropWatch — Test ID Changes
    displayName: Publish test results

  - task: PublishBuildArtifacts@1
    condition: always()
    inputs:
      pathToPublish: $(Build.ArtifactStagingDirectory)/test-reports
      artifactName: propwatch-reports
    displayName: Upload reports
```

## Using Docker

```yaml
pool:
  vmImage: ubuntu-latest

container: steve228uk/propwatch:latest

steps:
  - checkout: self
    fetchDepth: 0

  - script: |
      git fetch origin $(System.PullRequest.TargetBranch) --depth=1
      propwatch \
        --base origin/$(System.PullRequest.TargetBranch) \
        --reporter console,junit \
        --output test-reports/
    displayName: Scan test IDs

  - task: PublishTestResults@2
    condition: always()
    inputs:
      testResultsFormat: JUnit
      testResultsFiles: test-reports/propwatch-junit.xml
```

## Fail on breaking changes

```yaml
- script: |
    propwatch \
      --base origin/$(System.PullRequest.TargetBranch) \
      --reporter console,junit \
      --exit-on-breaking
  displayName: Scan test IDs
  failOnStderr: false
```

The pipeline stage will fail with a non-zero exit code when breaking changes are detected.

## Variables

```yaml
variables:
  PROPWATCH_REPORTERS: 'console,junit'
  PROPWATCH_OUTPUT_DIR: '$(Build.ArtifactStagingDirectory)/test-reports'

steps:
  - script: |
      git fetch origin $(System.PullRequest.TargetBranch) --depth=1
      PROPWATCH_BASE_REF="origin/$(System.PullRequest.TargetBranch)" npx propwatch
    displayName: Scan test IDs
```
