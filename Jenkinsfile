pipeline {
    agent any

    environment {
        APP_DIR = "/home/ubuntu/Quirky-Threads"
        PM2_APP = "Quirky-Threads-backend"
    }

    stages {

        stage('Clean Old App') {
            steps {
                sh """
                    mv ${APP_DIR} ${APP_DIR}-backup-$(date +%Y%m%d%H%M%S) || true
                    rm -rf ${APP_DIR}
                    mkdir -p ${APP_DIR}
                """
            }
        }

        stage('Copy Source Code') {
            steps {
                sh """
                    cp -r . ${APP_DIR}
                """
            }
        }

        stage('Build Application') {
            steps {
                sh """
                    cd ${APP_DIR}
                    npm run build
                """
            }
        }

        stage('Reload PM2') {
            steps {
                sh """
                    pm2 reload ${PM2_APP}
                """
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully!'
        }

        failure {
            echo 'Deployment failed!'
        }
    }
}