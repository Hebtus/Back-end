pipeline {
    agent any

    environment {
        IMAGE_NAME = "server:${BUILD_NUMBER}"
        CONTAINER_NAME = "server"
        CONFIG_PATH = "/home/azureuser/data/config.env"
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
                sh "docker run -d --name ${CONTAINER_NAME} -p 3001:3001 \
                    -v ${CONFIG_PATH}:/app/config.env ${IMAGE_NAME}"
            }
        }
    }
}
