# Pre-Deployment Checklist

Use this checklist before deploying to Google Cloud to ensure everything is configured correctly.

## Prerequisites
- [ ] Google Cloud CLI (gcloud) installed
- [ ] Google Cloud project created
- [ ] Billing enabled on the project
- [ ] Authenticated with `gcloud auth login`
- [ ] Project set with `gcloud config set project PROJECT_ID`

## Environment Configuration
- [ ] `.env.example` reviewed
- [ ] Environment variables documented
- [ ] API keys obtained (if needed)
- [ ] Secrets management strategy decided

## Local Testing
- [ ] Dependencies installed (`npm install`)
- [ ] Application builds successfully (`npm run build`)
- [ ] Build output exists in `dist/` directory
- [ ] Preview server works (`npm run preview`)
- [ ] No console errors in browser

## Deployment Files Review
- [ ] `app.yaml` - App Engine configuration
- [ ] `Dockerfile` - Container configuration
- [ ] `nginx.conf` - Web server configuration
- [ ] `cloudbuild.yaml` - CI/CD configuration
- [ ] `.gcloudignore` - Deployment exclusions
- [ ] `.dockerignore` - Docker build exclusions
- [ ] `package-lock.json` - Dependency lock file exists

## Security Checks
- [ ] No secrets in source code
- [ ] `.env.local` is in `.gitignore`
- [ ] HTTPS enforcement configured
- [ ] Security headers configured in nginx.conf
- [ ] Dependencies audited (`npm audit`)

## First Deployment (App Engine)
- [ ] Run: `npm run build`
- [ ] Run: `gcloud app deploy`
- [ ] Set environment variables (if needed)
- [ ] Test the deployed application
- [ ] Check logs: `gcloud app logs tail`

## First Deployment (Cloud Run)
- [ ] Build image: `gcloud builds submit --tag gcr.io/PROJECT_ID/SERVICE_NAME`
- [ ] Deploy: `gcloud run deploy SERVICE_NAME --image gcr.io/PROJECT_ID/SERVICE_NAME --platform managed --region REGION --allow-unauthenticated`
- [ ] Set environment variables (if needed)
- [ ] Test the deployed application
- [ ] Check logs: `gcloud run services logs read SERVICE_NAME`

## Post-Deployment
- [ ] Application is accessible via URL
- [ ] All pages load correctly
- [ ] No 404 errors for assets
- [ ] Console shows no critical errors
- [ ] API integrations work (if any)
- [ ] Performance is acceptable

## Monitoring & Maintenance
- [ ] Set up budget alerts in Cloud Console
- [ ] Configure uptime monitoring
- [ ] Set up error reporting
- [ ] Document the deployment process
- [ ] Share credentials with team (securely)
- [ ] Schedule regular dependency updates

## Optional CI/CD Setup
- [ ] Cloud Build triggers configured
- [ ] Repository connected to Cloud Build
- [ ] Automated deployments tested
- [ ] Build notifications configured

## Cost Management
- [ ] Reviewed pricing for chosen service
- [ ] Budget alerts configured
- [ ] Auto-scaling settings reviewed
- [ ] Free tier limits understood
- [ ] Cost monitoring dashboard set up

## Documentation
- [ ] README.md includes deployment instructions
- [ ] DEPLOYMENT.md reviewed
- [ ] Team trained on deployment process
- [ ] Rollback procedure documented
- [ ] Support contacts documented

---

## Quick Deployment Commands Reference

### App Engine
```bash
# Build and deploy
npm run build
gcloud app deploy

# With environment variables
gcloud app deploy --set-env-vars KEY=value

# View logs
gcloud app logs tail

# Open in browser
gcloud app browse
```

### Cloud Run
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/SERVICE_NAME

# Deploy
gcloud run deploy SERVICE_NAME \
  --image gcr.io/PROJECT_ID/SERVICE_NAME \
  --platform managed \
  --region REGION \
  --allow-unauthenticated

# With environment variables
gcloud run services update SERVICE_NAME \
  --set-env-vars KEY=value \
  --region REGION
```

### Using deploy.sh Script
```bash
# App Engine
./deploy.sh app-engine

# Cloud Run
./deploy.sh cloud-run SERVICE_NAME REGION
```

---

## Troubleshooting Quick Fixes

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
```bash
gcloud auth login
gcloud config set project PROJECT_ID
gcloud app deploy --verbosity=debug
```

### Log Checking
```bash
# App Engine
gcloud app logs tail -s default

# Cloud Run
gcloud run services logs read SERVICE_NAME --region REGION --limit 50
```
