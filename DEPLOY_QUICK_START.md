# Quick Start - Deploy ke Google Cloud Run

## Setup Awal (Sekali saja)

```bash
# 1. Login ke Google Cloud
gcloud auth login

# 2. Set project ID
gcloud config set project YOUR_PROJECT_ID

# 3. Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

## Deploy Aplikasi

### Metode 1: Menggunakan Cloud Build (Recommended)

```bash
gcloud builds submit --config=cloudbuild.yaml
```

### Metode 2: Deploy Manual

```bash
# Build image
docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest .

# Push ke registry
docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest

# Deploy ke Cloud Run
gcloud run deploy caps-web \
  --image gcr.io/YOUR_PROJECT_ID/caps-web:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080
```

## Testing Lokal (Optional)

```bash
# Test Docker build
./test-docker-build.sh

# Atau manual
docker build -t caps-web:test .
docker run -p 8080:8080 caps-web:test
# Buka http://localhost:8080
```

## Update Environment Variables

```bash
gcloud run services update caps-web \
  --region asia-southeast2 \
  --set-env-vars GEMINI_API_KEY=your-api-key,NODE_ENV=production
```

## Monitoring

```bash
# Lihat logs
gcloud run services logs read caps-web --region asia-southeast2

# Lihat service info
gcloud run services describe caps-web --region asia-southeast2

# List all services
gcloud run services list
```

## Troubleshooting

```bash
# Check build logs
gcloud builds list --limit=5

# View specific build log
gcloud builds log BUILD_ID

# Check Cloud Run service status
gcloud run services describe caps-web --region asia-southeast2 --format="value(status.conditions)"
```

## Region Options

Default: `asia-southeast2` (Jakarta, Indonesia)

Alternatif region Asia lainnya:
- `asia-southeast1` (Singapore)
- `asia-east1` (Taiwan)
- `asia-northeast1` (Tokyo)

Untuk mengganti region, update semua perintah yang menggunakan `--region`.

## Kesalahan Umum & Solusi

### Error: Dockerfile not found
✅ **FIXED**: Sudah diperbaiki di `.gcloudignore`

### Error: Permission denied
```bash
# Berikan permission ke Cloud Build service account
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member=serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role=roles/run.admin
```

### Error: API not enabled
```bash
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

## Dokumentasi Lengkap

Lihat file `CLOUD_RUN_DEPLOYMENT.md` untuk dokumentasi lengkap.
