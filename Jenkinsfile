pipeline {
    agent any

    environment {
        APP_DIR = "/home/ubuntu/Quirky-Threads-preprod"
        PM2_APP = "Quirky-Threads-backend-preprod"
    }

    stages {

        stage('Clean Old App') {
            steps {
                sh """
                    if [ -d "${APP_DIR}" ]; then
                        mv ${APP_DIR} ${APP_DIR}-backup-\$(date +%F-%T)
                        rm -rf ${APP_DIR}
                    fi
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
                  if pm2 describe ${PM2_APP} > /dev/null 2>&1; then
                      echo "PM2 app exists. Reloading..."
                      pm2 reload ${PM2_APP}
                  fi
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