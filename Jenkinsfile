pipeline {
    agent any

    environment {
        IMAGE_NAME = "Server:${BUILD_NUMBER}"
        CONTAINER_NAME = "Server"
    }

    stages {
        stage('Build') {
            steps {
                sh "docker system prune -af"
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Deploy') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm -f ${CONTAINER_NAME} || true"
                sh "docker run -p 3001:3001 -d --name ${CONTAINER_NAME} ${IMAGE_NAME}"
            }
        }
    }
}
