pipeline {
    agent any

    environment {
        IMAGE_NAME = "test:${BUILD_NUMBER}"
        CONTAINER_NAME = "test"
        GITHUB_USERNAME = "${env.GITHUB_USERNAME}"
        GITHUB_TOKEN = "${env.GITHUB_TOKEN}"
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker system prune -af'
                sh "docker build -t ${IMAGE_NAME} ."
            }
        }

        stage('Deploy') {
            steps {
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm -f ${CONTAINER_NAME} || true"
                //sh "docker run -p 3001:3001 -d --name ${CONTAINER_NAME} ${IMAGE_NAME}"
                sh "docker run -p 3001:3001 -d --name ${CONTAINER_NAME} -e GITHUB_USERNAME=$GITHUB_USERNAME -e GITHUB_TOKEN=$GITHUB_TOKEN ${IMAGE_NAME}"
            }
        }
    }
}
