pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
        APP_DIR      = 'notification_app_be'
    }

    triggers {
        githubPush()
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                echo 'Verifying Node.js installation...'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                dir("${APP_DIR}") {
                    sh 'npm install'
                }
            }
        }

        stage('Compile TypeScript') {
            steps {
                echo 'Compiling TypeScript to JavaScript...'
                dir("${APP_DIR}") {
                    sh 'npm run build'
                }
            }
        }

        stage('Run Priority Inbox') {
            steps {
                echo 'Running Priority Inbox application...'
                dir("${APP_DIR}") {
                    sh 'node dist/priority_inbox.js | tee priority_inbox_output.log'
                }
            }
        }

        stage('Archive Results') {
            steps {
                echo 'Archiving output logs...'
                archiveArtifacts artifacts: "${APP_DIR}/priority_inbox_output.log",
                                 fingerprint: true,
                                 allowEmptyArchive: true
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check console output.'
        }
        always {
            echo 'Pipeline finished. Cleaning up...'
            cleanWs()
        }
    }
}
