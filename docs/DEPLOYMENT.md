# Google Cloud Deployment Configuration Summary

## Important: Monorepo Structure

This repository has been restructured as a monorepo. The frontend application files are now located in the `frontend/` directory. The root-level `cloudbuild.yaml` file has been configured to handle this structure correctly by:
- Building the Docker image from the `./frontend` directory
- Deploying to Google Cloud Run with the proper configuration

If you're deploying manually, ensure you specify the correct context directory (`./frontend`) when building Docker images.

## Overview
This document summarizes all the deployment configurations added to enable deployment to Google Cloud Platform.

## Files Added/Modified

### 1. .gcloudignore
**Purpose:** Specifies files that should NOT be uploaded during deployment
**Key exclusions:**
- node_modules (will be installed on deployment)
- dist folder (will be built on deployment)
- Development and editor files
- Git and CI/CD configuration files
- Environment files with secrets

### 2. app.yaml (Modified)
**Purpose:** Google App Engine configuration
**Key features:**
- Runtime: Node.js 20
- Automatic scaling (1-10 instances, 65% CPU target)
- Environment variables support
- Static file handlers for SPA routing
- HTTPS enforcement (secure: always)
- Support for various file types (fonts, images, CSS, JS)

### 3. Dockerfile (Created)
**Purpose:** Container image for Cloud Run or GKE deployment
**Key features:**
- Multi-stage build (reduces final image size)
- Node.js 20 Alpine base
- Nginx Alpine for production serving
- Health check endpoint
- Port 8080 (Cloud Run standard)
- Optimized build process

### 4. nginx.conf (Created)
**Purpose:** Nginx configuration for serving the application
**Key features:**
- Port 8080 (Cloud Run compatible)
- Security headers (X-Frame-Options, CSP, etc.)
- Gzip compression for assets
- Caching strategies for static assets
- SPA fallback routing
- Health check endpoint at /health

### 5. cloudbuild.yaml (Created)
**Purpose:** Google Cloud Build CI/CD configuration
**Key features:**
- Automated dependency installation
- Build process
- Deployment to App Engine
- Version tagging with commit SHA
- High-CPU machine for faster builds

### 6. .dockerignore (Created)
**Purpose:** Optimizes Docker builds by excluding unnecessary files
**Key exclusions:**
- Same as .gcloudignore plus Docker-specific exclusions

### 7. .env.example (Created)
**Purpose:** Documents required environment variables
**Variables:**
- GEMINI_API_KEY (for AI features)
- NODE_ENV (for environment setting)

### 8. deploy.sh (Created)
**Purpose:** Simplified deployment script
**Features:**
- Support for App Engine and Cloud Run
- Automatic build process
- Project validation
- Usage instructions

### 9. app.json (Created)
**Purpose:** Application metadata for various platforms
**Contains:**
- App name and description
- Runtime information
- Environment variable definitions

### 10. package-lock.json (Generated)
**Purpose:** Lock dependency versions for consistent deployments
**Benefit:** Ensures the same package versions are installed in production

### 11. README.md (Updated)
**Purpose:** Comprehensive deployment documentation
**Sections added:**
- Prerequisites for deployment
- Step-by-step App Engine deployment
- Step-by-step Cloud Run deployment
- Cloud Build CI/CD setup
- Configuration files explanation
- Troubleshooting guide
- Cost optimization tips
- Security notes

## Deployment Options

**Note:** The repository is now structured as a monorepo with the frontend application in the `frontend/` directory.

### Option 1: Google App Engine
```bash
cd frontend
npm run build
gcloud app deploy
cd ..  # Return to repository root
```
**Best for:** Simple deployments, static content
**Cost:** Free tier available
**Scaling:** Automatic

### Option 2: Google Cloud Run (Container-based) - RECOMMENDED
```bash
# Deploy using Cloud Build (from repository root)
gcloud builds submit --config cloudbuild.yaml

# Or manually build and deploy
gcloud builds submit --tag gcr.io/PROJECT_ID/caps-web ./frontend
gcloud run deploy caps-web --image gcr.io/PROJECT_ID/caps-web --platform managed --region us-central1 --allow-unauthenticated
```
**Best for:** Containerized apps, API backends, future backend services
**Cost:** Pay per request (very cost-effective), generous free tier
**Scaling:** Automatic, scales to zero (no cost when idle)
**Why recommended:** Cloud Run is now preferred because:
- Works seamlessly with the monorepo structure via the root-level cloudbuild.yaml
- Provides better support for future backend microservices
- More cost-effective with scales-to-zero capability
- Container-based deployment is more portable and consistent

