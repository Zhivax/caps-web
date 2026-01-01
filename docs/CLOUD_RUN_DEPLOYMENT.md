# Google Cloud Run Deployment Guide

Panduan lengkap untuk mendeploy aplikasi CAPS Supply Chain Dashboard ke Google Cloud Run.

## Prasyarat

1. **Google Cloud CLI (gcloud)** - [Install gcloud](https://cloud.google.com/sdk/docs/install)
2. **Docker** (opsional, untuk testing lokal)
3. **Google Cloud Project** dengan billing enabled
4. **API yang harus diaktifkan:**
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## Cara Deploy ke Google Cloud Run

### Metode 1: Deploy Otomatis dengan Cloud Build (Recommended)

Ini adalah cara tercepat dan termudah. Google Cloud Build akan membangun Docker image dan mendeploy ke Cloud Run secara otomatis.

1. **Login ke Google Cloud:**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Aktifkan API yang diperlukan:**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Deploy dari repository:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

   Cloud Build akan:
   - Build Docker image dari source code
   - Push image ke Container Registry
   - Deploy ke Cloud Run di region asia-southeast2
   - Set port ke 8080
   - Allow unauthenticated access

4. **Lihat aplikasi yang sudah deployed:**
   ```bash
   gcloud run services describe caps-web --region asia-southeast2
   ```

   URL aplikasi akan ditampilkan di output.

### Metode 2: Deploy Manual Step-by-Step

Jika Anda ingin kontrol lebih detail atas proses deployment:

1. **Build Docker image:**
   ```bash
   docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest .
   ```

2. **Test image secara lokal (opsional):**
   ```bash
   docker run -p 8080:8080 gcr.io/YOUR_PROJECT_ID/caps-web:latest
   # Buka http://localhost:8080 di browser
   ```

3. **Push image ke Google Container Registry:**
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest
   ```

4. **Deploy ke Cloud Run:**
   ```bash
   gcloud run deploy caps-web \
     --image gcr.io/YOUR_PROJECT_ID/caps-web:latest \
     --platform managed \
     --region asia-southeast2 \
     --allow-unauthenticated \
     --port 8080
   ```

## Konfigurasi Environment Variables (Jika Diperlukan)

Jika aplikasi memerlukan API key (misalnya GEMINI_API_KEY):

```bash
gcloud run services update caps-web \
  --set-env-vars GEMINI_API_KEY=your-api-key-here \
  --region asia-southeast2
```

## Monitoring dan Logs

### Melihat logs aplikasi:
```bash
gcloud run services logs read caps-web --region asia-southeast2
```

### Melihat detail service:
```bash
gcloud run services describe caps-web --region asia-southeast2
```

### Melihat metrics di Cloud Console:
```
https://console.cloud.google.com/run
```

## Update Aplikasi

Untuk update aplikasi setelah ada perubahan code:

```bash
# Metode otomatis dengan Cloud Build
gcloud builds submit --config cloudbuild.yaml

# Atau metode manual
docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest .
docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest
gcloud run deploy caps-web \
  --image gcr.io/YOUR_PROJECT_ID/caps-web:latest \
  --region asia-southeast2
```

## Troubleshooting

### Error: "unable to prepare context: unable to evaluate symlinks in Dockerfile path"
**Solusi:** Pastikan file `Dockerfile` ada di root directory repository.

### Error: "self-signed certificate in certificate chain"
**Solusi:** Sudah ditangani di Dockerfile dengan `ENV npm_config_strict_ssl=false`

### Error: Build gagal dengan "vite: not found"
**Solusi:** Sudah diperbaiki dengan install semua dependencies (bukan hanya production)

### Application tidak bisa diakses
**Solusi:** Pastikan:
- `--allow-unauthenticated` flag digunakan saat deploy
- Port 8080 sudah di-expose di Dockerfile
- Nginx config menggunakan port 8080

## Custom Domain (Opsional)

Untuk menggunakan custom domain:

1. **Map domain ke Cloud Run service:**
   ```bash
   gcloud run domain-mappings create \
     --service caps-web \
     --domain your-domain.com \
     --region asia-southeast2
   ```

2. **Update DNS records** sesuai instruksi yang diberikan oleh gcloud.

## Biaya

- Cloud Run: Pay-per-request model
  - Free tier: 2 juta requests/bulan
  - Setelah free tier: ~$0.40 per juta requests
- Cloud Build: 
  - Free tier: 120 build-minutes/hari
  - Setelah free tier: $0.003 per build-minute
- Container Registry: 
  - Free tier: 5GB storage
  - Setelah free tier: $0.026 per GB/bulan

## Security Best Practices

1. **Jangan commit secrets** ke repository
2. **Gunakan Secret Manager** untuk API keys:
   ```bash
   echo -n "your-api-key" | gcloud secrets create gemini-api-key --data-file=-
   ```
3. **Limit akses** dengan IAM roles yang appropriate
4. **Enable Cloud Armor** untuk DDoS protection (jika diperlukan)

## Support

Untuk masalah deployment, check:
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Container Registry Documentation](https://cloud.google.com/container-registry/docs)
