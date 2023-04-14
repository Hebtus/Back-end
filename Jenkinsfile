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
                
                
                sh "docker logs ${CONTAINER_NAME} > container_logs.txt"
        withCredentials([usernamePassword(credentialsId: 'rof', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
            sh "git config --global user.email 'rofaydabassem@gmail.com'"
            sh "git config --global user.name 'rofaydaaa'"
            sh "git clone https://${USERNAME}:${PASSWORD}@github.com/<username>/<repository>.git"
            sh "cd <repository>"
            sh "git add container_logs.txt"
            sh "git commit -m 'Add container logs from Jenkins pipeline'"
            sh "git push origin production"
            }
        }
    }
}