**Note:** The root-level `cloudbuild.yaml` is configured to build from the `frontend/` directory.

### Option 3: Cloud Build (CI/CD) - RECOMMENDED
```bash
# From repository root
gcloud builds submit --config cloudbuild.yaml
```
**Best for:** Automated deployments from Git
**Features:** Continuous deployment on push
**Note:** This method automatically builds and deploys to Cloud Run from the monorepo structure.

## Environment Variables

### Required for Production:
- `NODE_ENV=production` (set in app.yaml)

### Optional:
- `GEMINI_API_KEY` - For AI features (set via gcloud CLI for security)

**Setting environment variables:**
```bash
# For App Engine
gcloud app deploy --set-env-vars GEMINI_API_KEY=your-key

# For Cloud Run
gcloud run services update caps-web --set-env-vars GEMINI_API_KEY=your-key --region REGION
```

## Security Configurations

### HTTPS Enforcement
- All handlers in app.yaml have `secure: always`
- Redirects HTTP to HTTPS with 301 status

### Security Headers (nginx.conf)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade

### Secrets Management
- API keys should NEVER be committed to Git
- Use environment variables via gcloud CLI
- Local development uses .env.local (gitignored)

## Performance Optimizations

### Build Configuration (vite.config.ts)
- Code splitting for React and UI vendors
- Minification with esbuild
- No source maps in production
- Manual chunks for better caching

### Nginx Optimizations
- Gzip compression enabled
- Static asset caching (1 year)
- Sendfile and tcp optimizations
- Asset-specific cache headers

### App Engine Scaling
- Min instances: 1 (reduces cold starts)
- Max instances: 10 (cost control)
- CPU target: 65% (balanced scaling)

## Testing the Configuration

### Local Build Test
```bash
npm install
npm run build
npm run preview
```

### Docker Build Test
```bash
docker build -t caps-web-test .
docker run -p 8080:8080 caps-web-test
```

### Deployment Validation
```bash
# Check gcloud configuration
gcloud config list

# Validate app.yaml syntax
gcloud app deploy --no-promote --dry-run

# Test Cloud Build
gcloud builds submit --config cloudbuild.yaml --no-source
```

## Cost Optimization Tips

1. **App Engine:**
   - Free tier: 28 instance hours/day
   - Use F1 instance class for low traffic
   - Enable automatic scaling

2. **Cloud Run:**
   - Scales to zero (no cost when idle)
   - Free tier: 2 million requests/month
   - Set max instances to control costs

3. **Cloud Build:**
   - Free tier: 120 build-minutes/day
   - Use caching to speed up builds

4. **Best Practices:**
   - Set up budget alerts in Cloud Console
   - Monitor usage with Cloud Monitoring
   - Review Cloud Console billing reports regularly

## Troubleshooting

### Common Issues:

1. **Build fails:**
   - Clear node_modules and reinstall
   - Check Node.js version (requires 20+)
   - Verify package-lock.json exists

2. **Deployment fails:**
   - Ensure gcloud CLI is installed and configured
   - Verify billing is enabled
   - Check project permissions

3. **App doesn't serve:**
   - Verify dist folder exists after build
   - Check handler URLs in app.yaml
   - Review app logs: `gcloud app logs tail`

4. **Environment variables not working:**
   - Verify variables are set: `gcloud app describe`
   - Check variable names match .env.example
   - Ensure no typos in variable names

## Next Steps

1. ✅ All deployment configurations are in place
2. 📝 Set up your Google Cloud project
3. 🔑 Obtain Gemini API key (if needed)
4. 🚀 Choose deployment method and follow README
5. 📊 Set up monitoring and alerts
6. 💰 Configure budget alerts

## Support Resources

- [Google App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Google Cloud Console](https://console.cloud.google.com/)
