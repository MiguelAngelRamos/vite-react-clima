pipeline {
    agent none

    environment {
        IMAGE_NAME     = 'weather-app'
        CONTAINER_NAME = 'weather-app-container'
        APP_PORT       = '3000'
    }

    stages {

        stage('Checkout') {
            agent { label 'master' }
            steps {
                echo "Clonando rama: ${env.BRANCH_NAME}"
                checkout scm
            }
        }

        stage('Tests') {
            agent {
                docker {
                    image 'node:24-alpine'
                    args '-u root:root --entrypoint=""'
                    label 'slave-weather'
                    reuseNode false
                }
            }
            steps {
                echo 'Instalando dependencias...'
                sh 'npm ci'
                echo 'Ejecutando tests...'
                sh 'npm run test:ci'
            }
            post {
                success { echo 'Tests completados exitosamente.' }
                failure  { echo 'Tests fallidos. Revisar el output.' }
            }
        }

        stage('Security — npm audit') {
            agent {
                docker {
                    image 'node:24-alpine'
                    args '-u root:root --entrypoint=""'
                    label 'slave-weather'
                    reuseNode false
                }
            }
            steps {
                echo 'Ejecutando análisis de seguridad...'
                sh 'npm ci'
                sh 'npm audit --audit-level=high'
            }
            post {
                success { echo 'Sin vulnerabilidades críticas detectadas.' }
                failure  { echo 'Vulnerabilidades de seguridad encontradas.' }
            }
        }

        stage('Build imagen Docker') {
            agent { label 'slave-weather' }
            steps {
                echo "Construyendo imagen ${IMAGE_NAME}:${env.BRANCH_NAME}..."
                sh "docker build -t ${IMAGE_NAME}:${env.BRANCH_NAME} ."
                echo 'Imagen construida exitosamente.'
            }
        }

        stage('Deploy') {
            agent { label 'slave-weather' }
            when { branch 'main' }
            steps {
                echo 'Deteniendo contenedor anterior si existe...'
                sh "docker stop ${CONTAINER_NAME} || true"
                sh "docker rm   ${CONTAINER_NAME} || true"

                echo "Desplegando ${IMAGE_NAME}:main en puerto ${APP_PORT}..."
                sh """
                    docker run -d \
                        --name ${CONTAINER_NAME} \
                        --restart unless-stopped \
                        -p ${APP_PORT}:80 \
                        ${IMAGE_NAME}:main
                """
                echo "App disponible en http://192.168.1.32:${APP_PORT}"
            }
            post {
                success { echo "Deploy exitoso — http://192.168.1.32:${APP_PORT}" }
                failure  { echo 'Deploy fallido. Revisar logs del contenedor.' }
            }
        }
    }

    post {
        success { echo "Pipeline completado — Rama: ${env.BRANCH_NAME}" }
        failure  { echo "Pipeline fallido — Rama: ${env.BRANCH_NAME} — Revisar logs." }
        always   { echo "Finalizado: ${env.BRANCH_NAME}" }
    }
}
