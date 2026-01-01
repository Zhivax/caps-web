<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Supply Chain Dashboard - Run and Deploy

This contains everything you need to run your app locally and deploy it to Google Cloud.

View your app in AI Studio: https://ai.studio/apps/drive/1kIFmbzUopZGquRjSjUK_hX1tUInia5xA

## Run Locally

**Prerequisites:** Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key:
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your API key
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy to Google Cloud

### Prerequisites for Deployment

1. **Google Cloud CLI (gcloud)** - [Install gcloud](https://cloud.google.com/sdk/docs/install)
2. **Google Cloud Project** - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
3. **Billing Enabled** - Make sure billing is enabled for your project

### Option 1: Deploy to Google App Engine (Recommended)

App Engine is the simplest option for deploying static web applications.

1. **Initialize gcloud and login:**
   ```bash
   gcloud init
   gcloud auth login
   ```

2. **Set your project:**
   ```bash
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Build the application:**
   ```bash
   npm install
   npm run build
   ```

4. **Deploy to App Engine:**
   ```bash
   gcloud app deploy
   ```

5. **Set environment variables (if needed):**
   ```bash
   gcloud app deploy --set-env-vars GEMINI_API_KEY=your-api-key-here
   ```

6. **View your app:**
   ```bash
   gcloud app browse
   ```

### Option 2: Deploy to Google Cloud Run (Container-based)

Cloud Run offers automatic scaling and container-based deployment.

1. **Build and push Docker image:**
   ```bash
   # Set variables
   export PROJECT_ID=your-project-id
   export REGION=asia-southeast2  # or your preferred region
   export SERVICE_NAME=caps-web

   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com

   # Build and deploy
   gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy $SERVICE_NAME \
     --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
     --platform managed \
     --region $REGION \
     --allow-unauthenticated \
     --port 8080
   ```

3. **Set environment variables (if needed):**
   ```bash
   gcloud run services update $SERVICE_NAME \
     --set-env-vars GEMINI_API_KEY=your-api-key-here \
     --region $REGION
   ```

### Option 3: Using Cloud Build (CI/CD)

For automated deployments, you can use Cloud Build:

1. **Enable Cloud Build API:**
   ```bash
   gcloud services enable cloudbuild.googleapis.com
   ```

2. **Submit build:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

3. **Or connect to GitHub for automatic deployments:**
   - Go to [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers)
   - Connect your GitHub repository
   - Create a trigger using `cloudbuild.yaml`

## Configuration Files

- **`app.yaml`** - App Engine configuration
- **`Dockerfile`** - Container configuration for Cloud Run/GKE
- **`nginx.conf`** - Nginx configuration for serving static files
- **`cloudbuild.yaml`** - Cloud Build configuration for CI/CD
- **`.gcloudignore`** - Files to exclude from deployment
- **`.env.example`** - Example environment variables

## Important Notes

1. **Environment Variables:** Never commit sensitive data like API keys. Use `.env.local` for local development and set them via gcloud CLI for production.

2. **Build Before Deploy:** Always build your application before deploying:
   ```bash
   npm run build
   ```

3. **Cost Optimization:** 
   - App Engine: Free tier available
   - Cloud Run: Pay per request (very cost-effective for low traffic)
   - Consider setting up budget alerts in Google Cloud Console

4. **Security:**
   - All traffic is forced to HTTPS (configured in app.yaml)
   - Security headers are set in nginx.conf
   - Keep your dependencies updated: `npm audit`

## Troubleshooting

### Build fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment fails
```bash
# Check gcloud configuration
gcloud config list

# Check App Engine status
gcloud app describe

# View logs
gcloud app logs tail -s default
```

### For Cloud Run
```bash
# View logs
gcloud run services logs read $SERVICE_NAME --region $REGION

# Describe service
gcloud run services describe $SERVICE_NAME --region $REGION
```

## Support

For issues related to:
- **App deployment:** Check [Google Cloud documentation](https://cloud.google.com/appengine/docs)
- **Build errors:** Review the build logs in Cloud Console
- **API issues:** Verify your Gemini API key is correct and active
