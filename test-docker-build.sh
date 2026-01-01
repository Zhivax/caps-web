#!/bin/bash

# Script to test Docker build locally before deploying to Cloud Run
# This helps catch any issues before actual deployment

set -e  # Exit on any error

echo "🚀 Testing Docker build for Cloud Run..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="caps-web-test"
IMAGE_TAG="local-test"
CONTAINER_NAME="caps-web-test-container"
PORT=8080

echo "📦 Building Docker image..."
if docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .; then
    echo -e "${GREEN}✅ Docker build successful!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

echo ""
echo "🧪 Testing the built image..."

# Stop and remove existing container if running
docker stop ${CONTAINER_NAME} 2>/dev/null || true
docker rm ${CONTAINER_NAME} 2>/dev/null || true

echo "🏃 Starting container..."
if docker run -d --name ${CONTAINER_NAME} -p ${PORT}:8080 ${IMAGE_NAME}:${IMAGE_TAG}; then
    echo -e "${GREEN}✅ Container started!${NC}"
else
    echo -e "${RED}❌ Failed to start container!${NC}"
    exit 1
fi

echo ""
echo "⏳ Waiting for application to be ready..."
sleep 5

# Test the health endpoint
echo "🏥 Testing health check endpoint..."
if command -v curl >/dev/null 2>&1; then
    if curl -s http://localhost:${PORT}/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${RED}❌ Health check failed!${NC}"
        echo "Container logs:"
        docker logs ${CONTAINER_NAME}
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
        exit 1
    fi
elif command -v wget >/dev/null 2>&1; then
    if wget -q -O - http://localhost:${PORT}/health | grep -q "healthy"; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${RED}❌ Health check failed!${NC}"
        echo "Container logs:"
        docker logs ${CONTAINER_NAME}
        docker stop ${CONTAINER_NAME}
        docker rm ${CONTAINER_NAME}
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  curl/wget not available, skipping health check${NC}"
fi

echo ""
echo "🌐 Testing application homepage..."
if command -v curl >/dev/null 2>&1; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/ | grep -q "200"; then
        echo -e "${GREEN}✅ Homepage is accessible!${NC}"
    else
        echo -e "${YELLOW}⚠️  Homepage returned non-200 status${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available, skipping homepage test${NC}"
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "🎉 Your application is ready for Cloud Run deployment!"
echo ""
echo "To deploy to Cloud Run, run:"
echo "  gcloud builds submit --config=cloudbuild.yaml"
echo ""
echo "Or manually:"
echo "  docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest ."
echo "  docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest"
echo "  gcloud run deploy caps-web --image gcr.io/YOUR_PROJECT_ID/caps-web:latest --platform managed --region asia-southeast2"
echo ""

# Prompt to stop container (skip in non-interactive mode)
if [ -t 0 ]; then
    read -p "Press Enter to stop and remove test container..."
else
    echo "Non-interactive mode: cleaning up automatically..."
    sleep 2
fi

docker stop ${CONTAINER_NAME}
docker rm ${CONTAINER_NAME}

echo -e "${GREEN}✅ Cleanup complete!${NC}"
