#!/bin/bash

# Deployment script for Google Cloud
# Usage: ./deploy.sh [app-engine|cloud-run]

set -e

DEPLOYMENT_TYPE=${1:-app-engine}
PROJECT_ID=$(gcloud config get-value project)

if [ -z "$PROJECT_ID" ]; then
    echo "Error: No Google Cloud project set. Run 'gcloud config set project YOUR_PROJECT_ID'"
    exit 1
fi

echo "================================"
echo "Deploying to: $DEPLOYMENT_TYPE"
echo "Project ID: $PROJECT_ID"
echo "================================"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build application
echo "Building application..."
npm run build

if [ ! -d "dist" ]; then
    echo "Error: Build failed - dist directory not found"
    exit 1
fi

if [ "$DEPLOYMENT_TYPE" == "app-engine" ]; then
    echo "Deploying to App Engine..."
    gcloud app deploy --quiet
    echo ""
    echo "Deployment complete!"
    echo "Run 'gcloud app browse' to view your app"
    
elif [ "$DEPLOYMENT_TYPE" == "cloud-run" ]; then
    SERVICE_NAME=${2:-caps-web}
    REGION=${3:-asia-southeast2}
    
    echo "Deploying to Cloud Run..."
    echo "Service: $SERVICE_NAME"
    echo "Region: $REGION"
    
    # Build and submit
    gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
    
    # Deploy to Cloud Run
    gcloud run deploy $SERVICE_NAME \
        --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 8080 \
        --quiet
    
    echo ""
    echo "Deployment complete!"
    echo "Run 'gcloud run services describe $SERVICE_NAME --region $REGION' for details"
    
else
    echo "Error: Unknown deployment type '$DEPLOYMENT_TYPE'"
    echo "Usage: ./deploy.sh [app-engine|cloud-run]"
    exit 1
fi
