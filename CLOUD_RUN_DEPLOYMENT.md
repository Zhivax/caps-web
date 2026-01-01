# Panduan Deployment Google Cloud Run

## Masalah yang Diperbaiki

### Masalah Utama
Error deployment: `unable to prepare context: unable to evaluate symlinks in Dockerfile path: lstat /workspace/Dockerfile: no such file or directory`

### Penyebab
1. **Dockerfile dan nginx.conf diignore**: File `.gcloudignore` mengecualikan `Dockerfile` dan `nginx.conf` dari deployment
2. **Konfigurasi salah**: `cloudbuild.yaml` dikonfigurasi untuk App Engine, bukan Cloud Run

### Solusi yang Diterapkan
1. ✅ Menghapus `Dockerfile` dan `nginx.conf` dari `.gcloudignore`
2. ✅ Mengubah `cloudbuild.yaml` untuk deploy ke Cloud Run
3. ✅ Menggunakan Docker container dengan Nginx untuk serving aplikasi

## Cara Deploy ke Google Cloud Run

### Prasyarat
1. Google Cloud Project sudah dibuat
2. Cloud Run API sudah diaktifkan
3. Cloud Build API sudah diaktifkan
4. Container Registry API sudah diaktifkan

### Deploy Otomatis via Cloud Build

Jalankan perintah berikut dari root directory project:

```bash
gcloud builds submit --config=cloudbuild.yaml
```

Atau push ke repository yang terhubung dengan Cloud Build trigger.

### Deploy Manual

Jika ingin deploy manual tanpa Cloud Build:

```bash
# 1. Build Docker image
docker build -t gcr.io/YOUR_PROJECT_ID/caps-web:latest .

# 2. Push ke Container Registry
docker push gcr.io/YOUR_PROJECT_ID/caps-web:latest

# 3. Deploy ke Cloud Run
gcloud run deploy caps-web \
  --image gcr.io/YOUR_PROJECT_ID/caps-web:latest \
  --platform managed \
  --region asia-southeast2 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

## Konfigurasi Cloud Run

### Port
- Aplikasi listen pada port **8080** (default Cloud Run)
- Nginx dikonfigurasi untuk listen di port 8080

### Resource Limits
- **Memory**: 512Mi (bisa ditingkatkan jika diperlukan)
- **CPU**: 1 vCPU
- **Max Instances**: 10
- **Min Instances**: 0 (scale to zero untuk menghemat biaya)

### Environment Variables
Set environment variable via gcloud:

```bash
gcloud run services update caps-web \
  --region asia-southeast2 \
  --set-env-vars NODE_ENV=production,GEMINI_API_KEY=your-api-key
```

## Arsitektur Deployment

```
┌─────────────────┐
│  Cloud Build    │
│  (Build Image)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Container       │
│ Registry (GCR)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Cloud Run      │
│  (nginx + app)  │
└─────────────────┘
```

### Build Process
1. **Stage 1 (Builder)**: 
   - Node.js 20 Alpine
   - Install dependencies (`npm ci`)
   - Build aplikasi (`npm run build`)
   - Output ke `/app/dist`

2. **Stage 2 (Production)**:
   - Nginx Alpine
   - Copy built files dari stage 1
   - Serve static files
   - SPA routing support

## Health Check

Aplikasi memiliki health check endpoint di `/health` yang mengembalikan "healthy".

Cloud Run akan melakukan health check otomatis pada port yang di-expose (8080).

## Troubleshooting

### Image tidak ditemukan
Pastikan Container Registry API sudah diaktifkan:
```bash
gcloud services enable containerregistry.googleapis.com
```

### Permission denied
Pastikan service account Cloud Build memiliki permission:
- Cloud Run Admin
- Service Account User

### Build timeout
Jika build timeout, tingkatkan timeout di `cloudbuild.yaml`:
```yaml
timeout: '2400s'  # 40 minutes
```

### Memory limit exceeded
Tingkatkan memory limit:
```bash
gcloud run services update caps-web \
  --region asia-southeast2 \
  --memory 1Gi
```

## Monitoring

Lihat logs aplikasi:
```bash
gcloud run services logs read caps-web --region asia-southeast2
```

Lihat detail service:
```bash
gcloud run services describe caps-web --region asia-southeast2
```

## Biaya

Cloud Run menggunakan pricing model "pay-per-use":
- Hanya dikenakan biaya saat ada request
- Dengan `min-instances: 0`, service akan scale to zero saat tidak ada traffic
- Lihat: https://cloud.google.com/run/pricing

## Catatan Penting

1. **Region**: Default region adalah `asia-southeast2` (Jakarta), bisa diubah sesuai kebutuhan
2. **Authentication**: Saat ini di-set `--allow-unauthenticated` untuk public access
3. **HTTPS**: Cloud Run otomatis menyediakan HTTPS certificate
4. **Custom Domain**: Bisa mapping custom domain via Cloud Run console

## Next Steps

Setelah deployment berhasil:
1. Test aplikasi di URL yang diberikan Cloud Run
2. Setup custom domain (optional)
3. Configure monitoring dan alerting
4. Setup CI/CD trigger di Cloud Build
