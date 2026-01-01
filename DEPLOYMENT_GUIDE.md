# Google Cloud Run Deployment Guide

This document provides instructions for deploying the CAPS Web frontend application to Google Cloud Run.

## Prerequisites

1. Google Cloud account with billing enabled
2. `gcloud` CLI installed and configured
3. Docker installed (for local testing)

## Project Configuration

The deployment configuration is defined in the root `cloudbuild.yaml` file:
- **Service Name**: `caps-web-frontend`
- **Region**: `us-central1` (default, can be overridden)
- **Port**: 8080
- **Access**: Unauthenticated (public)

## Deployment Methods

### Method 1: Using Cloud Build (Recommended)

Deploy directly from the repository:

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Submit build and deploy
gcloud builds submit --config cloudbuild.yaml

# Override region if needed
gcloud builds submit --config cloudbuild.yaml --substitutions=_REGION=asia-southeast2
```

### Method 2: Manual Docker Build and Deploy

Build and push manually:

```bash
# Set variables
PROJECT_ID=$(gcloud config get-value project)
IMAGE_NAME="gcr.io/$PROJECT_ID/caps-web-frontend"

# Build Docker image from frontend directory
cd frontend
docker build -t $IMAGE_NAME:latest .

# Push to Google Container Registry
docker push $IMAGE_NAME:latest

# Deploy to Cloud Run
gcloud run deploy caps-web-frontend \
  --image $IMAGE_NAME:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

## Environment Variables

If you need to add environment variables (e.g., API keys), add them during deployment:

```bash
gcloud run deploy caps-web-frontend \
  --image gcr.io/$PROJECT_ID/caps-web-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "GEMINI_API_KEY=your-api-key-here"
```

## Viewing Deployment

After successful deployment, you can:

```bash
# Get service URL
gcloud run services describe caps-web-frontend --region us-central1 --format 'value(status.url)'

# View logs
gcloud run services logs read caps-web-frontend --region us-central1

# View service details
gcloud run services describe caps-web-frontend --region us-central1
```

## Troubleshooting

### Build Fails with "Dockerfile not found"

Make sure you're running the build command from the repository root, not from the `frontend` directory.

### SSL Certificate Errors

The Dockerfile includes `npm config set strict-ssl false` to handle SSL certificate issues during build. This is necessary in some CI/CD environments.

### Port Issues

Google Cloud Run expects the service to listen on the port specified by the `PORT` environment variable (default 8080). The nginx configuration in this project is already set to listen on port 8080.

## Cost Optimization

- Cloud Run charges only for actual usage
- The service automatically scales to zero when not in use
- Consider setting `--max-instances` to control maximum costs:

```bash
gcloud run deploy caps-web-frontend \
  --image gcr.io/$PROJECT_ID/caps-web-frontend:latest \
  --max-instances 10 \
  --region us-central1
```

## Security

The application is configured with:
- HTTPS-only access (enforced by Cloud Run)
- Security headers in nginx configuration
- Proper CORS settings for API requests

For production use, consider:
- Enabling authentication with `--no-allow-unauthenticated`
- Using Cloud Armor for DDoS protection
- Implementing proper secret management for API keys

## Backend Integration

The backend will be deployed separately in its own repository. When ready, update the frontend environment variables to point to the backend service URL.
