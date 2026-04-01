# Jenkins

## Declarative pipeline

```groovy
pipeline {
  agent any

  stages {
    stage('Check Test IDs') {
      when {
        changeRequest()
      }
      steps {
        sh 'git fetch origin ${CHANGE_TARGET} --depth=1'
        sh "npx propwatch --base origin/${env.CHANGE_TARGET} --reporter console,junit --output test-reports/"
      }
      post {
        always {
          junit 'test-reports/propwatch-junit.xml'
        }
      }
    }
  }
}
```

The `junit` step publishes results to Jenkins' built-in test reporting UI. Failed test cases (Changed/Removed IDs) appear as test failures.

## With Docker agent

```groovy
pipeline {
  agent {
    docker {
      image 'steve228uk/propwatch:latest'
      args '-v $WORKSPACE:/workspace'
    }
  }

  stages {
    stage('Check Test IDs') {
      when {
        changeRequest()
      }
      steps {
        sh 'git fetch origin ${CHANGE_TARGET} --depth=1'
        sh "propwatch --base origin/${env.CHANGE_TARGET} --reporter console,junit --output test-reports/"
      }
      post {
        always {
          junit 'test-reports/propwatch-junit.xml'
        }
      }
    }
  }
}
```

## Fail on breaking changes

```groovy
steps {
  sh """
    npx propwatch \
      --base origin/${env.CHANGE_TARGET} \
      --reporter console,junit \
      --output test-reports/ \
      --exit-on-breaking
  """
}
```

A non-zero exit code will mark the stage as failed.

## Scripted pipeline

```groovy
node {
  stage('Checkout') {
    checkout scm
    sh "git fetch origin ${env.CHANGE_TARGET} --depth=1"
  }

  stage('Scan Test IDs') {
    try {
      sh "npx propwatch --base origin/${env.CHANGE_TARGET} --reporter console,junit --output test-reports/"
    } finally {
      junit 'test-reports/propwatch-junit.xml'
    }
  }
}
```

## Required plugins

- [JUnit Plugin](https://plugins.jenkins.io/junit/) — for `junit` step and test result rendering
- [Docker Pipeline Plugin](https://plugins.jenkins.io/docker-workflow/) — for `docker` agent (optional)
